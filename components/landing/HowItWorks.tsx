"use client";
import { UserPlus, Database, Bot, Eye, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

const steps = [
  { icon: UserPlus, title: "Onboard the client", desc: "Automated intake, adaptive document requests, and structured data collection." },
  { icon: Database, title: "Ingest data and structure the audit", desc: "Import trial balances, map accounts, and set up the engagement automatically." },
  { icon: Bot, title: "Let AI handle the heavy lifting", desc: "Risk assessment, procedure drafting, evidence linking, and conclusion preparation." },
  { icon: Eye, title: "Review only where it matters", desc: "Focus on exceptions, high-risk areas, and judgment calls — not routine checks." },
  { icon: CheckCircle, title: "Close faster", desc: "AI-assisted opinion drafting, final review, and engagement completion." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
        </div>
      </AnimatedSection>

      <div className="max-w-3xl mx-auto">
        {steps.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.1}>
            <div className="flex gap-6 mb-2">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl gradient-cta flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border my-2" />
                )}
              </div>

              {/* Content */}
              <div className="pb-10">
                <div className="text-xs font-mono text-primary mb-1 uppercase tracking-wider">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.2}>
        <div className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-95 hover:shadow-glow text-base px-8"
          >
            <a href="https://fi371.vercel.app/index-v2.html" target="_blank" rel="noopener noreferrer">
              See it in action
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default HowItWorks;
