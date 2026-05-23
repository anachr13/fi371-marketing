// FAQ content for the Fi371-vs-Caseware comparison page.
// Shared by the visible accordion (CasewareContent) and the FAQPage JSON-LD
// (page.tsx) so the structured data always matches on-page text — required by
// Google for FAQ rich results and trusted by AI engines. Created 2026-05-23.

export type Faq = { q: string; a: string };

export const casewareFaqs: Faq[] = [
  {
    q: "Is this a replacement for Caseware?",
    a: "We position our platform as a more modern, AI-native operating model for audit firms. It's designed for teams that want more automation, faster engagement velocity, and built-in support for emerging audit requirements like crypto. Many firms may use it alongside or instead of legacy tools depending on their workflow.",
  },
  {
    q: "What makes this different from legacy audit tools?",
    a: "Legacy tools primarily help organize audit work. Our platform actively accelerates it — with AI-assisted drafting, adaptive intake, exception-based review, and traceable AI outputs built in from the ground up.",
  },
  {
    q: "Does it support crypto audits?",
    a: "Yes. The platform includes purpose-built workflows for digital asset and crypto audit engagements, including evidence collection, procedure structuring, and reporting tailored to emerging requirements.",
  },
  {
    q: "Does AI replace auditor judgment?",
    a: "No. The platform automates repetitive, structured work. Every AI output is designed to be reviewed and approved by a qualified auditor. Expert judgment stays where it matters.",
  },
  {
    q: "Can solo auditors and small firms use it?",
    a: "Absolutely. The platform scales from solo practitioners to larger firms. It's designed to give smaller teams the leverage and speed of much larger operations.",
  },
  {
    q: "Is AI output traceable and reviewable?",
    a: "Yes. Every AI-generated output includes full trace logging and observability. You can see exactly what the AI produced, what inputs it used, and maintain a complete audit trail.",
  },
];
