import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import { createServerSupabaseClient } from "@/lib/supabase";

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  workEmail: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(2, "Company name required").max(120),
  firmSize: z.string().min(1, "Select your firm size"),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
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

    const { fullName, workEmail, company, firmSize, note } = result.data;

    const supabase = createServerSupabaseClient();
    const { error: dbError } = await supabase.from("demo_requests").insert({
      full_name: fullName,
      work_email: workEmail,
      company,
      firm_size: firmSize,
      note: note || null,
    });

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: "Failed to save request" },
        { status: 500 }
      );
    }

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
        subject: `New Demo Request — ${company}`,
        text: [
          `New demo request received:`,
          ``,
          `Name: ${fullName}`,
          `Email: ${workEmail}`,
          `Company: ${company}`,
          `Firm size: ${firmSize}`,
          note ? `Note: ${note}` : "",
          ``,
          `Submitted at: ${new Date().toISOString()}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Demo request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
