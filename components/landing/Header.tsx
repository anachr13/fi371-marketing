"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenDemo: () => void;
}

const navLinks = [
  { label: "Product", href: "#solution", id: "solution" },
  { label: "How It Works", href: "#how-it-works", id: "how-it-works" },
  { label: "Crypto Audits", href: "#crypto", id: "crypto" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

const Header = ({ onOpenDemo }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
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
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          Audit<span className="text-gradient">AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors relative ${
                activeId === link.id
                  ? "text-foreground"
                  : "text-foreground/75 hover:text-foreground"
              }`}
            >
              {link.label}
              {activeId === link.id && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </a>
          ))}
          <Link
            to="/compare/caseware"
            className="text-sm text-foreground/75 hover:text-foreground transition-colors"
          >
            Compare
          </Link>
        </nav>

        <div className="hidden md:block">
          <Button onClick={onOpenDemo} size="sm" className="gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-90">
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
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/compare/caseware"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              Compare
            </Link>
            <Button onClick={() => { onOpenDemo(); setMobileOpen(false); }} size="sm" className="gradient-cta text-primary-foreground font-semibold border-0 w-full">
              Book Demo
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
