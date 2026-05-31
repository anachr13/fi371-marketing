# /news/sources — Trusted Sources Page

**Status:** Approved 2026-05-31
**Branch:** claude/eloquent-ishizaka-21ff56

## Goal

Surface the publishers, regulators, and standards bodies behind Audit Pulse so
visitors can verify the editorial standard ("curated from trusted sources" is
no longer a claim — it's a destination). Linked from the existing /news kicker.

## Decisions (from brainstorming)

| # | Decision | Picked |
|---|---|---|
| 1 | Data origin | Curated static list in TypeScript (`lib/news-sources.ts`) |
| 2 | Logos | Favicons auto-fetched per domain via Google's free favicon service |
| 3 | Link target | Each row links to the source's own homepage (external, new tab) |
| 4 | Layout | Grouped by category — matches the structure of the n8n source library |
| 5 | Page intro | Short editorial paragraph; no narrative origin story like /about |

## File map

| Change | Path |
|---|---|
| NEW | `lib/news-sources.ts` — typed constant, helper for favicon URL |
| NEW | `app/news/sources/page.tsx` — server entry, metadata, JSON-LD |
| NEW | `components/news/SourcesPage.tsx` — client shell, grouped list UI |
| EDIT | `components/news/NewsPage.tsx` — turn "curated from trusted sources" into `<Link>` |

Header / footer / demo modal are unchanged — `SiteHeader` is already path-aware
on `/news*` routes ([components/site/SiteHeader.tsx:15](../../components/site/SiteHeader.tsx)), so /news and
/news/sources share one header component out of the box. **This satisfies the
requirement that the header be the same component on both pages.**

`next.config.ts` already allows any HTTPS image host (`hostname: "**"`), so
favicons from `www.google.com` work without config changes.

## Data shape (`lib/news-sources.ts`)

```ts
export type TrustedSource = {
  name: string;       // "Accountancy Europe"
  homepage: string;   // "https://accountancyeurope.eu/"
  domain: string;     // "accountancyeurope.eu" — stable favicon key
};

export type SourceGroup = {
  slug: string;       // "standards-bodies" — used as React key + anchor
  label: string;      // "Standards bodies & regulators"
  sources: TrustedSource[];
};

export const SOURCE_GROUPS: SourceGroup[];

export function faviconUrl(domain: string, size?: number): string;
```

Initial groups (5) seeded from the n8n source-library.yaml in a sibling branch
(`beautiful-raman-735a3b`), dedup'd to publisher homepages, competitors removed
(Caseware/DataSnipper/etc. aren't trusted sources we cite to users):

1. **Standards bodies & regulators** — IAASB, IFAC, AICPA & CIMA, CAQ,
   Accountancy Europe, ICAEW, The IIA, FRC UK, PCAOB
2. **Sustainability reporting & assurance** — IFRS Foundation, ISSB, EFRAG, GRI
3. **Security, governance & AI risk** — ISACA, NIST AI RMF, ISO/IEC 42001,
   ENISA, European Commission AI Act, CNIL
4. **Big 4 & advisory research** — Deloitte, PwC, EY, KPMG, BDO Insights
5. **Finance & accounting news** — FT, Bloomberg, Reuters, WSJ CFO Journal,
   Accounting Today, Accountancy Age, CFO Dive, Thomson Reuters Institute

~32 sources total.

## Server route (`app/news/sources/page.tsx`)

- `dynamic = "force-static"` — list is a checked-in constant, no DB
- `metadata`: title, description, canonical `/news/sources`, OG tags
- `JsonLd`: `CollectionPage` with `ItemList` of `WebSite` items
  (each item points at a publisher) — helps AEO/LLM citation by structurally
  saying "these are the publishers we monitor"
- No `searchParams`, no filters
- Renders `<SourcesPage groups={SOURCE_GROUPS} />`

## Client shell (`components/news/SourcesPage.tsx`)

Structure mirrors `components/news/NewsPage.tsx`:

```
SiteHeader (shared, path-aware)
main pt-32 pb-[120px]
  max-w-[1200px] mx-auto px-8
    kicker:  "Fi371 · Audit Pulse · 32 trusted sources"
    h1:      "Trusted sources"   (font-display, clamp 44-72px)
    intro:   short editorial paragraph (max-w-620px, muted)
    sections (flex flex-col gap-16):
      for each SOURCE_GROUP:
        h2 (mono kicker style, bottom border)
        ul.grid (1 col → sm 2 → lg 3, gap-2)
          for each source:
            <a target=_blank>
              favicon 24x24 in bordered card
              name
              ↗ on hover
SiteFooter (shared)
DemoModal (shared)
```

Accessibility: each row is min-h-[44px] (touch target — mirrors PR #19 a11y
pattern), focus-visible ring, decorative-alt favicon (name follows), keyboard
underline on hover.

Favicon: `next/image` with `unoptimized` flag — Google's favicon URL is already
a tiny optimized PNG; running it through Vercel image opt wastes quota.
Google returns a generic globe glyph for missing favicons → no broken-image
state to handle.

## /news edit (the link)

In `components/news/NewsPage.tsx`, wrap only the phrase
"curated from trusted sources" in a `<Link href="/news/sources">` with a subtle
underline-on-hover style. "Fi371" and "Updated daily" stay plain text. Matches
existing `/news` link styling (underline + focus-ring, see [NewsCard.tsx:61](../../components/news/NewsCard.tsx)).

## Out of scope

- Per-source article counts (would need a DB aggregate — defer until needed)
- Source-filtered `/news?source=...` view (separate feature, defer)
- Categorising sources by media type or credibility band (the YAML has it; not
  needed on a public page)
- Hand-curated SVG logos (favicons are good enough for v1)
- Porting the full source-library.yaml into this branch (n8n researcher and the
  public page serve different audiences — independent today, can be unified later)

## Validation

- `npm run lint` — no new errors beyond the 13 baseline (shadcn boilerplate)
- `npm run build` — typecheck must pass cleanly
- No unit tests in this project; visual QA via `npm run dev` on the new route
