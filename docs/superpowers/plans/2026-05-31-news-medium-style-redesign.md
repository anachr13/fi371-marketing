# `/news` Medium-style redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3-column grid + featured-promotion `/news` layout with a single-column, Medium-inspired feed where every card is identical (publisher row → labels → 26px serif title → summary → image to the right), and plumb two new fields (`source_logo_url`, `author_name`) end-to-end so n8n can start feeding them.

**Architecture:** Two new nullable columns on `public.news_items`, both flowed through the existing types (`NewsItem`), the existing server reader (`lib/news.server.ts`), and the existing ingest validator (`app/api/news/ingest/route.ts`). The frontend gets one rewritten `NewsCard` (single layout, no `featured` prop) and one simplified `NewsFeed` (grid + featured logic removed, day groups + filter chips kept). Backwards-compatible: old rows + old n8n posts continue to work.

**Tech Stack:** Next.js 16.2.4 (App Router), TypeScript, Tailwind, shadcn/ui, Supabase (Postgres), Zod, next/font/google for Instrument Serif + DM Sans + IBM Plex Mono. No unit tests in this repo — validation is `npm run lint` + `npm run build` + manual dogfood.

**Spec:** [docs/superpowers/specs/2026-05-31-news-medium-style-redesign-design.md](../specs/2026-05-31-news-medium-style-redesign-design.md)

---

## File Structure

**Create:**
- `db/news_items_logo_author.sql` — migration that adds the two new columns.

**Modify:**
- `lib/news.ts` — add `sourceLogoUrl` + `authorName` to the `NewsItem` type.
- `lib/news.server.ts` — extend `SELECT_COLUMNS`, `NewsRow`, `rowToItem`.
- `app/api/news/ingest/route.ts` — extend `itemSchema` and the upsert row mapping.
- `components/news/NewsCard.tsx` — full rewrite: single layout, publisher row helper, fallbacks.
- `components/news/NewsFeed.tsx` — drop grid + featured promo, single-column stack.

**Untouched:**
- `components/news/NewsPage.tsx` — shell stays as-is.
- `components/news/CategoryFilter.tsx` — filter chips stay as-is.
- `app/news/page.tsx` — server entry stays as-is (no schema/SEO changes).
- `app/api/news/list/route.ts` — list endpoint stays as-is (it reuses `getNewsPage`).
- `app/admin/news/page.tsx` — admin moderation stays as-is (out of scope).

---

## Task 1: Add `source_logo_url` + `author_name` columns to `news_items`

**Files:**
- Create: `db/news_items_logo_author.sql`
- Apply via Supabase MCP `mcp__5378505f-23ed-4e3f-a5e4-4bd6d18d011f__apply_migration` to project `kerlookffyyascxyubqs`.

- [ ] **Step 1: Write the migration SQL file**

Create `db/news_items_logo_author.sql` with this content:

```sql
-- Add publisher logo URL and (optional) author name to news_items. Backwards-compatible:
-- both nullable, so existing n8n ingest payloads continue to validate without change.
-- Apply to Supabase via the SQL editor or the Supabase MCP `apply_migration` tool.

alter table public.news_items
  add column if not exists source_logo_url text,
  add column if not exists author_name    text;
```

- [ ] **Step 2: Apply the migration**

Call the Supabase MCP migration tool (tool name `mcp__5378505f-23ed-4e3f-a5e4-4bd6d18d011f__apply_migration`) with:
- `project_id`: `kerlookffyyascxyubqs`
- `name`: `news_items_logo_author`
- `query`: the SQL body from Step 1 (without comments — just the `alter table ...` statement is fine).

Expected: success response, no error.

- [ ] **Step 3: Verify the columns exist**

Call `mcp__5378505f-23ed-4e3f-a5e4-4bd6d18d011f__list_tables` with:
- `project_id`: `kerlookffyyascxyubqs`
- `schemas`: `["public"]`

