import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { z } from 'zod'
import { trackZaiEvent } from '@/lib/zai'

const consultationSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(20).regex(/^\+?[0-9\s-]+$/, "Invalid phone format"),
  email: z.string().email().max(100).optional().or(z.literal('')),
  message: z.string().max(1000).optional(),

  marketingChannel: z.string().max(50).default('cnn_native'),
  pageSlug: z.string().max(50).default('ads-main'),
  language: z.enum(['ar', 'en']).default('ar'),

  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),

  landingPath: z.string().max(200).optional(),
  referer: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().max(50).optional(),

  isWhatsappPreferred: z.boolean().optional(),
  budgetRange: z.string().max(50).optional(),
  timeToInvest: z.string().max(50).optional(),
})

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5
const rateLimit = new Map<string, { count: number; expires: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

    // Rate Limiting Logic
    const now = Date.now()
    const record = rateLimit.get(ip)

    if (record) {
      if (now > record.expires) {
        rateLimit.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW })
      } else {
        if (record.count >= MAX_REQUESTS) {
          return NextResponse.json(
            { ok: false, error: 'Too many requests' },
            { status: 429 }
          )
        }
        record.count++
      }
    } else {
      rateLimit.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW })
    }

    // Cleanup old records
    if (rateLimit.size > 1000) {
      for (const [key, value] of rateLimit.entries()) {
        if (now > value.expires) rateLimit.delete(key)
      }
    }

    const raw = await req.json()
    const hdrs = await headers()

    const parsed = consultationSchema.parse({
      ...raw,
      // نكمّل من الهيدرز لو مش موجود في البودي
      referer: raw.referer ?? hdrs.get('referer') ?? undefined,
      userAgent: raw.userAgent ?? hdrs.get('user-agent') ?? undefined,
      ipAddress:
        raw.ipAddress ??
        ip ??
        undefined,
      landingPath: raw.landingPath ?? req.nextUrl.pathname + req.nextUrl.search,
    })

    // 1) Direct to CRM (No Local DB)
    const consultationId = 'cons-' + Date.now();

    // 2) إرسال لـ CRM الرئيسي (Refactored to match lead route logic roughly, but using the forwardToCrm helper)
    // We construct a fake consultation object to pass to forwardToCrm since it expects one
    const fadeConsultation = {
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      message: parsed.message,
      utmCampaign: parsed.utmCampaign,
      language: parsed.language,
      utmSource: parsed.utmSource,
      utmMedium: parsed.utmMedium,
      utmTerm: parsed.utmTerm,
      utmContent: parsed.utmContent,
      landingPath: parsed.landingPath
    };

    await forwardToCrm(fadeConsultation)

    // 3) event لزيتا / analytics
    await trackZaiEvent('lead.captured', {
      source: 'ads',
      marketingChannel: parsed.marketingChannel,
      pageSlug: parsed.pageSlug,
      utmSource: parsed.utmSource,
      utmCampaign: parsed.utmCampaign,
      id: consultationId,
    })

    return NextResponse.json({ ok: true, id: consultationId })
  } catch (error: any) {
    console.error('consultation POST error', error)

    if (error instanceof z.ZodError) {
      // ZodError in recent versions uses .issues
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

async function forwardToCrm(consultation: any) {
  // Try IMPERIUM_CRM_ENDPOINT first, then fall back to CRM_ENDPOINT
  const CRM_ENDPOINT = process.env.IMPERIUM_CRM_ENDPOINT || process.env.CRM_ENDPOINT
  const CRM_API_KEY = process.env.IMPERIUM_CRM_API_KEY || process.env.CRM_API_KEY

  if (!CRM_ENDPOINT || !CRM_API_KEY) {
    console.warn('Missing CRM config', { CRM_ENDPOINT, hasKey: !!CRM_API_KEY })
    return
  }

  try {
    // User requested EXACTLY https://console.imperiumgate.com/api/leads
    // We assume the ENV var is set to that. If not, we might need to be careful.
    // However, the new instruction says: "const CRM_ENDPOINT = .../api/leads"
    // So we use it as is.
    const url = CRM_ENDPOINT;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CRM_API_KEY}`,
      },
      body: JSON.stringify({
        // Flat payload as requested
        name: consultation.name,
        phone: consultation.phone,
        email: consultation.email || '',
        message: consultation.message || '',
        source: 'ads.imperiumgate.com',
        campaign: consultation.utmCampaign || 'unknown',
        language: consultation.language || 'ar'
        // Extra fields can be added if needed, but user emphasized name+phone
      }),
    })
  } catch (err) {
    console.error('forwardToCrm error', err)
  }
}