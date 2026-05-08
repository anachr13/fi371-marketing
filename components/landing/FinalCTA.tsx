"use client";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface FinalCTAProps {
  onOpenDemo: () => void;
}

const FinalCTA = ({ onOpenDemo }: FinalCTAProps) => (
  <section className="py-20 lg:py-28 bg-card/30">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedSection>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to remove the donkey work from{" "}
            <span className="text-gradient">audit?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            See how your firm can reduce audit time, accelerate engagement completion,
            and support modern audit workflows — including crypto audits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={onOpenDemo}
              size="lg"
              className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-90 transition-opacity text-base px-10"
            >
              Get Pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-foreground/75 hover:text-foreground hover:bg-transparent font-medium text-sm px-3"
              asChild
            >
              <a href="https://app.fi371.com/wizard/index-v2-5.html" target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-4 w-4" />
                Evaluate the AI
              </a>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default FinalCTA;
