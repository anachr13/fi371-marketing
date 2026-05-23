// Article: "A Practical Guide to Crypto & Digital-Asset Audits".
// Server component — owns metadata, canonical, and BlogPosting + FAQPage JSON-LD.
// Body uses shared prose styles + ArticleShell chrome. Pre-launch framing:
// Fi371 capabilities are described as design intent, not measured results.
// Created 2026-05-23.

import type { Metadata } from "next";
import ArticleShell from "@/components/blog/ArticleShell";
import JsonLd from "@/components/seo/JsonLd";
import { getBlogPost } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import * as prose from "@/components/blog/prose";

const post = getBlogPost("crypto-audit-guide")!;
const url = `${SITE_URL}/blog/${post.slug}`;

export const metadata: Metadata = {
  title: `${post.title} — Fi371`,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: {
    type: "article",
    url: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    publishedTime: post.date,
  },
};

const faqs = [
  {
    q: "How is a crypto audit different from a normal financial audit?",
    a: "The standards are the same, but the evidence is not. Existence and ownership are proven cryptographically (control of private keys) rather than by a bank confirmation; balances are read from a public blockchain at a specific block height; and valuation depends on volatile, fragmented markets. The auditor's judgment still governs the conclusion.",
  },
  {
    q: "How do auditors prove a client actually controls its crypto?",
    a: "By requiring cryptographic proof of control — typically a message signed with the wallet's private key, or a small test transaction from the address — rather than relying on a screenshot of a balance. This evidences both existence and the entity's rights to the asset at the reporting date.",
  },
  {
    q: "How are digital assets valued in an audit?",
    a: "Under IFRS, holdings are generally treated as intangible assets (IAS 38) or, in some cases, inventory, following the IFRS Interpretations Committee's agenda decision. Valuation requires a consistent, independent price source and a documented accounting policy, since prices can differ across venues and move sharply intraday.",
  },
  {
    q: "Does AI replace the auditor in a crypto audit?",
    a: "No. AI-native tooling is designed to automate the repetitive, structured work — assembling the wallet population, gathering on-chain confirmations, linking evidence, and drafting procedures — while every output remains traceable and is reviewed and approved by a qualified auditor.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      about: ["Crypto audit", "Digital-asset audit", "Audit evidence"],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function CryptoAuditGuidePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleShell
        category={post.category}
        title={post.title}
        date={post.date}
        readingMinutes={post.readingMinutes}
      >
        <p className={prose.defBlock}>
          A crypto (or digital-asset) audit is an assurance engagement over an
          entity&apos;s holdings, transactions, and controls involving
          cryptocurrencies and other blockchain-based assets. It applies the
          same auditing standards as any financial audit &mdash; but the
          evidence, valuation, and control environment work very differently
          from traditional assets.
        </p>

        <p className={prose.p}>
          Demand for assurance over digital assets is rising as more firms hold,
          accept, or manage crypto &mdash; and as regulators formalise the
          space. For most audit teams, the challenge isn&apos;t the accounting
          theory; it&apos;s building a <strong className="text-foreground">repeatable, evidence-backed
          workflow</strong> for an asset class that behaves unlike anything else
          on the balance sheet. This guide walks through what changes, the risks
          to plan for, the evidence you need, and a step-by-step process from
          onboarding to opinion.
        </p>

        <h2 className={prose.h2}>Why digital-asset audits are different</h2>
        <p className={prose.p}>
          Traditional audit evidence leans on third parties: banks confirm cash,
          registrars confirm shares. Crypto removes many of those
          intermediaries, which shifts where assurance comes from.
        </p>
        <ul className={prose.ul}>
          <li>
            <strong className="text-foreground">Self-custody.</strong> When an
            entity holds its own keys, there is no third party to confirm the
            balance &mdash; existence and rights must be proven cryptographically.
          </li>
          <li>
            <strong className="text-foreground">Public but pseudonymous data.</strong>{" "}
            On-chain balances are verifiable by anyone, yet addresses aren&apos;t
            self-identifying &mdash; completeness depends on identifying every
            wallet the entity controls.
          </li>
          <li>
            <strong className="text-foreground">Volatile, fragmented valuation.</strong>{" "}
            Prices move sharply and differ across venues, making the choice of
            price source and timing a real judgment.
          </li>
          <li>
            <strong className="text-foreground">Third-party platforms.</strong>{" "}
            Assets on exchanges or with custodians reintroduce reliance on
            controls you don&apos;t operate &mdash; SOC reports and confirmations
            matter again.
          </li>
          <li>
            <strong className="text-foreground">Smart contracts and DeFi.</strong>{" "}
            Staking, lending, and wrapped assets introduce automated, code-driven
            risks with no traditional analogue.
          </li>
        </ul>

        <h2 className={prose.h2}>The new risks to plan for</h2>
        <p className={prose.p}>
          Map each risk to the assertion it threatens, so your procedures are
          targeted rather than generic:
        </p>
        <ul className={prose.ul}>
          <li>
            <strong className="text-foreground">Existence &amp; ownership</strong>{" "}
            &mdash; does the entity genuinely control the keys at the reporting
            date?
          </li>
          <li>
            <strong className="text-foreground">Completeness</strong> &mdash; have
            all wallets, addresses, and custodial accounts been identified?
          </li>
          <li>
            <strong className="text-foreground">Valuation</strong> &mdash; which
            market and price source, captured at what moment?
          </li>
          <li>
            <strong className="text-foreground">Rights &amp; obligations</strong>{" "}
            &mdash; staked, lent, or wrapped positions can obscure who holds the
            economic interest.
          </li>
          <li>
            <strong className="text-foreground">Fraud &amp; misappropriation</strong>{" "}
            &mdash; transactions are irreversible and key compromise is
            catastrophic, raising the stakes on controls.
          </li>
        </ul>

        <h2 className={prose.h2}>The evidence you actually need</h2>
        <p className={prose.p}>
          A defensible crypto audit file generally includes:
        </p>
        <ul className={prose.ul}>
          <li>A complete, management-asserted list of wallet addresses and custodians.</li>
          <li>
            Cryptographic proof of control for each self-custodied address &mdash;
            a signed message or a small test transaction.
          </li>
          <li>On-chain confirmation of balances at the reporting date&apos;s block height.</li>
          <li>Independent price data from a reputable, consistently applied source.</li>
          <li>Custodian confirmations plus SOC 1 / SOC 2 reports for assets held by third parties.</li>
          <li>A reconciliation of on-chain activity to the accounting records.</li>
        </ul>

        <h2 className={prose.h2}>A repeatable workflow: onboarding to opinion</h2>
        <ol className={prose.ol}>
          <li>
            <strong className="text-foreground">Onboard &amp; scope.</strong>{" "}
            Understand the asset types, custody model, and platforms in use before
            requesting anything.
          </li>
          <li>
            <strong className="text-foreground">Identify the population.</strong>{" "}
            Pin down every address, wallet, and custodial account &mdash; the
            foundation of completeness.
          </li>
          <li>
            <strong className="text-foreground">Confirm control &amp; existence.</strong>{" "}
            Obtain cryptographic proof and block-height balances.
          </li>
          <li>
            <strong className="text-foreground">Value the holdings.</strong>{" "}
            Apply a consistent price source and a documented accounting policy.
          </li>
          <li>
            <strong className="text-foreground">Test transactions &amp; controls.</strong>{" "}
            Examine key management, segregation of duties, and smart-contract exposure.
          </li>
          <li>
            <strong className="text-foreground">Conclude &amp; report.</strong>{" "}
            Document evidence, resolve exceptions, and form the opinion.
          </li>
        </ol>

        <h2 className={prose.h2}>Where standards and regulation sit &mdash; especially in the EU</h2>
        <p className={prose.p}>
          Crypto audits aren&apos;t a separate rulebook; they apply existing
          standards to a new asset class:
        </p>
        <ul className={prose.ul}>
          <li>
            <strong className="text-foreground">Auditing:</strong> the same
            International Standards on Auditing apply &mdash; for example, ISA 500,
            <em> Audit Evidence</em> &mdash; with procedures tailored to on-chain realities.
          </li>
          <li>
            <strong className="text-foreground">Accounting:</strong> under IFRS,
            holdings are typically intangible assets (IAS 38) or, in limited cases,
            inventory, per the IFRS Interpretations Committee&apos;s agenda decision
            on holdings of cryptocurrencies. The AICPA &amp; CIMA digital-assets
            practice aid is the common reference in US practice.
          </li>
          <li>
            <strong className="text-foreground">EU regulation:</strong> the Markets
            in Crypto-Assets Regulation (MiCA, Regulation (EU) 2023/1114) is
            formalising oversight of crypto-asset service providers across the EU,
            raising the bar for the controls and assurance their auditors will expect.
          </li>
        </ul>

        <h2 className={prose.h2}>Where an AI-native workflow helps</h2>
        <p className={prose.p}>
          Most of the effort above is structured and repetitive: assembling the
          wallet population, gathering on-chain confirmations, mapping evidence to
          assertions, and drafting procedures. This is exactly the kind of work an
          AI-native audit platform is built to accelerate &mdash; Fi371 is designed
          to structure digital-asset evidence, link confirmations to workpapers, and
          draft procedures, while keeping every output traceable and subject to
          auditor review and approval. The goal is to free experienced auditors to
          spend their time on judgment and exceptions, not formatting.
        </p>

        <h2 className={prose.h2}>Frequently asked questions</h2>
        <div className="flex flex-col gap-3 mb-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="border border-border rounded-lg px-6 py-1 bg-card/50 open:border-primary/30"
            >
              <summary className="cursor-pointer list-none py-4 text-[19px] font-semibold text-foreground marker:hidden">
                {f.q}
              </summary>
              <p className="text-[17px] text-muted-foreground leading-relaxed pb-4">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <h2 className={prose.h2}>Standards &amp; further reading</h2>
        <ul className={prose.ul}>
          <li>ISA 500, <em>Audit Evidence</em> &mdash; IAASB</li>
          <li>Accounting for and Auditing of Digital Assets &mdash; AICPA &amp; CIMA practice aid</li>
          <li>Holdings of Cryptocurrencies &mdash; IFRS Interpretations Committee agenda decision (IAS 38)</li>
          <li>Markets in Crypto-Assets Regulation (MiCA) &mdash; Regulation (EU) 2023/1114</li>
        </ul>
      </ArticleShell>
    </>
  );
}
