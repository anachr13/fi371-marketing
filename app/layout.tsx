import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuditAI — AI-Native Audit Automation Platform",
  description:
    "Close audit engagements at the speed of light. AI-native audit automation to reduce audit time and support crypto audits.",
  openGraph: {
    type: "website",
    title: "AuditAI — AI-Native Audit Automation Platform",
    description:
      "Close audit engagements at the speed of light. AI-native audit automation to reduce audit time and support crypto audits.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuditAI — AI-Native Audit Automation Platform",
    description:
      "Close audit engagements at the speed of light. AI-native audit automation to reduce audit time and support crypto audits.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
