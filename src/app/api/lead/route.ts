import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(4).max(32),
  email: z.string().email().optional().or(z.literal("")).optional(),
  budget: z.string().optional(),
  campaignId: z.string().optional(),
  sourcePlatform: z.string().optional(),
  sourceType: z.string().optional(),
  sourceUrl: z.string().optional(),
  contactTime: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    // --- Direct DB Backup (Parallel, Non-blocking) ---
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS leads_backup (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          source_platform TEXT,
          source_type TEXT,
          payload JSONB
        )
      `);

      await query(
        `INSERT INTO leads_backup (full_name, phone, email, source_platform, source_type, payload)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          parsed.fullName,
          parsed.phone,
          parsed.email || null,
          parsed.sourcePlatform || "instagram",
          parsed.sourceType || "WebForm",
          body
        ]
      );
      console.log("Lead backed up to DB directly");
    } catch (dbError) {
      console.error("DB Backup Failed:", dbError);
      // Do not block main flow
    }
    // ------------------------------------------------

    const CRM_ENDPOINT =
      process.env.IMPERIUM_CRM_ENDPOINT
        ? `${process.env.IMPERIUM_CRM_ENDPOINT}/api/leads`
        : process.env.CRM_ENDPOINT || "https://console.imperiumgate.com/api/leads";

    const CRM_API_KEY = process.env.IMPERIUM_CRM_API_KEY || process.env.CRM_API_KEY || "";

    const payload = {
      name: parsed.fullName,
      phone: parsed.phone,
      email: parsed.email || null,
      budget: parsed.budget || null,
      source: "landing-page",
      campaignId: parsed.campaignId || null,
      meta: {
        sourcePlatform: parsed.sourcePlatform || "instagram",
        sourceType: parsed.sourceType || "WebForm",
        sourceUrl: parsed.sourceUrl || "",
      }
    };


    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (CRM_API_KEY) {
      // The protocol mentions x-api-key is preferred
      headers["x-api-key"] = CRM_API_KEY;
    }

    let crmSuccess = false;
    let crmData: any = null;

    try {
      const crmRes = await fetch(CRM_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await crmRes.text();
      if (!crmRes.ok) {
        console.error("CRM Forward Error:", text.substring(0, 500));
      } else {
        crmSuccess = true;
        try {
          crmData = JSON.parse(text);
        } catch {
          crmData = { raw: text };
        }
      }
    } catch (fetchError) {
      console.error("CRM Fetch Exception:", fetchError);
    }

    // Always return success to frontend to allow redirect, since we have DB backup.
    return NextResponse.json({
      ok: true,
      success: true,
      crm_forwarded: crmSuccess,
      crm_response: crmData,
    });


  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: "BAD_INPUT", details: e.issues }, { status: 400 });
    }
    console.error("Internal API Error:", e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}