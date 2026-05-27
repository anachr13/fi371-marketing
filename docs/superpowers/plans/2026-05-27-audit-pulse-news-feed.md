# Audit Pulse — Daily News Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, auto-updating "Audit Pulse" news page at `/news` that displays the biggest daily audit/accounting stories (title, summary, source, media badge, link out) with infinite scroll, fed by a secure ingest endpoint and protected by a single-password hide control.

**Architecture:** n8n (separate, out of scope) POSTs curated stories to a secret-key-protected `/api/news/ingest`; they land in a Supabase `news_items` table. The public server-rendered `/news` page reads the first batch (for SEO) and a client component appends more via `/api/news/list` as the reader scrolls. A cookie-gated `/admin/news` page lets the operator hide/unhide items.

**Tech Stack:** Next.js 16.2.4 (App Router), TypeScript, Tailwind + shadcn/ui, Supabase (`@supabase/supabase-js`), zod, `next/image`. Spec: `docs/superpowers/specs/2026-05-27-audit-pulse-news-feed-design.md`.

---

## Conventions, gotchas & testing philosophy (read first)

- **This is a modified Next.js (16.2.4).** Per `AGENTS.md`, before writing route handlers, `generateMetadata`, `cookies()`, `searchParams`, server actions, or `next/image` config, skim the matching guide in `node_modules/next/dist/docs/`. Known in this version: `searchParams` and `cookies()` are **async** (you `await` them); `after()` is importable from `next/server`.
- **No unit-test suite exists** in this repo, and adding a test runner is an unapproved dependency. So this plan's verification is the project's real gate: **`npm run build`** (runs `next build` = full TypeScript type-check) + **`npm run lint`**, plus concrete **`curl`** checks for APIs and **manual browser** checks for UI. Treat "build passes + curl/manual matches expected" as green.
- **Lint baseline:** there are ~13 pre-existing lint errors in shadcn `components/ui/*` boilerplate. The bar is **no NEW lint errors in files this plan creates/edits** — do not try to fix the boilerplate.
- **Design tokens:** use the semantic Tailwind classes only (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-primary`, `text-primary-foreground`, `font-display`, `font-mono`). `--primary` is the chartreuse accent — reserve `bg-primary` for AI-related elements only (per `DESIGN.md`).
- **Commit after every task.** Conventional commit messages. The repo already auto-appends a Claude co-author trailer convention — keep messages focused.

---

## Task 0: Setup

**Files:** none (environment only).

- [ ] **Step 1: Install dependencies** (fresh Conductor worktrees start with empty `node_modules`)

Run: `npm install`
Expected: completes without errors; `node_modules/next` present.

- [ ] **Step 2: Confirm the toolchain works on a clean tree**

Run: `npm run build`
Expected: build succeeds (this is the baseline; if it fails before any change, stop and report).

- [ ] **Step 3: Add local env vars for this feature**

Add to your local `.env` (NOT committed — `.env*` is gitignored):

```
NEWS_INGEST_SECRET=dev-ingest-secret-change-me
NEWS_ADMIN_PASSWORD=dev-admin-password-change-me
```

(`SUPABASE_URL` / `SUPABASE_SERVICE_KEY` should already be set from existing features.)

- [ ] **Step 4: Commit** — nothing to commit yet; proceed.

---

## Task 1: Database table `news_items`

**Files:**
- Create: `db/news_items.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- news_items: the curated daily audit/accounting stories shown on /news ("Audit Pulse").
-- Written by the n8n engine via POST /api/news/ingest; read by the public page + list API.
-- Apply to Supabase via the SQL editor or the Supabase MCP `apply_migration` tool.

create table if not exists public.news_items (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  published_at  timestamptz not null,
  title         text not null,
  summary       text not null,
  url           text not null unique,
  source_name   text not null,
  media_type    text not null check (media_type in ('article','video','report','podcast','other')),
  category      text not null check (category in
                  ('ai-in-audit','regulation-standards','sustainability','markets-big4','audit-tech','security-governance')),
  image_url     text,
  is_ai_related boolean not null default false,
  importance    smallint,
  hidden        boolean not null default false
);

-- Main public query: visible items, newest first; id breaks ties for keyset pagination.
create index if not exists news_items_visible_idx
  on public.news_items (hidden, published_at desc, id desc);

-- Category-filtered query.
create index if not exists news_items_category_idx
  on public.news_items (category, hidden, published_at desc, id desc);

-- All access is server-side via the Supabase service key (which bypasses RLS). Enabling RLS
-- with no public policy blocks the anon key entirely — defense in depth.
alter table public.news_items enable row level security;
```

- [ ] **Step 2: Apply it to Supabase**

Preferred: use the Supabase MCP `apply_migration` tool with name `news_items` and the SQL above.
Alternative: paste the SQL into the Supabase dashboard SQL editor and run it.

- [ ] **Step 3: Verify the table exists**

Use the Supabase MCP `list_tables` (or the dashboard) and confirm `news_items` is present with the columns above.
Expected: table `public.news_items` exists with the unique constraint on `url`.

- [ ] **Step 4: Commit**

```bash
git add db/news_items.sql
git commit -m "feat(news): add news_items table migration"
```

---

## Task 2: Shared news module `lib/news.ts` (client-safe)

This file holds everything safe to import from **both** client and server: types, the fixed category/media vocabularies, label helpers, and day-grouping. It must NOT import Supabase or use Node-only APIs (so it can be bundled into client components).

**Files:**
- Create: `lib/news.ts`

- [ ] **Step 1: Write the module**

```ts
// Shared, client-safe vocabulary + view helpers for Audit Pulse. Single source of truth for
// the category/media-type sets, the NewsItem shape, and day-grouping. NO server/Supabase
// imports here — this file is bundled into client components. DB reads live in lib/news.server.ts.

export const MEDIA_TYPES = ["article", "video", "report", "podcast", "other"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

// Order here is the order the filter chips render in.
export const NEWS_CATEGORY_SLUGS = [
  "ai-in-audit",
  "regulation-standards",
  "sustainability",
  "markets-big4",
  "audit-tech",
  "security-governance",
] as const;
export type NewsCategorySlug = (typeof NEWS_CATEGORY_SLUGS)[number];

export const NEWS_CATEGORIES: { slug: NewsCategorySlug; label: string }[] = [
  { slug: "ai-in-audit", label: "AI in Audit" },
  { slug: "regulation-standards", label: "Regulation & Standards" },
  { slug: "sustainability", label: "Sustainability" },
  { slug: "markets-big4", label: "Markets & Big 4" },
  { slug: "audit-tech", label: "Audit Tech" },
  { slug: "security-governance", label: "Security & Governance" },
];

export function categoryLabel(slug: string): string {
  return NEWS_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function isNewsCategorySlug(value: string): value is NewsCategorySlug {
  return (NEWS_CATEGORY_SLUGS as readonly string[]).includes(value);
}

// Client-facing item (camelCase). Mirrors a public news_items row (without `hidden`).
export type NewsItem = {
  id: string;
  publishedAt: string; // ISO 8601 (UTC)
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  mediaType: MediaType;
  category: NewsCategorySlug;
  imageUrl: string | null;
  isAiRelated: boolean;
  importance: number | null;
};

export type NewsPageResult = { items: NewsItem[]; nextCursor: string | null };

export const PAGE_SIZE = 24;

// --- Day grouping for the feed ---
export type NewsDayGroup = { key: string; label: string; items: NewsItem[] };

// "today"/"yesterday" reference keys are passed in (computed once on the server) so server
// render and client hydration agree even across a midnight boundary.
export function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}
export function yesterdayUtcKey(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

export function dayLabel(yyyyMmDd: string, todayKey: string, yesterdayKey: string): string {
  if (yyyyMmDd === todayKey) return "Today";
  if (yyyyMmDd === yesterdayKey) return "Yesterday";
  return new Date(`${yyyyMmDd}T00:00:00Z`).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Group items by UTC calendar day, newest day first, preserving order within a day.
export function groupByDay(
  items: NewsItem[],
  todayKey: string,
  yesterdayKey: string
): NewsDayGroup[] {
  const groups: NewsDayGroup[] = [];
  const byKey = new Map<string, NewsDayGroup>();
  for (const item of items) {
    const key = item.publishedAt.slice(0, 10); // YYYY-MM-DD (ISO is UTC)
    let group = byKey.get(key);
    if (!group) {
      group = { key, label: dayLabel(key, todayKey, yesterdayKey), items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS (no type errors). The module isn't imported anywhere yet, but `next build` still type-checks it.

- [ ] **Step 3: Commit**

```bash
git add lib/news.ts
git commit -m "feat(news): add shared news vocabulary + day-grouping helpers"
```

---

## Task 3: Server data module `lib/news.server.ts`

Server-only: keyset cursor encode/decode (uses Node `Buffer`) and the Supabase read used by the page + list API. Never import this from a client component.

**Files:**
- Create: `lib/news.server.ts`

- [ ] **Step 1: Write the module**

```ts
// SERVER-ONLY. Supabase reads + keyset cursor for Audit Pulse. Do NOT import from client
// components (it pulls in the service-role Supabase client + Node Buffer).

import { createServerSupabaseClient } from "@/lib/supabase";
import {
  PAGE_SIZE,
  type NewsItem,
  type NewsCategorySlug,
  type NewsPageResult,
} from "@/lib/news";

const SELECT_COLUMNS =
  "id, published_at, title, summary, url, source_name, media_type, category, image_url, is_ai_related, importance";

type NewsRow = {
  id: string;
  published_at: string;
  title: string;
  summary: string;
  url: string;
  source_name: string;
  media_type: NewsItem["mediaType"];
  category: NewsCategorySlug;
  image_url: string | null;
  is_ai_related: boolean;
  importance: number | null;
};

function rowToItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    publishedAt: new Date(row.published_at).toISOString(), // normalise to ...Z (URL-safe cursor)
    title: row.title,
    summary: row.summary,
    url: row.url,
    sourceName: row.source_name,
    mediaType: row.media_type,
    category: row.category,
    imageUrl: row.image_url,
    isAiRelated: row.is_ai_related,
    importance: row.importance,
  };
}

// --- Keyset cursor (published_at + id) for stable infinite scroll ---
export type Cursor = { publishedAt: string; id: string };

export function encodeCursor(item: NewsItem): string {
  return Buffer.from(`${item.publishedAt}|${item.id}`, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): Cursor | null {
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const sep = decoded.indexOf("|");
    if (sep < 0) return null;
    const publishedAt = decoded.slice(0, sep);
    const id = decoded.slice(sep + 1);
    if (!publishedAt || !id) return null;
    return { publishedAt, id };
  } catch {
    return null;
  }
}

// One page of visible items, newest first, optional category filter, continuing after a
// keyset cursor. Used by the server page (first batch) and the list API (subsequent batches).
export async function getNewsPage(opts: {
  category?: NewsCategorySlug | null;
  cursor?: Cursor | null;
  limit?: number;
}): Promise<NewsPageResult> {
  const limit = Math.min(opts.limit ?? PAGE_SIZE, 50);
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("news_items")
    .select(SELECT_COLUMNS)
    .eq("hidden", false)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (opts.category) query = query.eq("category", opts.category);

  if (opts.cursor) {
    // Tuple compare: published_at < X OR (published_at = X AND id < Y).
    const { publishedAt, id } = opts.cursor;
    query = query.or(
      `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},id.lt.${id})`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("getNewsPage error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to load news");
  }

  const items = (data as NewsRow[]).map(rowToItem);
  const nextCursor =
    items.length === limit ? encodeCursor(items[items.length - 1]) : null;
  return { items, nextCursor };
}

// --- Admin reads/writes (include hidden items) ---
export type AdminNewsItem = NewsItem & { hidden: boolean };

export async function getAdminRecentItems(limit = 100): Promise<AdminNewsItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("news_items")
    .select(SELECT_COLUMNS + ", hidden")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getAdminRecentItems error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to load admin news");
  }
  return (data as (NewsRow & { hidden: boolean })[]).map((r) => ({
    ...rowToItem(r),
    hidden: r.hidden,
  }));
}

export async function setHidden(id: string, hidden: boolean): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("news_items").update({ hidden }).eq("id", id);
  if (error) {
    console.error("setHidden error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to update item");
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/news.server.ts
git commit -m "feat(news): add server-side news reads + keyset cursor"
```

---

## Task 4: Ingest API `POST /api/news/ingest`

**Files:**
- Create: `app/api/news/ingest/route.ts`

- [ ] **Step 1: (red) Confirm the route doesn't exist yet**

Start dev: `npm run dev` (leave running in a second terminal). Then:
Run: `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/news/ingest`
Expected: `404`.

- [ ] **Step 2: Write the route**

```ts
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
```

> If TypeScript rejects `z.enum(NEWS_CATEGORY_SLUGS)` / `z.enum(MEDIA_TYPES)` because the array is `readonly` (`as const`), change them to `z.enum([...NEWS_CATEGORY_SLUGS])` / `z.enum([...MEDIA_TYPES])` — runtime validation is identical.

- [ ] **Step 3: (green) Verify auth rejects a missing key**

Run: `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/news/ingest -H "Content-Type: application/json" -d '{}'`
Expected: `401`.

- [ ] **Step 4: Verify a valid item inserts** (use your local `NEWS_INGEST_SECRET`)

```bash
curl -s -X POST http://localhost:3000/api/news/ingest \
  -H "Content-Type: application/json" \
  -H "x-ingest-secret: dev-ingest-secret-change-me" \
  -d '{"title":"Test story","summary":"A short summary.","url":"https://example.com/a","source_name":"IAASB","media_type":"article","category":"ai-in-audit","published_at":"2026-05-27T09:00:00Z","is_ai_related":true,"importance":80}'
```
Expected: `{"received":1,"inserted":1,"duplicates":0}`.

- [ ] **Step 5: Verify dedup + validation**

Re-run the exact command from Step 4. Expected: `{"received":1,"inserted":0,"duplicates":1}`.
Then send a bad category:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/news/ingest \
  -H "Content-Type: application/json" -H "x-ingest-secret: dev-ingest-secret-change-me" \
  -d '{"title":"x","summary":"y","url":"https://example.com/b","source_name":"S","media_type":"article","category":"not-a-category","published_at":"2026-05-27T09:00:00Z"}'
```
Expected: `400`.

- [ ] **Step 6: Type-check + lint, then commit**

Run: `npm run build` (expect PASS) and `npm run lint` (expect no new errors in `app/api/news/ingest/route.ts`).

```bash
git add app/api/news/ingest/route.ts
git commit -m "feat(news): add secure ingest endpoint with validation + dedup"
```

---

## Task 5: List API `GET /api/news/list` (powers infinite scroll)

**Files:**
- Create: `app/api/news/list/route.ts`

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { isNewsCategorySlug, PAGE_SIZE } from "@/lib/news";
import { getNewsPage, decodeCursor } from "@/lib/news.server";

// Public, read-only. Returns the next batch of visible items for the infinite-scroll feed.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const cursorParam = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    const category =
      categoryParam && isNewsCategorySlug(categoryParam) ? categoryParam : null;
    const cursor = cursorParam ? decodeCursor(cursorParam) : null;
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || PAGE_SIZE, 1), 50)
      : PAGE_SIZE;

    const page = await getNewsPage({ category, cursor, limit });
    return NextResponse.json(page, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("news list error:", err);
    return NextResponse.json({ error: "Failed to load news" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify it returns items**

Run: `curl -s "http://localhost:3000/api/news/list?limit=5"`
Expected: JSON `{"items":[...],"nextCursor":null}` containing the test story from Task 4 (camelCase fields: `publishedAt`, `sourceName`, `isAiRelated`).

- [ ] **Step 3: Verify category filter**

Run: `curl -s "http://localhost:3000/api/news/list?category=sustainability&limit=5"`
Expected: `{"items":[],"nextCursor":null}` (the test story is `ai-in-audit`, not `sustainability`).

- [ ] **Step 4: Type-check, then commit**

Run: `npm run build` (expect PASS).

```bash
git add app/api/news/list/route.ts
git commit -m "feat(news): add public list endpoint for infinite scroll"
```

---

## Task 6: `NewsCard` component

**Files:**
- Create: `components/news/NewsCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";
// One story card. `featured` renders a full-width horizontal layout for the daily top story.
// Thumbnail uses next/image with a graceful fallback to a tinted placeholder. Chartreuse
// (bg-primary) badge is reserved for AI-related items per DESIGN.md.

import Image from "next/image";
import { useState } from "react";
import { categoryLabel, type NewsItem } from "@/lib/news";

const VERB: Record<NewsItem["mediaType"], string> = {
  article: "Read",
  report: "Read",
  video: "Watch",
  podcast: "Listen",
  other: "Open",
};

const MEDIA_LABEL: Record<NewsItem["mediaType"], string> = {
  article: "Article",
  report: "Report",
  video: "Video",
  podcast: "Podcast",
  other: "Link",
};

function Placeholder({ item }: { item: NewsItem }) {
  const glyph = item.mediaType === "video" ? "▶" : item.mediaType === "podcast" ? "♪" : null;
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/10 text-muted-foreground font-mono text-[13px]">
      {glyph ? <span className="text-[18px]">{glyph}</span> : item.sourceName}
    </div>
  );
}

export default function NewsCard({
  item,
  featured = false,
}: {
  item: NewsItem;
  featured?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imgError;
  const verb = VERB[item.mediaType];

  const badges = (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.05em] px-2 py-0.5 rounded border ${
          item.isAiRelated
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border"
        }`}
      >
        {MEDIA_LABEL[item.mediaType]} · {item.sourceName}
      </span>
    </div>
  );

  const meta = (
    <div className="mt-auto flex items-center justify-between pt-3">
      <span className="font-mono text-[11px] text-muted-foreground">
        {categoryLabel(item.category)}
      </span>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[11px] text-foreground border-b border-border hover:border-foreground transition-colors"
      >
        {verb} →
      </a>
    </div>
  );

  if (featured) {
    return (
      <article className="flex flex-col sm:flex-row overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative h-44 sm:h-auto sm:w-[300px] flex-none border-b sm:border-b-0 sm:border-r border-border">
          {showImage ? (
            <Image
              src={item.imageUrl as string}
              alt=""
              fill
              sizes="300px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Placeholder item={item} />
          )}
        </div>
        <div className="flex flex-col p-6">
          {badges}
          <h3 className="font-display text-[26px] leading-[1.1] mb-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
              {item.title}
            </a>
          </h3>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{item.summary}</p>
          {meta}
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative h-[104px] border-b border-border">
        {showImage ? (
          <Image
            src={item.imageUrl as string}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Placeholder item={item} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        {badges}
        <h3 className="font-semibold text-[15.5px] leading-snug mb-1.5">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
            {item.title}
          </a>
        </h3>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground line-clamp-3">{item.summary}</p>
        {meta}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: PASS. (Note: `line-clamp-3` is built into modern Tailwind; if the build flags it as unknown, the plugin is absent — replace that class with `overflow-hidden`.)

- [ ] **Step 3: Commit**

```bash
git add components/news/NewsCard.tsx
git commit -m "feat(news): add NewsCard (featured + standard, image fallback)"
```

---

## Task 7: `CategoryFilter` component

**Files:**
- Create: `components/news/CategoryFilter.tsx`

- [ ] **Step 1: Write the component**

```tsx
// Topic filter chips, rendered as links so each filter is a shareable, indexable URL.
import Link from "next/link";
import { NEWS_CATEGORIES, type NewsCategorySlug } from "@/lib/news";

export default function CategoryFilter({ active }: { active: NewsCategorySlug | null }) {
  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      className={`font-mono text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
        isActive
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-5">
      {chip("/news", "All", active === null)}
      {NEWS_CATEGORIES.map((c) => chip(`/news?category=${c.slug}`, c.label, active === c.slug))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check, then commit**

Run: `npm run build` (expect PASS).

```bash
git add components/news/CategoryFilter.tsx
git commit -m "feat(news): add CategoryFilter chips"
```

---

## Task 8: `NewsFeed` component (infinite scroll)

**Files:**
- Create: `components/news/NewsFeed.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";
// The scrolling feed. Server passes the first batch + initial cursor; this component appends
// more from /api/news/list when the sentinel nears the viewport. Groups by day; on the first
// (unfiltered) day group it promotes the highest-importance item to a full-width feature.

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
      {groups.map((group, gi) => {
        const firstUnfiltered = gi === 0 && !category;
        let featured: NewsItem | null = null;
        let rest = group.items;
        if (firstUnfiltered && group.items.length > 0) {
          featured = group.items.reduce((a, b) =>
            (b.importance ?? -1) > (a.importance ?? -1) ? b : a
          );
          rest = group.items.filter((it) => it.id !== featured!.id);
        }
        return (
          <section key={group.key} className="mb-12">
            <h2 className="font-mono text-[12px] tracking-[0.08em] uppercase text-muted-foreground mb-5 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <NewsCard item={featured} featured />
                </div>
              )}
              {rest.map((it) => (
                <NewsCard key={it.id} item={it} />
              ))}
            </div>
          </section>
        );
      })}

      {cursor && <div ref={sentinelRef} aria-hidden className="h-1" />}
      {loading && (
        <p className="font-mono text-[13px] text-muted-foreground text-center py-8">Loading…</p>
      )}
      {error && (
        <button
          onClick={loadMore}
          className="block mx-auto font-mono text-[13px] px-5 py-2.5 rounded-full border border-foreground text-foreground py-8"
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
  );
}
```

- [ ] **Step 2: Type-check, then commit**

Run: `npm run build` (expect PASS).

```bash
git add components/news/NewsFeed.tsx
git commit -m "feat(news): add NewsFeed with infinite scroll + daily top story"
```

---

## Task 9: `NewsPage` client shell

**Files:**
- Create: `components/news/NewsPage.tsx`

- [ ] **Step 1: Write the component** (mirrors `components/blog/BlogIndex.tsx`: shared header/footer + demo modal)

```tsx
"use client";
// Client shell for /news: shared header/footer + demo modal (Contact = Book Demo, per
// project convention), the page heading, the category filter, and the infinite-scroll feed.

import { useState } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import DemoModal from "@/components/site/DemoModal";
import CategoryFilter from "./CategoryFilter";
import NewsFeed from "./NewsFeed";
import { categoryLabel, type NewsItem, type NewsCategorySlug } from "@/lib/news";

export default function NewsPage({
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
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onOpenDemo={() => setDemoOpen(true)} />

      <main className="pt-32 pb-[120px]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="font-mono text-[13px] tracking-[0.1em] uppercase text-muted-foreground mb-4">
            Fi371 · Updated daily · curated from trusted sources
          </div>
          <h1 className="font-display text-[clamp(44px,7vw,72px)] leading-[1.0] tracking-tight mb-4">
            Audit Pulse
          </h1>
          <p className="text-[19px] text-muted-foreground leading-relaxed mb-8 max-w-[620px]">
            The biggest stories in audit, accounting, AI, and assurance — gathered every
            morning, so you don’t have to check dozens of sites.
            {category ? ` Showing: ${categoryLabel(category)}.` : ""}
          </p>

          <CategoryFilter active={category} />

          <div className="mt-8">
            <NewsFeed
              initialItems={initialItems}
              initialCursor={initialCursor}
              category={category}
              todayKey={todayKey}
              yesterdayKey={yesterdayKey}
            />
          </div>
        </div>
      </main>

      <SiteFooter onOpenDemo={() => setDemoOpen(true)} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Type-check, then commit**

Run: `npm run build` (expect PASS).

```bash
git add components/news/NewsPage.tsx
git commit -m "feat(news): add NewsPage client shell"
```

---

## Task 10: Public page `app/news/page.tsx`

**Files:**
- Create: `app/news/page.tsx`

- [ ] **Step 1: Write the page** (server component: metadata, JSON-LD, first batch)

```tsx
// Server entry for /news ("Audit Pulse"). Fully public. Owns SEO metadata + the CollectionPage
// / ItemList JSON-LD, fetches the first batch (server-rendered for SEO), and hands off to the
// client shell. force-dynamic so the page always reflects the latest DB (ingest needs no
// revalidate hook). Empty -> noindex, mirroring the blog index.

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import NewsPage from "@/components/news/NewsPage";
import { getNewsPage } from "@/lib/news.server";
import {
  isNewsCategorySlug,
  categoryLabel,
  todayUtcKey,
  yesterdayUtcKey,
  type NewsCategorySlug,
} from "@/lib/news";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string };

function resolveCategory(sp: SearchParams): NewsCategorySlug | null {
  return sp.category && isNewsCategorySlug(sp.category) ? sp.category : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const category = resolveCategory(sp);
  const description =
    "The biggest daily stories in financial audit, accounting, AI in audit, regulation, sustainability assurance, audit technology, and governance — curated from trusted sources.";
  const title = category
    ? `${categoryLabel(category)} — Audit Pulse | ${SITE_NAME}`
    : `Audit Pulse — audit & accounting news, daily | ${SITE_NAME}`;
  const canonical = category ? `/news?category=${category}` : "/news";

  // Keep an empty page out of search until it has content (mirrors the blog index).
  const { items } = await getNewsPage({ category, limit: 1 });
  const robots = items.length === 0 ? { index: false, follow: true } : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title, description, url: canonical },
    ...(robots ? { robots } : {}),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = resolveCategory(sp);
  const { items, nextCursor } = await getNewsPage({ category });
  const todayKey = todayUtcKey();
  const yesterdayKey = yesterdayUtcKey();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Audit Pulse",
    url: `${SITE_URL}/news`,
    description: "Daily curated audit & accounting news.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 20).map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "NewsArticle",
          headline: it.title,
          url: it.url,
          datePublished: it.publishedAt,
          ...(it.imageUrl ? { image: it.imageUrl } : {}),
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <NewsPage
        initialItems={items}
        initialCursor={nextCursor}
        category={category}
        todayKey={todayKey}
        yesterdayKey={yesterdayKey}
      />
    </>
  );
}
```

- [ ] **Step 2: Build + manual check**

Run: `npm run build` (expect PASS), then `npm run dev`.
Open `http://localhost:3000/news`. Expected: the page renders with the "Audit Pulse" heading, the category chips, and the Task 4 test story as a (featured, full-width) card under a "Today" header. Open `http://localhost:3000/news?category=sustainability` — expected: heading note "Showing: Sustainability." and "No stories yet — check back soon."

- [ ] **Step 3: Seed a few more items to see the grid + AI badge** (optional but recommended)

Post 3–4 more stories via the Task 4 curl pattern (vary `url`, `category`, `media_type`, `is_ai_related`, `published_at`). Reload `/news`: confirm AI items show the chartreuse badge, non-AI items don't, videos/podcasts show the play/♪ placeholder glyph, and day-grouping renders.

- [ ] **Step 4: Commit**

```bash
git add app/news/page.tsx
git commit -m "feat(news): add public /news page (Audit Pulse) with SEO + JSON-LD"
```

---

## Task 11: Wire-up — nav link, footer link, sitemap, image config, env example

**Files:**
- Modify: `components/site/SiteHeader.tsx`
- Modify: `components/site/SiteFooter.tsx`
- Modify: `app/sitemap.ts`
- Modify: `next.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Add a "News" link to the header nav**

In `components/site/SiteHeader.tsx`, change the `<nav>` block to add a News link before the Book Demo button:

```tsx
        <nav className="flex items-center gap-6">
          <Link
            href="/news"
            className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            News
          </Link>
          <button
            onClick={onOpenDemo}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Book Demo
          </button>
        </nav>
```

(`Link` is already imported in this file.)

- [ ] **Step 2: Add a footer link**

In `components/site/SiteFooter.tsx`, add a News link as the first item inside the `<div className="flex flex-wrap ...">` link group:

```tsx
          <Link href="/news" className={linkClass}>
            News
          </Link>
```

(Place it directly above the existing `/blog` link.)

- [ ] **Step 3: Add `/news` + category URLs to the sitemap**

In `app/sitemap.ts`, import the category slugs and add entries. After the existing import line `import { blogPosts } from "@/lib/blog";` add:

```ts
import { NEWS_CATEGORY_SLUGS } from "@/lib/news";
```

Then, inside the returned array, add these entries right after the home (`/`) entry:

```ts
    { url: `${SITE_URL}/news`, lastModified, changeFrequency: "daily", priority: 0.8 },
    ...NEWS_CATEGORY_SLUGS.map((slug) => ({
      url: `${SITE_URL}/news?category=${slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
```

- [ ] **Step 4: Allow remote images in `next.config.ts`**

Replace the contents of `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Story thumbnails come from many external sources; next/image fetches + optimises them
    // server-side so the visitor never calls a third-party host (privacy + speed). Broken
    // images fall back to a placeholder in NewsCard. Hardening option: restrict to known
    // source domains, or have n8n upload thumbnails to Supabase Storage (first-party only).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Document the env vars**

In `.env.example`, append:

```
# Audit Pulse news feed
# Shared secret n8n must send as the `x-ingest-secret` header on POST /api/news/ingest
NEWS_INGEST_SECRET=choose-a-long-random-string
# Password for the private /admin/news hide tool
NEWS_ADMIN_PASSWORD=choose-a-password
```

- [ ] **Step 6: Build + manual check**

Run: `npm run build` (expect PASS), then `npm run dev`. Confirm:
- The header shows a "News" link that routes to `/news`.
- The footer shows "News".
- `http://localhost:3000/sitemap.xml` lists `/news` and the six `?category=` URLs.
- A story with a real `image_url` (post one via curl using a known https image URL) renders the optimised thumbnail rather than the placeholder.

- [ ] **Step 7: Commit**

```bash
git add components/site/SiteHeader.tsx components/site/SiteFooter.tsx app/sitemap.ts next.config.ts .env.example
git commit -m "feat(news): link Audit Pulse in nav/footer/sitemap + allow remote thumbnails"
```

---

## Task 12: Admin hide control `/admin/news`

Cookie-gated (no middleware). The cookie value is an HMAC keyed by `NEWS_ADMIN_PASSWORD`, so it can't be forged without the password.

**Files:**
- Create: `app/admin/news/auth.ts`
- Create: `app/admin/news/actions.ts`
- Create: `app/admin/news/page.tsx`

- [ ] **Step 1: Write the auth utilities**

```ts
// app/admin/news/auth.ts — server-only helpers for the single-password admin gate.
// NOT a server-actions file: these are plain functions used by the page + the actions.
import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE = "ap_admin";

// Token the cookie must hold: HMAC over a fixed string, keyed by the admin password.
// Unguessable without the password; changing the password invalidates old cookies.
export function expectedToken(): string | null {
  const pw = process.env.NEWS_ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("audit-pulse-admin").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const token = expectedToken();
  if (!token) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === token;
}

export async function setAdminCookie(): Promise<void> {
  const token = expectedToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/news",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  // Expire on the same path it was set with (delete() with a custom path is version-sensitive).
  jar.set(COOKIE, "", { path: "/admin/news", maxAge: 0 });
}
```

- [ ] **Step 2: Write the server actions**

```ts
// app/admin/news/actions.ts
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setHidden } from "@/lib/news.server";
import { expectedToken, setAdminCookie, clearAdminCookie } from "./auth";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (expectedToken() && password === process.env.NEWS_ADMIN_PASSWORD) {
    await setAdminCookie();
    redirect("/admin/news");
  }
  redirect("/admin/news?error=1");
}

export async function logout(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/news");
}

export async function toggleHidden(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden") ?? "") === "true";
  if (id) {
    await setHidden(id, hidden);
    revalidatePath("/admin/news");
    revalidatePath("/news");
  }
}
```

- [ ] **Step 3: Write the admin page**

```tsx
// app/admin/news/page.tsx — private hide/unhide tool. The public /news page is never gated;
// only this page requires the single password.
import { isAdmin } from "./auth";
import { login, logout, toggleHidden } from "./actions";
import { getAdminRecentItems } from "@/lib/news.server";
import { categoryLabel } from "@/lib/news";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await isAdmin();

  if (!authed) {
    const { error } = await searchParams;
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <form action={login} className="w-full max-w-sm">
          <h1 className="font-display text-[32px] mb-2">Audit Pulse admin</h1>
          <p className="text-muted-foreground text-[15px] mb-6">Enter the admin password.</p>
          <input
            type="password"
            name="password"
            autoFocus
            className="w-full rounded-lg border border-border bg-card px-4 py-3 mb-3"
            placeholder="Password"
          />
          {error ? <p className="text-destructive text-[14px] mb-3">Wrong password.</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const items = await getAdminRecentItems(100);

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-[40px]">Audit Pulse — hide control</h1>
          <form action={logout}>
            <button className="font-mono text-[13px] text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-4 py-3">
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                  it.hidden
                    ? "border-destructive text-destructive"
                    : "border-border text-muted-foreground"
                }`}
              >
                {it.hidden ? "HIDDEN" : "LIVE"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium truncate">{it.title}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {it.sourceName} · {categoryLabel(it.category)}
                </p>
              </div>
              <form action={toggleHidden}>
                <input type="hidden" name="id" value={it.id} />
                <input type="hidden" name="hidden" value={String(!it.hidden)} />
                <button className="font-mono text-[12px] px-3 py-1.5 rounded-full border border-foreground hover:bg-foreground hover:text-background transition-colors">
                  {it.hidden ? "Unhide" : "Hide"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Build + manual check**

Run: `npm run build` (expect PASS), then `npm run dev`.
- Open `http://localhost:3000/admin/news` → expect the password form.
- Enter the wrong password → redirected back with "Wrong password."
- Enter the correct `NEWS_ADMIN_PASSWORD` → see the list of items.
- Click "Hide" on the test story → it flips to HIDDEN; reload `/news` in another tab → that story is gone. Click "Unhide" → it returns to `/news`.

- [ ] **Step 5: Lint, then commit**

Run: `npm run lint` (expect no new errors in the three admin files).

```bash
git add app/admin/news/auth.ts app/admin/news/actions.ts app/admin/news/page.tsx
git commit -m "feat(news): add password-gated /admin/news hide control"
```

---

## Task 13: End-to-end verification + cleanup

**Files:** none (verification only).

- [ ] **Step 1: Full build + lint**

Run: `npm run build` (expect PASS) and `npm run lint` (expect only the ~13 pre-existing `components/ui/*` baseline errors — none in `app/news`, `app/api/news`, `app/admin/news`, `components/news`, `lib/news*`).

- [ ] **Step 2: End-to-end happy path** (dev server running)

1. Post a multi-item batch with back-dated `published_at` values (today, yesterday, 10 days ago) via `/api/news/ingest` (Task 4 pattern, `{"items":[...]}`). Expect counts to add up.
2. Load `/news`: confirm day-grouping ("Today", "Yesterday", dated), the full-width top story on the unfiltered view, AI badges only on AI items, and media placeholders for video/podcast.
3. Confirm infinite scroll: post enough items (>24) and scroll — more load automatically; at the end "You're all caught up" appears.
4. Click a category chip → URL becomes `/news?category=...`, feed filters, the chip is active.
5. Hide an item via `/admin/news` → it disappears from `/news`.

- [ ] **Step 3: Confirm scope boundaries**

Verify these are NOT in this PR (they're the separate n8n follow-up / future work): the n8n workflow, the 30-day backfill run, RSS feed, per-category pages.

- [ ] **Step 4: Final review commit (if any stray changes)**

```bash
git status
# commit anything outstanding with a descriptive message; otherwise proceed to PR.
```

---

## Spec coverage map

| Spec section | Task(s) |
|---|---|
| §5 Data model | 1 |
| §6 Ingest API | 4 |
| §6a List API | 5 |
| §6b Initial backfill (repo readiness: back-dated bulk insert) | 1, 4, 13 |
| §7 Public page (metadata, JSON-LD, filter, first batch, infinite scroll) | 10, 8 |
| §8 Feed UI (NewsFeed/NewsCard/CategoryFilter + shell) | 6, 7, 8, 9 |
| §9 Categories & media types | 2 |
| §10 Admin hide control | 12 |
| §11 Privacy (next/image, no embeds) | 6, 11 |
| §12 Error/edge cases (auth, dedup, empty state, broken image) | 4, 6, 10 |
| §13 Env vars | 0, 11 |
| §14 Testing plan | every task's verify steps + 13 |
| §16 File-by-file list | all tasks |

> **Note on §4 freshness:** implemented as `export const dynamic = "force-dynamic"` on `/news` (always reads latest DB) instead of on-demand `revalidatePath`. Simpler and equivalent for this traffic level; switching to ISR + revalidate is a future optimisation if needed.

> **Note on §12 Supabase-down:** if the DB read in `/news` throws, Next renders its default error page. Adding `app/news/error.tsx` (a small client error boundary showing "temporarily unavailable") is optional hardening, deferred from v1.
