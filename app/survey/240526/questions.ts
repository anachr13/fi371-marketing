// Content config for the /survey/240526 market-research survey. Keeping the
// option arrays + step metadata here (separate from SurveyContent.tsx) makes
// the questions easy to edit and lets a future dated survey reuse the UI.

export const ROLE_OPTIONS = [
  "Audit partner / owner",
  "Audit manager",
  "Senior auditor",
  "Junior auditor",
  "Data / analytics specialist",
  "Accounting / assurance professional",
  "Firm operations / technology lead",
  "Other",
] as const;

export const FIRM_TYPE_OPTIONS = [
  "Audit firm",
  "Accounting firm with audit services",
  "Accounting firm without audit services",
  "Advisory / consulting firm",
  "Internal audit team",
  "Other",
] as const;

export const CLIENT_TYPE_OPTIONS = [
  "Small local businesses",
  "Medium-sized private companies",
  "Large private companies",
  "Listed companies",
  "Banks / financial institutions",
  "Funds / investment entities",
  "Retail / hospitality",
  "Real estate / construction",
  "Technology companies",
  "International groups",
  "Other",
] as const;

export const STEPS = [
  { kicker: "Step 1 of 3", title: "About you" },
  { kicker: "Step 2 of 3", title: "The big questions" },
  { kicker: "Step 3 of 3", title: "About your firm" },
] as const;
