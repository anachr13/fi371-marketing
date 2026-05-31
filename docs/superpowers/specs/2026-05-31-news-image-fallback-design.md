# /news — Image Fallback + Cascade Extraction

**Status:** Approved 2026-05-31
**Branch:** claude/ecstatic-lamport-6adc4c

## Problem

Some `/news` cards render without an image. WSJ.com is the visible example —
WSJ blocks bots from scraping the article page, so n8n's `og:image` extraction
returns nothing, and `image_url` is stored as `null` in `news_items`. The card
then hides the image well entirely, leaving a visual gap.

Three failure modes contribute today:

1. **Paywalled / bot-blocked publishers** (WSJ CFO Journal, some Reuters) — the
   primary scrape fails outright.
2. **Publishers that ship `twitter:image` or JSON-LD but not `og:image`** — the
   current extractor only looks at `og:image`, so these rows ingest with `null`.
3. **Link rot at display time** — even when `image_url` is stored, the remote
   host may 4xx, 5xx, or time out at render. `NewsCard` already hides the image
   well on error, producing the same gap.

## Goal

Every card on `/news` shows an image. When a real article image is unavailable
(any failure mode above), the card renders a Fi371-branded placeholder so the
visual rhythm of the feed stays consistent. Strengthen extraction so the
placeholder is the exception, not the rule.

## Decisions (from brainstorming)

| # | Decision | Picked |
|---|---|---|
| 1 | What does a card with no image look like? | Always show an image — fall back to a placeholder |
| 2 | Placeholder style | Single generic Fi371 placeholder (one asset, used everywhere) |
| 3 | Extraction scope | Cascade + first-party hosting + headless retry (full robustness) |
| 4 | Shipping approach | **Staged: A now, B as roadmap.** Approach A = cascade + placeholder + backfill script. Approach B = first-party Supabase Storage hosting. Approach C = headless browser retry. |
| 5 | Cascade source of truth | TS module in repo (`lib/news-image-extract.ts`); n8n mirrors it with a documented contract |

## Scope of this spec

