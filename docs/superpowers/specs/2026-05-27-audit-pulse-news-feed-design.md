# Audit Pulse — Daily Audit News Feed (Design Spec)

- **Date:** 2026-05-27
- **Status:** Approved (ready for implementation plan)
- **Owner:** Christos / Fi371
- **Repo:** fi371-marketing (Next.js 16.2.4, Tailwind, shadcn/ui, Supabase, Vercel)
- **Revisions:** rev 2 — public access clarified, infinite scroll (no visible pagination), launch backfill of ~30 days

---

## 1. Summary

A public marketing page — **"Audit Pulse"** at `/news` — that surfaces the biggest daily
stories across financial audit, accounting, AI-in-audit, regulation, sustainability
assurance, audit technology, and security/governance. Each item shows a **title, short
summary, source, media-type, and a link out**. It is a growing, search-friendly content
library intended as an SEO/GEO asset (fresh content that earns search ranking and AI-search
citations) and a secondary content-sourcing radar. The page is **fully public** (no login)
and **pre-filled with the last ~30 days** at launch, so it opens full, not empty.

The **engine that finds, ranks, and summarises** stories runs in **n8n** (existing
automation). This repo is the **home** for the news: a database, a secure ingest endpoint, a
public read endpoint, the public page, and a hide control. The n8n workflow is **out of
scope** for this spec.

---

## 2. Decisions locked (from brainstorming)

| Decision | Choice |
|---|---|
| Audience / placement | **Public** page on the marketing site |
| Access | **Fully public** — no login/account to view; only the private hide tool is password-protected |
| Curation model | **Auto-publish + guardrails** (trusted sources, validation, 1-click hide) |
| Engine location | **n8n** finds/ranks/summarises; posts items into this site |
| Feed scope | **Top ~5–10 items/day + a growing, browsable archive** |
| Media handling | **Link out** with media-type badge + thumbnail (no embeds — GDPR-safe) |
| Layout | **Clean Feed** — category chips + uniform card grid, newest first, day-grouped |
| Browsing | **Infinite scroll** — first screen server-rendered (SEO); more loads automatically as you scroll, no visible pagination |
| Launch data | **Pre-filled with ~the last 30 days** via the engine's first-run backfill |
| Name / URL | **"Audit Pulse"**, served at **`/news`** |

## 3. Out of scope (explicitly)

- The **n8n workflow** itself (discovery, ranking, summarisation, the launch backfill source).
  Designed separately next.
- **Inline media players / embeds** (rejected for privacy/GDPR).
- **RSS/JSON feed output** — desirable fast-follow, not v1 (see §15).
- **Per-category landing pages** (`/news/[category]`) — v1 uses a query param; dedicated
  pages are a future SEO enhancement (see §15).
- A full auth/login system — admin uses a single shared password (one operator).

---

## 4. Architecture overview

```
n8n (daily + one-time backfill)     This repo (fi371-marketing)
-------------------------------     ---------------------------
scan ~45 sources                    POST /api/news/ingest   (secure inbox)
rank "biggest"                  -->    - verify secret key
write title + summary                  - validate each item
grab thumbnail + media type            - drop duplicates (by link)
assign category + AI flag              - insert into Supabase
(first run: look back ~30 days)        - refresh /news
                                            |
                                            v
                                    Supabase table: news_items
                                            |
                            +---------------+----------------+
                            v                                v
                  /news (server-rendered            GET /api/news/list
                   first batch + JSON-LD)            (cursor batches for
                            |                         infinite scroll)
                            v
                  /admin/news (password-gated hide control)
```

- **Freshness model:** the page is statically rendered and **revalidated on demand** right
  after ingest, so visitors get current news with no per-visit compute cost. If n8n misses a
  day, the last good page persists — no errors, no empty page.

> **Implementation note (important):** Per `AGENTS.md`, this is a modified Next.js
> (16.2.4) and APIs may differ from training data. Before writing code, consult
> `node_modules/next/dist/docs/` for the current App Router conventions — specifically
> route handlers, `generateMetadata`, `revalidatePath`/on-demand revalidation, `next/image`
> remote patterns, `searchParams` typing, and middleware. `after()` is available in this
> version and may be used to fire revalidation without blocking the ingest response.