Expected: in the `news_items` row, the `columns` array includes both `source_logo_url` and `author_name`, both with `data_type: "text"` and `is_nullable: true`.

- [ ] **Step 4: Commit the SQL file**

```bash
git add db/news_items_logo_author.sql
git commit -m "$(cat <<'EOF'
feat(db): add source_logo_url + author_name to news_items

Both nullable, so existing rows and the current n8n ingest payload
keep working unchanged. Applied to Supabase project kerlookffyyascxyubqs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Plumb new fields through the type system + ingest API

**Files:**
- Modify: `lib/news.ts:36-49` — extend `NewsItem` type
- Modify: `lib/news.server.ts:12-43` — extend `SELECT_COLUMNS`, `NewsRow`, `rowToItem`
- Modify: `app/api/news/ingest/route.ts:6-73` — extend `itemSchema` + upsert row mapping

- [ ] **Step 1: Extend the `NewsItem` client type**

In `lib/news.ts`, replace the existing `NewsItem` type block (the one starting `// Client-facing item (camelCase)...`) with:

```ts
// Client-facing item (camelCase). Mirrors a public news_items row (without `hidden`).
export type NewsItem = {
  id: string;
  publishedAt: string; // ISO 8601 (UTC)
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  sourceLogoUrl: string | null;
  authorName: string | null;
  mediaType: MediaType;
  category: NewsCategorySlug;
  imageUrl: string | null;
  isAiRelated: boolean;
  importance: number | null;
};
```

- [ ] **Step 2: Extend the server reader**

In `lib/news.server.ts`:

(a) Replace the `SELECT_COLUMNS` constant with:

```ts
const SELECT_COLUMNS =
  "id, published_at, title, summary, url, source_name, source_logo_url, author_name, media_type, category, image_url, is_ai_related, importance";
```

(b) Replace the `NewsRow` type with:

```ts
type NewsRow = {
  id: string;
  published_at: string;
  title: string;
  summary: string;
  url: string;
  source_name: string;
  source_logo_url: string | null;
  author_name: string | null;
  media_type: NewsItem["mediaType"];
  category: NewsCategorySlug;
  image_url: string | null;
  is_ai_related: boolean;
  importance: number | null;
};
```

(c) Replace the `rowToItem` function body with:

```ts
function rowToItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    publishedAt: new Date(row.published_at).toISOString(),
    title: row.title,
    summary: row.summary,
    url: row.url,
    sourceName: row.source_name,
    sourceLogoUrl: row.source_logo_url,
    authorName: row.author_name,
    mediaType: row.media_type,
    category: row.category,
    imageUrl: row.image_url,
    isAiRelated: row.is_ai_related,
    importance: row.importance,
  };
}
```

- [ ] **Step 3: Extend the ingest validator**

In `app/api/news/ingest/route.ts`:

(a) Replace the `itemSchema` block with:

```ts
const itemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(600),
  url: z.string().trim().url().max(2000),
  source_name: z.string().trim().min(1).max(120),
  source_logo_url: z.string().trim().url().max(2000).optional().nullable(),
  author_name: z.string().trim().min(1).max(200).optional().nullable(),
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
```

(b) Replace the `rows` mapping inside the POST handler with:

```ts
    const rows = items.map((it) => ({
      title: it.title,
      summary: it.summary,
      url: it.url,
      source_name: it.source_name,
      source_logo_url: it.source_logo_url ?? null,
      author_name: it.author_name ?? null,
      media_type: it.media_type,
      category: it.category,
      published_at: it.published_at,
      image_url: it.image_url ?? null,
      is_ai_related: it.is_ai_related ?? false,
      importance: it.importance ?? null,
    }));
```

- [ ] **Step 4: Type-check the changes**

