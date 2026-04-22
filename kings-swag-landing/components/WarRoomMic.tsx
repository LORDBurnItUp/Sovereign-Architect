"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Radio, Loader2, Zap } from "lucide-react";
import { getApiUrl } from "@/lib/api-config";

type General = { slug: string; display_name: string };

type Transcript = {
  text: string;
  provider: string;
  at: string;
  routed_to?: string;
  dispatched?: boolean;
  error?: string;
};

const KNOWN_GENERALS = [
  "overlord", "hermes", "douglas", "sentinel", "khan", "travis", "aureus",
  "openclaw_infra", "openclaw_strategy",
];

function detectGeneral(text: string): string | null {
  const lower = text.toLowerCase();
  // Matches "hermes, ...", "hey khan", "/speak douglas ...", etc.
  for (const g of KNOWN_GENERALS) {
    const re = new RegExp(`\\b${g.replace("_", "[_ ]?")}\\b`, "i");
    if (re.test(lower)) return g;
  }
  return null;
}

function detectPulse(text: string): string | null {
  const m = text.toLowerCase().match(/\bpulse\b[:\s]*([a-z\-]+)/);
  if (!m) return null;
  const candidate = m[1].replace(/[^a-z\-]/g, "");
  if (["dubai-blitz", "dubai", "blitz", "baja", "baja-ensenada", "ensenada", "general"].includes(candidate)) {
    return candidate.startsWith("dubai") ? "dubai-blitz" :
           candidate.startsWith("baja") || candidate === "ensenada" ? "baja-ensenada" :
           candidate === "general" ? "general" : "dubai-blitz";
  }
  return null;
}

