"use client";
import { Shield, Eye, Users, Lock } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const chips = [
  { icon: Users, text: "Built with practising auditors" },
  { icon: Eye, text: "Traceable AI outputs" },
  { icon: Lock, text: "EU data residency" },
  { icon: Shield, text: "Designed for regulated environments" },
];

const TrustBar = () => (
  <section className="py-12 border-y border-border bg-card/50">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
          {chips.map((c) => (
            <div
              key={c.text}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-secondary/50 text-sm text-secondary-foreground"
            >
              <c.icon className="h-4 w-4 text-primary" />
              {c.text}
            </div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default TrustBar;
