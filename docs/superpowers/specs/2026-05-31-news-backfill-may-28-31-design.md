# /news backfill May 28–31 + v2 workflow test — Design Spec

- **Date:** 2026-05-31
- **Status:** Approved (ready for implementation plan)
- **Owner:** Christos / Fi371
- **Repo:** fi371-marketing (Next.js 16.2.4, Tailwind, shadcn/ui, Supabase, Vercel)
- **Scope:** Operational task — no code changes in this repo. Surgical n8n config edits, one workflow run (maybe two), then restore.

---

## 1. Summary

`/news` (Audit Pulse) hasn't been updated since **2026-05-28**. The DB has 30 published items, latest `published_at = 2026-05-28 20:08 UTC`, so the page shows nothing for **May 29, 30, 31**.

There are two n8n workflows behind the page:
- **v1** — `Audit Pulse - News Engine` (production, currently `active: false`)
- **v2** — `Audit Pulse - News Engine v2 (WIP)` (currently `active: true`, never used against prod yet) — adds link verification, og:image extraction, trusted source-domain list (from `.agents/source-library.yaml`), and a stronger Fi371 brand voice.

Goal: **fill the May 28→31 gap on /news using v2, and learn whether v2 is ready to replace v1 as the daily worker.** Two goals, one operation.

Approach: **narrow first, then 30-day if light.** Temporarily tune v2's existing Manual/Backfill trigger to a 4-day window with a target of ~12 stories (four field changes across three nodes, see §5), run it once, inspect results. If Pass 1 lands fewer than 8 stories for May 28→31, restore the original values and run the full 30-day Manual/Backfill as a fallback (Pass 2). Either way, restore v2 to its original configuration at the end.

---

## 2. Decisions locked (from brainstorming)

| Decision | Choice |
|---|---|
| Which workflow | **v2** (`Audit Pulse - News Engine v2 (WIP)`, id `bQ3EsCh841BBHlcm`) |
| Date window | **May 28 → today** (2026-05-31) — 4 days |
| Strategy | **Narrow first, then 30-day if light** |
| Pass 1 target | **~12 stories** (3/day average) |
| Pass 2 trigger | Only if **Pass 1 lands < 8 stories** for May 28→31 |
| v2 edits | **Surgical** — 3 values, all reversible, restored at the end |
| Daily activation | **Out of scope** — separate decision after we see Pass 1 results |
| v1 | **Untouched** in this task |

---

## 3. Out of scope (explicitly)

- **Activating v2 as the daily worker / deactivating v1.** Separate decision after Pass 1.
- **Refactoring v2** to make `days` / `maxDays` derive from `lookbackHours` (clean-engineering option discussed and rejected for YAGNI on a one-off test).
- **Backfilling `author_name`** for any rows (pre-existing P1 carry-over from the previous session, see `docs/superpowers/2026-05-31-news-next-steps.md`).
- **Fixing paywalled stories** (4 existing WSJ/Reuters rows render text-only — known, accepted).
- **Touching the `/news` UI, the ingest API, the DB schema, or anything in this repo.** This is purely an n8n-side operation; the dedup, revalidation, and admin-hide guardrails are already in place.

---

## 4. Architecture (operational, not code)

```
Pass 1 (narrow, ~4 days)
─────────────────────────
  Snapshot DB state
        │
        ▼
  Edit 3 values in v2 (capture "before" snapshot first)
        │
        ▼
  Fire v2 Manual/Backfill (MCP execute_workflow, or n8n UI fallback)
        │
        ▼
  v2 runs: Tavily (days=4) → Verify URLs → Extract og:image →
           Curate (GPT-4o, target=12) → POST /api/news/ingest
        │
        ▼
  Inspect DB (new rows, per-day, sample) + spot-check /news
        │
        ▼
   ┌────┴────┐
   │         │
≥8 stories  <8 stories
   │         │
   ▼         ▼
Stop      Pass 2 (30-day fallback)
   │         │
   │         ▼
   │     Restore v2 to 30-day values FIRST
   │         │
   │         ▼
   │     Fire v2 Manual/Backfill again
   │         │
   │         ▼
   │     Inspect new rows
   │         │
   └────┬────┘
        ▼
  Restore v2 fully (no-op if Pass 2 already restored)
        │
        ▼
  Report results to Christos
```

---

## 5. Surgical edits in v2 (Pass 1)

Four field changes across three nodes in v2 (`bQ3EsCh841BBHlcm`), via n8n MCP `update_workflow`. Before any edit, capture the "before" values verbatim (paste into the implementation plan as the restore source-of-truth).

