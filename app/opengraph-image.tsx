// Generated Open Graph share image (1200x630) shown when a fi371.com link is
// posted on LinkedIn, Slack, iMessage, etc. Applied site-wide from the app root.
// Uses the brand's warm-paper palette + chartreuse AI accent (see DESIGN.md).
// Created 2026-05-23.

import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

export const alt =
  "Fi371 — AI-native audit automation. Close audit engagements in days, not weeks.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Renders the static social-share card at build time. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F2EFE5",
          color: "#161412",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#6F675F",
          }}
        >
          AI-Native Audit Automation
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 130, fontWeight: 700, lineHeight: 1 }}>
            Fi371
          </div>
          <div style={{ display: "flex", fontSize: 50, marginTop: 28, maxWidth: 940, lineHeight: 1.12 }}>
            Close audit engagements in days, not weeks.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#6F675F" }}>
            {SITE_URL.replace("https://", "")}
          </div>
          <div
            style={{
              display: "flex",
              background: "#C8FF00",
              color: "#161412",
              fontSize: 24,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 9999,
            }}
          >
            For solo, small &amp; mid-sized firms
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
