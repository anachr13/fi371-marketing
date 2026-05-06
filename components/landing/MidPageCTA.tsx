"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface Props {
  onOpenDemo: () => void;
  heading?: string;
  subtext?: string;
  cta?: string;
}

const MidPageCTA = ({
  onOpenDemo,
  heading = "Ready to see this on your engagement?",
  subtext = "30-minute demo, walked through your firm's workflow.",
  cta = "Learn More",
}: Props) => (
  <section className="py-12">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="max-w-5xl mx-auto rounded-2xl border border-primary/20 bg-card/70 px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-glow">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">{heading}</h3>
            <p className="text-sm text-muted-foreground">{subtext}</p>
          </div>
          <Button
            onClick={onOpenDemo}
            size="lg"
            className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-95 shrink-0"
          >
            {cta}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default MidPageCTA;
