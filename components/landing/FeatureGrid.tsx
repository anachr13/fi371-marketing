"use client";
import AnimatedSection from "./AnimatedSection";

const rows = [
  { feature: "Adaptive client onboarding", benefit: "Less back-and-forth and faster request collection" },
  { feature: "Automated document requests", benefit: "Fewer delays during fieldwork" },
  { feature: "TB / GL data ingestion", benefit: "Faster setup and cleaner audit inputs" },
  { feature: "AI risk and procedure drafting", benefit: "Less repetitive planning work" },
  { feature: "Evidence linking and summaries", benefit: "Better traceability, less admin" },
  { feature: "Conclusion and opinion drafting", benefit: "Faster completion and review prep" },
  { feature: "Observability and AI trace logging", benefit: "More trust, control, and governance" },
  { feature: "Crypto audit support", benefit: "Be ready for new digital asset audit requirements" },
];

const FeatureGrid = () => (
  <section className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Features that drive{" "}
            <span className="text-gradient">real outcomes.</span>
          </h2>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="max-w-4xl mx-auto rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-2 bg-secondary/80">
            <div className="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
              Feature
            </div>
            <div className="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
              Benefit
            </div>
          </div>
          {/* Rows */}
          {rows.map((r, i) => (
            <div
              key={r.feature}
              className={`grid grid-cols-2 border-t border-border ${
                i % 2 === 0 ? "bg-background" : "bg-card/50"
              }`}
            >
              <div className="px-6 py-4 text-sm font-medium text-foreground">{r.feature}</div>
              <div className="px-6 py-4 text-sm text-muted-foreground">{r.benefit}</div>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default FeatureGrid;
