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
  STEPS,
} from "./questions";
import { EU_COUNTRIES, OTHER_COUNTRIES, COUNTRY_FLAGS } from "@/lib/countries";

const inputClass =
  "w-full px-[18px] py-3 bg-background border-2 border-border rounded-lg text-[19px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors";
const labelClass = "block text-[19px] font-medium mb-2";
const helperClass = "text-[15px] text-muted-foreground mb-3";
// Neutral selection styling (DESIGN.md reserves chartreuse for AI/CTA only).
const optionBase =
  "flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors";
const optionOn = "border-foreground bg-muted";
const optionOff = "border-border hover:border-muted-foreground";

export default function SurveyContent({
  initialCountry = "",
}: {
  initialCountry?: string;
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Step 1 — contact details (all optional)
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactFirm, setContactFirm] = useState("");
  const [earlyAccess, setEarlyAccess] = useState(false);
  // Step 2 — firm profile. Selecting "Other" reveals a free-text box.
  const [role, setRole] = useState("");
  const [roleOther, setRoleOther] = useState("");
  const [firmType, setFirmType] = useState("");
  const [firmTypeOther, setFirmTypeOther] = useState("");
  const [country, setCountry] = useState(initialCountry);
  const [clientTypes, setClientTypes] = useState<string[]>([]);
  const [clientTypesOther, setClientTypesOther] = useState("");
  // Step 3 — open text
  const [timeLost, setTimeLost] = useState("");
  const [aiUsage, setAiUsage] = useState("");
  // Honeypot
  const [website, setWebsite] = useState("");

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Fold any "Other" free-text into the saved answer (e.g. "Other: Tax advisor")
  // so the downstream Sheet keeps the same columns.
  const withOther = (value: string, other: string) =>
    value === "Other" && other.trim() ? `Other: ${other.trim()}` : value;

  // The whole survey is optional, so navigation never blocks on answers.
  const next = () => {
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setError("");
    setEmailError("");
    // Email is optional, but if provided it must be valid. Show the error inline
    // at the email field on Step 1 (contacts) and jump back there.
    const emailTrimmed = contactEmail.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError("Please enter a valid work email, or leave it blank.");
      setStep(0);
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
          role: withOther(role, roleOther),
          firmType: withOther(firmType, firmTypeOther),
          country,
          clientTypes: clientTypes.map((c) =>
            c === "Other" && clientTypesOther.trim()
              ? `Other: ${clientTypesOther.trim()}`
              : c
          ),
          contactName,
          contactEmail,
          contactFirm,
          earlyAccess,
          website,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fieldMsg = data.fields
          ? (Object.values(data.fields)[0] as string)
          : null;
        setError(
          fieldMsg || data.error || "Something went wrong. Please try again."
        );
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setSubmitted(true);
    } catch {
      // No client-side timeout on purpose: a slow-but-successful save must not
      // be aborted and retried, which can write the response to the Sheet
      // twice (the append is not idempotent) and skew the research data. The
      // "Saving…" spinner keeps the wait honest; the server/Vercel function
      // timeout bounds a genuinely hung request and surfaces here as an error.
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
              <p className="text-[19px] text-muted-foreground mb-8 leading-relaxed">
                A short research survey for audit &amp; accounting
                professionals. About 3 minutes, and it directly shapes what we
                build.{" "}
                <strong className="font-semibold text-foreground">
                  Your answers are confidential.
                </strong>
              </p>

              {step === 0 && (
                <div className="mb-10">
                  <label className={labelClass}>
                    In which country is your firm mainly based?
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
                          {COUNTRY_FLAGS[c] ? `${COUNTRY_FLAGS[c]} ${c}` : c}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      {OTHER_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {COUNTRY_FLAGS[c] ? `${COUNTRY_FLAGS[c]} ${c}` : c}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

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

              <form onSubmit={(e) => e.preventDefault()}>
                {/* Spam honeypot: hidden from humans, bots fill it, so a
                    non-empty value makes the API discard the submission.
                    DO NOT name this "website"/"url"/"email" etc. and DO NOT make
                    it visible: browser autofill & password managers fill such
                    fields automatically, which silently flagged REAL
                    respondents as bots and dropped their answers (their browser
                    showed "Thank you" but nothing reached the Sheet). An opaque
                    name + display:none keeps autofill away while still catching
                    bots that blindly fill every input. Still submitted under the
                    `website` key to match the API schema. */}
                <input
                  type="text"
                  name="hp_token"
                  id="hp_token"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                />

                {step === 0 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <p className={helperClass}>
                        Totally optional — leave your details if you&apos;d like
                        us to follow up.
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
                            onChange={(e) => {
                              setContactEmail(e.target.value);
                              if (emailError) setEmailError("");
                            }}
                            placeholder="jane@yourfirm.com"
                            aria-invalid={emailError ? true : undefined}
                          />
                          {emailError && (
                            <p className="text-[15px] text-destructive mt-2">
                              {emailError}
                            </p>
                          )}
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

                {step === 1 && (
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

                {step === 2 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <label className={labelClass}>
                        What best describes your role?
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
                      {role === "Other" && (
                        <input
                          className={`${inputClass} mt-3`}
                          value={roleOther}
                          onChange={(e) => setRoleOther(e.target.value)}
                          placeholder="Please tell us your role"
                          maxLength={150}
                        />
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>
                        What type of firm do you work in?
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
                      {firmType === "Other" && (
                        <input
                          className={`${inputClass} mt-3`}
                          value={firmTypeOther}
                          onChange={(e) => setFirmTypeOther(e.target.value)}
                          placeholder="Please tell us your firm type"
                          maxLength={150}
                        />
                      )}
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
                      {clientTypes.includes("Other") && (
                        <input
                          className={`${inputClass} mt-3`}
                          value={clientTypesOther}
                          onChange={(e) => setClientTypesOther(e.target.value)}
                          placeholder="Please tell us which client types"
                          maxLength={150}
                        />
                      )}
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
                      key="continue"
                      type="button"
                      onClick={next}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      key="submit"
                      type="button"
                      onClick={submit}
                      disabled={submitting}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                            aria-hidden="true"
                          />
                          Saving…
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  )}
                </div>

                {submitting && (
                  <p
                    className="mt-4 text-[15px] text-muted-foreground"
                    aria-live="polite"
                  >
                    Saving your response — this can take a few seconds.
                  </p>
                )}
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
