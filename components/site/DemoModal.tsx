"use client";

// Demo request modal used by the marketing site (homepage + legal pages).

import { useState } from "react";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DemoModal({ open, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [firmSize, setFirmSize] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          workEmail: email,
          company,
          firmSize,
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

  const handleClose = () => {
    onClose();
    setSubmitted(false);
    setSubmitting(false);
    setError("");
    setName("");
    setEmail("");
    setCompany("");
    setFirmSize("");
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-background border border-border rounded-xl p-[50px] w-full max-w-[600px] mx-8 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground text-2xl px-2.5"
        >
          &times;
        </button>

        {!submitted ? (
          <>
            <h3 className="font-display text-[35px] mb-1">Request a demo</h3>
            <p className="text-[17px] text-muted-foreground mb-10">30-minute walkthrough tailored to your firm&apos;s workflow. No commitment.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-base font-medium mb-1">Full name</label>
                <input className="w-full px-[18px] py-3 bg-background border-2 border-border rounded-lg text-[19px] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors" placeholder="Jane Smith" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-1">Work email</label>
                <input className="w-full px-[18px] py-3 bg-background border-2 border-border rounded-lg text-[19px] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors" type="email" placeholder="jane@yourfirm.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-1">Firm name</label>
                <input className="w-full px-[18px] py-3 bg-background border-2 border-border rounded-lg text-[19px] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors" placeholder="Smith & Associates" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-1">Firm size</label>
                <select className="w-full px-[18px] py-3 bg-background border-2 border-border rounded-lg text-[19px] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors" value={firmSize} onChange={(e) => setFirmSize(e.target.value)}>
                  <option value="">Select firm size</option>
                  <option value="solo">Solo practitioner</option>
                  <option value="small">2-10 people</option>
                  <option value="mid">11-50 people</option>
                  <option value="large">51-200 people</option>
                  <option value="enterprise">200+ people</option>
                </select>
              </div>
              {error && <p className="text-[17px] text-red-500 mb-3">{error}</p>}
              <button type="submit" disabled={submitting} className="w-full mt-5 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? "Requesting..." : "Request a Demo"}
              </button>
              <p className="text-[15px] text-muted-foreground mt-2 text-center">We&apos;ll respond within 24 hours</p>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-[60px] h-[60px] rounded-full bg-primary inline-flex items-center justify-center text-[30px] mb-5">&#10003;</div>
            <h3 className="font-display text-[30px] mb-3">You&apos;re registered, {name}!</h3>
            <p className="text-[17px] text-muted-foreground mb-8">We&apos;ll send a confirmation to your email within 24 hours. You can also pick a time that works best for your firm now.</p>
            <a href="https://calendar.app.google/jSkPQpWzB4VUqvK48" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">Pick a Time</a>
          </div>
        )}
      </div>
    </div>
  );
}
