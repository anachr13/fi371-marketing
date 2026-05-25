import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

// Mirrors app/api/demo-request/route.ts. Required: role, firmType, country.
// `website` is a honeypot: bots fill it, humans never see it, so a non-empty
// value means spam and we silently discard it.
const schema = z.object({
  timeLost: z.string().trim().max(2000).optional().default(""),
  aiUsage: z.string().trim().max(2000).optional().default(""),
  role: z.string().trim().min(1, "Please select your role").max(100),
  firmType: z.string().trim().min(1, "Please select your firm type").max(100),
  country: z.string().trim().min(1, "Please select your country").max(100),
  clientTypes: z.array(z.string().max(100)).max(30).optional().default([]),
  repetitiveParts: z.array(z.string().max(100)).max(30).optional().default([]),
  contactName: z.string().trim().max(120).optional().default(""),
  contactEmail: z
    .union([z.string().trim().email(), z.literal("")])
    .optional()
    .default(""),
  contactFirm: z.string().trim().max(150).optional().default(""),
  earlyAccess: z.boolean().optional().default(false),
  website: z.string().max(0).optional().default(""), // honeypot
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      // If only the honeypot tripped, fake success so bots learn nothing.
      const onlyHoneypot = result.error.issues.every(
        (i) => i.path[0] === "website"
      );
      if (onlyHoneypot) {
        return NextResponse.json({ success: true });
      }
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const webhookUrl = process.env.SURVEY_SHEET_WEBHOOK_URL;
    const sharedSecret = process.env.SURVEY_SHEET_SHARED_SECRET;
    if (!webhookUrl || !sharedSecret) {
      console.error(
        "Missing SURVEY_SHEET_WEBHOOK_URL or SURVEY_SHEET_SHARED_SECRET"
      );
      return NextResponse.json(
        { error: "Survey is not configured" },
        { status: 500 }
      );
    }

    // Forward to the Apps Script web app, which appends a row to the Sheet.
    // Apps Script always returns HTTP 200, so we also check the JSON body.
    let sheetOk = false;
    try {
      const sheetRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token: sharedSecret }),
      });
      const sheetData = await sheetRes.json().catch(() => ({ ok: false }));
      sheetOk = sheetRes.ok && sheetData.ok === true;
    } catch (err) {
      console.error("Sheet webhook error:", err);
    }

    if (!sheetOk) {
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 502 }
      );
    }

    // Best-effort notification email — failure here must not fail the request.
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `New survey response${
          data.contactFirm ? ` — ${data.contactFirm}` : ""
        }`,
        text: [
          "New AI-in-audit survey response:",
          "",
          `Role: ${data.role}`,
          `Firm type: ${data.firmType}`,
          `Country: ${data.country}`,
          `Client types: ${data.clientTypes.join(", ") || "—"}`,
          `Repetitive parts: ${data.repetitiveParts.join(", ") || "—"}`,
          "",
          `Time lost / to automate: ${data.timeLost || "—"}`,
          `AI usage & impact: ${data.aiUsage || "—"}`,
          "",
          `Contact: ${data.contactName || "—"} / ${
            data.contactEmail || "—"
          } / ${data.contactFirm || "—"}`,
          `Early access: ${data.earlyAccess ? "Yes" : "No"}`,
          "",
          `Submitted at: ${new Date().toISOString()}`,
        ].join("\n"),
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Survey submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
