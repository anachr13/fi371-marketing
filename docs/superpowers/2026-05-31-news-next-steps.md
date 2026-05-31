# `/news` — Where we left off + next steps

**Last touched:** 2026-05-31
**Branch:** `claude/nifty-payne-14cc41` (worktree: `nifty-payne-14cc41`)
**Live URL (local):** http://localhost:3000/news
**Live URL (prod):** https://fi371.com/news (or your Vercel preview for this branch)

---

## What shipped this session

The /news redesign from grid-and-featured to single-column Medium-style is done end-to-end:

- **DB:** `news_items` table got two new nullable columns — `source_logo_url`, `author_name`. Migration file: [db/news_items_logo_author.sql](../../db/news_items_logo_author.sql). Applied to Supabase project `kerlookffyyascxyubqs`.
- **Ingest API:** `POST /api/news/ingest` now accepts both new fields, both optional. Old n8n payloads keep working.
- **Frontend:** `NewsCard` is a single Medium-style layout — publisher row (logo + name + optional author) → title → summary → label chips → image on the right (stacks below on mobile). `NewsFeed` is a single-column stack — no more grid, no featured promotion. Whole card is the click target. Article images are dimmed (`saturate(0.8) brightness(0.96)`), pop back to full colour on hover. Body column caps at 640px on desktop for Medium-style line length.
- **Data:** 25 of 29 production rows have a real article image pulled from each source's `og:image` meta tag.

**Spec:** [docs/superpowers/specs/2026-05-31-news-medium-style-redesign-design.md](specs/2026-05-31-news-medium-style-redesign-design.md)
**Plan:** [docs/superpowers/plans/2026-05-31-news-medium-style-redesign.md](plans/2026-05-31-news-medium-style-redesign.md)

---

## Open items

### Priority 1 — wire n8n to send `source_logo_url` + `author_name`

The frontend, schema, and validator are all ready. The n8n research workflow just needs to start sending these two new fields. **Both are optional**, so this is a one-line addition per field to your n8n payload — old runs still work.

Pseudocode for the n8n side:
```js
// In the node that builds the POST body for /api/news/ingest:
{
  ...existingFields,
  source_logo_url: extractedPublisherLogoUrl,  // null if not found
  author_name: extractedAuthorName,            // null if not found
}
```

Where to extract from the source page:
- `source_logo_url` — best from the publisher's homepage (`<link rel="apple-touch-icon">` or the `og:image` of the homepage). A cheap fallback that always works: `https://www.google.com/s2/favicons?domain=<host>&sz=64`.
- `author_name` — from the article page: `<meta property="article:author">`, `<meta name="author">`, or the JSON-LD `author.name` field. Many of our sources expose this cleanly.

### Priority 2 — backfill logos + authors for the existing 29 rows

Same approach as the og:image scrape, just two more meta-tag passes. The script that did the images this session is at [/tmp/extract-og-images.sh](/tmp/extract-og-images.sh) (one-shot — not saved to the repo yet). Adapt it to grep for `og:logo` / `article:author` / `meta name="author"` instead, then bulk-update.

**Decision the next session should make:** should this scraping live as a `scripts/backfill-news-meta.ts` (Node script using the existing Supabase client) so it can be re-run as new rows come in? Or is n8n the only place that ever needs this logic? I'd vote yes, save it — it's also useful as a one-shot recovery tool if n8n misses a field.

### Priority 3 — what to do with the 4 paywalled rows

Three WSJ CFO Journal articles and one Reuters sustainability piece block bots, so the og:image scrape returned empty for them. They currently render text-only on /news. Three ways to handle them:

- **(a) Leave them text-only.** Cleanest. Matches the "no image" fallback path. Best default.
- **(b) Hand-pick fallback images per article** in n8n — extra editorial work per WSJ story.
- **(c) Use a static publisher hero per source** ("WSJ generic" image for any WSJ story without og:image). Looks repetitive across many WSJ stories but solves the visual gap.

My recommendation: (a). If the editorial team finds the all-text WSJ cards visually weak, escalate to (c).

### Priority 4 — design-review findings still open

From the /design-review pass this session, four findings remain. Three were design taste calls that didn't get fixed:

