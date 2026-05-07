"use client";

import { useState } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeatureGrid from "@/components/landing/FeatureGrid";
import MidPageCTA from "@/components/landing/MidPageCTA";
import CryptoSection from "@/components/landing/CryptoSection";
import OutcomesSection from "@/components/landing/OutcomesSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import DemoModal from "@/components/landing/DemoModal";
import Footer from "@/components/landing/Footer";
import StickyMobileCTA from "@/components/landing/StickyMobileCTA";

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = () => setDemoOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onOpenDemo={openDemo} />
      <HeroSection onOpenDemo={openDemo} />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <FeatureGrid />
      <MidPageCTA onOpenDemo={openDemo} />
      <CryptoSection onOpenDemo={openDemo} />
      <OutcomesSection />
      <FAQSection onOpenDemo={openDemo} />
      <FinalCTA onOpenDemo={openDemo} />
      <Footer />
      <StickyMobileCTA onOpenDemo={openDemo} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