---

## 5. Data model — `news_items` (Supabase / Postgres)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `created_at` | timestamptz | default `now()` — when we received it |
| `published_at` | timestamptz | **required** — the story's date (may be back-dated for backfill); drives ordering + day groups |
| `title` | text | **required** |
| `summary` | text | **required** — 1–2 sentence original summary |
| `url` | text | **required**, **unique** — source link + dedup key |
| `source_name` | text | **required** — e.g. "IAASB", "Financial Times" |
| `media_type` | text | **required**, one of: `article` `video` `report` `podcast` `other` |
| `category` | text | **required**, one of the 6 category slugs (§9) |
| `image_url` | text | nullable — thumbnail / og:image |
| `is_ai_related` | boolean | not null, default `false` — drives chartreuse "AI" badge |
| `importance` | smallint | nullable (0–100) — engine's ranking; selects the daily top story |
| `hidden` | boolean | not null, default `false` — the guardrail off-switch |

**Constraints / indexes:**
- `UNIQUE (url)` — dedup at the database level (makes backfill re-runs safe).
- `CHECK` constraints on `media_type` and `category` against the fixed sets.
- Index on `(hidden, published_at DESC, id DESC)` for the main public query + keyset cursor.
- Index on `(category, hidden, published_at DESC, id DESC)` for filtered views.

**Migration:** SQL stored at `db/news_items.sql` (reference) and applied to Supabase via the
Supabase dashboard or the Supabase MCP `apply_migration`. Service-role access is via the
existing `lib/supabase.ts` (`createServerSupabaseClient`).

---

## 6. Ingest API — `POST /api/news/ingest`

The single secure "inbox" n8n posts to. Mirrors the existing survey shared-secret pattern.

- **Auth:** request header `x-ingest-secret` must equal `process.env.NEWS_INGEST_SECRET`
  (constant-time compare). Missing/wrong → `401`.
- **Body:** accepts a single item **or** `{ "items": [ ...up to 50 ] }` (n8n posts the day's
  batch). Validated with **zod**.
- **Per-item schema:** `title`, `summary`, `url` (valid URL), `source_name`,
  `media_type` (enum), `category` (enum), `published_at` (ISO 8601); optional `image_url`
  (valid URL), `is_ai_related` (bool, default false), `importance` (int 0–100).
