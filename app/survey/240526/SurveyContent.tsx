"use client";

// 3-step market-research survey. Mirrors the form pattern in
// components/site/DemoModal.tsx (plain React state + Tailwind, no
// react-hook-form). Submits to /api/survey, which forwards to a Google Sheet.

import { useState } from "react";
import Link from "next/link";
import {
  ROLE_OPTIONS,
  FIRM_TYPE_OPTIONS,
  CLIENT_TYPE_OPTIONS,
  REPETITIVE_PART_OPTIONS,
  STEPS,
} from "./questions";
import { EU_COUNTRIES, OTHER_COUNTRIES } from "@/lib/countries";

const inputClass =
  "w-full px-[18px] py-3 bg-background border-2 border-border rounded-lg text-[19px] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors";
const labelClass = "block text-[19px] font-medium mb-2";
const helperClass = "text-[15px] text-muted-foreground mb-3";
// Neutral selection styling (DESIGN.md reserves chartreuse for AI/CTA only).
const optionBase =
  "flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors";
const optionOn = "border-foreground bg-muted";
const optionOff = "border-border hover:border-muted-foreground";

export default function SurveyContent() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — open text
  const [timeLost, setTimeLost] = useState("");
  const [aiUsage, setAiUsage] = useState("");
  // Step 2 — firm profile
  const [role, setRole] = useState("");
  const [firmType, setFirmType] = useState("");
  const [country, setCountry] = useState("");
  const [clientTypes, setClientTypes] = useState<string[]>([]);
  // Step 3 — pain + optional contact
  const [repetitiveParts, setRepetitiveParts] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactFirm, setContactFirm] = useState("");
  const [earlyAccess, setEarlyAccess] = useState(false);
  // Honeypot
  const [website, setWebsite] = useState("");

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const step2Valid = role !== "" && firmType !== "" && country !== "";

  const next = () => {
    setError("");
    if (step === 1 && !step2Valid) {
      setError("Please answer the required questions before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!step2Valid) {
      setError("Please complete role, firm type, and country (Step 2).");
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeLost,
          aiUsage,
          role,
          firmType,
          country,
          clientTypes,
          repetitiveParts,
          contactName,
          contactEmail,
          contactFirm,
          earlyAccess,
          website,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-semibold text-2xl tracking-tight">
            Fi371
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/"
              className="text-[17px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-40 pb-[120px]">
        <div className="max-w-[760px] mx-auto px-8">
          {!submitted ? (
            <>
              <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">
                AI in Audit · 2026 Research
              </div>
              <h1 className="font-display text-[60px] leading-[1.1] tracking-tight mb-6">
                How is your firm really doing audits today?
              </h1>
              <p className="text-[19px] text-muted-foreground mb-10 leading-relaxed">
                A short research survey for audit &amp; accounting
                professionals. About 3 minutes, and it directly shapes what we
                build. Your answers are confidential.
              </p>

              <div className="mb-2 flex items-center justify-between font-mono text-[13px] uppercase tracking-[0.08em] text-muted-foreground">
                <span>{STEPS[step].kicker}</span>
                <span>{STEPS[step].title}</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full mb-10 overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="absolute left-[-9999px] top-[-9999px] h-0 w-0 opacity-0"
                />

                {step === 0 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <label className={labelClass}>
                        Where does your firm lose the most time in the audit
                        process, and what would you most like to see automated?
                      </label>
                      <textarea
                        className={inputClass}
                        rows={4}
                        value={timeLost}
                        onChange={(e) => setTimeLost(e.target.value)}
                        placeholder="Type as much or as little as you like…"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        If AI is being used in your firm today, how are people
                        using it — and what impact has it had on time spent?
                      </label>
                      <textarea
                        className={inputClass}
                        rows={4}
                        value={aiUsage}
                        onChange={(e) => setAiUsage(e.target.value)}
                        placeholder="Even informal use counts."
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <label className={labelClass}>
                        What best describes your role?{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        {ROLE_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className={`${optionBase} ${
                              role === opt ? optionOn : optionOff
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={opt}
                              checked={role === opt}
                              onChange={() => setRole(opt)}
                              className="accent-[hsl(var(--foreground))]"
                            />
                            <span className="text-[17px]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        What type of firm do you work in?{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        {FIRM_TYPE_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className={`${optionBase} ${
                              firmType === opt ? optionOn : optionOff
                            }`}
                          >
                            <input
                              type="radio"
                              name="firmType"
                              value={opt}
                              checked={firmType === opt}
                              onChange={() => setFirmType(opt)}
                              className="accent-[hsl(var(--foreground))]"
                            />
                            <span className="text-[17px]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        In which country is your firm mainly based?{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <select
                        className={inputClass}
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      >
                        <option value="">Select a country</option>
                        <optgroup label="European Union">
                          {EU_COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Other">
                          {OTHER_COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Which client types do you mostly audit?
                      </label>
                      <p className={helperClass}>Select all that apply.</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {CLIENT_TYPE_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className={`${optionBase} ${
                              clientTypes.includes(opt) ? optionOn : optionOff
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={clientTypes.includes(opt)}
                              onChange={() =>
                                setClientTypes((l) => toggle(l, opt))
                              }
                              className="accent-[hsl(var(--foreground))]"
                            />
                            <span className="text-[17px]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <label className={labelClass}>
                        Which parts of the audit feel most repetitive or manual?
                      </label>
                      <p className={helperClass}>Select all that apply.</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {REPETITIVE_PART_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className={`${optionBase} ${
                              repetitiveParts.includes(opt)
                                ? optionOn
                                : optionOff
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={repetitiveParts.includes(opt)}
                              onChange={() =>
                                setRepetitiveParts((l) => toggle(l, opt))
                              }
                              className="accent-[hsl(var(--foreground))]"
                            />
                            <span className="text-[17px]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-8">
                      <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-2">
                        Optional — about you
                      </div>
                      <p className={helperClass}>
                        Leave your details if you&apos;d like us to follow up.
                        Totally optional.
                      </p>
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className={labelClass}>Name</label>
                          <input
                            className={inputClass}
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Jane Smith"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Work email</label>
                          <input
                            className={inputClass}
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="jane@yourfirm.com"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Firm name</label>
                          <input
                            className={inputClass}
                            value={contactFirm}
                            onChange={(e) => setContactFirm(e.target.value)}
                            placeholder="Smith &amp; Associates"
                          />
                        </div>
                        <label className="flex items-center gap-3 mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={earlyAccess}
                            onChange={(e) => setEarlyAccess(e.target.checked)}
                            className="accent-[hsl(var(--foreground))] h-5 w-5"
                          />
                          <span className="text-[17px]">
                            Yes, contact me about early access to Fi371.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-[17px] text-destructive mt-6">{error}</p>
                )}

                <div className="flex items-center justify-between gap-4 mt-10">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="px-6 py-3 border-2 border-border text-foreground font-semibold rounded-lg hover:border-muted-foreground transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={next}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">
                Thank you
              </div>
              <h1 className="font-display text-[50px] leading-[1.1] tracking-tight mb-6">
                Thank you for your input.
              </h1>
              <p className="text-[19px] text-muted-foreground mb-10 leading-relaxed">
                Your answers go straight to our research and directly shape what
                we build for audit firms like yours.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
