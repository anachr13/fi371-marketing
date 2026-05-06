"use client";
import { Zap, UserCheck, Search, Rocket, Bitcoin } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const solutions = [
  {
    icon: UserCheck,
    title: "Smart client onboarding",
    desc: "Adaptive document requests that learn what's needed, reduce back-and-forth, and get clients prepared faster.",
  },
  {
    icon: Zap,
    title: "Faster audit execution",
    desc: "Automated data ingestion, risk assessment, and procedure drafting so your team focuses on judgment — not formatting.",
  },
  {
    icon: Search,
    title: "Exception-based expert review",
    desc: "AI flags what matters. Reviewers focus on exceptions and high-risk areas instead of reviewing everything line by line.",
  },
  {
    icon: Rocket,
    title: "Faster close",
    desc: "AI-assisted conclusions, opinion drafts, and completion workflows that dramatically shorten engagement timelines.",
  },
  {
    icon: Bitcoin,
    title: "Crypto audit support",
    desc: "Purpose-built workflows for digital asset engagements — evidence collection, controls, and reporting tailored to crypto audits.",
  },
];

const SolutionSection = () => (
  <section id="solution" className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            One platform to move the audit forward —{" "}
            <span className="text-gradient">fast.</span>
          </h2>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.08}>
            <div className="rounded-xl border border-border bg-background p-8 h-full hover:shadow-glow hover:border-primary/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl gradient-cta flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
