import { NextRequest, NextResponse } from "next/server";

type Brain = "gemma" | "claude" | "gpt";

function brainTag(b: Brain) {
  return b === "gemma" ? "[local·gemma-4]" : b === "claude" ? "[api·opus-4.7]" : "[api·gpt-4o]";
}

function compose(text: string, brain: Brain, provider: string) {
  const tag = brainTag(brain);
  const t = text.toLowerCase();
  if (t.includes("help") || t.includes("?")) {
    return `${tag} sovereign swarm online — seed growth via right panel, or teleport via terminal (backtick).`;
  }
  if (t.includes("trial") || t.includes("beta")) {
    return `${tag} dispatch an /api/trial/issue call — you'll get a 7-day sovereign key on ${provider}.`;
  }
  if (t.includes("price") || t.includes("cost") || t.includes("10")) {
    return `${tag} sovereign tier runs 10/mo — first 7 days free, no card. pro swarm at 99/mo when you need the full hive.`;
  }
  if (t.includes("who") || t.includes("what")) {
    return `${tag} B.L.A.S.T. — a sovereign swarm of agents running intelligence, outreach, and growth 24/7. you command via this channel.`;
  }
  return `${tag} logged on ${provider}: "${text.slice(0, 120)}" · swarm routing reply…`;
}

export async function POST(req: NextRequest) {
  let body: { provider?: string; brain?: Brain; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { provider = "global", brain = "gemma", text = "" } = body;
  if (!text.trim()) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }
  return NextResponse.json({
    author: `SWARM-${brain.toUpperCase()}`,
    brain,
    provider,
    reply: compose(text, brain, provider),
  });
}
