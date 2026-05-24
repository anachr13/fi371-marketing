// Shared prose styles for blog articles, matching DESIGN.md (Instrument Serif
// display headings, DM Sans body, warm palette, chartreuse AI accent). Used so
// every article renders consistently without @tailwindcss/typography (not
// installed). Apply these via className on raw elements. Created 2026-05-23.

/** 40–60 word direct-answer block at the top — optimized for AI snippet extraction. */
export const defBlock =
  "border-l-2 border-primary bg-card/60 rounded-r-lg pl-6 pr-5 py-5 mb-10 text-[20px] leading-relaxed text-foreground";
export const lead = "text-[21px] leading-relaxed text-foreground mb-8";
export const p = "text-[19px] leading-relaxed text-muted-foreground mb-6";
export const h2 =
  "font-display text-[34px] leading-tight tracking-tight text-foreground mt-14 mb-5";
export const h3 = "text-[22px] font-semibold text-foreground mt-10 mb-3";
export const ul = "list-disc pl-6 space-y-2 mb-6 text-[19px] text-muted-foreground";
export const ol = "list-decimal pl-6 space-y-2 mb-6 text-[19px] text-muted-foreground";
export const a =
  "text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors";
/** Pull-stat / callout for cited figures (boosts AI citability). */
export const stat =
  "font-display text-[28px] leading-snug text-foreground border-l-2 border-primary pl-5 my-8";