This spec covers **Approach A only**. Approach B is documented under
[Future work](#future-work) and will be a separate spec when triggered.

## File map

| Change | Path | Purpose |
|---|---|---|
| NEW | `lib/news-image-extract.ts` | Server-only cascade module. One function: `extractImageUrl(articleUrl)`. |
| NEW | `public/news/placeholder.svg` | Fi371-branded fallback image, warm paper palette. |
| NEW | `scripts/backfill-news-images.ts` | Re-runs cascade against rows where `image_url IS NULL`. Saved tool, re-runnable. |
| EDIT | `components/news/NewsCard.tsx` | Always render image well; swap to placeholder on null or `onError`. |
| EDIT (out-of-repo) | n8n "Web Researcher" workflow | Mirror the same cascade in its JS code node. Documented in this spec; not version-controlled in this repo. |

**What does NOT change:**
- DB schema — `image_url` stays nullable text
- `next.config.ts` — `remotePatterns: ["**"]` stays as-is until Approach B lands
- Ingest API contract — `image_url` is still optional in the payload
- Admin tools, list API, infinite scroll, day grouping

## Architecture

### The extraction cascade (`lib/news-image-extract.ts`)

```ts
// Server-only. Given an article URL, try multiple meta-tag strategies in order
// and return the first usable absolute https image URL, or null. Used by the
// backfill script and (via documented contract) mirrored in the n8n workflow.
export async function extractImageUrl(articleUrl: string): Promise<string | null>;
```

**Behavior:**

1. `fetch(articleUrl)` with a browser-like User-Agent and a 10s timeout.
2. If HTTP status is non-2xx → return `null`.
3. Parse the HTML with `node-html-parser` (lightweight, no native bindings).
4. Try, in order, return first valid hit:
   1. `<meta property="og:image">`
   2. `<meta property="og:image:url">`
   3. `<meta property="og:image:secure_url">`
   4. `<meta name="twitter:image">`
   5. `<meta name="twitter:image:src">`
   6. JSON-LD: parse each `<script type="application/ld+json">`, walk for
      `Article.image` / `NewsArticle.image` (string or `{ url }`)
   7. `<link rel="image_src" href="...">`
5. **URL sanity checks** (each candidate must pass before being returned):
   - Absolute `https://` (no `http://`, no relative paths, no `data:` URIs)
   - Length ≤ 2000 chars (matches Zod schema in the ingest API)
   - Hostname parses as a real domain (`new URL()` doesn't throw)
6. If nothing valid → return `null`.

**Why this order:** `og:image` is the publisher's intended share image. Twitter
cards are next-best and very common. JSON-LD is a fallback news publishers
sometimes ship even when they skip Open Graph. `link rel=image_src` is legacy
but still around.

### Frontend (`components/news/NewsCard.tsx`)

The image well always renders. The `src` swaps between the real image and the
placeholder; `onError` triggers the placeholder swap mid-load.

```tsx
const [imgError, setImgError] = useState(false);
const usingPlaceholder = !item.imageUrl || imgError;
const imageSrc = usingPlaceholder ? "/news/placeholder.svg" : item.imageUrl;

return (
  <div className="relative h-[180px] w-full flex-none overflow-hidden rounded border border-border sm:h-[134px] sm:w-[200px]">
    <Image
      src={imageSrc}
      alt={usingPlaceholder ? "" : item.title}
      fill
      sizes="(max-width: 640px) 100vw, 200px"
      className="object-cover saturate-[0.8] brightness-[0.96] transition-[filter] duration-200 group-hover:saturate-100 group-hover:brightness-100"
      onError={() => setImgError(true)}
      unoptimized={usingPlaceholder}
    />
  </div>
);
```

**Three details worth noting:**

1. **Empty `alt` on the placeholder** — decorative, screen readers skip it. On a
   real image, `alt={item.title}` so blind users still get headline context.
2. **`unoptimized` on the placeholder** — it's a local SVG; no value in routing
   it through next/image's optimizer.
3. **Identical hover treatment** — placeholder gets the same `saturate(0.8)
   brightness(0.96)` → full-saturation hover. Keeps the visual rhythm consistent.

### Placeholder visual (`public/news/placeholder.svg`)

- **Dimensions:** 400×268 SVG (2× the 200×134 desktop slot, crisp on retina)
- **Background:** `#EAE2D5` (card surface from DESIGN.md light mode)
- **Center mark:** small "Fi371" wordmark, DM Sans 700, color `#6F675F` (muted text)
- **Editorial rule:** 1px horizontal line above the wordmark in `#C8B9A6`, 24px wide (centered)
- **No chartreuse** — per DESIGN.md, chartreuse (`#C8FF00`) is reserved
  exclusively for AI elements. Using it on the placeholder would falsely signal
  "AI" on every card without an image.
- **Dark mode:** the existing `bg-card` border + the dimmed filter handle dark
  mode automatically; the SVG itself is mode-agnostic. Confirm on visual review.

### Backfill script (`scripts/backfill-news-images.ts`)

**Usage:**
```bash
npx tsx scripts/backfill-news-images.ts --dry-run        # preview only
npx tsx scripts/backfill-news-images.ts                  # apply updates
npx tsx scripts/backfill-news-images.ts --limit 10       # process first 10 rows
npx tsx scripts/backfill-news-images.ts --force          # re-check rows that already have an image
```

**What it does:**

1. Connect to Supabase via the service-role client (reads `.env.local`).
2. Select rows where `image_url IS NULL` — or all rows when `--force`.
3. For each row, call `extractImageUrl(row.url)` from the shared module.
4. If a usable URL is found → `UPDATE news_items SET image_url = ... WHERE id = ...`.
5. If not → log and skip; card will show placeholder.
6. Print summary: `N rows updated, M still have no image`.

**Safety:**

- `--dry-run` prints would-be updates without writing — recommended first pass.
- Concurrency: process 5 rows in parallel (`Promise.all` in chunks of 5). Polite
  to publisher servers, fast enough for the current ~30-row feed.
- Per-row failures are logged and skipped; never abort the whole run.
- Idempotent — safe to re-run; only touches rows where a new value is found.

**Expected outcome on current data:**

The feed has 25/29 rows with images. Of the 4 missing:
- 3 WSJ CFO Journal rows: probably still no usable image. WSJ's paywall page
  serves a generic logo at best. Cards show the Fi371 placeholder.
- 1 Reuters row: possibly recovered via `twitter:image` or JSON-LD. If not,
  placeholder.

Net: best case 1-2 recovered, worst case 0. The placeholder carries these.

### n8n mirror contract

The n8n "Web Researcher" workflow's JS code node does its own HTML fetch + parse.
We do **not** route n8n through our `/api/news/extract-image` endpoint (extra hop,
extra deploy gate). Instead:

- `lib/news-image-extract.ts` is the source of truth.
- A comment at the top of that file documents the cascade order and links to
  this spec.
- The n8n workflow's JS code node has a matching comment that says: "Mirror
  of `lib/news-image-extract.ts` cascade — if you change this, update the TS
  module too."
- Out of scope for the repo PR; the n8n change is a separate small change in
  the n8n workspace.

## Data flow

```
Ingest path (n8n → DB):
  Article URL → n8n cascade (mirrors TS module) → image_url (or null) → POST /api/news/ingest → news_items row

Display path (DB → user):
  news_items row → getNewsPage() → NewsItem → NewsCard
    if imageUrl is null OR <Image> onError fires → render /news/placeholder.svg
    else                                         → render the real image

Backfill path (one-shot tool, re-runnable):
  scripts/backfill-news-images.ts
    → SELECT id, url FROM news_items WHERE image_url IS NULL
    → extractImageUrl(url) (from the TS module)
    → UPDATE news_items SET image_url = ... (when found)
```

## Error handling

Every failure path ends at the placeholder — no broken-image icons, no empty
white boxes, no layout shift.

| Failure | Handled by | User impact |
|---|---|---|
| n8n primary `og:image` returns nothing | Cascade falls through to next meta source | Often recovered |
| Whole cascade returns null | `image_url` ingested as null | Card shows placeholder |
| Stored `image_url` host returns 4xx/5xx | `NewsCard` `onError` → placeholder | Placeholder, no broken icon |
| Stored `image_url` is malformed or times out | Same — `onError` → placeholder | Placeholder |
| `placeholder.svg` missing at build | `npm run build` fails on missing static reference | Caught before deploy |
| Backfill script can't fetch an article URL | Caught try/catch, logged, row skipped | Other rows continue |
| Backfill script Supabase update fails | Logged, row skipped | Other rows continue |
| n8n cascade JS throws | Workflow catches, sends `image_url: null` to ingest | Card shows placeholder |
| User on flaky network | `onError` → placeholder | Card still renders |

No silent error swallowing — both the n8n cascade and the backfill script log
failures with the article URL so we can audit later.

## Open questions

1. **New dependency:** Approach A needs an HTML parser. `node-html-parser` is the
   smallest sensible option (~50KB, no native bindings, no jsdom). Per
   CLAUDE.md "Ask before adding any new dependency." → **Ask user during the
   implementation plan.** Alternative: hand-rolled regex extraction (fragile,
   not recommended).
2. **n8n workflow update timing:** the n8n cascade mirror can land before, after,
   or alongside the repo PR. They are independent. Recommendation: ship repo PR
   first (frontend works immediately via placeholder), update n8n the same day.
3. **Backfill script `.env.local`:** the script reuses the existing
   `SUPABASE_*` env vars already in `.env.local`. No new secrets.

## Testing

Per `reference_validation_workflow`: no unit tests. Validation is:

- `npm run lint` — catches TS / linting issues in new files
- `npm run build` — full TypeScript check; fails on missing static asset references
- **Manual smoke test:**
  1. Run `npx tsx scripts/backfill-news-images.ts --dry-run` against the live DB.
  2. Apply: `npx tsx scripts/backfill-news-images.ts`.
  3. `npm run dev`, open `/news`.
  4. Confirm: every card has an image OR the Fi371 placeholder. No missing
     image wells, no broken-image icons.
  5. Pick a WSJ card, confirm placeholder is showing.
  6. DevTools → throttle to "Offline" → reload → confirm placeholders appear
     cleanly when remote images fail.
- **Cross-check before merge:** screenshot `/news` in light and dark mode,
  confirm placeholder renders correctly in both.

## Future work — Approach B

Approach B: First-party hosting in Supabase Storage. Download each image at
ingest time, upload to a `news-thumbnails` bucket, store the Supabase URL in
`image_url` instead of the publisher's CDN URL.

**Why we waited:**
- Link rot isn't a current pain — the oldest article is ~5 days old.
- The feed is too small for it to be visible (29 rows; growing daily by a handful).
- Approach A's placeholder is a sufficient safety net at this scale.

**Triggers to revisit:**
- Feed exceeds ~500 rows.
- We spot a broken image on an older article in production.
- We want to tighten `next.config.ts` `remotePatterns` to a known allowlist
  (privacy / hardening — currently `"**"`).

**Effort estimate when triggered:** ~2 days. Includes:
- Supabase Storage bucket creation + RLS policy
- Ingest pipeline change (download → upload → store Supabase URL)
- One-time migration script to back-populate the bucket from existing
  `image_url` values
- `next.config.ts` `remotePatterns` tightening (optional)

**Future work — Approach C** (headless browser for blocked sources): only if a
specific blocker emerges that justifies it. Likely doesn't help WSJ (paywall
blocks headless too); useful for sites that gate on JS rendering. Out of scope
unless a real need shows up.

## What ships in Approach A

| Artifact | Where |
|---|---|
| Cascade module | `lib/news-image-extract.ts` |
| Placeholder asset | `public/news/placeholder.svg` |
| Backfill script | `scripts/backfill-news-images.ts` |
| Updated card | `components/news/NewsCard.tsx` |
| n8n cascade mirror | (out-of-repo, applied same day) |
| New dep | `node-html-parser` (pending user approval) |
