// Site-wide constants: single source of truth for canonical URL, brand, and
// descriptions used across metadata, sitemap, and structured data (JSON-LD).
// Centralised so SEO/GEO fields never drift between files (DRY / single source).
// Created 2026-05-23.

/** Canonical production origin (matches public/robots.txt sitemap reference). */
export const SITE_URL = "https://fi371.com";

/** Brand name — used as-is, no legal suffix (pre-incorporation). */
export const SITE_NAME = "Fi371";

/** Short positioning line used in titles and og:site descriptions. */
export const SITE_TAGLINE = "AI-Native Audit Automation Platform";

/** Default meta description (mirrors the homepage hero promise). */
export const SITE_DESCRIPTION =
  "Close audit engagements in days, not weeks. AI-native audit automation for solo, small and mid-sized firms — from client onboarding to final opinion.";

/** Primary contact inbox (also used on legal pages). */
export const CONTACT_EMAIL = "anastasiades.chr@gmail.com";
