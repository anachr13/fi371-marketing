"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompareHeaderProps {
  onOpenDemo: () => void;
}

const navLinks = [
  { label: "Why Us", href: "#why-us" },
  { label: "Compare", href: "#compare" },
  { label: "Workflow", href: "#workflow" },
  { label: "Crypto Audits", href: "#crypto" },
  { label: "FAQ", href: "#faq" },
];

const CompareHeader = ({ onOpenDemo }: CompareHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <a href="/" className="text-xl font-bold tracking-tight text-foreground">
          Audit<span className="text-gradient">AI</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button onClick={onOpenDemo} size="sm" className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-90 transition-opacity">
            Book Demo
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4">
          <nav className="flex flex-col gap-4 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button onClick={() => { onOpenDemo(); setMobileOpen(false); }} size="sm" className="gradient-cta text-primary-foreground font-semibold border-0 w-full">
              Book Demo
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default CompareHeader;
