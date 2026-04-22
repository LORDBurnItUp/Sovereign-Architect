import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Provider = "discord" | "telegram" | "whatsapp" | "messenger" | "global";

type Msg = {
  id: string;
  provider: Provider;
  author: string;
  handle?: string;
  text: string;
  ts: string;
  kind?: "user" | "agent" | "seed" | "system";
};

function fmt(d: Date) {
  return d.toTimeString().slice(0, 8);
}

function seedFor(p: Provider): Msg[] {
  const now = Date.now();
  const ago = (s: number) => fmt(new Date(now - s * 1000));
  return [
    { id: `${p}-seed-1`, provider: p, author: "DOUGLAS", kind: "agent", text: "◈ sovereign neural link synced · channel armed", ts: ago(720) },
    { id: `${p}-seed-2`, provider: p, author: "HERMES", kind: "seed", text: "◆ Dubai brokers: $50 flat Sovereign Gateway intro live · 7-day beta · drop ✦ to claim", ts: ago(420) },
    { id: `${p}-seed-3`, provider: p, author: "cipher_42", handle: "cipher_42", kind: "user", text: "how do i get sovereign beta?", ts: ago(220) },
    { id: `${p}-seed-4`, provider: p, author: "TRAVIS", kind: "agent", text: "drop ✦ in thread — issuing free 7-day sovereign keys to first 12 responders.", ts: ago(90) },
  ];
}

export async function GET(req: NextRequest) {
  const provider = (req.nextUrl.searchParams.get("provider") || "global") as Provider;
  const valid: Provider[] = ["discord", "telegram", "whatsapp", "messenger", "global"];
  if (!valid.includes(provider)) {
    return NextResponse.json({ error: "invalid provider" }, { status: 400 });
  }
  return NextResponse.json(seedFor(provider));
}
