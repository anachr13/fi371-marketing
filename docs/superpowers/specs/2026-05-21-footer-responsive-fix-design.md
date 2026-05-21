# Footer Responsive Fix

## Problem
The home page footer (`app/page.tsx`, lines 262-273) has no responsive behavior. On mobile screens, the copyright text and four navigation links are forced into a single horizontal row, causing:
- Copyright text wrapping into 3 awkward lines
- "Contact" link cut off on the right edge
- 32px gap between links too wide for small screens

## Scope
Tailwind class changes only on 5 existing elements. No new HTML, no new components, no structural changes. Desktop layout remains unchanged.

## Approach
Stack the footer content vertically on mobile (< 768px), switching to the current side-by-side layout at the `md` breakpoint. This matches the responsive pattern already used by the header navigation.

## Mobile Layout (< 768px)
- Copyright on its own line, left-aligned
- Nav links on a second line below, left-aligned
- 32px horizontal padding (consistent with rest of page)
- 16px gap between links (reduced from 32px)
- 14px font size for all text
- `flex-wrap` on links as overflow safety net

## Desktop Layout (768px+)
Unchanged — side-by-side, 32px padding, 32px link gap, 16px font.

## Changes

| Element | Current | New |
|---------|---------|-----|
| `<footer>` | `py-10` | `py-8 md:py-10` |
| Container div | `px-8 flex justify-between items-center` | `px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0` |
| Copyright span | `text-base` | `text-sm md:text-base` |
| Nav links div | `flex gap-8` | `flex flex-wrap gap-4 md:gap-8` |
| Each link/button (x4) | `text-base` | `text-sm md:text-base` |

## File
`app/page.tsx` — lines 262-273

## Verification
1. Dev server at mobile width (~375px): footer stacks cleanly, nothing cut off
2. At 320px: `flex-wrap` prevents overflow
3. At desktop (1200px+): no visual change from current
4. "Contact" button fully visible and tappable on mobile
