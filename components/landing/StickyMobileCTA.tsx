"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Props {
  onOpenDemo: () => void;
}

const StickyMobileCTA = ({ onOpenDemo }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-border transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Button
        onClick={onOpenDemo}
        className="w-full gradient-cta text-primary-foreground font-semibold border-0"
      >
        Book Demo
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
};

export default StickyMobileCTA;
