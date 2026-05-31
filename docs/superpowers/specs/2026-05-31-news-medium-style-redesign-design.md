# `/news` Medium-style card redesign — Design

**Date:** 2026-05-31
**Owner:** Christos
**Status:** Draft — awaiting user review

## Context

`/news` ("Audit Pulse") today renders a 3-column grid and promotes the daily highest-importance story to a full-width "featured" card with bigger type. Result: the first item visually dominates and the remaining cards feel cramped and tiny.

We're switching to a single-column, Medium-inspired feed where every card is identical in size and structure. We're also enriching each story with publisher logo and (optional) author.

## Goal

`/news` reads like Medium's homepage feed: a calm, uniform vertical stream of stories where the eye moves down the page, not across a grid. Same density, same typography scale, every story.

## Out of scope

- Changes to the n8n workflow itself. The ingest API will accept the new fields; updating n8n to start sending them is a separate task.
- The admin moderation page (`/admin/news`) and its actions.
- Per-article detail pages (we still link out to the publisher).
- Backfilling logos/authors for existing rows in the DB.

## Visual structure

### Per-card layout (top to bottom in the body column)

1. **Publisher row** — 14px DM Sans. Small circular logo (22px), then `In <Publisher Name>` and, when present, `· by <Author Name>`. No date here (day is shown in the section header above).
2. **Label row** — 11px IBM Plex Mono uppercase chips. First chip is media-type + AI flag (`AI · Article` chartreuse pill when `is_ai_related`, else `Article` / `Report` / `Video` / `Podcast` / `Link` in the muted style). Second chip is the category label (`AI in Audit`, `Regulation & Standards`, etc.).
3. **Title** — 26px Instrument Serif, leading 1.15, near-black.
4. **Summary** — 16px DM Sans, leading 1.55, muted-foreground.

### Image (right of body column)

- 200×134px, 4px border-radius, 1px border in `--border` color.
- Only renders when `image_url` is present and loads successfully (on image error, the card falls back to text-only — same as today).
- On viewports `< 640px`, the image stacks below the body (full width, ~180px tall) instead of sitting to the right.

### Spacing between cards

- 24px vertical padding inside each card.
- 1px `--border` divider line between cards (Medium uses this; matches Fi371 editorial style).
- 48px gap between day groups.

### Page chrome (unchanged from today, just confirmed in scope)

- H1 "Audit Pulse" + intro paragraph at the top.
- Category filter chips (All / AI in Audit / Regulation & Standards / Sustainability / Markets & Big 4 / Audit Tech / Security & Governance) remain — they're shareable URLs.
- Day section headers (`Today`, `Yesterday`, then `31 May 2026`, etc.) remain between groups.
- Infinite scroll sentinel + "You're all caught up" terminal state remain.

### What gets removed