export default function WarRoomMic() {
  const [active, setActive] = useState(false);
  const [level, setLevel] = useState<number[]>(Array(24).fill(0));
  const [transcribing, setTranscribing] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [history, setHistory] = useState<Transcript[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch {}
      ctxRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setLevel(Array(24).fill(0));
  }, []);

  const dispatchTranscript = useCallback(async (text: string): Promise<{ routed_to: string; dispatched: boolean; error?: string }> => {
    const pulseFocus = detectPulse(text);
    if (pulseFocus) {
      try {
        const r = await fetch(getApiUrl("/api/symphony/pulse"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ focus: pulseFocus }),
        });
        const data = await r.json();
        if (!r.ok) return { routed_to: `pulse/${pulseFocus}`, dispatched: false, error: data.detail || JSON.stringify(data) };
        return { routed_to: `pulse/${pulseFocus}`, dispatched: true };
      } catch (e) {
        return { routed_to: `pulse/${pulseFocus}`, dispatched: false, error: String(e) };
      }
    }

    const general = detectGeneral(text);
    if (general) {
      try {
        const r = await fetch(getApiUrl("/api/symphony/speak"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ general, text }),
        });
        const data = await r.json();
        if (!r.ok) return { routed_to: general, dispatched: false, error: data.detail || JSON.stringify(data) };
        return { routed_to: general, dispatched: true };
      } catch (e) {
        return { routed_to: general, dispatched: false, error: String(e) };
      }
    }

    try {
      const r = await fetch(getApiUrl("/api/symphony/broadcast"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) return { routed_to: "broadcast", dispatched: false, error: data.detail || JSON.stringify(data) };
      return { routed_to: "broadcast", dispatched: true };
    } catch (e) {
      return { routed_to: "broadcast", dispatched: false, error: String(e) };
    }
  }, []);

  const handleBlob = useCallback(async (blob: Blob) => {
    setTranscribing(true);
    setErr(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "warroom.webm");
      const r = await fetch(getApiUrl("/api/stt"), { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.detail || data.error || `stt ${r.status}`);
        return;
      }
      const text: string = String(data.text || "").trim();
      if (!text) {
        setErr("no speech detected — try again");
        return;
      }
      setTranscribing(false);
      setDispatching(true);
      const route = await dispatchTranscript(text);
      setHistory((h) => [
        { text, provider: data.provider, at: new Date().toTimeString().slice(0, 8), ...route },
        ...h,
      ].slice(0, 10));
      if (route.error) setErr(route.error);
    } catch (e) {
      setErr(String(e));
    } finally {
      setTranscribing(false);
      setDispatching(false);
    }
  }, [dispatchTranscript]);

  const start = useCallback(async () => {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bins = analyser.frequencyBinCount;
      const data = new Uint8Array(bins);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        const slice = Array.from(data.slice(0, 24)).map((v) => v / 255);
        setLevel(slice);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        stopStream();
        if (blob.size > 200) {
          await handleBlob(blob);
        } else {
          setErr("audio too short — hold to speak");
        }
      };
      rec.start();
      recRef.current = rec;
      setActive(true);
    } catch (e) {
      setErr(`mic access failed: ${e}`);
      stopStream();
    }
  }, [handleBlob, stopStream]);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== "inactive") {
      recRef.current.stop();
    }
    recRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => () => {
    try { recRef.current?.stop(); } catch {}
    stopStream();
  }, [stopStream]);

  const busy = transcribing || dispatching;

  return (
    <div className="glass-panel sovereign-border p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-orbitron text-lg font-black text-gold uppercase tracking-widest">
            🎙️ War Room Mic
          </h2>
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-1">
            voice → whisper → symphony · say a general&apos;s name to target
          </p>
        </div>
        <div className={`font-mono text-[9px] tracking-widest uppercase ${active ? "text-alert" : "text-white/30"}`}>
          {active ? "● LIVE" : "◯ IDLE"}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="relative w-28 h-28">
          <div className={`absolute inset-0 rounded-full border-4 ${active ? "border-alert/40 animate-pulse" : "border-gold/20"}`} />
          <div className={`absolute inset-3 rounded-full border-4 ${active ? "border-alert/60" : "border-cyan/20"}`}
               style={{ animation: active ? "pulse 1.2s ease-in-out infinite" : "none", animationDelay: "0.15s" }} />
          <button
            onClick={active ? stop : start}
            disabled={busy}
            className={`absolute inset-6 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
              active
                ? "bg-alert/20 border-2 border-alert text-alert shadow-[0_0_30px_rgba(255,49,49,0.5)]"
                : "bg-gold/10 border-2 border-gold text-gold hover:bg-gold/20"
            }`}
            aria-label={active ? "stop recording" : "start recording"}
          >
            {busy ? <Loader2 size={34} className="animate-spin" /> : active ? <MicOff size={34} /> : <Mic size={34} />}
          </button>
        </div>

        <div className="flex items-end gap-[2px] h-12 w-full max-w-[280px] mx-auto">
          {level.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${active ? "bg-gradient-to-t from-alert/70 to-gold" : "bg-white/10"}`}
              style={{
                height: `${Math.max(4, v * 100)}%`,
                transition: "height 60ms ease-out",
                opacity: active ? 0.5 + v * 0.5 : 0.3,
              }}
            />
          ))}
        </div>

        <div className="font-mono text-[10px] tracking-widest uppercase text-white/60 min-h-[14px]">
          {active ? "LISTENING… tap to end" :
           transcribing ? "TRANSCRIBING (whisper)…" :
           dispatching ? "DISPATCHING TO SYMPHONY…" :
           "tap mic · say: ‘Khan, lead status on Baja’ / ‘broadcast…’ / ‘pulse dubai blitz’"}
        </div>
      </div>

      {err && (
        <div className="mb-3 p-2 border border-alert/40 bg-alert/10 text-alert font-mono text-[11px]">
          ✖ {err}
        </div>
      )}

      {!!history.length && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="hud-label mb-2 flex items-center gap-2">
            <Radio size={10} /> Transcripts
          </div>
          <div className="space-y-2 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div key={i} className={`p-2 border ${h.dispatched ? "border-matrix/30 bg-matrix/[0.03]" : "border-alert/30 bg-alert/[0.05]"}`}>
                <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest uppercase">
                  <Zap size={10} className={h.dispatched ? "text-matrix" : "text-alert"} />
                  <span className="text-white/40">{h.at}</span>
                  <span className="text-white/30">· {h.provider}</span>
                  <span className="text-gold">→ {h.routed_to || "?"}</span>
                  {!h.dispatched && <span className="text-alert">· failed</span>}
                </div>
                <div className="text-[12px] text-white/85 mt-1 font-mono">{h.text}</div>
                {h.error && <div className="text-[10px] text-alert/80 mt-1 font-mono truncate">{h.error}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
