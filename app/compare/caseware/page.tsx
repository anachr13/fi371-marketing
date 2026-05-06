"use client";

import { useState } from "react";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareHero from "@/components/compare/CompareHero";
import CompareTable from "@/components/compare/CompareTable";
import WorkflowComparison from "@/components/compare/WorkflowComparison";
import CompareDemoModal from "@/components/compare/CompareDemoModal";
import AnimatedSection from "@/components/landing/AnimatedSection";
import Footer from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Repeat,
  Zap,
  Eye,
  Shield,
  Rocket,
  TrendingUp,
  Clock,
  Layers,
  FileCheck,
  Users,
} from "lucide-react";

/* ── Intro section ── */
const CompareIntro = () => (
  <section id="why-us" className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
          Not just another audit tool.{" "}
          <span className="text-gradient">A different way to run the engagement.</span>
        </h2>
        <p className="text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
          Traditional audit platforms help teams organize work. Our platform is designed to actively
          move the audit forward. Instead of relying on manual coordination, repetitive drafting, and
          static workflows, it uses AI-native automation, adaptive intake, and exception-based expert
          review to accelerate the full engagement lifecycle.
        </p>
      </AnimatedSection>
    </div>
  </section>
);

/* ── Why We Win ── */
const whyCards = [
  { icon: Repeat, title: "Less donkey work", desc: "Automate repetitive work like follow-ups, drafting, evidence prep, and review packaging." },
  { icon: Rocket, title: "Faster engagement velocity", desc: "Move from onboarding to completion with less friction and fewer manual bottlenecks." },
  { icon: Eye, title: "Better use of expert time", desc: "Keep auditors focused on judgment, exceptions, and approval — not admin." },
  { icon: Shield, title: "AI with control", desc: "Every AI-generated output is structured, traceable, and reviewable." },
  { icon: TrendingUp, title: "Built for what's next", desc: "Support evolving audit requirements, including crypto and digital asset audits." },
];

const WhyWeWin = () => (
  <section className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
          Why modern audit teams need more than{" "}
          <span className="text-gradient-accent">legacy workflow software</span>
        </h2>
      </AnimatedSection>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {whyCards.map((c, i) => (
          <AnimatedSection key={c.title} delay={i * 0.08}>
            <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-glow transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl gradient-cta flex items-center justify-center mb-5">
                <c.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

/* ── Crypto section ── */
const cryptoBullets = [
  { icon: Shield, text: "Supports digital asset / crypto audit workflows" },
  { icon: FileCheck, text: "Helps structure evidence and procedures for new audit areas" },
  { icon: Layers, text: "Better suited to evolving requirements than static manual processes" },
  { icon: Users, text: "Gives firms a stronger GTM story for modern audit services" },
];

const CryptoSection = () => (
  <section id="crypto" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
      <AnimatedSection>
        <div className="rounded-2xl border border-primary/20 bg-card p-8 lg:p-14 shadow-glow">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            Crypto Audit Ready
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 max-w-2xl">
            Ready for the next wave of audit demand —{" "}
            <span className="text-gradient-accent">including crypto audits.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            Digital asset audits are creating new requirements for evidence collection, controls
            understanding, reporting, and review. Our platform is built to support crypto audit
            workflows with a more scalable, AI-native process that reduces manual coordination and
            helps firms respond faster to emerging demand.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {cryptoBullets.map((b) => (
              <div key={b.text} className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
                <b.icon className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-secondary-foreground">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

/* ── Outcomes ── */
const outcomes = [
  { icon: Clock, title: "Reduce audit time", desc: "Automate the repetitive work that consumes most of your team's hours." },
  { icon: Zap, title: "Close engagements faster", desc: "Move from onboarding to opinion with streamlined, AI-assisted workflows." },
  { icon: TrendingUp, title: "Increase margin through automation", desc: "Do more with less manual effort and better team leverage." },
  { icon: Shield, title: "Expand into crypto audit opportunities", desc: "Support digital asset audit requirements with purpose-built workflows." },
];

const OutcomesSection = () => (
  <section className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
          What you gain with our platform
        </h2>
      </AnimatedSection>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {outcomes.map((o, i) => (
          <AnimatedSection key={o.title} delay={i * 0.08}>
            <div className="text-center p-8 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-glow transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center mx-auto mb-5">
                <o.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{o.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

/* ── FAQ ── */
const faqs = [
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

const FAQSection = () => (
  <section id="faq" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
          Frequently asked questions
        </h2>
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border rounded-xl px-6 bg-card/50 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </AnimatedSection>
    </div>
  </section>
);

/* ── Final CTA ── */
interface FinalCTAProps {
  onOpenDemo: () => void;
}

const FinalCTA = ({ onOpenDemo }: FinalCTAProps) => (
  <section className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            See why the next generation of audit teams will{" "}
            <span className="text-gradient">outgrow legacy tools.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Book a demo to see how your firm can reduce audit time, remove donkey work, and close
            engagements faster with an AI-native audit platform built for both standard and crypto audits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={onOpenDemo}
              size="lg"
              className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-90 transition-opacity text-base px-10"
            >
              Book Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary font-semibold text-base px-8" asChild>
              <a href="#workflow">
                <Play className="mr-2 h-4 w-4" />
                See the Workflow
              </a>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

/* ── Page ── */
export default function CompareCasewarePage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompareHeader onOpenDemo={() => setDemoOpen(true)} />
      <CompareHero onOpenDemo={() => setDemoOpen(true)} />
      <CompareIntro />
      <CompareTable />
      <WhyWeWin />
      <WorkflowComparison />
      <CryptoSection />
      <OutcomesSection />
      <FAQSection />
      <FinalCTA onOpenDemo={() => setDemoOpen(true)} />
      <Footer />
      <CompareDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
