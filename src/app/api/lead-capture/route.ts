import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

function getConnString() {
    // Prefer pooled, fallback to direct
    return process.env.DATABASE_URL || process.env.DIRECT_URL || "";
}

const pool = new Pool({
    connectionString: getConnString(),
    ssl: { rejectUnauthorized: false },
    // keep tiny to avoid Neon pooler issues in dev
    max: 1,
});

function okJson(data: any, status = 200) {
    return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
    try {
        // simple auth (optional but recommended): accept token if set
        const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
        const key = (process.env.CRM_API_KEY || "").trim();
        if (key && token !== key) return okJson({ error: "Unauthorized" }, 401);

        const body = await req.json().catch(() => ({}));

        const name = String(body?.name || "").trim();
        const phone = String(body?.phone || "").trim();
        const email = body?.email ? String(body.email).trim() : null;

        // MIN requirements: name + phone OR name only (because user asked “أي مكان بسرعة”)
        if (!name) return okJson({ error: "name is required" }, 400);

        const sourcePlatform = String(body?.sourcePlatform || "instagram").toLowerCase();
        const sourceUrl = body?.sourceUrl ? String(body.sourceUrl) : null;
        const sourceVideoUrl = body?.sourceVideoUrl ? String(body.sourceVideoUrl) : null;
        const sourceType = body?.sourceType ? String(body.sourceType) : "Video";
        const source = String(body?.source || "instagram").toLowerCase();
        const budget = body?.budget ? String(body.budget) : null;
        const campaignId = body?.campaignId ? String(body.campaignId) : null;

        const client = await pool.connect();
        try {
            // Find admin user id (if exists)
            const admin = await client.query(
                `select id from "User" where role='admin' order by "createdAt" asc limit 1`
            );
            const assignedTo = admin.rows?.[0]?.id || null;

            // Default pipeline + first stage (optional)
            const pipe = await client.query(`select id from "Pipeline" where "isDefault"=true limit 1`);
            const pipelineId = pipe.rows?.[0]?.id || null;

            let stageId: string | null = null;
            if (pipelineId) {
                const st = await client.query(
                    `select id from "Stage" where "pipelineId"=$1 order by "order" asc limit 1`,
                    [pipelineId]
                );
                stageId = st.rows?.[0]?.id || null;
            }

            // Insert lead (minimal)
            const inserted = await client.query(
                `insert into "Lead"
        ("id","name","phone","email","budget","status","score","source",
         "sourcePlatform","sourceUrl","sourceVideoUrl","sourceType",
         "pipelineId","stageId","priority","expectedValue","assignedTo","campaignId",
         "createdAt","updatedAt")
        values
        (concat('ld_', substring(md5(random()::text), 1, 24)),
         $1,$2,$3,$4,'new',0,$5,
         $6,$7,$8,$9,
         $10,$11,'MEDIUM',0,$12,$13,
         now(),now())
        returning id`,
                [
                    name,
                    phone || null,
                    email,
                    budget,
                    source,
                    sourcePlatform,
                    sourceUrl,
                    sourceVideoUrl,
                    sourceType,
                    pipelineId,
                    stageId,
                    assignedTo,
                    campaignId,
                ]
            );

            const leadId = inserted.rows[0].id;

            // Notification only if admin exists
            if (assignedTo) {
                await client.query(
                    `insert into "Notification"
          ("id","type","title","body","leadId","userId","isRead","createdAt")
          values
          (concat('nt_', substring(md5(random()::text), 1, 24)),
           'LEAD_ASSIGNMENT','New Lead (Emergency Capture)',
           $1,$2,$3,false,now())`,
                    [`${name}${phone ? ` (${phone})` : ""}`, leadId, assignedTo]
                );
            }

            return okJson({ success: true, leadId });
        } finally {
            client.release();
        }
    } catch (e: any) {
        console.error("[lead-capture] error:", e);
        return okJson({ error: "Internal Server Error" }, 500);
    }
}

export async function GET(req: NextRequest) {
    try {
        // Auth via Header OR Query param (for easy browser access)
        const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
        const url = new URL(req.url);
        const queryKey = url.searchParams.get("key");
        const key = (process.env.CRM_API_KEY || "").trim();

        // Check if key is configured and enforce it
        if (key && token !== key && queryKey !== key) {
            return okJson({ error: "Unauthorized" }, 401);
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                `select id, name, phone, email, source, "sourcePlatform", "createdAt" 
         from "Lead" 
         order by "createdAt" desc 
         limit 50`
            );
            return okJson({
                success: true,
                count: result.rowCount,
                leads: result.rows
            });
        } finally {
            client.release();
        }
    } catch (e: any) {
        console.error("[lead-capture-get] error:", e);
        return okJson({ error: "Internal Server Error" }, 500);
    }
}
