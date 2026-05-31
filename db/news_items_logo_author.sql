-- Add publisher logo URL and (optional) author name to news_items. Backwards-compatible:
-- both nullable, so existing n8n ingest payloads continue to validate without change.
-- Apply to Supabase via the SQL editor or the Supabase MCP `apply_migration` tool.

alter table public.news_items
  add column if not exists source_logo_url text,
  add column if not exists author_name    text;
