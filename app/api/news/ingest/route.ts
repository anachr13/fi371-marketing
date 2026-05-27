import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase";
import { MEDIA_TYPES, NEWS_CATEGORY_SLUGS } from "@/lib/news";

// n8n posts the day's stories here. Single item or { items: [...] }. Secret-key gated.
const itemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(600),
  url: z.string().trim().url().max(2000),
  source_name: z.string().trim().min(1).max(120),
  media_type: z.enum(MEDIA_TYPES),
  category: z.enum(NEWS_CATEGORY_SLUGS),
  // Accept any parseable date (date-only or full ISO) and normalise to ISO UTC.
  published_at: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date")
    .transform((s) => new Date(s).toISOString()),
  image_url: z.string().trim().url().max(2000).optional().nullable(),
  is_ai_related: z.boolean().optional().default(false),
  importance: z.number().int().min(0).max(100).optional().nullable(),
});

const bodySchema = z.union([
  itemSchema,
  z.object({ items: z.array(itemSchema).min(1).max(50) }),
]);

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.NEWS_INGEST_SECRET;
  const provided = request.headers.get("x-ingest-secret");
  if (!secret || !provided || provided.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) {
    diff |= provided.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json().catch(() => null);
    if (raw === null) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const items = "items" in parsed.data ? parsed.data.items : [parsed.data];
    const received = items.length;

    const rows = items.map((it) => ({
      title: it.title,
      summary: it.summary,
      url: it.url,
      source_name: it.source_name,
      media_type: it.media_type,
      category: it.category,
      published_at: it.published_at,
      image_url: it.image_url ?? null,
      is_ai_related: it.is_ai_related ?? false,
      importance: it.importance ?? null,
    }));

    const supabase = createServerSupabaseClient();
    // INSERT ... ON CONFLICT (url) DO NOTHING. .select() returns only newly-inserted rows,
    // so duplicates (re-posts / backfill re-runs) are counted, not errors.
    const { data, error } = await supabase
      .from("news_items")
      .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
      .select("id");

    if (error) {
      console.error("news ingest insert error:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: "Failed to store items" }, { status: 500 });
    }

    const inserted = data?.length ?? 0;
    return NextResponse.json({ received, inserted, duplicates: received - inserted });
  } catch (err) {
    console.error("news ingest error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
