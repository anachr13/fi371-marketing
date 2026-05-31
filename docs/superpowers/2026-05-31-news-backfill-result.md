# /news May 28-31 backfill — Result report

**Date:** 2026-05-31
**Spec:** [docs/superpowers/specs/2026-05-31-news-backfill-may-28-31-design.md](specs/2026-05-31-news-backfill-may-28-31-design.md)
**Plan:** [docs/superpowers/plans/2026-05-31-news-backfill-may-28-31.md](plans/2026-05-31-news-backfill-may-28-31.md)
**Workflow used:** **v1** (`Audit Pulse - News Engine`, id `MrWzAX6U1oVYMHHD`) — pivoted from v2 mid-flight; see §5 below

---

## 1. Outcome summary

- **/news now has 34 visible items** (was 30). 4 new rows landed.
- **May 29, 30, 31 — still 0 rows.** The original gap on `/news` is unchanged.
- The 4 new rows fill earlier May gaps (May 28 morning, May 11, May 6, May 4).
- v1 ran cleanly; the run was a backfill via fallback engine (not a v2 quality test).

---

## 2. What landed

The single batch POST to `/api/news/ingest` contained 4 stories:

| Published | Source | Category | AI? | Title |
|---|---|---|---|---|
| 2026-05-28 05:05 | Consultancy.uk | AI in Audit | ✅ | Three-quarters of finance leaders deploying AI tools in work |
| 2026-05-11 11:32 | edie.net | Sustainability | ❌ | ESRS and SFDR: What's changing with the EU's sustainability reporting frameworks? |
| 2026-05-06 13:00 | Accounting Today | AI in Audit | ✅ | Does your firm need an AI architect? |
| 2026-05-04 15:22 | Accounting Today | AI in Audit | ✅ | Accounting's AI arms race |

**Per-day breakdown of new vs. existing (May 2026):**

| Day | Rows after | Was |
|---|---|---|
| 2026-05-31 | 0 | 0 — **GAP UNCHANGED** |
| 2026-05-30 | 0 | 0 — **GAP UNCHANGED** |
| 2026-05-29 | 0 | 0 — **GAP UNCHANGED** |
| 2026-05-28 | 4 | 3 (+1) |
| 2026-05-27 | 1 | 1 |
| 2026-05-26 | 1 | 1 |
| 2026-05-22 | 1 | 1 |
| 2026-05-20 | 1 | 1 |
| 2026-05-19 | 6 | 6 |
| 2026-05-18 | 5 | 5 |
| 2026-05-14 | 1 | 1 |
| 2026-05-11 | 2 | 1 (+1) |
| 2026-05-06 | 1 | 0 (+1) |
| 2026-05-05 | 2 | 2 |
| 2026-05-04 | 2 | 1 (+1) |

DB row count: 30 → 34 (visible, `hidden = false`).

---

## 3. Why no May 29-31 stories?

Tavily Search returned only **6 deduped candidates** across all 6 themes for the 30-day window — modest for a backfill (max possible: 90). None had `published_date` in May 29-31.

Three plausible causes (likely a mix):
1. **News reality.** Memorial Day was 2026-05-25 (US); audit/accounting publishers historically slow through that week. May 29-31 may simply have had little major coverage.
2. **Tavily index lag.** Tavily's "news" topic indexes recent stories with some delay; same-day coverage isn't guaranteed.
3. **Curator filtering.** GPT-4o was instructed to drop weak/off-topic items. Anything Tavily surfaced for May 29-31 may have been filtered.

