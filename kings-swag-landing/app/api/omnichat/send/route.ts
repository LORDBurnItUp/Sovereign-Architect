import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Brain = "groq" | "gemma" | "claude" | "gpt" | "grok";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM = (provider: string) =>
  `You are the SOVEREIGN SWARM voice on the ${provider.toUpperCase()} channel of the B.L.A.S.T. Omni-Chat hub.
Ground truth:
- B.L.A.S.T. is a multi-identity AI command center for Dubai / MENA real-estate operations.
- 9 generals (Overlord, Hermes, Douglas, Sentinel, Khan, Travis, Aureus, OpenClaw-Infra, OpenClaw-Strategy).
- Current offer: $50 flat limited-time Sovereign Gateway intro (7-day beta, no card).
- Dubai 2026 context: off-plan ~70-73% share, secondary slowing 30-49% YoY, smaller brokers under pressure.
Style: crisp, 1-3 sentences, no emoji unless the user uses one. Never mention you are an AI. Always end with a concrete next step if one fits.`;

async function callGroq(messages: ChatMsg[]) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: 250, temperature: 0.75 }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function callOpenAI(messages: ChatMsg[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 250, temperature: 0.75 }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function callAnthropic(messages: ChatMsg[]) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const chat = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 250,
      system,
      messages: chat.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.content[0].text.trim();
}

async function callGrok(messages: ChatMsg[]) {
  const key = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (!key) throw new Error("XAI_API_KEY / GROK_API_KEY not set");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "grok-2-latest", messages, max_tokens: 250, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`xai ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

function brainTag(b: Brain) {
  if (b === "grok") return "grok·x-ai";
  if (b === "claude") return "claude·haiku-4.5";
  if (b === "gpt") return "openai·4o-mini";
  return "groq·llama-3.3-70b";
}

export async function POST(req: NextRequest) {
  let body: { provider?: string; brain?: Brain; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const provider = body.provider || "global";
  const brain = (body.brain || "groq").toLowerCase() as Brain;
  const text = (body.text || "").trim();
  if (!text) return NextResponse.json({ error: "empty message" }, { status: 400 });

  const messages: ChatMsg[] = [
    { role: "system", content: SYSTEM(provider) },
    { role: "user", content: text },
  ];

  try {
    let reply: string;
    switch (brain) {
      case "claude":           reply = await callAnthropic(messages); break;
      case "gpt":              reply = await callOpenAI(messages); break;
      case "grok":             reply = await callGrok(messages); break;
      case "groq":
      case "gemma":
      default:                 reply = await callGroq(messages);
    }
    return NextResponse.json({
      author: `SWARM·${brain.toUpperCase()}`,
      brain,
      provider,
      tag: brainTag(brain),
      reply,
    });
  } catch (e) {
    return NextResponse.json(
      {
        author: `SWARM·${brain.toUpperCase()}`,
        brain,
        provider,
        reply: `[${brainTag(brain)}] brain offline: ${String(e).slice(0, 160)} — tip: check the matching API key in .env`,
        error: true,
      },
      { status: 200 }
    );
  }
}
