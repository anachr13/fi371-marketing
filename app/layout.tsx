import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
  title: "Fi371 — AI-Native Audit Automation Platform",
  description:
    "Close audit engagements in days, not weeks. AI-native audit automation for solo, small and mid-sized firms.",
  openGraph: {
    type: "website",
    title: "Fi371 — AI-Native Audit Automation Platform",
    description:
      "Close audit engagements in days, not weeks. AI-native audit automation for solo, small and mid-sized firms.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fi371 — AI-Native Audit Automation Platform",
    description:
      "Close audit engagements in days, not weeks. AI-native audit automation for solo, small and mid-sized firms.",
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