- The "featured" card variant in `NewsCard` (the `featured?: boolean` prop and its branch).
- The "first unfiltered day group" featured-promotion logic in `NewsFeed`.
- The 3-column grid layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- The separate "Read →" link at the bottom of each card (whole-card click target replaces it).
- The category label that currently appears at the bottom-right of each card (it's now in the label row at the top).

## Data model changes

### Supabase: `public.news_items` migration

Add two nullable columns:

```sql
alter table public.news_items
  add column if not exists source_logo_url text,
  add column if not exists author_name    text;
```

No new indexes needed (neither field is queried/filtered/sorted).

Migration file: `db/news_items_logo_author.sql` (one new file alongside `db/news_items.sql`, matching the existing pattern). Applied via the Supabase SQL editor or the `apply_migration` MCP tool.

### Ingest API: `app/api/news/ingest/route.ts`

Extend the `itemSchema` Zod validator with two optional fields:

```ts
source_logo_url: z.string().trim().url().max(2000).optional().nullable(),
author_name:    z.string().trim().min(1).max(200).optional().nullable(),
```

And persist them into the upsert row mapping. Backwards-compatible: existing n8n posts (without these fields) continue to validate and insert with both columns null.

### Server reader: `lib/news.server.ts`

- Add `source_logo_url, author_name` to the `SELECT_COLUMNS` string.
- Add the same two fields to `NewsRow` and to the `rowToItem` mapping.

### Client type: `lib/news.ts`

Extend `NewsItem`:

```ts
sourceLogoUrl: string | null;
authorName:    string | null;
```

## Component changes

### `components/news/NewsCard.tsx` — rewrite

- Drop the `featured` prop and the entire `if (featured) { ... }` branch.
- Single layout: `flex flex-col sm:flex-row` body+image.
- Whole-card click target via wrapping `<a>` (target=_blank, rel=noopener noreferrer) around the article content. Title still keeps its underline-on-hover for affordance; image gets a subtle opacity transition.
- Internals organised as `<PublisherRow>`, `<LabelRow>`, `<Title>`, `<Summary>` — keep them as plain JSX blocks in the same file unless any one grows past ~20 lines.

### `components/news/NewsFeed.tsx`

- Remove the `featured` promotion logic (lines computing the highest-importance item and splitting `rest`).
- Replace the grid with a single-column stack of `<NewsCard>` separated by the 1px divider.
- Keep day grouping + sentinel + load-more + terminal/error states.

### `components/news/NewsPage.tsx`

- No changes. The shell, heading, filter chips, and footer stay.

## Fallback behaviour

| Field missing | Behaviour |
|---|---|
| `sourceLogoUrl` is null/empty OR image fails to load | Show a 22px circle filled with `--card` surface, 1px `--border`, with the first character of `sourceName` (uppercased) centered in 11px DM Sans 700. Uses an `onError` handler on the `<img>` to swap to the letter on broken URLs, tracking the existing pattern used for `imageUrl`. |
| `authorName` is null/empty | Render `In <Publisher Name>` only — no `· by ...` segment, no trailing dot. |
| `imageUrl` is null OR fails to load | Card renders text-only; body takes full width. Same behaviour as today. |
| `summary` empty | Should not happen — Zod requires `min(1)`. No special handling needed. |

## Accessibility

- Whole-card link uses the title as its accessible name (`aria-label={item.title}` on the anchor; the visible title is the same string so screen readers don't double-announce).
- Logo letter fallback gets `aria-hidden="true"` (the publisher name is in adjacent text — the letter is decorative).
- Image gets `alt={item.title}` (matches today's behaviour).
- Anchor preserves the existing `focus-visible:ring-2 focus-visible:ring-foreground ring-offset-card` pattern; 44px minimum touch target enforced on the whole card body via padding (24px top + body height already exceeds 44px).
- Day headers stay as `<h2>`; cards stay as `<article>`.

## Visual tokens (mapped to existing DESIGN.md)

- Publisher row text: `text-foreground` for name/author, `text-muted-foreground` for connector words.
- Chip border + idle text: `border-border` + `text-muted-foreground`.
- AI chip: `bg-primary text-primary-foreground border-primary` (existing chartreuse pattern).
- Title: `font-display` (Instrument Serif), `text-foreground`.
- Summary: `text-muted-foreground`.
- Card divider: `border-b border-border` on each `<article>` (last card omits border via Tailwind `last:border-b-0`).

No new colour tokens. No new fonts. The only new typography scale value is the 26px title size, which already lives in the existing card as the `featured` title — we're just using it as the default now.

## Testing / validation

No unit tests in this repo. Validation steps:

1. `npm run lint` — must not regress beyond the ~13 baseline shadcn errors.
2. `npm run build` — must pass (tsc).
3. Manual dogfood on dev:
   - Empty DB state — page shows "No stories yet" (unchanged).
   - Card with all fields — logo + author + image.
   - Card with no `source_logo_url` — letter circle fallback.
   - Card with no `author_name` — publisher only, no trailing dot.
   - Card with no `image_url` — text-only card, full width.
   - AI-flagged card — chartreuse `AI · Article` chip.
   - Mobile viewport (≤640px) — image stacks below body.
   - Filter chip click — category-scoped feed renders without featured promotion (since that logic is gone for everyone).
   - Infinite scroll — sentinel still loads page 2.
4. Visual diff against the mockup at `.superpowers/brainstorm/.../proposed-layout.html`.

## Trade-offs and risks

- **Losing the "biggest story today" visual emphasis** — by killing the featured card, the highest-`importance` story no longer reads as more important. We're trading editorial signal for uniform calm. The `importance` column stays on the DB row (admin can still see it; future "Editor's pick" experiments can use it), but it no longer affects the public feed — order is purely `published_at desc, id desc`.
- **Bigger DB rows** — two new text columns, both nullable, both small. No measurable impact.
- **Whole-card link target** — slight regression in the case where someone wanted to copy text from the card; they'll select-and-drag from the title outward. Acceptable; matches Medium behaviour.
- **Logo URL trust** — `source_logo_url` will be rendered as a remote `<img>`. n8n will populate it from trusted sources (the same publishers we already trust for `image_url`), but we should add the domain pattern to `next.config.js` `images.remotePatterns` if we want optimised Next/Image rendering — otherwise use a plain `<img>` and accept un-optimised delivery (logos are tiny, 22px). Decision: use plain `<img>` for logos to avoid a remote-pattern allowlist explosion; keep `next/image` for `image_url` as today.
