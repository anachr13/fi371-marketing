"use client";
import { UserX, FileSearch, Database, ClipboardList, Unlink, Clock, Bitcoin } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const painPoints = [
  { icon: UserX, title: "Endless client follow-ups", desc: "Chasing clients for information that should flow automatically." },
  { icon: FileSearch, title: "Manual document chasing", desc: "Tracking down missing files across emails, drives, and portals." },
  { icon: Database, title: "Messy data imports", desc: "Trial balance and GL data that needs constant cleanup and formatting." },
  { icon: ClipboardList, title: "Repetitive procedure drafting", desc: "Rewriting the same procedures for similar engagements over and over." },
  { icon: Unlink, title: "Disconnected evidence", desc: "Workpapers and evidence scattered across multiple tools and formats." },
  { icon: Clock, title: "Slow review cycles", desc: "Review bottlenecks that delay completion and frustrate teams." },
  { icon: Bitcoin, title: "New crypto audit pressure", desc: "Growing demand for digital asset audits without clear workflows." },
];

const ProblemSection = () => (
  <section className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Audit teams are still losing time to work that should already be{" "}
            <span className="text-gradient">automated.</span>
          </h2>
        </div>
      </AnimatedSection>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {painPoints.map((p, i) => (
          <AnimatedSection key={p.title} delay={i * 0.05}>
            <div className="gradient-card rounded-xl border border-border p-6 h-full hover:border-primary/30 transition-colors">
              <p.icon className="h-5 w-5 text-accent mb-4" />
              <h3 className="font-semibold text-foreground mb-2 text-sm">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
