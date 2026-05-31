# News Image Fallback + Cascade Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every card on `/news` shows an image. When the publisher's `og:image` is missing or broken, fall back cleanly to a Fi371-branded placeholder. Strengthen extraction with a meta-tag cascade so the placeholder is the exception, not the rule.

**Architecture:** A shared TS module (`lib/news-image-extract.ts`) runs a 7-step meta-tag cascade against any article URL. The frontend (`NewsCard.tsx`) always renders the image well, swapping in `public/news/placeholder.svg` whenever the real image is null or errors. A re-runnable script (`scripts/backfill-news-images.ts`) applies the cascade to existing DB rows with null `image_url`. The n8n workflow mirrors the same cascade in its JS code node (out-of-repo change, same-day).

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript 5, Supabase JS 2.105, new dep `node-html-parser` (~50KB, no native bindings).

**Spec:** [docs/superpowers/specs/2026-05-31-news-image-fallback-design.md](../specs/2026-05-31-news-image-fallback-design.md)

---

## File Structure

| Change | Path | Responsibility |
|---|---|---|
| NEW | `lib/news-image-extract.ts` | Pure extraction logic: fetch article URL, run cascade, return URL or null. Server-only. |
| NEW | `public/news/placeholder.svg` | Static fallback image, warm paper palette per DESIGN.md. |
| NEW | `scripts/backfill-news-images.ts` | One-shot tool: select null-image rows, run cascade, update DB. Saved + re-runnable. |
| EDIT | `components/news/NewsCard.tsx` | Always render image well; swap to placeholder on null or `onError`. |
| EDIT | `package.json` | Add `node-html-parser` dependency. |

Each file has one clear responsibility. The cascade module is the only place the extraction logic lives; the script imports it; the n8n mirror documents it.

---

## Task 0: Confirm dependency

**Files:** None yet. This is a user-approval gate.

- [ ] **Step 1: Ask the user**

Per CLAUDE.md, ask before adding any new dependency. Present this:

> "Approach A needs an HTML parser to run the meta-tag cascade. Recommendation: `node-html-parser` — about 50KB, zero native bindings, no jsdom, fast. The alternative is hand-rolled regex (fragile, not recommended). OK to add?"

Wait for explicit approval before continuing to Task 1.

---

## Task 1: Add the placeholder SVG

**Files:**
- Create: `public/news/placeholder.svg`

- [ ] **Step 1: Create the file**

```svg
<svg width="400" height="268" viewBox="0 0 400 268" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
  <rect width="400" height="268" fill="#EAE2D5"/>
  <line x1="188" y1="124" x2="212" y2="124" stroke="#C8B9A6" stroke-width="1"/>
  <text x="200" y="148" text-anchor="middle" font-family="'DM Sans', -apple-system, system-ui, sans-serif" font-weight="700" font-size="16" letter-spacing="-0.02em" fill="#6F675F">Fi371</text>
</svg>
```

- [ ] **Step 2: Verify file exists**

Run: `ls -la public/news/placeholder.svg`
Expected: file listed with a non-zero byte count.

- [ ] **Step 3: Commit**

```bash
git add public/news/placeholder.svg
git commit -m "feat(news): Fi371 placeholder asset for cards without og:image"
```

---

## Task 2: Update NewsCard to always render image well

**Files:**
- Modify: `components/news/NewsCard.tsx` (lines 65-67, 122-133)

- [ ] **Step 1: Read the current file**

Run: `cat components/news/NewsCard.tsx`

Confirm the current shape matches what's in the spec: `showImage = Boolean(item.imageUrl) && !imgError;` and the JSX wraps the image well in `{showImage && (...)}`.

- [ ] **Step 2: Replace the image-handling block**

Find this block (around line 65-67):
```tsx
export default function NewsCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imgError;
```

Replace with:
```tsx
const PLACEHOLDER_SRC = "/news/placeholder.svg";

export default function NewsCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false);
  const usingPlaceholder = !item.imageUrl || imgError;
  const imageSrc = usingPlaceholder ? PLACEHOLDER_SRC : (item.imageUrl as string);
```

- [ ] **Step 3: Replace the image-well JSX**

Find this block (around line 122-133):
```tsx
        {showImage && (
          <div className="relative h-[180px] w-full flex-none overflow-hidden rounded border border-border sm:h-[134px] sm:w-[200px]">
            <Image
              src={item.imageUrl as string}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover saturate-[0.8] brightness-[0.96] transition-[filter] duration-200 group-hover:saturate-100 group-hover:brightness-100"
              onError={() => setImgError(true)}
            />
          </div>
        )}
```

