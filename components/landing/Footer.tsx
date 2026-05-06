"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onOpenDemo?: () => void;
}

const Footer = ({ onOpenDemo }: FooterProps) => (
  <footer className="border-t border-border py-12 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-base font-bold text-foreground">
            Audit<span className="text-gradient">AI</span>
          </span>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            AI-native audit automation for solo, small and mid-sized firms.
          </p>
        </div>
        {onOpenDemo && (
          <Button
            onClick={onOpenDemo}
            size="sm"
            className="gradient-cta text-primary-foreground font-semibold border-0"
          >
            Book Demo
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 border-t border-border text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} AuditAI. All rights reserved.</p>
        <nav className="flex flex-wrap gap-5">
          <Link href="/compare/caseware" className="hover:text-foreground transition-colors">Compare</Link>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="mailto:hello@auditai.app" className="hover:text-foreground transition-colors">Contact</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
