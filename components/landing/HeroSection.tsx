"use client";
import { ArrowRight, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface HeroProps {
  onOpenDemo: () => void;
}

const workflowSteps = [
  "Client Onboarding",
  "Data Intake",
  "Risk & Procedures",
  "Fieldwork",
  "Conclusions",
  "Opinion",
  "Close",
];

const reasons = [
  { icon: Zap, title: "Speed", text: "Cut weeks of manual work from every engagement." },
  { icon: ShieldCheck, title: "Control", text: "Traceable AI outputs with auditor approval at every step." },
];

const HeroSection = ({ onOpenDemo }: HeroProps) => (
  <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
    <div className="absolute inset-0 gradient-hero" />
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-5">
              Close audit engagements{" "}
              <span className="text-gradient">in days, not weeks.</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.08}>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              The AI-native audit OS for solo, small and mid-sized firms — from onboarding to final opinion, faster.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <Button
                onClick={onOpenDemo}
                size="lg"
                className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-95 hover:shadow-glow text-base px-8 animate-pulse-once"
              >
                Book Demo
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-foreground hover:bg-transparent hover:text-primary font-semibold text-base px-4 group"
                asChild
              >
                <a href="https://app.fi371.com/wizard/index-v2-5.html" target="_blank" rel="noopener noreferrer">
                  Preview a Scenario
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-10">
              30-minute demo · See your firm's workflow · No commitment
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.22}>
            <ul className="grid sm:grid-cols-2 gap-4">
              {reasons.map((r) => (
                <li key={r.title} className="rounded-lg border border-border bg-card/50 p-4">
                  <r.icon className="h-4 w-4 text-primary mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">{r.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{r.text}</div>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.25}>
          <div className="relative bg-card rounded-2xl border border-border p-6 md:p-8 shadow-elevated">
            <div className="text-xs font-mono text-muted-foreground mb-6 uppercase tracking-widest">
              Audit Workflow
            </div>
            <div className="space-y-3">
              {workflowSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      i <= 3
                        ? "gradient-cta text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-secondary/60 rounded-lg px-4 py-3 text-sm font-medium text-foreground">
                    {step}
                  </div>
                  {i <= 3 && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Engagement status</span>
              <span className="text-xs font-mono text-primary">In progress</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default HeroSection;
