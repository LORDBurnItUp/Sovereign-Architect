import { NextRequest, NextResponse } from "next/server";

function randToken() {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `SVR-${hex.slice(0, 4).toUpperCase()}-${hex.slice(4, 8).toUpperCase()}-${hex.slice(8, 12).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  let body: { handle?: string; days?: number };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const handle = body.handle || "anonymous";
  const days = typeof body.days === "number" && body.days > 0 && body.days <= 30 ? body.days : 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const token = randToken();

  // TODO: persist to trial ledger; wire gate check in /api/me/trial/verify
  return NextResponse.json({
    handle,
    token,
    days,
    issued: new Date().toISOString(),
    expires: expiresAt.toISOString().slice(0, 19).replace("T", " "),
    tier: "sovereign-beta",
  });
}
