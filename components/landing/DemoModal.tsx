"use client";
import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(2, "Company name required").max(120),
  firmSize: z.string().min(1, "Select your firm size"),
  note: z.string().trim().max(1000).optional(),
});

const initial = { name: "", email: "", company: "", firmSize: "", note: "" };

const DemoModal = ({ open, onClose }: DemoModalProps) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm(initial);
        setErrors({});
        setSubmitted(false);
      }, 200);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const update = (key: keyof typeof initial, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-title"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">You're booked in.</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We'll reply within 1 business day to schedule your 30-minute demo.
            </p>
            <Button onClick={onClose} className="gradient-cta text-primary-foreground border-0">
              Close
            </Button>
          </div>
        ) : (
          <>
            <h3 id="demo-title" className="text-2xl font-bold text-foreground mb-1">Book a demo</h3>
            <p className="text-sm text-muted-foreground mb-6">
              30 minutes. Walked through your firm's workflow.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="name" className="text-foreground">Full name</Label>
                <Input
                  ref={firstFieldRef}
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Smith"
                  className="mt-1.5 bg-secondary border-border text-foreground"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jane@auditfirm.com"
                  className="mt-1.5 bg-secondary border-border text-foreground"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="company" className="text-foreground">Company name</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="Your firm"
                  className="mt-1.5 bg-secondary border-border text-foreground"
                />
                {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
              </div>

              <div>
                <Label className="text-foreground">Firm size</Label>
                <Select value={form.firmSize} onValueChange={(v) => update("firmSize", v)}>
                  <SelectTrigger className="mt-1.5 bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Select firm size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo practitioner</SelectItem>
                    <SelectItem value="small">2–10 people</SelectItem>
                    <SelectItem value="mid">11–50 people</SelectItem>
                    <SelectItem value="large">51–200 people</SelectItem>
                    <SelectItem value="enterprise">200+ people</SelectItem>
                  </SelectContent>
                </Select>
                {errors.firmSize && <p className="text-xs text-destructive mt-1">{errors.firmSize}</p>}
              </div>

              <div>
                <Label htmlFor="note" className="text-foreground">Anything we should know? <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Crypto audits, current stack, timing…"
                  className="mt-1.5 bg-secondary border-border text-foreground resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-95"
              >
                {submitting ? "Booking…" : "Book my demo"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We'll never share your details. Reply within 1 business day.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoModal;
