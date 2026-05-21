"use client";

import { useState } from "react";
import Link from "next/link";
import DemoModal from "@/components/site/DemoModal";

const workflowSteps = [
  { num: "01", name: "Client Onboarding", badge: "ai" },
  { num: "02", name: "Data Intake", badge: "ai" },
  { num: "03", name: "Risk Assessment", badge: "ai" },
  { num: "04", name: "Fieldwork", badge: "ai" },
  { num: "05", name: "Reporting", badge: "ai" },
  { num: "06", name: "Review & Sign-off", badge: "human" },
];

const stats = [
  { value: "3x", label: "faster engagement completion compared to manual workflows" },
  { value: "70%", label: "reduction in time spent on document collection and data entry" },
  { value: "100%", label: "traceable AI outputs with full audit trail for every decision" },
];

const painPoints = [
  { title: "Endless client follow-ups", desc: "Chasing clients for information that should flow automatically into your engagement file." },
  { title: "Manual document chasing", desc: "Tracking down missing files across emails, drives, and client portals." },
  { title: "Messy data imports", desc: "Trial balance and GL data that needs constant cleanup and manual formatting." },
  { title: "Slow review cycles", desc: "Review bottlenecks that delay completion and frustrate teams and clients alike." },
];

const features = [
  { name: "Adaptive client onboarding", benefit: "Less back-and-forth and faster request collection" },
  { name: "Automated document requests", benefit: "Fewer delays during fieldwork" },
  { name: "TB / GL data ingestion", benefit: "Faster setup and cleaner audit inputs" },
  { name: "AI risk and procedure drafting", benefit: "Less repetitive planning work" },
  { name: "Evidence linking and summaries", benefit: "Better traceability, less admin" },
  { name: "Conclusion and opinion drafting", benefit: "Faster completion and review prep", highlight: true },
  { name: "Observability and AI trace logging", benefit: "More trust, control, and governance" },
];

const compareRows = [
  { cap: "Client onboarding", legacy: "Structured but largely manual client coordination", modern: "Adaptive onboarding that asks for more only when needed" },
  { cap: "Document requests", legacy: "Request lists and follow-up coordination", modern: "Dynamic document requests triggered by answers, data, and workflow state" },
  { cap: "Data ingestion", legacy: "Data import and organization", modern: "Faster ingestion plus validation, mapping, and workflow activation" },
  { cap: "Risk assessment", legacy: "Auditor-led assessment supported by templates", modern: "AI-assisted risk suggestions with traceable rationale and human approval" },
  { cap: "Procedure drafting", legacy: "Template-based preparation", modern: "AI-generated procedures based on risk, account, and engagement context" },
  { cap: "Evidence linking", legacy: "Document collection and manual linkage", modern: "Structured evidence linking, summarization, and workflow-aware traceability" },
  { cap: "Conclusion drafting", legacy: "Auditor-prepared documentation", modern: "AI-assisted conclusion drafts with explainability and review controls" },
  { cap: "Opinion drafting", legacy: "Final drafting handled manually or through templates", modern: "AI-generated draft opinions with approval and manual override options" },
  { cap: "Review model", legacy: "Broader manual review burden", modern: "Exception-based expert review focused on judgment and approvals" },
  { cap: "Workflow flexibility", legacy: "Methodology-driven workflow support", modern: "Adaptive workflow orchestration designed to move engagements forward faster" },
  { cap: "AI observability", legacy: "Limited or externalized AI tracing", modern: "Built-in AI traceability, observability, and control patterns" },
];

