"use client";
import { Shield, FileCheck, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface CryptoSectionProps {
  onOpenDemo?: () => void;
}

const bullets = [
  { icon: Shield, text: "Supports digital asset / crypto audit workflows" },
  { icon: FileCheck, text: "Helps manage new evidence and control requirements" },
  { icon: Users, text: "Reduces manual coordination in emerging audit areas" },
  { icon: TrendingUp, text: "Gives firms a stronger operating model for evolving audit demand" },
];

const CryptoSection = ({ onOpenDemo }: CryptoSectionProps) => (
  <section id="crypto" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-primary/20 bg-card p-8 lg:p-14 shadow-glow">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              Crypto Audit Ready
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 max-w-2xl">
              Built for the next wave of audit requirements —{" "}
              <span className="text-gradient">including crypto audits.</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Audit requirements are changing, and digital asset engagements are becoming
              more important and more complex. The platform supports crypto audit workflows
              by helping teams collect the right evidence, structure digital asset-related
              procedures, and manage new reporting and review requirements with a more
              scalable process.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {bullets.map((b) => (
                <div
                  key={b.text}
                  className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <b.icon className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-secondary-foreground">{b.text}</span>
                </div>
              ))}
            </div>

            {onOpenDemo && (
              <div className="mt-8">
                <Button
                  onClick={onOpenDemo}
                  size="lg"
                  className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-95"
                >
                  Talk to us about crypto audits
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default CryptoSection;
