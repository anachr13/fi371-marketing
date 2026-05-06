"use client";
import { ArrowRight, Play, CheckCircle2, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/landing/AnimatedSection";

interface CompareHeroProps {
  onOpenDemo: () => void;
}

const bullets = [
  "Adaptive client onboarding and document requests",
  "Faster TB / GL ingestion, risk assessment, and procedure drafting",
  "AI-generated conclusions and opinion drafts with approval controls",
  "Designed for modern audits, including crypto audit workflows",
];

const legacySteps = [
  "Manual setup",
  "Template work",
  "Document chasing",
  "Manual drafting",
  "Review bottlenecks",
  "Delayed close",
];

const modernSteps = [
  "Client Onboarding",
  "Data Intake",
  "Risk & Procedures",
  "Fieldwork",
  "Conclusions",
  "Opinion",
  "Close",
];

const CompareHero = ({ onOpenDemo }: CompareHeroProps) => (
  <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
    <div className="absolute inset-0 gradient-hero" />
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider border border-primary/20">
              <Zap className="h-3.5 w-3.5" />
              vs Legacy Audit Tools
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.05}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6">
              Beyond legacy audit tools.{" "}
              <span className="text-gradient">Close engagements at the speed of light.</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Our AI-native audit platform helps firms reduce audit time, remove manual donkey work,
              and move from onboarding to final opinion dramatically faster — including support for
              new crypto audit requirements.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="flex flex-wrap gap-3 mb-10">
              <Button
                onClick={onOpenDemo}
                size="lg"
                className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-90 transition-opacity text-base px-8 animate-pulse-glow"
              >
                Book Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-secondary font-semibold text-base px-8"
                asChild
              >
                <a href="#workflow">
                  <Play className="mr-2 h-4 w-4" />
                  See the Workflow
                </a>
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <ul className="space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>

        {/* Hero visual: side-by-side comparison */}
        <AnimatedSection delay={0.25} className="hidden lg:block">
          <div className="space-y-4">
            {/* Legacy side */}
            <div className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Legacy Approach</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {legacySteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="px-3 py-2 rounded-lg bg-secondary/60 text-xs text-muted-foreground border border-border">
                      {step}
                    </div>
                    {i < legacySteps.length - 1 && (
                      <span className="text-muted-foreground/40 text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modern side */}
            <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-glow">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest">AI-Native Platform</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {modernSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                      i <= 4
                        ? "gradient-cta text-primary-foreground border-transparent"
                        : "bg-secondary/60 text-secondary-foreground border-border"
                    }`}>
                      {step}
                    </div>
                    {i < modernSteps.length - 1 && (
                      <span className="text-primary/40 text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Engagement progress</span>
                <span className="text-xs font-mono text-primary">71% complete</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                <div className="gradient-cta h-1.5 rounded-full" style={{ width: "71%" }} />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default CompareHero;
