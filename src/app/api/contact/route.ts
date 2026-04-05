// app/api/contact/route.ts
// Sends form submissions to CONTACT_EMAIL via Nodemailer + Gmail SMTP
//
// .env.local:
//   GMAIL_USER=your-gmail@gmail.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
//   CONTACT_EMAIL=team@veltrex.co.in

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  // ── 1. Parse & validate body ──────────────────────────────────────────────
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const company = body.company?.trim() ?? "";
  const budget = body.budget?.trim() ?? "";
  const projectType = body.projectType?.trim() ?? "";

  // Debug log to help trace 400 errors
  console.log("📬 Contact form submission:", { name, email, hasMessage: !!message });

  if (!name || !email || !message) {
    console.warn("❌ Validation failed — missing:", { name: !name, email: !email, message: !message });
    return NextResponse.json(
      { error: "Name, email, and project details are required." },
      { status: 400 }
    );
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // ── 2. Validate env ───────────────────────────────────────────────────────
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const contactEmail = process.env.CONTACT_EMAIL ?? "team@veltrex.co.in";

  if (!gmailUser || !gmailPass) {
    console.error("❌ GMAIL_USER or GMAIL_APP_PASSWORD missing in .env.local");
    return NextResponse.json(
      { error: "Email service not configured. Please contact us at team@veltrex.co.in" },
      { status: 500 }
    );
  }

  // ── 3. Build and send email ───────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      background:#050709;
      color:#e8e4de;
      margin:0;
      padding:0
    }

    .w{
      max-width:600px;
      margin:0 auto;
      padding:40px 24px
    }

    .hdr{
      border-bottom:1px solid rgba(200,169,126,0.25);
      padding-bottom:24px;
      margin-bottom:32px
    }

    .logo{
      font-size:22px;
      font-weight:900;
      letter-spacing:-0.04em;
      color:#fff
    }

    .logo span{
      color:#c8a97e
    }

    .badge{
      display:inline-block;
      background:rgba(200,169,126,0.08);
      border:1px solid rgba(200,169,126,0.25);
      color:#c8a97e;
      font-size:10px;
      font-weight:700;
      letter-spacing:0.18em;
      text-transform:uppercase;
      padding:4px 12px;
      border-radius:100px;
      margin-top:8px
    }

    .lbl{
      font-size:10px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.18em;
      color:rgba(255,255,255,0.25);
      margin-bottom:6px;
      margin-top:20px
    }

    .box{
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:12px;
      padding:14px 18px
    }

    .val{
      color:#e8e4de;
      font-size:15px;
      line-height:1.6
    }

    .val a{
      color:#c8a97e;
      text-decoration:none
    }

    .pill{
      display:inline-block;
      background:rgba(200,169,126,0.12);
      border:1px solid rgba(200,169,126,0.25);
      color:#e8c89a;
      font-size:11px;
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:0.14em;
      padding:3px 10px;
      border-radius:100px;
      margin-right:6px
    }

    .ftr{
      border-top:1px solid rgba(255,255,255,0.05);
      margin-top:32px;
      padding-top:20px;
      font-size:12px;
      color:rgba(255,255,255,0.25)
    }

    .cta{
      display:inline-block;
      background:linear-gradient(135deg,#c8a97e,#e8c89a,#a07848);
      color:#050709;
      font-weight:700;
      font-size:13px;
      padding:12px 24px;
      border-radius:100px;
      text-decoration:none;
      margin-top:24px
    }
  </style>
</head>

<body>
<div class="w">

  <div class="hdr">
    <div class="logo">VELTREX<span>.DEVS</span></div>
    <div class="badge">New Project Enquiry</div>
  </div>

  <div class="lbl">From</div>
  <div class="box">
    <div class="val"><strong>${name}</strong></div>
    <div class="val"><a href="mailto:${email}">${email}</a></div>
    ${company ? `<div class="val" style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:4px">${company}</div>` : ""}
  </div>

  ${projectType ? `
  <div class="lbl">Project Type</div>
  <div class="box">
    <span class="pill">${projectType}</span>
  </div>` : ""}

  ${budget ? `
  <div class="lbl">Budget</div>
  <div class="box">
    <span class="pill">${budget}</span>
  </div>` : ""}

  <div class="lbl">Project Details</div>
  <div class="box">
    <div class="val" style="white-space:pre-wrap">
      ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
    </div>
  </div>

  <a href="mailto:${email}?subject=Re: Your project enquiry — Veltrex.Devs" class="cta">
    Reply to ${name} →
  </a>

  <div class="ftr">
    Sent from Veltrex.Devs contact form &nbsp;·&nbsp;
    ${new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "long",
      timeStyle: "short"
    })} IST
  </div>

</div>
</body>
</html>`;
  try {
    await transporter.sendMail({
      from: `"Veltrex.Devs Website" <${gmailUser}>`,
      to: contactEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `New enquiry from ${name}${company ? ` · ${company}` : ""}${projectType ? ` — ${projectType}` : ""}`,
      html: htmlBody,
      text: [
        "New project enquiry — Veltrex.Devs",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        company && `Company: ${company}`,
        projectType && `Project type: ${projectType}`,
        budget && `Budget: ${budget}`,
        "",
        "Message:",
        message,
      ].filter(Boolean).join("\n"),
    });

    console.log("✅ Email sent successfully to", contactEmail);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Nodemailer error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Failed to send. Please email team@veltrex.co.in directly." },
      { status: 500 }
    );
  }
}