Replace with:
```tsx
        <div className="relative h-[180px] w-full flex-none overflow-hidden rounded border border-border sm:h-[134px] sm:w-[200px]">
          <Image
            src={imageSrc}
            alt={usingPlaceholder ? "" : item.title}
            fill
            sizes="(max-width: 640px) 100vw, 200px"
            className="object-cover saturate-[0.8] brightness-[0.96] transition-[filter] duration-200 group-hover:saturate-100 group-hover:brightness-100"
            onError={() => setImgError(true)}
            unoptimized={usingPlaceholder}
          />
        </div>
```

- [ ] **Step 4: Lint the file**

Run: `npm run lint -- components/news/NewsCard.tsx`
Expected: no errors on this file (some baseline lint errors elsewhere are fine — see `reference_validation_workflow` in memory).

- [ ] **Step 5: Type-check via build**

Run: `npm run build`
Expected: build succeeds. If TS fails, the error tells you what's wrong; fix and rerun.

- [ ] **Step 6: Smoke test in dev**

Run: `npm run dev` in a separate terminal.
Open `http://localhost:3000/news` in a browser.
Expected:
- Every card has an image well visible.
- Cards with `image_url` show the real image.
- WSJ cards (which currently have `image_url IS NULL`) now show the Fi371 placeholder instead of an empty gap.
- Hover a card with a real image: the `saturate(0.8) brightness(0.96)` filter releases (image goes full color). Same hover treatment applies to placeholder cards.

Stop the dev server when done: Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add components/news/NewsCard.tsx
git commit -m "feat(news): always render image well, fall back to placeholder

Every card now has a visible image position. When image_url is null
or the remote image errors, swap in the Fi371 placeholder. Empty alt
on the placeholder keeps screen readers from announcing decorative
content."
```

---

## Task 3: Install the HTML parser dependency

**Files:**
- Modify: `package.json` (dependencies)
- Modify: `package-lock.json`

**Precondition:** Task 0 user approval received.

- [ ] **Step 1: Install**

Run: `npm install node-html-parser`
Expected: package added to `dependencies` in `package.json`. Lockfile updated.

- [ ] **Step 2: Verify version is reasonable**

Run: `npm list node-html-parser`
Expected: shows a `6.x` version (current major). If it pulled an unexpected major version, ask the user before continuing.

- [ ] **Step 3: Type-check via build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add node-html-parser dep for news image cascade"
```

---

## Task 4: Build the extraction cascade module

**Files:**
- Create: `lib/news-image-extract.ts`

- [ ] **Step 1: Create the file**

```ts
// Server-only. Given an article URL, fetch the HTML and try multiple meta-tag
// strategies in order; return the first usable absolute https image URL, or null.
//
// Used by:
//   - scripts/backfill-news-images.ts (direct import)
//   - n8n "Web Researcher" workflow (mirror; see spec for cascade contract)
//
// If you change the cascade order or sanity checks, also update the n8n mirror.
// Spec: docs/superpowers/specs/2026-05-31-news-image-fallback-design.md

import { parse } from "node-html-parser";

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; Fi371NewsBot/1.0; +https://fi371.com)";

// Meta tag cascade. Order is intentional: og:image is the publisher's intended
// share image; twitter:image is next-best and very common; JSON-LD is handled
// separately (it's a parsed structure, not an attribute); link rel=image_src
// is legacy but still around on older sites.
const META_SELECTORS: { selector: string; attr: "content" }[] = [
  { selector: 'meta[property="og:image"]', attr: "content" },
  { selector: 'meta[property="og:image:url"]', attr: "content" },
  { selector: 'meta[property="og:image:secure_url"]', attr: "content" },
  { selector: 'meta[name="twitter:image"]', attr: "content" },
  { selector: 'meta[name="twitter:image:src"]', attr: "content" },
];

export async function extractImageUrl(articleUrl: string): Promise<string | null> {
  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(articleUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const root = parse(html);

  // 1-5: meta tag scrapes
  for (const m of META_SELECTORS) {
    const el = root.querySelector(m.selector);
    const candidate = el?.getAttribute(m.attr)?.trim();
    if (candidate && isUsable(candidate)) return candidate;
  }

  // 6: JSON-LD walk
  const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.text);
      const found = findImageInJsonLd(data);
      if (found && isUsable(found)) return found;
    } catch {
      // skip malformed JSON-LD; try the next script
    }
  }

  // 7: <link rel="image_src">
  const linkEl = root.querySelector('link[rel="image_src"]');
  const linkCandidate = linkEl?.getAttribute("href")?.trim();
  if (linkCandidate && isUsable(linkCandidate)) return linkCandidate;

  return null;
}

// URL must be absolute https, ≤ 2000 chars (matches the ingest schema),
// and parse as a real URL. Rejects data: URIs, relative paths, and malformed URLs.
function isUsable(url: string): boolean {
  if (url.length === 0 || url.length > 2000) return false;
  if (!url.startsWith("https://")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Walk a JSON-LD value looking for an `image` field. The value can be a string,
// an object with `{ url }`, an array of either, or nested under `@graph`.
function findImageInJsonLd(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findImageInJsonLd(item);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  if ("image" in obj) {
    const img = obj.image;
    if (typeof img === "string") return img;
    if (img && typeof img === "object" && !Array.isArray(img)) {
      const urlField = (img as { url?: unknown }).url;
      if (typeof urlField === "string") return urlField;
    }
    if (Array.isArray(img)) {
      for (const i of img) {
        if (typeof i === "string") return i;
        if (i && typeof i === "object") {
          const urlField = (i as { url?: unknown }).url;
          if (typeof urlField === "string") return urlField;
        }
      }
    }
  }
  if ("@graph" in obj) {
    const found = findImageInJsonLd(obj["@graph"]);
    if (found) return found;
  }
  return null;
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint -- lib/news-image-extract.ts`
Expected: no errors on this file.

