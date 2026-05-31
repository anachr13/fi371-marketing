// Curated trusted-source library for /news/sources. Client-safe (no Supabase, no Node
// APIs) so it can be imported from both the server route and the client shell. The list
// is hand-maintained — seeded from the n8n source-library.yaml (sibling branch) and
// dedup'd to publisher homepages. Competitors are intentionally excluded.

export type TrustedSource = {
  name: string;
  homepage: string;
  domain: string; // stable favicon key — kept separate from homepage so a deep-link homepage still produces the right favicon URL
};

export type SourceGroup = {
  slug: string;
  label: string;
  sources: TrustedSource[];
};

// Order here is the order groups render on the page. Sources within a group render
// in the order listed (rough A–Z, with related entries clustered).
export const SOURCE_GROUPS: SourceGroup[] = [
  {
    slug: "standards-regulators",
    label: "Standards bodies & regulators",
    sources: [
      { name: "IAASB", homepage: "https://www.iaasb.org/", domain: "iaasb.org" },
      { name: "IFAC", homepage: "https://www.ifac.org/", domain: "ifac.org" },
      { name: "AICPA & CIMA", homepage: "https://www.aicpa-cima.com/", domain: "aicpa-cima.com" },
      { name: "Center for Audit Quality", homepage: "https://www.thecaq.org/", domain: "thecaq.org" },
      { name: "Accountancy Europe", homepage: "https://accountancyeurope.eu/", domain: "accountancyeurope.eu" },
      { name: "ICAEW", homepage: "https://www.icaew.com/", domain: "icaew.com" },
      { name: "The IIA", homepage: "https://www.theiia.org/", domain: "theiia.org" },
      { name: "FRC UK", homepage: "https://www.frc.org.uk/", domain: "frc.org.uk" },
      { name: "PCAOB", homepage: "https://pcaobus.org/", domain: "pcaobus.org" },
    ],
  },
  {
    slug: "sustainability",
    label: "Sustainability reporting & assurance",
    sources: [
      { name: "IFRS Foundation", homepage: "https://www.ifrs.org/", domain: "ifrs.org" },
      { name: "ISSB", homepage: "https://www.ifrs.org/groups/international-sustainability-standards-board/", domain: "ifrs.org" },
      { name: "EFRAG", homepage: "https://www.efrag.org/", domain: "efrag.org" },
      { name: "GRI", homepage: "https://www.globalreporting.org/", domain: "globalreporting.org" },
    ],
  },
  {
    slug: "security-governance-ai",
    label: "Security, governance & AI risk",
    sources: [
      { name: "ISACA", homepage: "https://www.isaca.org/", domain: "isaca.org" },
      { name: "NIST AI Risk Management Framework", homepage: "https://www.nist.gov/itl/ai-risk-management-framework", domain: "nist.gov" },
      { name: "ISO/IEC 42001", homepage: "https://www.iso.org/standard/81230.html", domain: "iso.org" },
      { name: "ENISA", homepage: "https://www.enisa.europa.eu/", domain: "enisa.europa.eu" },
      { name: "European Commission AI Act", homepage: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai", domain: "digital-strategy.ec.europa.eu" },
      { name: "CNIL", homepage: "https://www.cnil.fr/en/artificial-intelligence-ai", domain: "cnil.fr" },
    ],
  },
  {
    slug: "advisory-research",
    label: "Big 4 & advisory research",
    sources: [
      { name: "Deloitte Insights", homepage: "https://www.deloitte.com/global/en/insights.html", domain: "deloitte.com" },
      { name: "PwC Insights", homepage: "https://www.pwc.com/gx/en/issues.html", domain: "pwc.com" },
      { name: "EY Insights", homepage: "https://www.ey.com/en_gl/insights", domain: "ey.com" },
      { name: "KPMG Insights", homepage: "https://kpmg.com/xx/en/insights.html", domain: "kpmg.com" },
      { name: "BDO Insights", homepage: "https://www.bdo.global/en-gb/insights", domain: "bdo.global" },
    ],
  },
  {
    slug: "news-media",
    label: "Finance & accounting news",
    sources: [
      { name: "Financial Times", homepage: "https://www.ft.com/", domain: "ft.com" },
      { name: "Bloomberg", homepage: "https://www.bloomberg.com/", domain: "bloomberg.com" },
      { name: "Reuters", homepage: "https://www.reuters.com/business/", domain: "reuters.com" },
      { name: "WSJ CFO Journal", homepage: "https://www.wsj.com/news/cfo-journal", domain: "wsj.com" },
      { name: "Accounting Today", homepage: "https://www.accountingtoday.com/", domain: "accountingtoday.com" },
      { name: "Accountancy Age", homepage: "https://www.accountancyage.com/", domain: "accountancyage.com" },
      { name: "CFO Dive", homepage: "https://www.cfodive.com/", domain: "cfodive.com" },
      { name: "Thomson Reuters Institute", homepage: "https://www.thomsonreuters.com/en-us/posts/", domain: "thomsonreuters.com" },
    ],
  },
];

// Google's free favicon service. Returns a PNG at the requested size (32 → crisp on
// retina at 24px display). If a domain has no favicon, Google returns a generic globe
// glyph, so there is no broken-image state to handle in the UI.
export function faviconUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

// Total count across all groups — used in the page kicker and ItemList JSON-LD.
export const TOTAL_SOURCE_COUNT: number = SOURCE_GROUPS.reduce(
  (n, g) => n + g.sources.length,
  0
);