Run: `npm run build`
Expected: build succeeds. (The Next.js build runs `tsc`. There are no new errors; the existing baseline lint errors in shadcn boilerplate don't gate the build.)

If you see a tsc error pointing at the three edited files, re-read Steps 1–3 carefully — the camelCase ↔ snake_case mapping is the most common source of mistakes.

- [ ] **Step 5: Lint-check the changes**

Run: `npm run lint`
Expected: no NEW errors compared to the ~13 baseline shadcn errors. If `lint` reports anything pointing at `lib/news.ts`, `lib/news.server.ts`, or `app/api/news/ingest/route.ts`, fix it before continuing.

- [ ] **Step 6: Commit**

```bash
git add lib/news.ts lib/news.server.ts app/api/news/ingest/route.ts
git commit -m "$(cat <<'EOF'
feat(news-api): accept source_logo_url + author_name in ingest

Both fields are optional + nullable so the current n8n payload keeps
validating. NewsItem type, server reader (SELECT_COLUMNS / NewsRow /
rowToItem) and the Zod ingest schema + upsert mapping all carry the
new fields through. No frontend changes yet — that's the next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Redesign `NewsCard` + simplify `NewsFeed` for single-column Medium layout

These two files change together to avoid leaving the tree in a broken state (NewsFeed currently passes `featured` to NewsCard; once NewsCard drops the prop, NewsFeed must stop passing it).

**Files:**
- Modify (full rewrite): `components/news/NewsCard.tsx`
- Modify: `components/news/NewsFeed.tsx` (drop grid + featured promotion; keep day groups + sentinel + load-more)

- [ ] **Step 1: Rewrite `components/news/NewsCard.tsx`**

Replace the entire file content with:

```tsx
"use client";
// One Medium-style story card. Top to bottom: publisher row (logo + name + optional
// author) → label chips (media type + AI flag, category) → 26px Instrument Serif title
// → summary. Optional article image sits to the right on ≥640px, stacks below on mobile.
// Whole card is the link target. Missing publisher logo falls back to a first-letter
// circle so the alignment stays consistent. Chartreuse (bg-primary) on the media chip is
// reserved for AI items per DESIGN.md.

import Image from "next/image";
import { useState } from "react";
import { categoryLabel, type NewsItem } from "@/lib/news";

const MEDIA_LABEL: Record<NewsItem["mediaType"], string> = {
  article: "Article",
  report: "Report",
  video: "Video",
  podcast: "Podcast",
  other: "Link",
};

function PublisherLogo({ src, name }: { src: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  if (src && !errored) {
    return (
      // Plain <img>: publisher logos come from many domains; keeping them out of next/image
      // avoids a remotePatterns allowlist explosion. They render at 22px, so optimization
      // doesn't meaningfully matter.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={22}
        height={22}
        onError={() => setErrored(true)}
        className="h-[22px] w-[22px] flex-none rounded-full border border-border object-cover bg-card"
      />
    );
  }
  const letter = (name.trim().charAt(0) || "·").toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground"
    >
      {letter}
    </span>
  );
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imgError;

  return (
    <article className="border-b border-border last:border-b-0">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.title}
        className="group flex flex-col gap-4 py-6 sm:flex-row sm:gap-8 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="min-w-0 flex-1">
          {/* Publisher row */}
          <div className="mb-2.5 flex items-center gap-2 text-[14px]">
            <PublisherLogo src={item.sourceLogoUrl} name={item.sourceName} />
            <span className="text-muted-foreground">
              In <span className="font-medium text-foreground">{item.sourceName}</span>
              {item.authorName ? (
                <>
                  {" "}by <span className="text-foreground">{item.authorName}</span>
                </>
              ) : null}
            </span>
          </div>

          {/* Label row */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.05em] px-2 py-0.5 rounded border ${
                item.isAiRelated
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border"
              }`}
            >
              {item.isAiRelated ? "AI · " : ""}{MEDIA_LABEL[item.mediaType]}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.05em] px-2 py-0.5 rounded border bg-background text-muted-foreground border-border">
              {categoryLabel(item.category)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-[26px] leading-[1.15] tracking-[-0.005em] mb-2 text-foreground group-hover:underline underline-offset-4">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-[16px] leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        </div>

        {showImage && (
          <div className="relative h-[180px] w-full flex-none overflow-hidden rounded border border-border sm:h-[134px] sm:w-[200px]">
            <Image
              src={item.imageUrl as string}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </a>
    </article>
  );
}
```

- [ ] **Step 2: Rewrite `components/news/NewsFeed.tsx`**

Replace the entire file content with:

```tsx
"use client";
// The infinite-scrolling feed. Single column of identical cards, grouped by day. The
// server passes the first batch + initial cursor; we append from /api/news/list as the
// sentinel nears the viewport. No more featured-promotion — every card is equal.

import { useCallback, useEffect, useRef, useState } from "react";
import NewsCard from "./NewsCard";
import { groupByDay, type NewsItem, type NewsCategorySlug } from "@/lib/news";

export default function NewsFeed({
  initialItems,
  initialCursor,
  category,
  todayKey,
  yesterdayKey,
}: {
  initialItems: NewsItem[];
  initialCursor: string | null;
  category: NewsCategorySlug | null;
  todayKey: string;
  yesterdayKey: string;
}) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      params.set("cursor", cursor);
      if (category) params.set("category", category);
      const res = await fetch(`/api/news/list?${params.toString()}`);
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { items: NewsItem[]; nextCursor: string | null };
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, category]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return (
      <p className="text-[19px] text-muted-foreground">No stories yet — check back soon.</p>
    );
  }

  const groups = groupByDay(items, todayKey, yesterdayKey);

  return (
    <div>
      {groups.map((group) => (
        <section key={group.key} className="mb-12">
          <h2 className="font-mono text-[12px] tracking-[0.08em] uppercase text-muted-foreground mb-2 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
            {group.label}
          </h2>
          <div>
            {group.items.map((it) => (
              <NewsCard key={it.id} item={it} />
            ))}
          </div>
        </section>
      ))}

      {cursor && <div ref={sentinelRef} aria-hidden className="h-1" />}
      <div role="status" aria-live="polite">
        {loading && (
          <p className="font-mono text-[13px] text-muted-foreground text-center py-8">Loading…</p>
        )}
        {error && (
          <button
            onClick={loadMore}
            className="mx-auto flex w-fit items-center justify-center min-h-[44px] font-mono text-[13px] px-6 rounded-full border border-foreground text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Couldn’t load more — tap to retry
          </button>
        )}
        {!cursor && (
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground text-center py-10">
            You’re all caught up
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run build`
Expected: build succeeds with no errors. If tsc complains about `featured`, `imgError` types, or `NewsItem` field access, re-read Steps 1 and 2.

- [ ] **Step 4: Lint-check**

Run: `npm run lint`
Expected: no NEW errors. The one `<img>` use in `PublisherLogo` is silenced with an inline `eslint-disable-next-line @next/next/no-img-element` comment — confirm that comment is on the line directly above the `<img>` element.

- [ ] **Step 5: Commit**

```bash
git add components/news/NewsCard.tsx components/news/NewsFeed.tsx
git commit -m "$(cat <<'EOF'
feat(/news): Medium-style cards, single-column feed

Drops the 3-column grid + daily-featured promotion. Every card now
renders identically: publisher row (logo + name + optional author) →
label chips → 26px serif title → 16px summary, with optional 200×134
image to the right (stacks below on mobile). Whole card is the link
target. Missing source_logo_url falls back to a first-letter circle.
Day groupings and the category filter chips stay.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Manual dogfood

No code changes here — this is the visual validation pass called out in the spec.

**Files:** none.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: dev server boots, prints a localhost URL (typically `http://localhost:3000`). Open `/news`.

- [ ] **Step 2: Walk the empty / full-data / fallback matrix**

For each scenario, confirm visually. Where the data isn't already in the DB, hide the cells you don't want via the admin page (`/admin/news`) or temporarily edit a row in Supabase Studio.

| Scenario | What to confirm |
|---|---|
| Empty DB (no visible rows) | "No stories yet — check back soon." renders; no console errors. |
| Card with `source_logo_url` + `author_name` + `image_url` | Logo circle renders the remote image; "In Publisher by Author"; 200×134 image to the right on desktop. |
| Card with `source_logo_url` but no `author_name` | "In Publisher" alone — no trailing word, no orphan punctuation. |
| Card with `author_name` but no `source_logo_url` | First-letter circle in place of the logo; "In Publisher by Author" still reads cleanly. |
| Card with no `image_url` | Body takes full width; no empty image well; no layout shift. |
| AI-related card (`is_ai_related = true`) | First chip is chartreuse (`AI · Article`); second chip stays muted (the category). |
| Mobile viewport (`<640px`, e.g. iPhone DevTools) | Image stacks below body at full width, ~180px tall; type sizes stay legible. |
| Category filter click (e.g. `/news?category=ai-in-audit`) | Only that category renders; no day-1 card is promoted bigger than the rest. |
| Infinite scroll | After ~24 items, the sentinel triggers; "Loading…" shows; next batch appends. |
| Keyboard tab | Whole card receives a visible focus ring (chartreuse-adjacent foreground ring on background); Enter opens the article in a new tab. |

- [ ] **Step 3: If anything is off, fix it and re-run lint + build**

If you find a visual bug (e.g. title doesn't underline on hover, focus ring not visible, image overflows on a narrow viewport), edit the relevant file, then:

```bash
npm run lint
npm run build
```

Commit each fix with a descriptive message (`fix(/news): ...`).

- [ ] **Step 4: Final sanity check on lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed; lint has no NEW errors beyond the baseline.

- [ ] **Step 5: Stop the dev server**

`Ctrl+C` the `npm run dev` process.

---

## Trade-offs encoded in this plan

- **Plain `<img>` for publisher logos.** The spec calls this out — keeps logos out of the next/image remotePatterns allowlist. 22px renders fine without optimization. The eslint rule is silenced with a single-line `eslint-disable-next-line` comment.
- **No tests written.** The repo has none; spec validation is lint + build + manual dogfood (per project memory `reference_validation_workflow.md`).
- **Direct file rewrites, no subagent writes.** Per project memory `feedback_subagent_worktree_contamination.md`, write-subagents in Conductor worktrees can contaminate the main branch. Each task in this plan is meant to be executed directly in this worktree.
- **NewsCard + NewsFeed bundled in one task.** They must change together (the `featured` prop disappears from one side, so the other side must stop passing it). Splitting them would leave the tree non-compiling between commits.

---

## Self-review notes

- Spec section "Visual structure" → covered by Task 3 Step 1 (NewsCard) and Step 2 (NewsFeed).
- Spec section "Data model changes" → covered by Task 1 (SQL) and Task 2 (types + ingest).
- Spec section "Component changes" → covered by Task 3.
- Spec section "Fallback behaviour" → covered in Task 3 Step 1 (`PublisherLogo` + `authorName ? ... : null` + `showImage` guard).
- Spec section "Accessibility" → `aria-label` on the link, `aria-hidden` on the logo letter, `<img alt={item.title}>` on the article image, focus ring preserved.
- Spec section "Testing / validation" → Task 4 mirrors the matrix.
- No `TBD`, `TODO`, or "implement later" in any step.
- Function/type names checked for consistency: `PublisherLogo`, `MEDIA_LABEL`, `sourceLogoUrl` / `authorName` (camelCase in the type, snake_case in DB + Zod). `NewsItem` extension is referenced identically in `lib/news.ts`, `lib/news.server.ts`, and `components/news/NewsCard.tsx`.
