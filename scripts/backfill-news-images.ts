// scripts/backfill-news-images.ts
// Re-runs the og:image cascade against existing news_items rows.
// Targets rows where image_url IS NULL (or all rows with --force).
// Safe to re-run. Idempotent on missing-image rows.
//
// Usage (the --env-file flag loads SUPABASE_URL / SUPABASE_SERVICE_KEY):
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts --dry-run
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts --limit 10
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts --force

import { createServerSupabaseClient } from "@/lib/supabase";
import { extractImageUrl } from "@/lib/news-image-extract";

type Row = { id: string; url: string; source_name: string; image_url: string | null };

const CONCURRENCY = 5;

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const limitIdx = argv.indexOf("--limit");
  const limitRaw = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : NaN;
  const limit = Number.isFinite(limitRaw) ? limitRaw : null;
  return { dryRun, force, limit };
}

async function main() {
  const { dryRun, force, limit } = parseArgs();
  console.log(
    `Mode: ${dryRun ? "DRY RUN" : "APPLY"}, force=${force}, limit=${limit ?? "none"}`
  );

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("news_items")
    .select("id, url, source_name, image_url")
    .order("published_at", { ascending: false });
  if (!force) query = query.is("image_url", null);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch rows:", error);
    process.exit(1);
  }
  const rows = (data as Row[]) ?? [];
  console.log(`Found ${rows.length} candidate rows.\n`);

  let updated = 0;
  let stillEmpty = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const chunk = rows.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map(async (row) => {
        const newUrl = await extractImageUrl(row.url);
        return { row, newUrl };
      })
    );
    for (const r of results) {
      if (r.status === "rejected") {
        failed++;
        console.log(`x extraction error: ${String(r.reason)}`);
        continue;
      }
      const { row, newUrl } = r.value;
      if (!newUrl) {
        stillEmpty++;
        console.log(`x ${row.source_name}: ${row.url} (no image found)`);
        continue;
      }
      if (newUrl === row.image_url) {
        console.log(`= ${row.source_name}: unchanged`);
        continue;
      }
      if (dryRun) {
        updated++;
        console.log(`-> ${row.source_name}: would set image_url to ${newUrl}`);
      } else {
        const { error: updErr } = await supabase
          .from("news_items")
          .update({ image_url: newUrl })
          .eq("id", row.id);
        if (updErr) {
          failed++;
          console.log(`x ${row.source_name}: update failed: ${updErr.message}`);
        } else {
          updated++;
          console.log(`v ${row.source_name}: image_url updated`);
        }
      }
    }
  }

  console.log(
    `\nSummary: ${updated} ${dryRun ? "would-update" : "updated"}, ${stillEmpty} still empty, ${failed} errors`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
