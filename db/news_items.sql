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