- **Dedup:** insert with `ON CONFLICT (url) DO NOTHING`. Duplicates are counted, not errors.
- **On success:** if any rows inserted, trigger `revalidatePath('/news')` (via `after()` so
  the response isn't blocked).
- **Response (200):** `{ received, inserted, duplicates, rejected: [{index, reason}] }` so
  n8n can log outcomes.
- **Errors:** `401` bad/missing key; `400` malformed body or all items invalid; `413` if
  batch > 50.

### 6a. List API — `GET /api/news/list` (powers infinite scroll)

Public, read-only endpoint the feed calls to append the next batch as the reader scrolls.

- **Query:** `category` (optional slug), `cursor` (optional — opaque keyset cursor encoding
  the last item's `published_at` + `id`), `limit` (default 24, max 50).
- **Returns:** `{ items: [...], nextCursor: string | null }`. Only `hidden = false` rows,
  newest first, **keyset (cursor) pagination** — stable even as new items arrive at the top.
- No secret needed (it only ever exposes already-public items).

### 6b. Initial backfill (launch data)

The page must open **pre-filled with ~the last 30 days**, not empty.

- The **back-dated items are produced by the engine's first run** (n8n configured to look
  back ~30 days) — that work is part of the separate n8n build (§3), not this repo.
- **This repo is fully ready for it:** `published_at` accepts past dates, day-grouping renders
  historical days correctly, and `ON CONFLICT (url)` makes re-posting safe. Because a month is
  ~150–300 items (> the 50/batch cap), the backfill arrives as **several batches of ≤ 50** —
  no special endpoint needed.
- Net effect: the page is **live and indexable from day one**; the empty state (§12) becomes
  a safety net rather than the launch experience.

---

## 7. Public page — `/news` ("Audit Pulse")

`app/news/page.tsx` — server component. **Fully public — no login or account to read it.**

- **Reads** published items (`hidden = false`) newest-first, grouped by calendar day, via
  `lib/news.ts`.
- **Metadata** (`generateMetadata`): title `Audit Pulse — audit & accounting news, daily | Fi371`,
  descriptive meta description, `canonical` `/news`. **Empty state:** if zero items, set
  `robots: { index: false }` (mirrors the blog's empty-index trick); auto-flips once items exist.
- **Structured data (GEO):** JSON-LD `CollectionPage` containing an `ItemList`; each item
  emitted as `NewsArticle` (`headline`, `url`, `datePublished`, `publisher`/source). This is
  what helps Google and AI search understand and cite the page.
- **Filtering:** category via `?category=<slug>` (server-filtered). Each filter is a real,
  indexable URL; `generateMetadata` adjusts title + canonical per category.
- **Browsing / archive — infinite scroll:** the page **server-renders the first batch**
  (≈ the most recent 24 items / few days) for SEO and fast first paint, then **auto-loads
  more as the reader nears the bottom** (client-side, via the §6a list endpoint). No page
  numbers, no "load more" button. Keeps a quiet "You're all caught up" end-state.
- **Day grouping:** headers render "Today", "Yesterday", then the full date.
- Registered in **sitemap** and linked from the **site nav** (and/or footer).

---

## 8. Feed UI — `components/news/`

Hybrid: the first batch + category chips are **server-rendered** (SEO, fast first paint); the
feed list is a **client component** that appends further batches on scroll. Subtle staggered
fade-up entrance (framer-motion, already a dependency) is optional polish.

- **`NewsFeed.tsx`** (client) — receives the server-rendered first batch + initial cursor;
  renders day-group headers + the grid; uses an `IntersectionObserver` sentinel near the
  bottom to fetch the next batch from `GET /api/news/list` (§6a) and append, re-grouping by
  day. Shows a small loading shimmer while fetching and a quiet "You're all caught up" when
  the cursor is exhausted.
- **`NewsCard.tsx`** — thumbnail (`next/image`, fallback to tinted placeholder on
  missing/broken), badge row (`media_type · source_name`; chartreuse **AI** badge when
  `is_ai_related`), title (links to `url`, `target="_blank" rel="noopener noreferrer"`),
  summary, footer (date · category label · "Read/Watch/Listen →").
- **`CategoryFilter.tsx`** — the six category chips + "All", rendered as links; active state
  reflects the current `?category`.
- **Top story:** on the unfiltered first batch only, the highest-`importance` item of the most
  recent day renders as a **full-width** card (ties broken by most recent). All others are
  uniform cards.

**Design system adherence (`DESIGN.md`):** warm paper `#F2EFE5`, cards `#EAE2D5`, rules
`#C8B9A6`, Instrument Serif for the H1 + top-story headline, DM Sans body, IBM Plex Mono for
kicker/labels/badges, chartreuse `#C8FF00` **only** on AI items. Light-first; dark mode
supported per the existing tokens.

---

## 9. Categories & media types (fixed sets)

**Categories** (slug → label), derived from the source library:
- `ai-in-audit` → "AI in Audit"
- `regulation-standards` → "Regulation & Standards"
- `sustainability` → "Sustainability"
- `markets-big4` → "Markets & Big 4"
- `audit-tech` → "Audit Tech"
- `security-governance` → "Security & Governance"

**Media types:** `article`, `video`, `report`, `podcast`, `other`.

Both sets live as typed constants in `lib/news.ts` (single source of truth for the DB
`CHECK` constraints, the zod validation, and the UI labels).

---

## 10. Admin / hide control — `/admin/news`

> The **public `/news` page is never gated** — no login or account to read it. This section
> covers only the private hide tool.

- **Auth:** lightweight single-password gate. A simple form accepts `NEWS_ADMIN_PASSWORD`
  and sets a signed, httpOnly cookie; `/admin/news` requires it (enforced in the route or
  middleware). Not a multi-user auth system (YAGNI — one operator, one shared password).
- **UI:** lists recent items (including hidden ones) with a hide/unhide **toggle**.
- **Action:** a server action flips `hidden` and calls `revalidatePath('/news')`.

---

## 11. Privacy / GDPR (EU-first)

- No third-party embeds, no trackers — items link out only.
- **Thumbnails** are served through the site's own image optimisation (`next/image`), so the
  visitor's browser never calls a third-party image host (privacy + speed). `next.config.ts`
  `images.remotePatterns` allows `https` sources; broken/missing images fall back to the
  tinted placeholder. *(Hardening option / future: have n8n upload thumbnails to Supabase
  Storage so we serve only first-party images.)*

---

## 12. Error handling & edge cases

- **Bad ingest key / payload:** rejected with `401`/`400`; never partially trusts input.
- **Duplicate story:** silently de-duplicated (counted in the response).
- **Missing thumbnail / broken image:** placeholder fallback, no layout break.
- **No news yet:** tasteful empty state + `noindex` until items exist. In practice the launch
  backfill (§6b) fills the page before go-live, so this is a safety net, not the launch view.
- **n8n down for a day:** page keeps showing the latest items; no error surface.
- **Unknown category / media type from n8n:** rejected by validation (kept off the page).
- **Supabase unavailable on read:** page renders a graceful "temporarily unavailable" state
  rather than crashing; the infinite-scroll endpoint returns an error the client shows quietly.

---

## 13. Environment variables (add to `.env.example`)

- `NEWS_INGEST_SECRET` — shared secret for the ingest endpoint (n8n holds the same value).
- `NEWS_ADMIN_PASSWORD` — password for `/admin/news`.

(Existing `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are reused.)

---

## 14. Testing / validation plan

No unit-test suite in this project (per repo convention). Validate via:
- `npm run lint` and `npm run build` must pass (build = `tsc`).
- **Manual QA:** load `/news`; test category filters, **infinite scroll** (loads on scroll,
  end-state, filtered scroll), empty state, mobile layout, dark mode; exercise the
  `/admin/news` hide/unhide flow.
- **Ingest tests (curl):** valid item appears on the page; a duplicate is rejected as such;
  a wrong/missing key returns `401`; a malformed item returns `400`; a multi-batch backfill
  with back-dated items renders under the right day headers.
- **Production verification after merge** (Vercel previews are login-walled).

---

## 15. Future / fast-follow (not v1)

- Publish Audit Pulse as an **RSS/JSON feed** (fitting + good for distribution/GEO).
- **Per-category landing pages** (`/news/[category]`) for stronger topic SEO (and deeper
  crawlability beyond the server-rendered first batch).
- **Thumbnails → Supabase Storage** for fully first-party images.
- **Manual "add story"** in the admin (for hand-picked items).
- The **n8n discovery/ranking/summarisation workflow + the 30-day backfill run** (separate design).

---

## 16. File-by-file change list

| File | Change |
|---|---|
| `db/news_items.sql` | New — table + constraints + indexes (applied to Supabase) |
| `lib/news.ts` | New — types, category/media constants, read + keyset-cursor helpers (mirrors `lib/blog.ts`) |
| `app/api/news/ingest/route.ts` | New — secure inbox (auth, zod validation, dedup, revalidate, batch backfill) |
| `app/api/news/list/route.ts` | New — public read endpoint powering infinite scroll (cursor-based) |
| `app/news/page.tsx` | New — public page, metadata, JSON-LD, category filter, server-rendered first batch |
| `components/news/NewsFeed.tsx` | New — client; day-grouped grid + infinite scroll |
| `components/news/NewsCard.tsx` | New — card (thumbnail, badges, link out) |
| `components/news/CategoryFilter.tsx` | New — chip filter (links) |
| `app/admin/news/page.tsx` | New — password-gated hide/unhide list |
| `app/admin/news/actions.ts` | New — server action to toggle `hidden` |
| `next.config.ts` | Edit — `images.remotePatterns` for thumbnails |
| `app/sitemap.ts` | Edit/new — include `/news` |
| site nav component | Edit — add "Audit Pulse" / News link |
| `.env.example` | Edit — add `NEWS_INGEST_SECRET`, `NEWS_ADMIN_PASSWORD` |
