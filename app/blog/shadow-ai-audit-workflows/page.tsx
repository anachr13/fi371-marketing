// Server entry for /blog/shadow-ai-audit-workflows (article B001). Owns the
// article's SEO/canonical metadata and the BlogPosting + FAQPage structured
// data; the editorial layout comes from ArticleShell and prose styles. The
// article body is hand-built static JSX (no client state) so it server-renders
// fully — best for SEO and AI citation (GEO). Created 2026-05-25.

import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/blog/ArticleShell";
import * as prose from "@/components/blog/prose";
import JsonLd from "@/components/seo/JsonLd";
import { getBlogPost } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { shadowAiFaqs } from "./faqs";

const SLUG = "shadow-ai-audit-workflows";

// Pull title/description/category/date/reading time from the registry so the
// index card, sitemap, and this page never drift (single source of truth). The
// throw guards the coupling: if the entry is ever removed, the build fails loud
// instead of rendering a broken page.
const post = getBlogPost(SLUG);
if (!post) {
  throw new Error(`Blog post "${SLUG}" is missing from lib/blog.ts`);
}
// Destructure after the guard so these read as plain string/number — TypeScript
// otherwise re-widens `post` back to `| undefined` inside the component closure.
const { title, description, category, date, readingMinutes } = post;

// SEO <title> differs from the editorial H1 (shorter, keyword-led); brand suffix
// matches the rest of the site ("About — Fi371", "Blog — Fi371").
const SEO_TITLE = "Understanding Shadow AI in Audit Workflows — Fi371";

const TAGS = [
  "Shadow AI",
  "Auditing",
  "AI Integration",
  "Data Security",
  "Audit Compliance",
  "Audit Automation",
  "AI in Accounting",
  "Audit Technology",
];

const CANONICAL_PATH = `/blog/${SLUG}`;
const ABSOLUTE_URL = `${SITE_URL}${CANONICAL_PATH}`;
// Site OG image (dynamic route at app/opengraph-image.tsx). Setting a custom
// `openGraph` on this route suppresses the inherited file-based image, so we
// reference it explicitly for both social cards and BlogPosting.image.
const OG_IMAGE = "/opengraph-image";

export const metadata: Metadata = {
  title: SEO_TITLE,
  description,
  keywords: TAGS,
  alternates: { canonical: CANONICAL_PATH },
  openGraph: {
    type: "article",
    title: SEO_TITLE,
    description,
    url: CANONICAL_PATH,
    publishedTime: date,
    authors: [SITE_NAME],
    tags: TAGS,
    images: [OG_IMAGE],
  },
  twitter: {
    images: [OG_IMAGE],
  },
};

// Structured data: BlogPosting gives Google + AI engines a clean article entity
// (authored/published by the Fi371 Organization defined in the root layout);
// FAQPage mirrors the visible FAQ accordion at the foot of the page (both built
// from faqs.ts, so schema always matches on-page text — Google requires this).
// @graph lets the two entities coexist.
const orgId = `${SITE_URL}/#organization`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${ABSOLUTE_URL}#article`,
      headline: title,
      description,
      image: `${SITE_URL}${OG_IMAGE}`,
      datePublished: date,
      dateModified: date,
      inLanguage: "en",
      url: ABSOLUTE_URL,
      mainEntityOfPage: ABSOLUTE_URL,
      articleSection: category,
      keywords: TAGS.join(", "),
      author: { "@type": "Organization", name: SITE_NAME, "@id": orgId },
      publisher: { "@id": orgId },
    },
    {
      "@type": "FAQPage",
      "@id": `${ABSOLUTE_URL}#faq`,
      mainEntity: shadowAiFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ],
};

