import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function transcribeGroq(audio: Blob, filename: string): Promise<{ text: string; duration?: number }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "verbose_json");
  form.append("language", "en");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`groq ${res.status}: ${body.slice(0, 200)}`);
  const data = JSON.parse(body);
  return { text: String(data.text || "").trim(), duration: data.duration };
}

async function transcribeOpenAI(audio: Blob, filename: string): Promise<{ text: string; duration?: number }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");

  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`openai ${res.status}: ${body.slice(0, 200)}`);
  const data = JSON.parse(body);
  return { text: String(data.text || "").trim(), duration: data.duration };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const audio = form.get("audio") as Blob | null;
    if (!audio) return NextResponse.json({ error: "audio field missing" }, { status: 400 });

    const preferred = (form.get("provider") as string | null)?.toLowerCase() || "groq";
    const filename =
      (form.get("filename") as string | null) ||
      (audio instanceof File ? audio.name : "audio.webm");

    const order: ("groq" | "openai")[] = preferred === "openai" ? ["openai", "groq"] : ["groq", "openai"];

    let lastErr: string | null = null;
    for (const p of order) {
      try {
        const r = p === "groq" ? await transcribeGroq(audio, filename) : await transcribeOpenAI(audio, filename);
        if (!r.text) continue;
        return NextResponse.json({ text: r.text, duration_s: r.duration, provider: p });
      } catch (e) {
        lastErr = String(e);
      }
    }

    return NextResponse.json(
      { error: "stt failed", detail: lastErr || "all providers failed" },
      { status: 502 }
    );
  } catch (e) {
    return NextResponse.json({ error: "bad request", detail: String(e) }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    providers_configured: {
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    hint: "POST multipart { audio: Blob, provider?: 'groq'|'openai' }",
  });
}