- [ ] **Step 3: Type-check via build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Quick manual smoke test**

Create a throwaway test file `/tmp/test-extract.ts`:

```ts
import { extractImageUrl } from "@/lib/news-image-extract";

(async () => {
  // A site we know publishes og:image
  const r1 = await extractImageUrl("https://www.bloomberg.com/");
  console.log("bloomberg.com:", r1);

  // A site we know blocks bots
  const r2 = await extractImageUrl("https://www.wsj.com/news/cfo-journal");
  console.log("wsj.com:", r2);

  // An invalid URL
  const r3 = await extractImageUrl("https://this-domain-does-not-exist-fi371.example/");
  console.log("invalid:", r3);
})();
```

Run: `npx tsx /tmp/test-extract.ts`
Expected:
- `bloomberg.com:` prints an `https://...` URL
- `wsj.com:` prints either `null` or a generic WSJ logo URL (paywall page)
- `invalid:` prints `null`

Delete the throwaway: `rm /tmp/test-extract.ts`.

- [ ] **Step 5: Commit**

```bash
git add lib/news-image-extract.ts
git commit -m "feat(news): image extraction cascade module

Server-only module exporting extractImageUrl(articleUrl). Runs a
7-step cascade: og:image variants → twitter:image variants → JSON-LD
Article.image → link rel=image_src. URL sanity checks: absolute https,
≤2000 chars, parseable. 10s fetch timeout with a browser-like UA.

Designed to be mirrored in the n8n Web Researcher workflow."
```

---

## Task 5: Build the backfill script

**Files:**
- Create: `scripts/backfill-news-images.ts`

- [ ] **Step 1: Create the file**

