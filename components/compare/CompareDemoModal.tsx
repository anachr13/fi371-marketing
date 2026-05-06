"use client";
import { useState } from "react";
import { X } from "lucide-react";
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
import { toast } from "sonner";

interface CompareDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const CompareDemoModal = ({ open, onClose }: CompareDemoModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Demo request submitted! We'll be in touch shortly.");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-2xl font-bold text-foreground mb-2">Book a Demo</h3>
        <p className="text-sm text-muted-foreground mb-6">
          See how we compare to your current audit stack.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cmp-name" className="text-foreground">Full name</Label>
            <Input id="cmp-name" required placeholder="Jane Smith" className="mt-1.5 bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <Label htmlFor="cmp-email" className="text-foreground">Work email</Label>
            <Input id="cmp-email" type="email" required placeholder="jane@auditfirm.com" className="mt-1.5 bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <Label htmlFor="cmp-company" className="text-foreground">Company name</Label>
            <Input id="cmp-company" required placeholder="Your firm" className="mt-1.5 bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <Label className="text-foreground">Firm size</Label>
            <Select>
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
          </div>
          <div>
            <Label className="text-foreground">Current audit volume</Label>
            <Select>
              <SelectTrigger className="mt-1.5 bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">1–20 engagements / year</SelectItem>
                <SelectItem value="mid">21–100 engagements / year</SelectItem>
                <SelectItem value="high">100+ engagements / year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Current audit stack</Label>
            <Select>
              <SelectTrigger className="mt-1.5 bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select current tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caseware">Caseware</SelectItem>
                <SelectItem value="other-legacy">Other legacy platform</SelectItem>
                <SelectItem value="spreadsheets">Spreadsheets / manual</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Interest in crypto audits</Label>
            <Select>
              <SelectTrigger className="mt-1.5 bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, actively exploring</SelectItem>
                <SelectItem value="planning">Planning for the future</SelectItem>
                <SelectItem value="no">Not at this time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cmp-note" className="text-foreground">Optional note</Label>
            <Textarea id="cmp-note" placeholder="Anything else you'd like us to know?" className="mt-1.5 bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none" rows={3} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full gradient-cta text-primary-foreground font-semibold border-0 hover:opacity-90 transition-opacity">
            {submitting ? "Submitting..." : "Submit Demo Request"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompareDemoModal;
