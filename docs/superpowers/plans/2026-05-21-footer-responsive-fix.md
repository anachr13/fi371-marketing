# Footer Responsive Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home page footer stack vertically on mobile instead of overflowing in a single row.

**Architecture:** Tailwind class-only changes on 5 existing elements in `app/page.tsx`. Mobile-first stacking with `flex-col`, switching to `flex-row` at the `md` breakpoint. No HTML structure changes.

**Tech Stack:** Tailwind CSS responsive utilities

---

### Task 1: Update footer Tailwind classes for responsive layout

**Files:**
- Modify: `app/page.tsx:263-270`

**Spec reference:** `docs/superpowers/specs/2026-05-21-footer-responsive-fix-design.md`

- [ ] **Step 1: Update the `<footer>` element padding**

In `app/page.tsx` line 263, change:

```tsx
<footer className="border-t border-border py-10">
```

to:

```tsx
<footer className="border-t border-border py-8 md:py-10">
```

This reduces vertical padding from 40px to 32px on mobile. Desktop stays at 40px.

- [ ] **Step 2: Update the container div for vertical stacking on mobile**

In `app/page.tsx` line 264, change:

```tsx
<div className="max-w-[1500px] mx-auto px-8 flex justify-between items-center">
```

to:

```tsx
<div className="max-w-[1500px] mx-auto px-5 md:px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0">
```

This does three things:
- `px-5 md:px-8` — reduces horizontal padding from 32px to 20px on mobile
- `flex flex-col md:flex-row` — stacks vertically on mobile, horizontal on desktop
- `gap-6 md:gap-0` — 24px gap between copyright and nav on mobile; desktop uses `justify-between` instead

- [ ] **Step 3: Update the copyright span font size**

In `app/page.tsx` line 265, change:

```tsx
<span className="text-base text-muted-foreground">
```

to:

```tsx
<span className="text-sm md:text-base text-muted-foreground">
```

- [ ] **Step 4: Update the nav links container**

In `app/page.tsx` line 266, change:

```tsx
<div className="flex gap-8">
```

to:

```tsx
<div className="flex flex-wrap gap-4 md:gap-8">
```

This reduces the gap from 32px to 16px on mobile and adds `flex-wrap` as a safety net for very narrow screens (< 320px).

- [ ] **Step 5: Update each nav link and button font size (4 elements)**

In `app/page.tsx` lines 267-270, change `text-base` to `text-sm md:text-base` on each element:

Line 267 — About link:
```tsx
<Link href="/about" className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">About</Link>
```

Line 268 — Privacy link:
```tsx
<Link href="/privacy" className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
```

Line 269 — Terms link:
```tsx
<Link href="/terms" className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
```

Line 270 — Contact button:
```tsx
<button onClick={() => setDemoOpen(true)} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Contact</button>
```

- [ ] **Step 6: Run the dev server and verify**

```bash
npm run dev
```

Open browser and check:
1. At **375px width**: footer stacks vertically (copyright on top, links below), left-aligned, nothing cut off
2. At **320px width**: `flex-wrap` prevents link overflow
3. At **1200px+ width**: footer looks identical to before (side-by-side layout)
4. "Contact" button is fully visible and tappable on mobile

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "fix: make homepage footer responsive on mobile"
```