```ts
// scripts/backfill-news-images.ts
// Re-runs the og:image cascade against existing news_items rows.
// Targets rows where image_url IS NULL (or all rows with --force).
// Safe to re-run. Idempotent on missing-image rows.
//
// Usage (the --env-file flag loads SUPABASE_URL / SUPABASE_SERVICE_KEY):
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts --dry-run
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts --limit 10
//   npx tsx --env-file=.env.local scripts/backfill-news-images.ts --force

import { createServerSupabaseClient } from "@/lib/supabase";
import { extractImageUrl } from "@/lib/news-image-extract";

type Row = { id: string; url: string; source_name: string; image_url: string | null };

const CONCURRENCY = 5;

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const limitIdx = argv.indexOf("--limit");
  const limitRaw = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : NaN;
  const limit = Number.isFinite(limitRaw) ? limitRaw : null;
  return { dryRun, force, limit };
}

async function main() {
  const { dryRun, force, limit } = parseArgs();
  console.log(
    `Mode: ${dryRun ? "DRY RUN" : "APPLY"}, force=${force}, limit=${limit ?? "none"}`
  );

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("news_items")
    .select("id, url, source_name, image_url")
    .order("published_at", { ascending: false });
  if (!force) query = query.is("image_url", null);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch rows:", error);
    process.exit(1);
  }
  const rows = (data as Row[]) ?? [];
  console.log(`Found ${rows.length} candidate rows.\n`);

  let updated = 0;
  let stillEmpty = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const chunk = rows.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map(async (row) => {
        const newUrl = await extractImageUrl(row.url);
        return { row, newUrl };
      })
    );
    for (const r of results) {
      if (r.status === "rejected") {
        failed++;
        console.log(`✗ extraction error: ${String(r.reason)}`);
        continue;
      }
      const { row, newUrl } = r.value;
      if (!newUrl) {
        stillEmpty++;
        console.log(`✗ ${row.source_name}: ${row.url} (no image found)`);
        continue;
      }
      if (newUrl === row.image_url) {
        console.log(`= ${row.source_name}: unchanged`);
        continue;
      }
      if (dryRun) {
        updated++;
        console.log(`→ ${row.source_name}: would set image_url to ${newUrl}`);
      } else {
        const { error: updErr } = await supabase
          .from("news_items")
          .update({ image_url: newUrl })
          .eq("id", row.id);
        if (updErr) {
          failed++;
          console.log(`✗ ${row.source_name}: update failed: ${updErr.message}`);
        } else {
          updated++;
          console.log(`✓ ${row.source_name}: image_url updated`);
        }
      }
    }
  }

  console.log(
    `\nSummary: ${updated} ${dryRun ? "would-update" : "updated"}, ${stillEmpty} still empty, ${failed} errors`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Lint**

Run: `npm run lint -- scripts/backfill-news-images.ts`
Expected: no errors on this file.

- [ ] **Step 3: Type-check via build**

Run: `npm run build`
Expected: succeeds. (The script is outside the `app/` and `pages/` paths Next.js scans for routes, but `tsc` still type-checks it.)

- [ ] **Step 4: Dry-run against the live DB**

Run: `npx tsx --env-file=.env.local scripts/backfill-news-images.ts --dry-run`
Expected:
- Prints `Mode: DRY RUN, force=false, limit=none`
- Prints `Found N candidate rows.` (N is the count of rows with `image_url IS NULL`; today that's 4)
- For each row, prints either `→ source: would set image_url to https://...` or `✗ source: url (no image found)`
- Final line: `Summary: X would-update, Y still empty, Z errors`

Read the dry-run output before continuing. If the would-update URLs look reasonable, proceed to Task 6. If they look suspicious (e.g., point to ads, social icons, or tracking pixels), pause and report to the user.

- [ ] **Step 5: Commit**

```bash
git add scripts/backfill-news-images.ts
git commit -m "feat(scripts): backfill-news-images for null-image rows

One-shot tool that re-runs the cascade against news_items rows with
image_url IS NULL. Supports --dry-run, --limit N, --force. Concurrent
(5 at a time). Idempotent. Saved to scripts/ so it can be re-run as
new rows accumulate."
```

---

## Task 6: Apply the backfill against the live DB

**Files:** None (DB-only change; no code commit).

**Precondition:** Task 5 dry-run output looked reasonable.

- [ ] **Step 1: Apply**

Run: `npx tsx --env-file=.env.local scripts/backfill-news-images.ts`
Expected:
- Same as the dry-run output, but with `→` lines replaced by `✓ source: image_url updated`.
- Final summary shows the actual update count.

- [ ] **Step 2: Verify in Supabase**

Use the Supabase MCP `execute_sql` tool against project `kerlookffyyascxyubqs` (per memory `reference_fi371_supabase_project`):

```sql
SELECT source_name, COUNT(*) AS total, COUNT(image_url) AS with_image
FROM public.news_items
WHERE hidden = false
GROUP BY source_name
ORDER BY total DESC;
```

