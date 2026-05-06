"use client";
import { ArrowRight, Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import AnimatedSection from "@/components/landing/AnimatedSection";

const legacyFlow = [
  { label: "Client request", icon: Clock },
  { label: "Manual chasing", icon: AlertTriangle },
  { label: "Import setup", icon: Clock },
  { label: "Template workpapers", icon: Clock },
  { label: "Manual summaries", icon: AlertTriangle },
  { label: "Review bottlenecks", icon: AlertTriangle },
  { label: "Delayed close", icon: Clock },
];

const modernFlow = [
  { label: "Adaptive onboarding", icon: Zap },
  { label: "Automated intake", icon: Zap },
  { label: "AI-assisted risk & procedures", icon: Zap },
  { label: "Evidence linking", icon: CheckCircle2 },
  { label: "Draft conclusions", icon: Zap },
  { label: "Approval-only review", icon: CheckCircle2 },
  { label: "Faster close", icon: CheckCircle2 },
];

const WorkflowComparison = () => (
  <section id="workflow" className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
          Legacy workflow vs{" "}
          <span className="text-gradient">AI-native workflow</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-14">
          See the difference in how engagements move from start to close.
        </p>
      </AnimatedSection>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Legacy */}
        <AnimatedSection delay={0.1}>
          <div className="rounded-2xl border border-border bg-card/50 p-8 h-full">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-muted-foreground">Legacy Process</h3>
            </div>
            <div className="space-y-3">
              {legacyFlow.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <step.icon className={`h-4 w-4 ${
                      step.icon === AlertTriangle ? "text-accent" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-lg bg-secondary/40 border border-border text-sm text-muted-foreground">
                    {step.label}
                  </div>
                  {i < legacyFlow.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">Slower cycle · Manual bottlenecks · High admin load</span>
            </div>
          </div>
        </AnimatedSection>

        {/* Modern */}
        <AnimatedSection delay={0.2}>
          <div className="rounded-2xl border border-primary/20 bg-card p-8 h-full shadow-glow">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-primary">AI-Native Platform</h3>
            </div>
            <div className="space-y-3">
              {modernFlow.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center shrink-0">
                    <step.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-foreground font-medium">
                    {step.label}
                  </div>
                  {i < modernFlow.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-primary/40 shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-primary/10">
              <span className="text-xs text-primary">Faster cycle · Automation-first · Expert-only review</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default WorkflowComparison;
