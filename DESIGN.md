# Design System -- Fi371

## Product Context
- **What this is:** AI-native audit automation platform -- from client onboarding to final opinion
- **Who it's for:** Solo, small, and mid-sized accounting/audit firms frustrated with legacy tools
- **Space/industry:** Audit technology / accounting automation
- **Project type:** Marketing landing page (Next.js + Tailwind + shadcn/ui)

## Logo
- **Type:** Text wordmark only, no icon or symbol
- **Text:** "Fi371"
- **Font:** DM Sans (body font), 20px, font-weight 700
- **Color:** Uses --text (primary foreground) in both light and dark modes
- **Tracking:** -0.02em (slightly tightened)
- **Usage:** Top-left of header, footer copyright. Always rendered as plain text, never as an image.
- **Do not:** Add icons, symbols, gradients, or decorative elements to the logo. Keep it typographic.

## Aesthetic Direction
- **Direction:** Warm Editorial -- paper-textured warmth meets precise, document-driven design
- **Decoration level:** Intentional -- editorial rules, horizontal dividers, monospace AI annotations. Texture comes from typography and structure, not decorative elements.
- **Mood:** Like a premium financial publication crossed with a modern AI product studio. Serious, confident, and clearly designed in this decade. Not cold corporate, not startup playful.
- **Memorable thing:** "Finally, something that doesn't look like it was built in 2005, utilising AI"
- **Anti-patterns (never use):** Purple gradients, 3-column icon grids with colored circles, centered-everything layouts, decorative blobs, stock photos of people at laptops, gradient hero sections, system-ui as display font, generic SaaS template layouts.

## Typography
- **Display/Hero:** Instrument Serif (Google Fonts) -- editorial authority, sharp and elegant. No audit tech competitor uses serif headlines. This is the single strongest visual differentiator.
- **Body:** DM Sans (Google Fonts) -- warmer than Inter, excellent readability, supports tabular-nums for data tables. Modern without being generic.
- **UI/Labels:** DM Sans (same as body)
- **Data/Tables:** DM Sans with tabular-nums feature enabled
- **Mono/AI States:** IBM Plex Mono (Google Fonts) -- used for AI status annotations, audit metadata, proof points, and kicker text. Makes the AI-native angle feel operational, not gimmicky.
- **Loading:** All fonts via next/font/google for optimal performance
- **Scale:**
  - Hero: 60px / 3.75rem (font-black, tracking-tight)
  - H1: 48px / 3rem
  - H2: 36px / 2.25rem
  - H3: 24px / 1.5rem
  - Body: 16px / 1rem
  - Small: 14px / 0.875rem
  - Caption/Mono: 12px / 0.75rem

## Color
- **Approach:** Restrained -- warm paper base + single bold accent. Color is used with surgical precision.
- **This is a LIGHT-FIRST design.** The warm paper background is the single strongest differentiator from every competitor in the space (they all use dark navy or clinical white).

### Light Mode (Primary)
- **Background:** #F2EFE5 -- warm paper/parchment, not clinical white
- **Surface/Cards:** #EAE2D5 -- layered stock, like filing material
- **Primary text:** #161412 -- near-black with warmth, avoids sterile contrast
- **Muted text:** #6F675F -- supporting copy and interface labels
- **Rules/Borders:** #C8B9A6 -- editorial structure, dividers, gridlines
- **Accent (AI):** #C8FF00 -- electric chartreuse, used SPECIFICALLY for AI-related elements (badges, highlights, active AI steps). Creates a clear visual language: "chartreuse = AI is doing this"
- **Accent hover:** #B5E600 -- slightly darker chartreuse for hover/active states
- **CTA:** #C8FF00 on dark text (#161412) -- high contrast, unmissable
- **Success:** #22C55E
- **Warning:** #EAB308
- **Error:** #EF4444
- **Info:** #6F675F (uses muted, not blue -- stays in the warm palette)

### Dark Mode (Secondary)
- **Background:** #1C1917 -- deep warm charcoal (stone-900)
- **Surface/Cards:** #292524 -- warm dark surface (stone-800)
- **Primary text:** #F5F5F4 -- warm off-white (stone-100)
- **Muted text:** #A8A29E -- warm gray (stone-400)
- **Rules/Borders:** #44403C -- warm border (stone-700)
- **Accent (AI):** #D4FF33 -- slightly warmer chartreuse for dark backgrounds
- **CTA:** #D4FF33 on dark text
- Reduce saturation 10-20% from light mode values

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable between sections, functional-dense within cards/data blocks
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(96px)
- **Section spacing:** 80-112px between major sections (generous editorial pacing)
- **Card internal:** 24-32px padding (functional density)

## Layout
- **Approach:** Creative-editorial -- asymmetric compositions, poster-like hero, editorial grid
- **Grid:** 12-column grid, max-width 1200px centered
- **Hero:** Asymmetric 60/40 split (headline left, product artifact right)
- **Section rhythm:** Alternate dense and sparse sections for editorial pacing
- **Border radius:** Hierarchical -- sm: 4px (inputs), md: 8px (cards), lg: 12px (panels), xl: 16px (hero elements)
- **First viewport:** Treat as a poster, not a document. One dominant idea.

## Motion
- **Approach:** Minimal-functional -- subtle entrance animations, meaningful state transitions. Precise, like the product itself. No bouncy, no playful.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Entrance:** Subtle fade-up with 8px translate, staggered 50ms between siblings

## Visual Language for AI
- Chartreuse (#C8FF00) is reserved exclusively for AI-related UI elements
- AI status badges: small chartreuse pills with dark text (e.g., "AI" next to workflow steps)
- AI-generated content: subtle chartreuse left-border or highlight
- Non-AI elements: warm paper palette only (no chartreuse)
- This creates an instant visual language: users learn that chartreuse = "AI is working here"

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-06 | Initial design system created | /design-consultation with competitive research + 3 independent AI design voices |
| 2026-05-06 | Chose light-first warm paper over dark-mode-only | Every competitor uses dark navy or white. Warm paper is the strongest differentiator. |
| 2026-05-06 | Chose Instrument Serif for display | No audit tech product uses serif headlines. Editorial authority that breaks SaaS convention. |
| 2026-05-06 | Chose DM Sans over Inter for body | Warmer, more distinctive, same readability. Inter is the most overused font on the web. |
| 2026-05-06 | Chose chartreuse (#C8FF00) as accent | Used exclusively for AI elements. Creates "chartreuse = AI" visual language. More distinctive than vermilion (which was the other finalist). |
| 2026-05-06 | Rejected navy/teal/cyan palette | Every audit tech competitor (Caseware, DataSnipper, AuditBoard, Silverfin) uses this palette. Deliberate departure. |
