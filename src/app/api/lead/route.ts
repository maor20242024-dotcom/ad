import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    // --- Zeta Ingest Protocol: Logging incoming data ---
    console.log("-----------------------------------------");
    console.log("🚀 [ZETA_INGEST] New Lead Received:");
    console.log(JSON.stringify(body, null, 2));
    console.log("-----------------------------------------");

    const baseCrmEndpoint = process.env.IMPERIUM_CRM_ENDPOINT || process.env.CRM_ENDPOINT || "https://console.imperiumgate.com/api";
    const CRM_ENDPOINT = baseCrmEndpoint.endsWith("/api")
      ? `${baseCrmEndpoint}/leads`
      : `${baseCrmEndpoint}/api/leads`;

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

    console.log("📡 [ZETA_INGEST] Forwarding to CRM:", CRM_ENDPOINT);
    console.log("📦 [ZETA_INGEST] CRM Payload:", JSON.stringify(payload, null, 2));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (CRM_API_KEY) {
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
        console.error("❌ [ZETA_INGEST] CRM Forward Error:", text.substring(0, 500));
      } else {
        crmSuccess = true;
        console.log("✅ [ZETA_INGEST] CRM Forward Success");
        try {
          crmData = JSON.parse(text);
        } catch {
          crmData = { raw: text };
        }
      }
    } catch (fetchError) {
      console.error("💥 [ZETA_INGEST] CRM Fetch Exception:", fetchError);
    }

    // Always return success to allow redirect as per Zeta laws
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