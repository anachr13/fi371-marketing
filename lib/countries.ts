// Country options for the survey country field. EU/EEA countries are surfaced
// first (Fi371 is EU-first GTM), then other common markets, then "Other".
// Consumed by app/survey/240526/SurveyContent.tsx.

export const EU_COUNTRIES: string[] = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
  "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
  "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden",
];

export const OTHER_COUNTRIES: string[] = [
  "United Kingdom", "Switzerland", "Norway", "Iceland", "Liechtenstein",
  "United States", "Canada", "Australia", "New Zealand",
  "United Arab Emirates", "South Africa", "India", "Singapore", "Other",
];