| # | Node ID | Node name | Field | Current | Pass 1 value | Restore value |
|---|---|---|---|---|---|---|
| 1 | `77ece41b-0a3d-4f0a-b9eb-13128d7d2425` | `Config - Manual` | `assignments[c2].value` (lookbackHours) | 720 | **96** | 720 |
| 2 | `77ece41b-0a3d-4f0a-b9eb-13128d7d2425` | `Config - Manual` | `assignments[c3].value` (targetCount) | 20 | **12** | 20 |
| 3 | `160f659c-e63d-4a53-93c6-d808e6f9e5fc` | `Theme Queries` | `jsCode` — replace `(mode==="backfill")?30:14` with `(mode==="backfill")?4:14` | `?30:14` | **`?4:14`** | `?30:14` |
| 4 | `36e9ad7e-9657-404d-a724-6c7bc414aa3b` | `Collect Candidates` | `jsCode` — replace `(mode==="backfill")?31:14` with `(mode==="backfill")?4:14` | `?31:14` | **`?4:14`** | `?31:14` |

Mode stays `backfill` so Tavily continues to use `max_results=15` per theme (6 themes × 15 = up to 90 candidate URLs in the pool) — generous enough to find 12 good ones in a 4-day window.

---

## 6. Execution plan

### 6.1 Pass 1 — narrow run

1. **Snapshot before state** (Supabase MCP `execute_sql`, project `kerlookffyyascxyubqs`):
   - `select count(*), max(published_at) from public.news_items where hidden = false;` → expect `30`, `2026-05-28T20:08:38Z`
   - `select url from public.news_items where hidden = false;` → save full URL list to verify dedup vs new
2. **Capture v2 "before" snapshot** via n8n MCP `get_workflow_details` (already done at brainstorming time — values are in §5).
3. **Apply the 3 surgical edits** via n8n MCP `update_workflow`.
4. **Validate v2 still parses** via n8n MCP `validate_workflow` — abort if any errors.
5. **Fire v2** via n8n MCP `execute_workflow` (workflowId `bQ3EsCh841BBHlcm`). If MCP can't target the Manual trigger directly, fallback: Christos clicks "Execute Workflow" on the Manual / Backfill node in n8n UI.
6. **Wait for completion** via `get_execution` polling — expected runtime 30–90s. Timeout: 5 minutes. If exceeded, report execution ID + last node reached, troubleshoot before any further action.
7. **Inspect outcome:**
   - DB: `select date(published_at) as day, count(*) from public.news_items where created_at > <pass1_started_at> group by 1 order by 1 desc;`
   - DB sample: `select published_at, source_name, category, is_ai_related, image_url is not null as has_image, title from public.news_items where created_at > <pass1_started_at> order by published_at desc;`
   - /news: open prod, eyeball May 29–31 cards (titles, images load, summaries read in Fi371 voice).
8. **Score against success criteria** (§7).
9. **Decide:** ≥8 stories landed for May 28–31 → skip Pass 2, jump to §6.3 restore. Else → §6.2.

### 6.2 Pass 2 — 30-day fallback (only if Pass 1 light)

1. **Restore the 3 narrow-pass values to their originals first** (table in §5, "Restore value" column) — Config-Manual back to 720/20, Theme Queries back to `?30:14`, Collect Candidates back to `?31:14`.
2. **Validate v2** parses.
3. **Fire v2** again via MCP (or UI fallback).
4. **Wait for completion**, same timeout.
5. **Inspect new rows** (filter `created_at > <pass2_started_at>`). Most candidates will be deduped — that's expected. We're looking for *any* additional May 28–31 stories Pass 1 missed.
6. Pass 2 is restorative-by-design — once it finishes, v2 is already back to its original state.

### 6.3 Restore + report

- If only Pass 1 ran: **apply the restore values** (table in §5) via `update_workflow`. Validate v2 parses.
- If Pass 2 ran: v2 is already restored. Verify by reading the current Config-Manual / Theme Queries / Collect Candidates values match the "Restore value" column.
- Report back to Christos:
  - Pass 1 result: N stories landed (per-day breakdown for May 28/29/30/31), image fill rate, source distribution, sample titles
  - Pass 2 result (if applicable): M additional stories landed
  - v2 quality score against §7 criteria (X/8 pass)
  - Recommendation on the daily-activation decision (separate from this task)

---

## 7. Success criteria (v2 quality)

After Pass 1, score v2 against these 8 checks:

