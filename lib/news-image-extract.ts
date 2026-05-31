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

// schema.org types we treat as "this node's image is the article thumbnail."
// Publishers commonly include Organization/WebSite/Publisher nodes alongside the
// article in an @graph; those nodes' `image` is the publisher logo, NOT the
// article hero, so we skip them.
const ARTICLE_TYPES: ReadonlySet<string> = new Set([
  "Article",
  "NewsArticle",
  "BlogPosting",
  "Report",
  "ScholarlyArticle",
  "TechArticle",
  "SocialMediaPosting",
]);

function isArticleType(typeField: unknown): boolean {
  if (typeof typeField === "string") return ARTICLE_TYPES.has(typeField);
  if (Array.isArray(typeField)) {
    return typeField.some((t) => typeof t === "string" && ARTICLE_TYPES.has(t));
  }
  return false;
}

// `image` in JSON-LD can be a string, an object with `{ url }`, or an array of either.
function extractImageString(img: unknown): string | null {
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
  return null;
}

// Walk a JSON-LD value looking for an `image` field on an Article-typed node.
// Handles arrays, @graph nesting, and the multi-shape `image` value. Returns
// null when no article node has an image (caller falls through to link[rel=image_src]).
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
  if (isArticleType(obj["@type"]) && "image" in obj) {
    const extracted = extractImageString(obj.image);
    if (extracted) return extracted;
  }
  if ("@graph" in obj) {
    const found = findImageInJsonLd(obj["@graph"]);
    if (found) return found;
  }
  return null;
}
