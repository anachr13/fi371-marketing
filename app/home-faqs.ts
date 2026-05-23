// Homepage FAQ content. Shared by the visible accordion (HomeContent) and the
// FAQPage JSON-LD (page.tsx) so structured data matches on-page text — required
// for Google FAQ rich results and trusted by AI engines. Created 2026-05-23.

export type Faq = { q: string; a: string };

export const homeFaqs: Faq[] = [
  {
    q: "Is this built for solo auditors or only large firms?",
    a: "Both. The platform scales from solo practitioners who need to move faster, to small offices looking for leverage, to larger firms that want to standardize and accelerate their audit workflows.",
  },
  {
    q: "Does this replace auditor judgment?",
    a: "No. The platform automates repetitive, structured work like data ingestion, procedure drafting, and evidence linking. Every AI output is reviewed and approved by a qualified auditor. Expert judgment stays where it matters.",
  },
  {
    q: "Can it help reduce audit turnaround time?",
    a: "Absolutely. By automating the manual steps that consume most of an engagement's time, firms can close engagements significantly faster.",
  },
  {
    q: "Is AI output traceable?",
    a: "Yes. Every AI-generated output includes full trace logging and observability. You can see exactly what the AI produced, what inputs it used, and maintain a complete audit trail for governance and quality control.",
  },
];
