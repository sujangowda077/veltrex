// app/api/chat/route.ts
// Uses Groq API (fast, free tier available)
// .env.local: GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Vexa, the AI assistant for Veltrex.Devs — a product engineering studio based in Bengaluru, India. You help visitors understand our work, projects, and how to get started.

ABOUT VELTREX.DEVS:
- Founded in 2025 by student founders
- Focused on building apps, websites, web apps, and AI-based products
- Early-stage startup working on real-world solutions

PROJECTS:
1. Sidequest — Campus app for ordering food and accessing printout services
2. Onyx — AI-based interview training system to improve communication skills
3. Office Docs — LLM-based system that reads PDFs and answers user questions
4. Timetable Planner — Smart timetable system (currently in development)

SERVICES:
- App Development (Android, iOS, Web Apps)
- Website Development
- AI-based Solutions
- SaaS Product Development

PROCESS:
Idea → Planning → Development → Testing → Launch

PRICING:
- Flexible depending on project scope
- Focused on student/startup-friendly solutions

CONTACT:
- Email: team@veltrex.co.in
- Phone: +91 9632795538
- Do not mention specific prices or costs unless explicitly asked. Keep responses focused on value and solutions.
TONE: Friendly, clear, and helpful. Keep replies short (2–4 sentences). Always guide the user toward contacting us or discussing their idea.`;
export async function POST(req: NextRequest) {
  // ── 1. Validate API key ───────────────────────────────────────────────────
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.error("❌ GROQ_API_KEY missing in .env.local");
    return NextResponse.json(
      { message: "AI service not configured. Please email team@veltrex.co.in" },
      { status: 200 }
    );
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let messages: { role: string; content: string }[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("invalid");
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  // ── 3. Call Groq API ──────────────────────────────────────────────────────
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",   // fast, free-tier friendly
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10),        // keep last 10 for context window
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ Groq API error (${response.status}):`, err);

      const clientMsg =
        response.status === 401
          ? "Authentication error. Please email team@veltrex.co.in"
          : response.status === 429
          ? "I'm a bit busy right now! Email team@veltrex.co.in for a faster response."
          : "I'm having trouble connecting. Please email team@veltrex.co.in";

      return NextResponse.json({ message: clientMsg }, { status: 200 });
    }

    const data = await response.json();
    const text =
      data?.choices?.[0]?.message?.content ??
      "Sorry, I didn't catch that. Please email team@veltrex.co.in";

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("❌ Chat route error:", error?.message ?? error);
    return NextResponse.json(
      { message: "Network error. Please email team@veltrex.co.in — we respond within 4 hours." },
      { status: 200 }
    );
  }
}