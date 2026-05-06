"use client";
import { Clock, Zap, Users, Layers } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const outcomes = [
  { icon: Clock, title: "Reduce audit time", desc: "Automate the repetitive work that consumes most of your team's hours." },
  { icon: Zap, title: "Increase engagement velocity", desc: "Move from onboarding to opinion faster with streamlined workflows." },
  { icon: Users, title: "Improve team leverage", desc: "Let junior staff handle more with AI assistance and structured review." },
  { icon: Layers, title: "Build for what's next", desc: "Stay ahead of evolving requirements including crypto and digital asset audits." },
];

const OutcomesSection = () => (
  <section className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
          What firms get
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

export default OutcomesSection;
