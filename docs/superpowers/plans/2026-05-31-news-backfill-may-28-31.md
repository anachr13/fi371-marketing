# /news Backfill May 28-31 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the May 28→31 gap on /news using n8n workflow v2 and learn whether v2 is ready to replace v1 as the daily worker.

**Architecture:** Surgical 4-field edit to v2's Manual/Backfill path (3 nodes, all reversible), fire workflow via MCP, inspect results, conditional 30-day fallback only if Pass 1 lands < 8 stories, restore v2 fully. All work happens in external systems (n8n + Supabase) — no code changes in this repo, only a post-run report doc.

**Tech Stack:** n8n MCP (`update_workflow`, `validate_workflow`, `execute_workflow`, `get_execution`, `get_workflow_details`), Supabase MCP (project `kerlookffyyascxyubqs`, `execute_sql`), Postgres SQL.

**Spec:** [docs/superpowers/specs/2026-05-31-news-backfill-may-28-31-design.md](../specs/2026-05-31-news-backfill-may-28-31-design.md)

---

## File Structure

This plan does **not** modify code in this repo. The only file written is a post-run report at the end.

| Path | Role |
|---|---|
| (external) n8n workflow `bQ3EsCh841BBHlcm` (Audit Pulse v2) | Gets 4 reversible field edits in Tasks 2 + 7, fully restored in Task 10 |
| (external) Supabase `public.news_items` | Receives ingested rows via the existing `/api/news/ingest` route. No schema change. |
| `docs/superpowers/2026-05-31-news-backfill-result.md` (new) | Post-run report: snapshots, scorecard, recommendation. Committed in Task 12. |

---

## n8n MCP preflight (read once before Task 2)

`update_workflow` expects the workflow definition in the n8n SDK form. If you (the executing agent) have not used `update_workflow` in this session yet:

1. Call `get_sdk_reference` (sections: `guidelines`, `design`) to see the SDK shape.
2. Use the workflow JSON from `get_workflow_details` (Task 1.3) as the basis for translating into SDK code — only the 3 nodes listed in §5 of the spec need to change; everything else carries over verbatim.

If `update_workflow` fails because of a shape mismatch, fall back to: ask Christos to manually apply the 4 field edits in the n8n UI using the values in Task 2. The plan can continue from Task 3 either way.

---

## Task Decomposition

### Task 1: Capture before-state snapshot

**Files:** none (produces values used by later tasks; record them in your scratchpad)

- [ ] **Step 1.1: Snapshot DB row count + latest date**

Supabase MCP `execute_sql` (project_id `kerlookffyyascxyubqs`):
```sql
select count(*) as total, max(published_at) as latest
from public.news_items
where hidden = false;
```
Expected: `total = 30`, `latest = 2026-05-28T20:08:38Z`. If different, **STOP** — someone else may have added rows; reconcile with Christos before continuing.

- [ ] **Step 1.2: Snapshot existing URLs (for later dedup-vs-new diff)**

```sql
select url, published_at, source_name
from public.news_items
where hidden = false
order by published_at desc;
```
Save the result set. Used in Task 4 to verify dedup behaviour and identify net-new rows by URL.

- [ ] **Step 1.3: Snapshot v2 workflow current values**

n8n MCP `get_workflow_details` (workflowId `bQ3EsCh841BBHlcm`). Confirm exactly:
- `Config - Manual` node (id `77ece41b-0a3d-4f0a-b9eb-13128d7d2425`) — assignments include `lookbackHours = 720` (number) and `targetCount = 20` (number).
- `Theme Queries` node (id `160f659c-e63d-4a53-93c6-d808e6f9e5fc`) — `jsCode` string contains the substring `(mode==="backfill")?30:14`.
- `Collect Candidates` node (id `36e9ad7e-9657-404d-a724-6c7bc414aa3b`) — `jsCode` string contains the substring `(mode==="backfill")?31:14`.

If ANY value already differs, **STOP** and report to Christos — someone has already modified v2; do not overwrite their changes.

- [ ] **Step 1.4: Record Pass 1 start timestamp**

```sql
select now() as pass1_started_at;
```
Save this timestamp verbatim (e.g. `2026-05-31T14:23:45.123Z`). All "new since Pass 1" queries in Task 4 use this as the cutoff.

---

### Task 2: Apply the 4 surgical edits + validate