Expected: `with_image` rose by the number of recovered rows. WSJ CFO Journal likely still shows `with_image < total` (those will rely on the placeholder — that's by design).

- [ ] **Step 3: Smoke test on /news**

Run: `npm run dev`
Open `http://localhost:3000/news`.
Expected:
- Recovered rows now show real images instead of placeholders.
- Any remaining null-image rows still show the placeholder.
- No card has an empty image well or a broken-image icon.

Stop the dev server (Ctrl-C).

---

## Task 7: Final validation + PR

**Files:** None (CI gates + PR).

- [ ] **Step 1: Lint the whole project**

Run: `npm run lint`
Expected: the ~13 baseline lint errors in shadcn boilerplate are fine (per `reference_validation_workflow`); no NEW errors from our files.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Visual cross-check (light + dark mode)**

Run: `npm run dev`
Open `http://localhost:3000/news` in light mode (system default).
Screenshot the feed; verify placeholder rendering on at least one card.
Toggle to dark mode (via OS, or browser devtools "Emulate CSS prefers-color-scheme").
Screenshot again; verify the placeholder still looks coherent against the dark card surface (`#292524`). If the warm-paper placeholder looks too bright on dark mode, file a follow-up — out of scope for this PR.

Stop the dev server (Ctrl-C).

- [ ] **Step 4: Push the branch**

Run:
```bash
git push -u origin claude/ecstatic-lamport-6adc4c
```

- [ ] **Step 5: Open the PR**

Run:
```bash
gh pr create --title "feat(news): image fallback + cascade extraction" --body "$(cat <<'EOF'
## Summary
- Every `/news` card now shows an image — when `og:image` is missing or broken, the Fi371 placeholder fills the gap.
- New cascade module (`lib/news-image-extract.ts`) tries 7 meta-tag strategies before giving up.
- One-shot backfill script (`scripts/backfill-news-images.ts`) re-runs the cascade against existing rows with null `image_url`. Saved + re-runnable.
- Fixes the WSJ "no image" visual gap by replacing it with the placeholder.

## Spec
- [docs/superpowers/specs/2026-05-31-news-image-fallback-design.md](docs/superpowers/specs/2026-05-31-news-image-fallback-design.md)

## Out of scope (deferred to future work)
- **Approach B** — first-party Supabase Storage hosting. Revisit when feed exceeds ~500 rows or link rot becomes visible.
- **Approach C** — headless browser retry for blocked sources. Only if a specific blocker emerges.
- **n8n cascade mirror** — applied same-day in the n8n workspace. See `lib/news-image-extract.ts` comment.

## Test plan
- [ ] `npm run lint` passes (no new errors)
- [ ] `npm run build` succeeds
- [ ] On `/news`, every card has an image well visible
- [ ] WSJ cards show the Fi371 placeholder (not an empty gap, not a broken image)
- [ ] Hover over a card → saturate filter releases (real images go full color; placeholder gets the same treatment)
- [ ] Backfill script dry-run against live DB shows sensible would-update URLs
- [ ] Backfill apply updates DB; recovered rows render real images on `/news`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

- [ ] **Step 6: Self-review on the PR**

Per CLAUDE.md "Pull Requests" guidance: post a review comment on your own PR flagging:
- Anything you're unsure about (e.g., the placeholder visual in dark mode if you noticed any issue)
- Key changes (placeholder always renders; cascade module; backfill tool)
- Trade-offs / risks: WSJ-style paywalled sites still show placeholder; new `node-html-parser` dependency

```bash
gh pr review --comment --body "Self-review notes:

**Key changes**
- \`NewsCard.tsx\` no longer conditionally renders the image well — every card has a visible image position
- New \`lib/news-image-extract.ts\` is the single source of truth for the cascade order; n8n mirror is documented in the spec
- \`scripts/backfill-news-images.ts\` is saved to the repo as a re-runnable recovery tool, not a one-shot

**Trade-offs flagged**
- WSJ and similar bot-blocked sites will keep showing the placeholder — that's the spec's accepted outcome
- \`node-html-parser\` is a new dep (~50KB, no native bindings); approved before adding
- The placeholder is one universal asset (not per-publisher) — keeps maintenance to zero

**Things to double-check before merging**
- Placeholder appearance in dark mode (manually verified during smoke test)
- Backfill ran without errors against the live DB"
```

- [ ] **Step 7: Notify the user**

PR URL is the deliverable. Report it back, summarize what landed, and remind the user that the n8n cascade mirror is an out-of-repo same-day change (separate from this PR).

---

## Self-Review Notes

Spec coverage check:
- Cascade (spec §Architecture) → Task 4
- Placeholder asset (spec §Placeholder visual) → Task 1
- Frontend swap (spec §Frontend) → Task 2
- Backfill script (spec §Backfill script) → Tasks 5–6
- Error handling (spec §Error handling) → covered inline in NewsCard's onError + cascade's catches + script's Promise.allSettled
- Testing (spec §Testing) → Task 2 step 6, Task 4 step 4, Task 6 step 3, Task 7 steps 1–3
- Future work (spec §Future work) → linked in PR body, no implementation tasks (correct — it's deferred)
- Open questions (spec §Open questions) → dep approval is Task 0; n8n timing is documented in PR body; env vars use existing `.env.local`

Placeholder scan: no TBD/TODO/"add appropriate X" in any step. Every code step has the full code; every command step has the exact command and expected output.

Type consistency: function name `extractImageUrl` used identically in Task 4 (definition), Task 5 (import). Constant `PLACEHOLDER_SRC` used only in Task 2. SVG path `/news/placeholder.svg` matches between Task 1 (file location) and Task 2 (constant value).

Scope check: single subsystem (news image rendering + ingestion fallback). One PR. No decomposition needed.
