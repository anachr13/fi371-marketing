import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import JsonLd from "@/components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  CONTACT_EMAIL,
} from "@/lib/site";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase lets all relative URL fields (canonical, og:image) resolve to
  // absolute fi371.com URLs — required for correct link previews and canonicals.
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  // Only truly site-wide OG/Twitter fields belong at the root. url/title/
  // description are intentionally omitted: nested metadata is inherited by
  // child routes, so setting them here would make /about, /privacy, /terms emit
  // the homepage's og:url and title. Each page now derives og:title/description
  // from its own title/description instead.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Site-wide structured data. @graph lets the entities cross-reference via @id
// (WebSite + product are published by the Organization), which gives Google and
// AI engines a clean, unambiguous picture of who Fi371 is and what it does.
const orgId = `${SITE_URL}/#organization`;
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": orgId,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      email: CONTACT_EMAIL,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": orgId },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": orgId },
      audience: {
        "@type": "Audience",
        audienceType:
          "Solo, small, and mid-sized accounting and audit firms",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <JsonLd data={siteJsonLd} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
