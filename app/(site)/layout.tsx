// Sub-layout for the (site) route group. Renders the shared SiteFooter after
// every marketing page's children so /, /about, /blog, /news, /privacy, /terms,
// and any future page added under (site) get the footer with zero per-page
// wiring. Created 2026-05-31.

import SiteFooter from "@/components/site/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
