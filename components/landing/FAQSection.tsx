"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface FAQSectionProps {
  onOpenDemo?: () => void;
}

const faqs = [
  {
    q: "Is this built for solo auditors or only large firms?",
    a: "Both. The platform is designed to scale — from solo practitioners who need to move faster, to small offices looking for leverage, to larger firms that want to standardize and accelerate their audit workflows.",
  },
  {
    q: "Does this replace auditor judgment?",
    a: "No. The platform automates repetitive, structured work — data ingestion, procedure drafting, evidence linking, and conclusion preparation. Every AI output is designed to be reviewed and approved by a qualified auditor. Expert judgment stays where it matters.",
  },
  {
    q: "Does it support crypto audits?",
    a: "Yes. The platform includes purpose-built workflows for digital asset and crypto audit engagements, including evidence collection, procedure structuring, and reporting tailored to emerging requirements.",
  },
  {
    q: "Can it help reduce audit turnaround time?",
    a: "Absolutely. By automating the manual steps that consume most of an engagement's time — document requests, data cleanup, procedure drafting, and conclusion preparation — firms can close engagements significantly faster.",
  },
  {
    q: "Is AI output traceable?",
    a: "Yes. Every AI-generated output includes full trace logging and observability. You can see exactly what the AI produced, what inputs it used, and maintain a complete audit trail for governance and quality control.",
  },
];

const FAQSection = ({ onOpenDemo }: FAQSectionProps) => (
  <section id="faq" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
          Frequently asked questions
        </h2>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border rounded-xl px-6 bg-card/50 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </AnimatedSection>

      {onOpenDemo && (
        <AnimatedSection delay={0.15}>
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Still have questions? Get them answered in a 30-minute demo.
            </p>
            <Button
              onClick={onOpenDemo}
              size="lg"
              className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-95"
            >
              Request Info
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </AnimatedSection>
      )}
    </div>
  </section>
);

export default FAQSection;