**Files:** (external) n8n workflow `bQ3EsCh841BBHlcm`

- [ ] **Step 2.1: Build the modified workflow definition**

Starting from the workflow JSON returned by Step 1.3, apply these 4 changes (and only these):

1. `Config - Manual` node → change the `lookbackHours` assignment value from `720` to `96`.
2. `Config - Manual` node → change the `targetCount` assignment value from `20` to `12`.
3. `Theme Queries` node → in `parameters.jsCode`, replace the substring `(mode==="backfill")?30:14` with `(mode==="backfill")?4:14`. (One occurrence; do not change `:14` part — that's the daily mode, untouched.)
4. `Collect Candidates` node → in `parameters.jsCode`, replace the substring `(mode==="backfill")?31:14` with `(mode==="backfill")?4:14`. (One occurrence.)

Leave the `mode` assignment (`backfill`) untouched. Leave every other node, connection, and trigger untouched.

- [ ] **Step 2.2: Validate the modified workflow**

n8n MCP `validate_workflow` against the new code from Step 2.1. Expected: validates clean (zero errors). If any error: **STOP**, do NOT fire. Report the error to Christos and fix before continuing.

- [ ] **Step 2.3: Apply the update**

n8n MCP `update_workflow` (workflowId `bQ3EsCh841BBHlcm`) with the validated code. Expected: success response.

- [ ] **Step 2.4: Confirm the edits stuck**

Call `get_workflow_details` again. Confirm:
- `Config - Manual`: `lookbackHours = 96`, `targetCount = 12`.
- `Theme Queries` jsCode contains `(mode==="backfill")?4:14`.
- `Collect Candidates` jsCode contains `(mode==="backfill")?4:14`.

If any field still shows the old value: re-apply that edit, validate again, update again, re-confirm. Do not proceed to Task 3 until all 4 edits are present.

---

### Task 3: Fire v2 Pass 1 + poll for completion

**Files:** none

- [ ] **Step 3.1: Fire the workflow**

n8n MCP `execute_workflow` (workflowId `bQ3EsCh841BBHlcm`). Note the returned execution ID.

**Fallback:** if the call errors with "cannot trigger Manual" or similar, ask Christos to click "Execute Workflow" on the **Manual / Backfill** node in the n8n UI (workflow: Audit Pulse v2). He should paste back the execution ID from the run record.

- [ ] **Step 3.2: Poll execution status**

n8n MCP `get_execution` with the ID from Step 3.1. Poll every 15 seconds. Expected: `status = "success"` within 30-90 seconds.

**Hard timeout: 5 minutes.** If exceeded, abort polling, capture the `status` + last executed node from the execution record, report to Christos, and do not proceed to Task 4. Investigate before any further action.

- [ ] **Step 3.3: Capture the ingest API response**

In the successful execution record, locate the `Publish to /news` node output. It will contain the HTTP response from `POST https://www.fi371.com/api/news/ingest`. Expected: HTTP 200 with JSON body `{ received, inserted, duplicates }`.

Record all three values. Example (your values will vary):
- `received: 12` (the curator output)
- `inserted: 9` (genuinely new)
- `duplicates: 3` (URLs already in DB)

---

### Task 4: Inspect Pass 1 results

**Files:** none (build the data you need for Task 5's scorecard)

- [ ] **Step 4.1: New rows by day**

```sql
select date(published_at) as day, count(*) as new_rows
from public.news_items
where created_at > '<pass1_started_at>'
group by 1
order by 1 desc;
```
Substitute `<pass1_started_at>` with the timestamp from Step 1.4.

Expected: rows under `2026-05-31`, `2026-05-30`, `2026-05-29`, possibly `2026-05-28`. Any date outside `2026-05-28` to `2026-05-31` → flag for the date-accuracy check in Task 5.

- [ ] **Step 4.2: New rows full detail**

```sql
select published_at, source_name, category, is_ai_related,
       (image_url is not null) as has_image,
       title, url
from public.news_items
where created_at > '<pass1_started_at>'
order by published_at desc;
```
This is your raw material for the on-topic / brand-voice / no-fabrication checks in Task 5.

- [ ] **Step 4.3: Image fill rate**

```sql
select count(*) as total,
       count(image_url) as with_image,
       round(count(image_url)::numeric / nullif(count(*),0) * 100, 1) as pct
from public.news_items
where created_at > '<pass1_started_at>';
```
Record `pct` — feeds into Task 5 check #4.

- [ ] **Step 4.4: Visual spot-check on /news**

Fetch `https://www.fi371.com/news` (curl or browser). Confirm new cards appear under "May 29 / 30 / 31" day-group headers, images load, titles render, no visible breakage. Note anything off.

---

### Task 5: Score Pass 1 against the 8 success criteria

**Files:** none (produces a scorecard for the Task 12 report)

- [ ] **Step 5.1: Score each of the 8 checks from spec §7**

Build a table `check, pass_or_fail, evidence` for each:

1. **Items reached DB** — `count(*) ≥ 6` from Step 4.1. Pass/fail.
2. **On-topic (≥ 80%)** — read titles from Step 4.2. Count audit/accounting/assurance-relevant rows, divide by total. Pass if ≥ 80%.
3. **URLs work (100% 2xx)** — pick 3 random `url` values from Step 4.2. For each, run `curl -sI <url> -o /dev/null -w "%{http_code}\n"`. Pass if all 3 return 2xx (or 3xx redirects following to 2xx).
4. **Images (≥ 60%)** — from Step 4.3 `pct`. Pass if ≥ 60%.
5. **Brand voice** — read 3 random `summary` values. Mark pass if all three sound peer-to-peer, free of hype/lecturing, no claims AI replaces the auditor.
6. **No fabrication** — for the same 3 URLs from check 3, visit each URL and confirm the page's title matches the DB `title` value (substring match OK; outlets sometimes append " | Outlet"). Pass if all 3 match.
7. **Trusted sources** — read `source_name` values from Step 4.2. Compare to `.agents/source-library.yaml` (the include_domains list hard-coded in v2's `Source Domains` node, lines 1-3 of its jsCode). Pass if all values map to a domain in that list.
8. **Date accuracy** — run:
```sql
select count(*) as out_of_range
from public.news_items
where created_at > '<pass1_started_at>'
  and (published_at < '2026-05-28' or published_at > '2026-06-01');
```
Pass if `out_of_range = 0`.

- [ ] **Step 5.2: Compute the verdict**

- **≥ 6 of 8 pass** → v2 is working. (Recommend: proceed to the separate daily-activation decision.)
- **< 6 of 8 pass** → v2 has a problem. Record which check(s) failed. Recommend (a) fix v2 first, (b) fall back to v1 for the gap, or (c) escalate to deeper investigation.

Save the verdict + reasoning for Task 12's report.

---

### Task 6: Decision gate — Pass 2 or skip?

**Files:** none

- [ ] **Step 6.1: Count NEW May 28-31 stories from Pass 1**

```sql
select count(*) as pass1_gap_stories
from public.news_items
where created_at > '<pass1_started_at>'
  and published_at >= '2026-05-28'
  and published_at < '2026-06-01';
```

- [ ] **Step 6.2: Decide**

- If `pass1_gap_stories >= 8` → **SKIP Tasks 7-9.** Jump straight to Task 10 (restore-only path).
- If `pass1_gap_stories < 8` → **proceed to Task 7** (Pass 2 fallback path).

Record the decision and the count in your scratchpad for Task 12.

---

### Task 7: Restore v2 to 30-day values (Pass 2 prep)

**Only if Step 6.2 said Pass 2 is needed. Otherwise skip to Task 10.**

**Files:** (external) n8n workflow `bQ3EsCh841BBHlcm`

- [ ] **Step 7.1: Build the restored workflow definition**

Starting from the current workflow JSON (Pass 1 narrow values), apply these 4 changes:

1. `Config - Manual` → set `lookbackHours` assignment value back to `720`.
2. `Config - Manual` → set `targetCount` assignment value back to `20`.
3. `Theme Queries` → in `parameters.jsCode`, replace `(mode==="backfill")?4:14` with `(mode==="backfill")?30:14`.
4. `Collect Candidates` → in `parameters.jsCode`, replace `(mode==="backfill")?4:14` with `(mode==="backfill")?31:14`.

- [ ] **Step 7.2: Validate**

`validate_workflow` against the restored code. Expected: clean. If error → **STOP**, fix, re-validate.

- [ ] **Step 7.3: Apply the update**

`update_workflow` (workflowId `bQ3EsCh841BBHlcm`).

- [ ] **Step 7.4: Confirm the edits stuck**

`get_workflow_details`. Confirm:
- Config-Manual: `lookbackHours = 720`, `targetCount = 20`.
- Theme Queries jsCode contains `(mode==="backfill")?30:14`.
- Collect Candidates jsCode contains `(mode==="backfill")?31:14`.

If anything's off, re-apply that specific edit and re-confirm. Do not proceed until all 4 are restored.

---

### Task 8: Fire Pass 2 + poll

**Only if Pass 2 is needed.**

**Files:** none

- [ ] **Step 8.1: Capture Pass 2 start timestamp**

```sql
select now() as pass2_started_at;
```
Save verbatim.

- [ ] **Step 8.2: Fire the workflow**

`execute_workflow` (workflowId `bQ3EsCh841BBHlcm`). Same MCP-error fallback as Step 3.1 (Christos clicks Manual / Backfill in UI).

- [ ] **Step 8.3: Poll to completion**

`get_execution` every 15s. Expected runtime: 60-180s (wider Tavily window = more URL verifies). Same 5-minute hard timeout as Step 3.2.

- [ ] **Step 8.4: Capture ingest response**

Same as Step 3.3 — pull `received / inserted / duplicates` from the `Publish to /news` node output.

---

### Task 9: Inspect Pass 2 results

**Only if Pass 2 ran.**

**Files:** none

- [ ] **Step 9.1: New rows by day since Pass 2 started**

```sql
select date(published_at) as day, count(*) as new_rows
from public.news_items
where created_at > '<pass2_started_at>'
group by 1
order by 1 desc;
```
Most Tavily candidates will dedup (we already have 30 + Pass 1's new rows). We care about any ADDITIONAL May 28-31 stories Pass 1 missed.

- [ ] **Step 9.2: Updated May 28-31 coverage (Pass 1 + Pass 2 combined)**

```sql
select date(published_at) as day, count(*) as new_rows
from public.news_items
where created_at > '<pass1_started_at>'
  and published_at >= '2026-05-28'
  and published_at < '2026-06-01'
group by 1
order by 1 desc;
```

(Note: v2 is already at its restored values because Pass 2 used them. Task 10 only verifies.)

---

### Task 10: Restore + verify

**Files:** (external) n8n workflow `bQ3EsCh841BBHlcm`

- [ ] **Step 10.1: Branch on path taken**

- **If Pass 2 ran** (Tasks 7-9 happened): v2 is already at the restored values. Skip to Step 10.2 to verify.
- **If only Pass 1 ran** (Task 6 said skip): apply the restore edits NOW. Repeat Steps 7.1, 7.2, 7.3 verbatim (4 field changes back to 720/20/`?30:14`/`?31:14`, validate, update).

- [ ] **Step 10.2: Verify v2 is at its original values**

`get_workflow_details`. Confirm exactly:
- `Config - Manual`: `lookbackHours = 720`, `targetCount = 20`.
- `Theme Queries` jsCode contains `(mode==="backfill")?30:14`.
- `Collect Candidates` jsCode contains `(mode==="backfill")?31:14`.

If ANY value still shows a narrow-pass value: apply the missing edit (build modified code → validate → update) and re-verify. Do not leave this step until v2 matches its Task 1.3 snapshot exactly.

- [ ] **Step 10.3: Final validate**

`validate_workflow` one last time. Expected: clean.

---

### Task 11: Final DB sanity + /news visual confirm

**Files:** none

- [ ] **Step 11.1: DB final state**

```sql
select count(*) as total, max(published_at) as latest
from public.news_items
where hidden = false;
```
Expected: `total = 30 + (Pass 1 inserted) + (Pass 2 inserted, 0 if skipped)`. `latest` should now be `2026-05-31` (or possibly `2026-05-30` if no May 31 stories came back yet that day). Record both.

- [ ] **Step 11.2: /news visual check on prod**

Fetch `https://www.fi371.com/news` (or open in browser). Confirm:
- New cards appear under `May 29`, `May 30`, `May 31` day-group headers.
- Images load (allow some misses for paywalled sources — known pattern).
- Titles + summaries render with no layout breakage.
- No items are obviously off-topic or low-quality.

Note any cards that look bad — Christos can hide them via `/admin/news` after the report.

---

### Task 12: Write post-run report + commit

**Files:**
- Create: `docs/superpowers/2026-05-31-news-backfill-result.md`

- [ ] **Step 12.1: Write the report doc**

Create `docs/superpowers/2026-05-31-news-backfill-result.md` with these sections:

```markdown
# /news May 28-31 backfill — Result report

**Date:** 2026-05-31
**Spec:** docs/superpowers/specs/2026-05-31-news-backfill-may-28-31-design.md
**Plan:** docs/superpowers/plans/2026-05-31-news-backfill-may-28-31.md
**Workflow:** Audit Pulse v2 (`bQ3EsCh841BBHlcm`)

## Pass 1 (narrow, 4-day)

- Started: <pass1_started_at>
- Execution ID: <id from Step 3.1>
- Ingest response: received=N, inserted=M, duplicates=N-M
- New rows by day:
  - 2026-05-31: X
  - 2026-05-30: Y
  - 2026-05-29: Z
  - 2026-05-28: W
- Image fill rate: A% (from Step 4.3)
- Sample titles: (3-5 from Step 4.2)

## v2 quality scorecard (8 checks from spec §7)

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | Items reached DB (≥6) | pass/fail | count = N |
| 2 | On-topic (≥80%) | pass/fail | observed % |
| 3 | URLs work (100% 2xx) | pass/fail | 3/3 spot-checks |
| 4 | Images (≥60%) | pass/fail | A% |
| 5 | Brand voice | pass/fail | summary excerpts |
| 6 | No fabrication | pass/fail | 3/3 title matches |
| 7 | Trusted sources | pass/fail | all from source-library |
| 8 | Date accuracy | pass/fail | out_of_range = 0 |

**Verdict:** X / 8. v2 is [working / has a problem].

## Pass 2 (only if triggered)

- Started: <pass2_started_at> (or "skipped — Pass 1 met the ≥8 threshold")
- Execution ID, ingest response, additional rows landed (same shape as Pass 1)

## Final DB state

- Before: 30 rows, latest = 2026-05-28T20:08Z
- After: N rows, latest = <new latest>
- Net new: N - 30

## v2 workflow state

Restored to original values per spec §5 "Restore value" column.
Verified at Step 10.2.

## Recommendation (for the separate daily-activation decision)

[1-3 sentences: should v2 take over Morning/Lunch from v1? What conditions, if any?]

## Items flagged for /admin/news hide

[Any cards that looked bad in Task 11.2 — empty if none.]
```

Fill in all bracketed/`<...>` placeholders with the actual values you captured during the run. NO unfilled placeholders allowed in the committed doc.

- [ ] **Step 12.2: Commit the report**

```bash
git add docs/superpowers/2026-05-31-news-backfill-result.md
git commit -m "$(cat <<'EOF'
docs(news): result of May 28-31 backfill + v2 quality test

Pass 1 (narrow, 4-day) landed N stories. v2 scored X/8 on the spec §7
quality checks. Pass 2 [ran / skipped]. v2 restored to original values.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 12.3: Surface the report to Christos**

In your final message, link the report doc and highlight:
- Net new rows on /news
- §7 scorecard result (X/8)
- Recommendation for the daily-activation decision

---

## Self-Review notes (from the planner)

- Every spec section is covered: §1 (whole plan), §2 (Task 1-2 values), §3 (nothing crosses out-of-scope), §4 (Tasks mirror the flowchart), §5 (Task 2), §6.1 (Tasks 1-4), §6.2 (Tasks 7-9), §6.3 (Tasks 10-12), §7 (Task 5), §8 (STOP conditions in Tasks 1.3, 2.2, 3.2, 7.2, 10.2), §9 (Task 10 + 11), §10 (report recommendation in Task 12.1), §11 (Task 12.2 commits the only repo change).
- No "TBD"/"TODO"/"add error handling" placeholders. `<pass1_started_at>` / `<pass2_started_at>` / `<id from Step 3.1>` are documented runtime values, not unfilled spec gaps — Step 1.4 / 8.1 / 3.1 capture them respectively.
- Restore path in Task 10 explicitly repeats the Task 7 steps instead of "see Task 7" — engineer can execute Task 10 cold.
- Workflow IDs, node IDs, and field paths consistent across all tasks.