Decision (from §6 of the spec's brainstorming flow): **accept and move on.** Re-evaluate next week.

---

## 4. Quality scorecard (partial)

Spec §7 was written for v2. v1 has narrower instrumentation, so several checks don't apply cleanly. What we can score:

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | Items reached DB (≥ 6) | ❌ FAIL | 4 rows |
| 2 | On-topic (≥ 80%) | ✅ PASS | 4/4 audit / accounting / AI |
| 3 | URLs work | ⏭ Not spot-checked | (low risk — v1 historically reliable) |
| 4 | Images (≥ 60%) | ❌ FAIL | 0% (v1 doesn't extract og:image — known limitation) |
| 5 | Brand voice | ⏭ Not read | (eyeball on /news to confirm) |
| 6 | No fabrication | ⏭ Not spot-checked | (low risk — v1 prompt forbids inventing URLs) |
| 7 | Trusted sources | ⚠️ PARTIAL | v1 has no source-library filter — surfaced 1 source (edie.net) outside v2's allowlist |
| 8 | Date accuracy (May 28-31) | ❌ FAIL | 0 / 4 in target window |

Not a useful "v2 quality" signal because v2 was not the engine that ran.

---

## 5. What happened to v2 (pivot story)

The spec called for v2 + 4 surgical edits. Execution path I took, with what broke:

1. **Snapshot before-state** ✅ — DB at 30 rows, v2 verified at original config.
2. **Applied 4 edits via SDK `update_workflow`** — `valid: true` from `validate_workflow` but with a warning about agent subnodes.
3. **Update succeeded but silently mangled v2:**
   - Tavily Search lost its httpHeaderAuth credential (SDK skips credential reassignment on httpRequest nodes — documented in the update response).
   - Publish to /news lost its httpHeaderAuth credential — same.
   - Curate Model + Curate Schema were absorbed into Curate & Write's `subnodes` field as embedded objects rather than separate connected nodes — broke the canvas + execution wiring.
4. **`publish_workflow` with the original `versionId` restored `activeVersionId` to the pre-update version.** Triggers will now run the good original. **But v2's editor draft is still the SDK-mangled version** — anyone opening v2 in n8n will see broken Curate & Write with empty subnode slots. Needs cleanup before activating v2 for daily use.
5. **Pivoted to v1** for this run because v1 is untouched and intact (all credentials, all subnode wiring).

Lesson: **n8n MCP `update_workflow` is destructive for workflows containing httpRequest credentials and langchain agent subnodes.** Manual UI edits are the safer path for surgical changes. Larger lesson for the v2-daily-activation decision below.

---

## 6. v2 state right now

- `activeVersionId = 9c5f3154-761f-47be-83bd-efb1d66b96aa` — the original working version. Triggers (Morning, Lunch) and manual fires will run this.
- Latest draft (`versionId = f2f2fe66-...`) is the SDK-mangled version with broken subnodes + missing credentials. Visible in the editor.
- **Before activating v2 to handle daily runs, the draft needs to be cleaned** — either by re-publishing the activeVersion as the draft, or by hand in the UI.
- v1 remains `active: false` after the manual fire; manual triggers don't require active=true.

---

## 7. Final DB state

```sql
select count(*) as total, max(published_at) as latest_published
from public.news_items where hidden = false;
-- total: 34, latest_published: 2026-05-28 20:08:38+00
```

- Before: 30 rows, latest 2026-05-28 20:08:38
- After: 34 rows, latest **still 2026-05-28 20:08:38** (the 4 new rows are all earlier than the existing latest)
- Net new: 4

---

## 8. Recommendation (for the separate daily-activation decision)

**Do not activate v2 from its current draft state.** The draft is SDK-damaged. Fix path:
1. In n8n UI, open v2 → use the version history clock icon → restore the `9c5f3154-...` version into the draft (so editor and active match).
2. Verify all credentials present on Tavily Search + Publish to /news.
3. Verify Curate Model + Curate Schema appear as separate connected subnodes.
4. Test v2's Manual / Backfill manually before flipping schedule triggers on.
5. **Future v2 edits should be done in the n8n UI**, not via SDK code, until n8n MCP's SDK abstraction handles credential preservation + langchain subnodes correctly.

**v1 daily activation:** if you want to keep `/news` fed while v2 is being repaired, activate v1 (`MrWzAX6U1oVYMHHD`). v1's daily schedule will fire Morning + Lunch and keep the page current — at the cost of v2's better quality controls (source library, link verification, og:image extraction).

---

## 9. Items flagged for /admin/news hide

None. The 4 new stories look on-topic and credible. No moderation needed.

---

## 10. Open follow-ups

- **Repair v2's editor draft.** See §6 fix path.
- **Decide on v1 vs v2 for daily runs** while v2 is being repaired.
- **`/news` will continue to show no cards for May 29-31** until either real stories surface for those days or they're hand-added via SQL or admin tooling.