| # | Check | Pass bar | How to verify |
|---|---|---|---|
| 1 | Items reached DB | ≥ 6 new rows | `select count(*) from public.news_items where created_at > <pass1_started_at>` |
| 2 | On-topic | ≥ 80% genuinely audit/accounting/assurance | Read titles + summaries; subjective but defensible |
| 3 | URLs work | 100% of inserted URLs return 2xx | Random spot-check of 3 URLs; v2's Verify URL node already enforces this |
| 4 | Images | ≥ 60% have `image_url` populated | SQL: `count(image_url) / count(*)` — accept paywalled misses |
| 5 | Brand voice | Summaries peer-to-peer, no hype, no lecturing | Read 3 random summaries |
| 6 | No fabrication | URLs, titles, sources are real | Spot-check 3: visit URL, confirm title matches |
| 7 | Trusted sources | All from the source-library domain list | Compare `source_name` against `.agents/source-library.yaml` |
| 8 | Date accuracy | All `published_at` between 2026-05-28 and 2026-05-31 (UTC) | SQL: `where published_at not between '2026-05-28' and '2026-06-01'` returns 0 |

**Verdict:**
- **≥ 6 of 8 pass** → v2 is working. Recommend proceeding to the (separate) daily-activation decision.
- **< 6 pass** → v2 has a problem. Report which checks failed, recommend (a) fix v2, (b) fall back to v1 for the gap, or (c) escalate.

Edge case: the curator may return fewer than 12 stories (it's instructed not to pad with weak items). That's the prompt working, not a failure. Check 1's bar is **6**, not 12.

---

## 8. Error handling & edge cases

| Risk | Protection |
|---|---|
| v2 runs but inserts 0 rows | Step §6.1.7 catches it. Diagnose: Tavily quota? `NEWS_INGEST_SECRET` mismatch? Curator returned empty (raw output check)? |
| Duplicate stories | `ON CONFLICT (url) DO NOTHING` in `/api/news/ingest` — silent, returned as `duplicates` count |
| Off-topic story slips through | `/admin/news` hide control (password-gated) — flip `hidden = true`, page revalidates |
| Story works at fetch time but is paywalled later | Renders text-only on /news. No layout break. Known pattern (4 such rows already in DB). |
| MCP `execute_workflow` can't fire the Manual trigger | UI fallback: Christos clicks "Execute Workflow" in n8n |
| Workflow hangs >5 min | Abort poll, report execution ID + last node, troubleshoot before further action |
| Restore values forgotten | This spec is the source of truth (§5 "Restore value" column). Implementation plan includes a mandatory restore checklist. |
| Pass 1 stamps all stories with wrong dates | §6.1.7 per-day breakdown catches it. Hide via `/admin/news`, fix v2's date extractor before any further run. |
| Validate-workflow fails after our edit | Abort, do not fire. Report the validation error, fix, re-validate. |
| Ingest API returns 4xx/5xx for some items | `/api/news/ingest` reports `inserted` vs `received` — gap = something rejected. n8n's `Publish to /news` node uses `neverError: true` so the workflow won't crash; we inspect its response in the execution log. |

---

## 9. State after completion

**v2 (`bQ3EsCh841BBHlcm`):** identical to current state — `active: true`, all triggers intact, all node values restored per §5.

**v1 (`MrWzAX6U1oVYMHHD`):** unchanged — `active: false`.

**DB:** N additional rows (where 6 ≤ N ≤ ~25), all with `published_at` between 2026-05-28 and 2026-05-31, all `hidden = false` (unless §6.1.7 surfaced bad ones we manually hid).

**/news page:** shows new cards under May 29, May 30, May 31 day-group headers (plus possibly more under May 28). Triggered automatically via `revalidatePath('/news')` from the ingest route.

**No code changes** in this repo. No new files. No git commits except this spec doc and the resulting implementation plan.

---

## 10. Open follow-ups (separate from this task)

- **Daily-activation decision** — should v2 take over Morning/Lunch from v1? Make after Pass 1 results land.
- **Pre-existing P1 carry-over** (from `docs/superpowers/2026-05-31-news-next-steps.md`): `author_name` backfill, paywalled-row UX, mobile click affordance (F2). None of these block this task.
- **v2 hardening** if §7 score is 6/8 or 7/8 — note which check(s) missed. The (separate) daily-activation decision can then weigh whether to fix first or promote as-is.

---

## 11. File-by-file change list

| File | Change |
|---|---|
| `docs/superpowers/specs/2026-05-31-news-backfill-may-28-31-design.md` | **New** — this spec |
| `docs/superpowers/plans/2026-05-31-news-backfill-may-28-31.md` | New — implementation plan (via writing-plans skill, next step) |
| n8n workflow `bQ3EsCh841BBHlcm` (external) | Temporary 4-value edit + restore. Final state identical to starting state. |
| Supabase `public.news_items` (external) | N additional rows inserted, no schema change. |

No files in this repo are modified beyond the spec + plan docs.
