import { NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().default(""),
  email: z.string().email(),
  projectType: z.string().max(120).optional().default(""),
  timing: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(5000),
});

const TO_ADDRESSES = (
  process.env.MARKETING_CONTACT_TO ?? "scott@friendsandfamily.tv,jed@friendsandfamily.tv"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, company, email, projectType, timing, message } = parsed.data;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const fromAddr = process.env.EMAIL_FROM ?? gmailUser;

  if (!gmailUser || !gmailPass || !fromAddr) {
    console.warn("[marketing/contact] Email env not configured; logging only", {
      name,
      email,
    });
    return NextResponse.json({ ok: true, dev: true });
  }

  const subject = `New inquiry — ${name}${company ? ` (${company})` : ""}`;
  const text = [
    `Name: ${name}`,
    company ? `Company: ${company}` : null,
    `Email: ${email}`,
    projectType ? `Project type: ${projectType}` : null,
    timing ? `Timing: ${timing}` : null,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
    await transporter.sendMail({
      from: fromAddr,
      to: TO_ADDRESSES.join(", "),
      replyTo: email,
      subject,
      text,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[marketing/contact] send failed", err);
    return NextResponse.json(
      { error: "Failed to send. Please email scott@friendsandfamily.tv directly." },
      { status: 500 },
    );
  }
}
