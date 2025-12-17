import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { trackZaiEvent } from '@/lib/zai'

const leadSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(4).max(32).regex(/^\+?[0-9\s-]+$/, "Invalid phone format"),
  email: z.string().email().max(100).optional().or(z.literal('')),
  country: z.string().min(1).max(80).optional(),
  message: z.string().max(1000).optional(),
  contactMethod: z.string().default('whatsapp'),

  marketingChannel: z.string().max(50).default('native_ad'),
  pageSlug: z.string().max(50).default('imperium_native_v1'),
  language: z.enum(['ar', 'en']).default('ar'),

  utm: z
    .object({
      source: z.string().max(100).optional(),
      medium: z.string().max(100).optional(),
      campaign: z.string().max(100).optional(),
      term: z.string().max(100).optional(),
      content: z.string().max(100).optional(),
    })
    .optional(),

  meta: z
    .object({
      landingPath: z.string().max(200).optional(),
      referer: z.string().max(500).optional(),
      userAgent: z.string().max(500).optional(),
    })
    .optional(),

  fingerprint: z.string().max(100).optional(),
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

    // Cleanup
    if (rateLimit.size > 1000) {
      for (const [key, value] of rateLimit.entries()) {
        if (now > value.expires) rateLimit.delete(key)
      }
    }

    const body = await req.json()
    const parsed = leadSchema.parse(body)
    const hdrs = await headers()

    // 1) Submit to CRM directly (No Local DB)
    const crmEndpoint = process.env.IMPERIUM_CRM_ENDPOINT ?? process.env.CRM_ENDPOINT;
    const crmApiKey = process.env.IMPERIUM_CRM_API_KEY ?? process.env.CRM_API_KEY;

    let leadId = 'crm-forward-only-' + Date.now();

    // Don't fail if CRM is missing, just log
    if (crmEndpoint && crmApiKey) {
      try {
        const url = crmEndpoint;

        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${crmApiKey}`,
          },
          body: JSON.stringify({
            // Flat payload
            name: parsed.fullName,
            phone: parsed.phone,
            email: parsed.email || '',
            message: parsed.message || '',
            source: 'ads.imperiumgate.com',
            campaign: parsed.utm?.campaign || 'unknown',
            language: parsed.language || 'ar'
          }),
        })
      } catch (err) {
        console.error('CRM forwarding error', err)
      }
    }

    // 2) Analytics
    await trackZaiEvent('lead.captured', {
      source: 'ads_main',
      marketingChannel: parsed.marketingChannel,
      pageSlug: parsed.pageSlug,
    })

    return NextResponse.json({ ok: true, id: leadId })
  } catch (error: any) {
    console.error('Lead API error', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, message: 'Internal Server Error' }, { status: 500 })
  }
}