const faqs = [
  { q: "Is this built for solo auditors or only large firms?", a: "Both. The platform scales from solo practitioners who need to move faster, to small offices looking for leverage, to larger firms that want to standardize and accelerate their audit workflows." },
  { q: "Does this replace auditor judgment?", a: "No. The platform automates repetitive, structured work like data ingestion, procedure drafting, and evidence linking. Every AI output is reviewed and approved by a qualified auditor. Expert judgment stays where it matters." },
  { q: "Can it help reduce audit turnaround time?", a: "Absolutely. By automating the manual steps that consume most of an engagement's time, firms can close engagements significantly faster." },
  { q: "Is AI output traceable?", a: "Yes. Every AI-generated output includes full trace logging and observability. You can see exactly what the AI produced, what inputs it used, and maintain a complete audit trail for governance and quality control." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-8 py-[22px] text-left text-[19px] font-semibold hover:bg-card transition-colors">
        {q}
        <span className={`text-muted-foreground text-[22px] ml-5 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="px-8 pb-[22px] text-[17px] text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
          <a href="#" className="font-semibold text-2xl tracking-tight">Fi371</a>
          <nav className="hidden md:flex items-center gap-10">
            <a href="https://app.fi371.com/wizard/index-v2-5.html" target="_blank" rel="noopener noreferrer" className="text-[17px] font-medium text-muted-foreground hover:text-foreground transition-colors">Try It Yourself</a>
            <a href="#features" className="text-[17px] font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <button onClick={() => setDemoOpen(true)} className="px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:opacity-90 transition-opacity">Book Demo</button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-40 pb-[120px]">
          <div className="max-w-[1500px] mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div>
                <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">AI-native audit automation</div>
                <h1 className="font-display text-[70px] leading-[1.08] tracking-tight mb-8">Close audit engagements in days, not weeks.</h1>
                <p className="text-[22px] text-muted-foreground leading-relaxed mb-10 max-w-[600px]">Accelerate your audits with an end-to-end platform built on AI. From client onboarding to final opinion, faster.</p>
                <div className="flex gap-5 mb-3">
                  <button onClick={() => setDemoOpen(true)} className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">Book Demo</button>
                  <a href="https://app.fi371.com/wizard/index-v2-5.html" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border-2 border-foreground font-semibold rounded-lg hover:bg-foreground hover:text-background transition-colors">&#9655; Preview a Scenario</a>
                </div>
                <p className="text-[15px] text-muted-foreground">30-minute demo &middot; See your firm&apos;s workflow &middot; No commitment</p>
              </div>

              <div className="flex flex-col gap-3 pt-10" role="list" aria-label="Audit workflow steps">
                {workflowSteps.map((step) => (
                  <div key={step.num} className="flex items-center gap-4 px-6 py-5 border border-border rounded-lg hover:border-muted-foreground transition-colors" role="listitem">
                    <span className="font-mono text-[15px] font-medium text-muted-foreground w-8 shrink-0">{step.num}</span>
                    <span className="flex-1 text-[19px] font-medium">{step.name}</span>
                    {step.badge === "ai" && <span className="font-mono text-sm font-medium tracking-wide px-2.5 py-0.5 rounded bg-primary text-primary-foreground">AI</span>}
                    {step.badge === "human" && <span className="font-mono text-sm font-medium tracking-wide px-2.5 py-0.5 rounded bg-card text-muted-foreground border border-border">Human Action</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1500px] mx-auto px-8"><hr className="border-border" /></div>

        {/* Stats */}
        <section className="py-20">
          <div className="max-w-[1500px] mx-auto px-8">
            <div className="grid sm:grid-cols-3 gap-10">
              {stats.map((s) => (
                <div key={s.value}>
                  <div className="font-display text-[60px] mb-1">{s.value}</div>
                  <div className="text-[17px] text-muted-foreground leading-relaxed">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1500px] mx-auto px-8"><hr className="border-border" /></div>

        {/* Problem */}
        <section className="py-20">
          <div className="max-w-[1500px] mx-auto px-8">
            <h2 className="font-display text-[50px] leading-[1.15] tracking-tight mb-16 max-w-[800px]">Audit teams are still losing time to work that should already be automated.</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {painPoints.map((p) => (
                <div key={p.title} className="p-8 border border-border rounded-lg">
                  <div className="text-[19px] font-semibold mb-1">{p.title}</div>
                  <div className="text-[17px] text-muted-foreground leading-relaxed">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1500px] mx-auto px-8"><hr className="border-border" /></div>

        {/* Features */}
        <section className="py-20" id="features">
          <div className="max-w-[1500px] mx-auto px-8">
            <h2 className="font-display text-[50px] leading-[1.15] tracking-tight mb-16 max-w-[800px]">Features that drive real outcomes.</h2>
            <div className="max-w-[1000px] border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 bg-card">
                <span className="px-8 py-[18px] font-mono text-sm font-medium tracking-[0.06em] uppercase text-muted-foreground">Feature</span>
                <span className="px-8 py-[18px] font-mono text-sm font-medium tracking-[0.06em] uppercase text-muted-foreground">Benefit</span>
              </div>
              {features.map((f, i) => (
                <div key={f.name} className={`grid grid-cols-2 border-t border-border ${i % 2 === 0 ? "bg-background" : ""}`}>
                  <span className="px-8 py-[18px] text-[17px] font-medium">{f.name}</span>
                  <span className="px-8 py-[18px] text-[17px] text-muted-foreground">
                    {f.highlight ? <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded">{f.benefit}</span> : f.benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Compare expand */}
            <div className="mt-10">
              <button onClick={() => setCompareOpen(!compareOpen)} className={`text-[19px] font-semibold hover:text-muted-foreground transition-colors ${compareOpen ? "" : ""}`}>
                Legacy audit tools vs our AI-native platform <span className={`inline-block text-[15px] transition-transform ${compareOpen ? "rotate-90" : ""}`}>&#9655;</span>
              </button>
            </div>

            {compareOpen && (
              <div className="mt-10">
                <p className="text-[17px] text-muted-foreground mb-8">A detailed comparison of how each approach handles key audit workflow areas.</p>
                <div className="hidden lg:block border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_1.2fr_1.2fr] bg-card">
                    <span className="px-6 py-[18px] font-mono text-sm font-medium tracking-[0.06em] uppercase text-muted-foreground">Capability</span>
                    <span className="px-6 py-[18px] font-mono text-sm font-medium tracking-[0.06em] uppercase text-muted-foreground">Legacy platform</span>
                    <span className="px-6 py-[18px] font-mono text-sm font-medium tracking-[0.06em] uppercase bg-primary text-primary-foreground">Fi371 AI-native</span>
                  </div>
                  {compareRows.map((row, i) => (
                    <div key={row.cap} className={`grid grid-cols-[1fr_1.2fr_1.2fr] border-t border-border ${i % 2 === 0 ? "bg-background" : ""}`}>
                      <span className="px-6 py-[18px] text-base font-medium">{row.cap}</span>
                      <span className="px-6 py-[18px] text-base text-muted-foreground border-l border-border">{row.legacy}</span>
                      <span className="px-6 py-[18px] text-base border-l border-border">{row.modern}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden space-y-4">
                  {compareRows.map((row, i) => (
                    <div key={row.cap} className="rounded-xl border border-border bg-card p-5">
                      <h3 className="text-base font-semibold mb-3">{row.cap}</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Legacy approach</span>
                          <p className="text-sm text-muted-foreground mt-1">{row.legacy}</p>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">AI-native platform</span>
                          <p className="text-sm text-foreground mt-1">{row.modern}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="max-w-[1500px] mx-auto px-8"><hr className="border-border" /></div>

        {/* How it works */}
        <section className="py-20" id="how">
          <div className="max-w-[1500px] mx-auto px-8">
            <h2 className="font-display text-[50px] leading-[1.15] tracking-tight mb-16 max-w-[800px]">From onboarding to opinion. One platform.</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="p-10 border border-border rounded-xl">
                <div className="font-mono text-[15px] font-medium text-muted-foreground mb-5">01</div>
                <h3 className="font-display text-[30px] mb-3">Connect your client</h3>
                <p className="text-[17px] text-muted-foreground leading-relaxed">Automated PBC list generation, client portal, and document intake. AI extracts and organizes everything.</p>
                <span className="inline-block mt-5 font-mono text-sm font-medium px-3 py-1 rounded bg-primary text-primary-foreground">AI-powered</span>
              </div>
              <div className="p-10 border border-border rounded-xl">
                <div className="font-mono text-[15px] font-medium text-muted-foreground mb-5">02</div>
                <h3 className="font-display text-[30px] mb-3">Run your procedures</h3>
                <p className="text-[17px] text-muted-foreground leading-relaxed">AI drafts risk assessments, generates audit procedures, and pre-populates workpapers from your firm&apos;s templates.</p>
                <span className="inline-block mt-5 font-mono text-sm font-medium px-3 py-1 rounded bg-primary text-primary-foreground">AI-powered</span>
              </div>
              <div className="p-10 border border-border rounded-xl">
                <div className="font-mono text-[15px] font-medium text-muted-foreground mb-5">03</div>
                <h3 className="font-display text-[30px] mb-3">Review and sign off</h3>
                <p className="text-[17px] text-muted-foreground leading-relaxed">Clear review queues, traceable AI reasoning, and structured sign-off at every stage. You stay in control.</p>
                <span className="inline-block mt-5 font-mono text-sm font-medium px-3 py-1 rounded bg-card text-muted-foreground border border-border">Human Action</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1500px] mx-auto px-8"><hr className="border-border" /></div>

        {/* FAQ */}
        <section className="py-20" id="faq">
          <div className="max-w-[900px] mx-auto px-8">
            <h2 className="font-display text-[50px] leading-[1.15] tracking-tight mb-16 max-w-[800px]">Frequently asked questions</h2>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1500px] mx-auto px-8"><hr className="border-border" /></div>

        {/* CTA */}
        <section className="py-[120px] text-center">
          <div className="max-w-[1500px] mx-auto px-8">
            <h2 className="font-display text-[60px] leading-[1.1] mb-5">Ready to leave 2005 behind?</h2>
            <p className="text-[22px] text-muted-foreground mb-10 max-w-[650px] mx-auto">See how Fi371 works for your firm. 30-minute demo, tailored to your workflow.</p>
            <div className="flex justify-center gap-5">
              <button onClick={() => setDemoOpen(true)} className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">Book Demo</button>
              <a href="https://app.fi371.com/wizard/index-v2-5.html" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border-2 border-foreground font-semibold rounded-lg hover:bg-foreground hover:text-background transition-colors">&#9655; Evaluate the AI</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-[1500px] mx-auto px-8 flex justify-between items-center">
          <span className="text-base text-muted-foreground">&copy; 2026 Fi371. All rights reserved.</span>
          <div className="flex gap-8">
            <Link href="/about" className="text-base text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="text-base text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-base text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <button onClick={() => setDemoOpen(true)} className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Contact</button>
          </div>
        </div>
      </footer>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