// Shared props for external reference links (new tab, no referrer leakage).
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function ShadowAiArticlePage() {
  // Visible FAQ as a native <details> accordion (no client JS) so the answers
  // are in the server-rendered HTML — best for crawlers and answer engines —
  // while staying collapsed and tidy. Matches the FAQPage JSON-LD above.
  const faqSection = (
    <section className="mt-16 pt-10 border-t border-border">
      <h2 className={prose.h2}>Frequently asked questions</h2>
      <div className="flex flex-col gap-3">
        {shadowAiFaqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-lg border border-border overflow-hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-[19px] font-semibold hover:bg-card transition-colors [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="ml-5 text-[22px] text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-6 pb-5 text-[17px] leading-relaxed text-muted-foreground">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleShell
        category={category}
        title={title}
        date={date}
        readingMinutes={readingMinutes}
        belowCta={faqSection}
      >
        <p className={prose.lead}>
          Auditors are already starting to explore artificial intelligence in
          their day-to-day work. In many firms, this is happening quietly and
          informally, often before official AI policies or approved tools are
          fully in place.
        </p>

        {/* 40–60 word direct answer up top — optimized for AI snippet extraction. */}
        <p className={prose.defBlock}>
          Shadow AI is the informal use of AI tools &mdash; like ChatGPT, Claude,
          Copilot, or Gemini &mdash; without formal approval from the firm. In
          audit, it usually means using these tools to draft, summarise, review
          text, or explore data before official policies or approved,
          audit-specific tools are in place.
        </p>

        <p className={prose.p}>
          This is sometimes called Shadow AI. While the term can sound negative,
          the behaviour behind it is very understandable: audit teams are looking
          for practical ways to save time, reduce repetitive work, and focus more
          on judgement-heavy areas of the audit.
        </p>

        <h2 className={prose.h2}>What is Shadow AI in auditing?</h2>
        <p className={prose.p}>
          Shadow AI refers to the informal use of AI tools without formal approval
          from the firm. In audit, this may include experimenting with tools such
          as ChatGPT, Claude, Copilot, or Gemini to support tasks like drafting,
          summarising, reviewing text, or exploring data.
        </p>
        <p className={prose.p}>
          For many auditors, this is not about replacing professional judgement.
          It is about finding faster ways to handle work that is repetitive,
          administrative, or time-consuming. The opportunity is real &mdash; but
          so is the need for the right controls around accuracy, confidentiality,
          and compliance.
        </p>

        {/* Survey CTA — AI-in-Audit research survey on-site at /survey/240526. */}
        <div className="my-12 rounded-2xl border border-primary/20 bg-card p-8">
          <h2 className="font-display text-[28px] leading-tight mb-3">
            Take the survey and join the AI auditors community
          </h2>
          <p className="text-[17px] text-muted-foreground mb-6">
            Auditors are already experimenting with AI. Add your perspective to
            our AI-in-Audit research &mdash; it takes just a few minutes, and
            we&rsquo;ll send you the results when the study closes.
          </p>
          <Link
            href="/survey/240526"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Take the survey
          </Link>
        </div>

        <h2 className={prose.h2}>How are auditors using AI unofficially?</h2>
        <p className={prose.p}>
          Many auditors are using AI to help with the kind of work that takes time
          but does not always require deep professional judgement from the first
          minute. This can include summarising client information, improving
          wording in documentation, preparing first drafts, or getting support
          with initial analysis.
        </p>
        <p className={prose.p}>
          Large Language Models can be helpful in these areas because they are
          good at processing text, identifying patterns, and producing structured
          summaries. The{" "}
          <a
            className={prose.a}
            href="https://www.ifac.org/knowledge-gateway/artificial-intelligence-technology"
            {...ext}
          >
            IFAC has also highlighted the growing role of AI
          </a>{" "}
          in handling large data sets and supporting the profession as it evolves.
        </p>
        <p className={prose.p}>
          This informal experimentation shows something important: auditors are
          not resisting innovation. Many are already trying to understand where AI
          can genuinely help.
        </p>

        <h2 className={prose.h2}>Benefits and risks of Shadow AI</h2>
        <p className={prose.p}>
          The main benefit is clear: AI can help reduce turnaround time and free
          auditors from some of the repetitive work that slows down engagements.
        </p>
        <p className={prose.p}>
          But when AI is used informally, firms may not always have full
          visibility over what data is being used, how outputs are reviewed, or
          whether the tool is suitable for audit work. This can create questions
          around accuracy, bias, audit quality, and compliance.
        </p>
        <p className={prose.p}>
          The issue is not that auditors are using AI. The issue is that many
          audit teams may be using general-purpose tools outside a controlled
          audit workflow. Guidance from{" "}
          <a
            className={prose.a}
            href="https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-rise-of-shadow-ai-auditing-unauthorized-ai-tools-in-the-enterprise"
            {...ext}
          >
            ISACA points to the importance of governance
          </a>
          , oversight, and responsible use.
        </p>

        <h2 className={prose.h2}>Why security and confidentiality matter</h2>
        <p className={prose.p}>
          Audit work involves sensitive client information. This may include
          financial records, payroll data, bank details, supplier information,
          management explanations, or commercially sensitive transactions.
        </p>
        <p className={prose.p}>
          That is why confidentiality matters. If auditors use AI tools that have
          not been approved or reviewed by the firm, it may be unclear how client
          data is stored, processed, or protected.
        </p>
        <p className={prose.p}>
          For audit firms, the goal should not be to discourage useful AI
          experimentation. The goal should be to make sure AI is used in a secure,
          GDPR-aware, and professionally responsible way. This protects the
          client, the audit firm, and the auditor using the tool.
        </p>

        <h2 className={prose.h2}>How to integrate AI safely and effectively</h2>
        <p className={prose.p}>
          A practical next step is for firms to move from informal AI use toward
          approved and controlled AI workflows.
        </p>
        <p className={prose.p}>
          This does not need to start with a large transformation project. Firms
          can begin by understanding how AI is already being used, what tasks
          auditors find most useful, and where the main risks sit.
        </p>
        <p className={prose.p}>
          From there, audit firms can create simple guidance around what is
          allowed, what is not allowed, what data should never be entered into
          public tools, and how AI-generated work should be reviewed. Training is
          also important, not only on what AI can do, but also on its limits.
        </p>
        <p className={prose.p}>
          Reports such as the{" "}
          <a
            className={prose.a}
            href="https://www.cpa.com/sites/cpa/files/2025-06/2025_AI_in_Accounting_Report.pdf"
            {...ext}
          >
            CPA AI in Accounting Report
          </a>{" "}
          can help firms think about governance, responsible adoption, and the
          practical steps needed to use AI with confidence.
        </p>

        <h2 className={prose.h2}>Conclusion: preparing for an AI-integrated future</h2>
        <p className={prose.p}>
          AI is already entering audit work. In many cases, it is starting with
          small experiments by auditors who are simply trying to work more
          efficiently.
        </p>
        <p className={prose.p}>
          That is not something to ignore. It is something to understand and
          guide.
        </p>
        <p className={prose.p}>
          The future of AI in audit should not be uncontrolled copy-paste into
          general tools. It should be secure, reviewable, audit-specific workflows
          where client data is protected, outputs are traceable, and auditors
          remain in control of the final judgement.
        </p>
        <p className={prose.p}>
          The question for audit firms is not only whether AI will be used. It is
          how it can be used safely, responsibly, and in a way that genuinely
          improves audit work.
        </p>

        <h2 className={prose.h2}>Sources</h2>
        <ul className={prose.ul}>
          <li>
            <a
              className={prose.a}
              href="https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-rise-of-shadow-ai-auditing-unauthorized-ai-tools-in-the-enterprise"
              {...ext}
            >
              ISACA &mdash; The Rise of Shadow AI
            </a>
          </li>
          <li>
            <a
              className={prose.a}
              href="https://www.cpa.com/sites/cpa/files/2025-06/2025_AI_in_Accounting_Report.pdf"
              {...ext}
            >
              CPA &mdash; AI in Accounting Report
            </a>
          </li>
          <li>
            <a
              className={prose.a}
              href="https://www.ifac.org/knowledge-gateway/artificial-intelligence-technology"
              {...ext}
            >
              IFAC &mdash; Artificial Intelligence and Technology
            </a>
          </li>
        </ul>
      </ArticleShell>
    </>
  );
}
