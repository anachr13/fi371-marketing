"use client";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AnimatedSection from "@/components/landing/AnimatedSection";

const rows = [
  {
    feature: "Client onboarding",
    legacy: "Structured but largely manual client coordination",
    modern: "Adaptive onboarding that asks for more only when needed",
    badge: "Adaptive",
  },
  {
    feature: "Document requests",
    legacy: "Request lists and follow-up coordination",
    modern: "Dynamic document requests triggered by answers, data, and workflow state",
    badge: "AI-native",
  },
  {
    feature: "Data ingestion",
    legacy: "Data import and organization",
    modern: "Faster ingestion plus validation, mapping, and workflow activation",
    badge: "Faster",
  },
  {
    feature: "Risk assessment",
    legacy: "Auditor-led assessment supported by templates",
    modern: "AI-assisted risk suggestions with traceable rationale and human approval controls",
    badge: "Traceable",
  },
  {
    feature: "Procedure drafting",
    legacy: "Template-based preparation",
    modern: "AI-generated and tailored procedures based on risk, account, and engagement context",
    badge: "AI-native",
  },
  {
    feature: "Evidence linking",
    legacy: "Document collection and manual linkage",
    modern: "Structured evidence linking, summarization, and workflow-aware traceability",
    badge: "Traceable",
  },
  {
    feature: "Conclusion drafting",
    legacy: "Auditor-prepared documentation",
    modern: "AI-assisted conclusion drafts with explainability and review controls",
    badge: "Faster",
  },
  {
    feature: "Opinion drafting",
    legacy: "Final drafting handled manually or through standard templates",
    modern: "AI-generated draft opinions with approval, regeneration, and manual override options",
    badge: "AI-native",
  },
  {
    feature: "Review model",
    legacy: "Broader manual review burden",
    modern: "Exception-based expert review focused on judgment and approvals",
    badge: "Adaptive",
  },
  {
    feature: "Workflow flexibility",
    legacy: "Methodology-driven workflow support",
    modern: "Adaptive workflow orchestration designed to move the engagement forward faster",
    badge: "Faster",
  },
  {
    feature: "AI observability",
    legacy: "Limited or externalized AI tracing depending on firm stack",
    modern: "Built-in AI traceability, observability, and control patterns",
    badge: "Traceable",
  },
  {
    feature: "Crypto audit readiness",
    legacy: "Firms adapt existing workflows to new digital asset requirements",
    modern: "Explicitly designed to support modern crypto and digital asset audit workflows",
    badge: "Crypto-ready",
  },
];

const badgeColor: Record<string, string> = {
  "AI-native": "bg-primary/15 text-primary border-primary/20",
  "Adaptive": "bg-accent/15 text-accent border-accent/20",
  "Faster": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Traceable": "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Crypto-ready": "bg-accent/15 text-accent border-accent/20",
};

const CompareTable = () => (
  <section id="compare" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
          Legacy audit tools vs{" "}
          <span className="text-gradient">our AI-native platform</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-14">
          A detailed comparison of how each approach handles key audit workflow areas.
        </p>
      </AnimatedSection>

      {/* Desktop table */}
      <AnimatedSection delay={0.1}>
        <div className="hidden lg:block rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1.2fr_1.2fr] bg-secondary/50">
            <div className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border">
              Capability
            </div>
            <div className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border">
              <span className="flex items-center gap-2">
                <Minus className="h-3.5 w-3.5" />
                Legacy audit platform
              </span>
            </div>
            <div className="px-6 py-4 text-xs font-semibold text-primary uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                Our AI-native platform
              </span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_1.2fr_1.2fr] ${
                i % 2 === 0 ? "bg-card/30" : "bg-card/60"
              } border-t border-border`}
            >
              <div className="px-6 py-5 text-sm font-semibold text-foreground border-r border-border">
                {row.feature}
              </div>
              <div className="px-6 py-5 text-sm text-muted-foreground border-r border-border">
                {row.legacy}
              </div>
              <div className="px-6 py-5 text-sm text-foreground bg-primary/[0.03]">
                <div className="flex items-start gap-3">
                  <div className="flex-1">{row.modern}</div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColor[row.badge] || ""}`}>
                    {row.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-4">
        {rows.map((row, i) => (
          <AnimatedSection key={row.feature} delay={i * 0.04}>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">{row.feature}</h3>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColor[row.badge] || ""}`}>
                  {row.badge}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Legacy approach</span>
                  <p className="text-xs text-muted-foreground mt-1">{row.legacy}</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">AI-native platform</span>
                  <p className="text-xs text-foreground mt-1">{row.modern}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default CompareTable;
