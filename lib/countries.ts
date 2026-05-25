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

// Flag emoji per country, used only as a visual prefix in the dropdown label.
// The saved value stays the plain country name. "Other" intentionally has none.
export const COUNTRY_FLAGS: Record<string, string> = {
  Austria: "🇦🇹", Belgium: "🇧🇪", Bulgaria: "🇧🇬", Croatia: "🇭🇷", Cyprus: "🇨🇾",
  Czechia: "🇨🇿", Denmark: "🇩🇰", Estonia: "🇪🇪", Finland: "🇫🇮", France: "🇫🇷",
  Germany: "🇩🇪", Greece: "🇬🇷", Hungary: "🇭🇺", Ireland: "🇮🇪", Italy: "🇮🇹",
  Latvia: "🇱🇻", Lithuania: "🇱🇹", Luxembourg: "🇱🇺", Malta: "🇲🇹", Netherlands: "🇳🇱",
  Poland: "🇵🇱", Portugal: "🇵🇹", Romania: "🇷🇴", Slovakia: "🇸🇰", Slovenia: "🇸🇮",
  Spain: "🇪🇸", Sweden: "🇸🇪",
  "United Kingdom": "🇬🇧", Switzerland: "🇨🇭", Norway: "🇳🇴", Iceland: "🇮🇸",
  Liechtenstein: "🇱🇮", "United States": "🇺🇸", Canada: "🇨🇦", Australia: "🇦🇺",
  "New Zealand": "🇳🇿", "United Arab Emirates": "🇦🇪", "South Africa": "🇿🇦",
  India: "🇮🇳", Singapore: "🇸🇬",
};

// ISO 3166-1 alpha-2 code -> country name, for pre-filling from the visitor's
// location. Vercel sets the `x-vercel-ip-country` header at the edge (uppercase
// code); we map it to one of our option names. Only the countries we offer are
// listed — an unknown code leaves the field blank.
export const CODE_TO_COUNTRY: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", HR: "Croatia", CY: "Cyprus",
  CZ: "Czechia", DK: "Denmark", EE: "Estonia", FI: "Finland", FR: "France",
  DE: "Germany", GR: "Greece", HU: "Hungary", IE: "Ireland", IT: "Italy",
  LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", MT: "Malta", NL: "Netherlands",
  PL: "Poland", PT: "Portugal", RO: "Romania", SK: "Slovakia", SI: "Slovenia",
  ES: "Spain", SE: "Sweden",
  GB: "United Kingdom", CH: "Switzerland", NO: "Norway", IS: "Iceland",
  LI: "Liechtenstein", US: "United States", CA: "Canada", AU: "Australia",
  NZ: "New Zealand", AE: "United Arab Emirates", ZA: "South Africa",
  IN: "India", SG: "Singapore",
};
