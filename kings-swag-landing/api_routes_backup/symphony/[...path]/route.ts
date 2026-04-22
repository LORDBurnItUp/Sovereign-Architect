import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SOVEREIGN_SYMPHONY_URL || "http://127.0.0.1:5055";

async function forward(req: NextRequest, pathParts: string[]) {
  const subpath = pathParts.join("/");
  const qs = req.nextUrl.search || "";
  const url = `${BASE}/symphony/${subpath}${qs}`;
  const init: RequestInit = { method: req.method };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    init.body = body;
    init.headers = { "content-type": req.headers.get("content-type") || "application/json" };
  }

  try {
    const res = await fetch(url, init);
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: res.status, headers: { "content-type": contentType } });
  } catch (e) {
    return NextResponse.json(
      {
        error: "symphony offline",
        detail: String(e),
        hint: `start sovereign_symphony: python -m sovereign_symphony.main (expected at ${BASE})`,
      },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params.path);
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx.params.path);
}