- **F2** (medium) — mobile click affordance. Whole card is clickable but there's no hover cue on touch devices. A subtle `→` glyph at the right edge of the body would read as "tap to open" without breaking the calm. ~10 lines of JSX in `components/news/NewsCard.tsx`.
- **F3** (polish) — letter-circle logos all look identical (gray-on-paper circles). Acceptable as fallback, but a touch more colour or contrast would help with rhythm. Only matters until P1 (real logos) lands — then becomes moot.
- **F4** (polish) — empty space right of cards on wide viewports. Body caps at 640px and image well is 200px + 32px gap, so there's a chunk of empty paper to the right at 1200px page width. Intentional (Medium-style loose feed), but worth eyeballing on a wide monitor.

### Priority 5 — spec/plan freshness

The spec and plan don't mention the late-session tweaks made after the user reviewed them:
- Label chips moved to **below the summary** (not above the title — spec still says above).
- Body column capped at `sm:max-w-[640px]` (spec doesn't mention this).
- Article images dimmed with `saturate(0.8) brightness(0.96)` + hover-restore (spec doesn't mention this).

If the next session does more work on /news, fold these into the spec for accuracy. Otherwise, the git log is the source of truth — these changes landed in commits `c3b08fb` and `4a995d7`.

---

## Files to know

| Path | What it does |
|---|---|
| [app/news/page.tsx](../../app/news/page.tsx) | Server entry — fetches the first batch, sets SEO, hands off to `<NewsPage>` |
| [components/news/NewsPage.tsx](../../components/news/NewsPage.tsx) | Client shell — header, footer, demo modal, H1, filter chips |
| [components/news/NewsFeed.tsx](../../components/news/NewsFeed.tsx) | Infinite-scroll feed — day groups, sentinel, load-more states |
| [components/news/NewsCard.tsx](../../components/news/NewsCard.tsx) | The card — publisher row, title, summary, labels, image |
| [components/news/CategoryFilter.tsx](../../components/news/CategoryFilter.tsx) | Filter chips at top |
| [lib/news.ts](../../lib/news.ts) | Client-safe types + day grouping helpers |
| [lib/news.server.ts](../../lib/news.server.ts) | Server-side Supabase reads + keyset cursor |
| [app/api/news/ingest/route.ts](../../app/api/news/ingest/route.ts) | n8n POSTs here — Zod-validated, service-role secret gate |
| [app/api/news/list/route.ts](../../app/api/news/list/route.ts) | Pagination endpoint (called by the infinite scroll) |
| [app/admin/news/page.tsx](../../app/admin/news/page.tsx) | Password-gated hide tool — useful for moderating bad rows |
| [db/news_items.sql](../../db/news_items.sql) | Original table definition |
| [db/news_items_logo_author.sql](../../db/news_items_logo_author.sql) | This session's migration |

---

## Quick commands to pick up where we left off

```bash
# Make sure the worktree is current
git fetch && git status

# Worktrees need npm install + .env on first use — both are already in place here
ls .env.local && head -1 .env.local | grep SUPABASE  # should print one line

# Start the dev server
npm run dev   # → http://localhost:3000/news

# Lint + type-check before pushing
npm run lint
npm run build

# Inspect what the DB looks like for /news
# (use the Supabase MCP — project_id: kerlookffyyascxyubqs)
# Useful queries:
#   select count(*), count(image_url), count(author_name), count(source_logo_url)
#   from public.news_items where hidden = false;
#
#   select source_name, count(*), count(image_url) as has_image
#   from public.news_items where hidden = false group by source_name order by 2 desc;
```

---

## Open questions for the next session

1. **Do logos and authors need a backfill script saved to the repo, or is n8n the only place that ever needs this logic?** (See Priority 2.)
2. **Are the 4 paywalled cards (WSJ/Reuters) OK staying text-only?** (See Priority 3.)
3. **Should /news gain a mobile click affordance (F2 from design review)?** Quick win if yes.
4. **Should the og:image extraction logic move into the n8n workflow, or stay as a one-shot recovery tool?** Either works.

Pick one or more of these and the next session can move fast.
