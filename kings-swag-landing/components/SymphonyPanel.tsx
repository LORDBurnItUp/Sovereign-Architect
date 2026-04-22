"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Send, Loader2, Megaphone, Radio } from "lucide-react";

type General = {
  slug: string;
  display_name: string;
  rank: string;
  division: string;
  style: string;
  color: string;
};

type Status = {
  roster: {
    live: { slug: string; display_name: string; ready: boolean; user: string | null }[];
    missing_tokens: string[];
    ffmpeg: boolean;
  };
  queue: {
    depth: number;
    current: { id: string; general: string; text: string } | null;
    history: { id: string; general: string; text: string; status: string; duration_s: number }[];
  };
  eleven_pool: { keys_total: number; keys_usable: number; model: string };
  ffmpeg: boolean;
};

export default function SymphonyPanel() {
  const [generals, setGenerals] = useState<General[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchRoster = useCallback(async () => {
    try {
      const [g, s] = await Promise.all([
        fetch("/api/symphony/generals").then((r) => r.json()),
        fetch("/api/symphony/status").then((r) => r.json()),
      ]);
      if (Array.isArray(g.generals)) {
        setGenerals(g.generals);
        if (!selected && g.generals.length) setSelected(g.generals[0].slug);
      }
      setStatus(s);
      setErr(null);
    } catch (e) {
      setErr("symphony api unreachable — start `python -m sovereign_symphony.main`");
    }
  }, [selected]);

  useEffect(() => {
    fetchRoster();
    const t = setInterval(fetchRoster, 3000);
    return () => clearInterval(t);
  }, [fetchRoster]);

  const speak = useCallback(async () => {
    if (!text.trim() || !selected) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/symphony/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ general: selected, text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || data.error || `status ${r.status}`);
      setText("");
      await fetchRoster();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }, [text, selected, fetchRoster]);

  const broadcast = useCallback(async () => {
    if (!text.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/symphony/broadcast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || data.error || `status ${r.status}`);
      setText("");
      await fetchRoster();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }, [text, fetchRoster]);

  const liveSlugs = useMemo(
    () => new Set(status?.roster.live.map((b) => b.slug) ?? []),
    [status]
  );

  return (
    <div className="glass-panel sovereign-border p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-orbitron text-lg font-black text-gold uppercase tracking-widest">
            🎼 Sovereign Symphony
          </h3>
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-1">
            Multi-identity generals · ElevenLabs TTS · no-overlap queue
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-matrix">
            ◉ {status?.roster.live.filter((b) => b.ready).length ?? 0}/{status?.roster.live.length ?? 0} online
          </span>
          <span className={status?.ffmpeg ? "text-matrix" : "text-amber-300"}>
            ffmpeg: {status?.ffmpeg ? "yes" : "no (mp3 attach mode)"}
          </span>
          <span className="text-cyan">
            tts keys: {status?.eleven_pool.keys_usable ?? "?"}/{status?.eleven_pool.keys_total ?? "?"}
          </span>
        </div>
      </div>

      {err && (
        <div className="p-3 border border-alert/50 bg-alert/10 text-alert font-mono text-xs">
          ✖ {err}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {generals.map((g) => {
          const isLive = liveSlugs.has(g.slug);
          const isSelected = selected === g.slug;
          return (
            <button
              key={g.slug}
              onClick={() => setSelected(g.slug)}
              disabled={!isLive}
              className={`text-left p-3 border transition-all ${
                isSelected
                  ? "border-gold bg-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                  : isLive
                  ? "border-white/10 bg-white/[0.015] hover:border-gold/30"
                  : "border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed"
              }`}
              style={{ borderLeftWidth: 3, borderLeftColor: g.color }}
            >
              <div className="flex items-center justify-between">
                <span className="font-orbitron text-[11px] font-black uppercase tracking-widest" style={{ color: g.color }}>
                  {g.display_name}
                </span>
                <span className={`w-2 h-2 rounded-full ${isLive ? "bg-matrix anim-pulse-matrix" : "bg-white/20"}`} />
              </div>
              <div className="font-mono text-[9px] text-white/40 mt-1 uppercase tracking-widest">
                {g.rank} · {g.division}
              </div>
              <div className="font-mono text-[9px] text-white/30 mt-1 italic truncate">
                {g.style}
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gold/10 pt-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={selected ? `script for ${selected.toUpperCase()}...` : "select a general"}
          rows={3}
          className="w-full bg-black/40 border border-white/10 focus:border-gold/50 outline-none text-white text-sm font-mono p-3 placeholder:text-white/20 resize-none"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={speak}
            disabled={busy || !text.trim() || !selected || !liveSlugs.has(selected)}
            className="px-4 py-2 bg-gold/10 border border-gold/40 text-gold font-orbitron text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            {busy ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            Speak as {selected.toUpperCase() || "—"}
          </button>
          <button
            onClick={broadcast}
            disabled={busy || !text.trim() || liveSlugs.size === 0}
            className="px-4 py-2 bg-cyan/10 border border-cyan/40 text-cyan font-orbitron text-[10px] font-bold uppercase tracking-widest hover:bg-cyan/20 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            <Megaphone size={11} /> Broadcast to all
          </button>
          <span className="ml-auto font-mono text-[10px] text-white/40 tracking-widest uppercase">
            queue depth: <span className="text-gold">{status?.queue.depth ?? 0}</span>
            {status?.queue.current && (
              <> · now: <span className="text-matrix">{status.queue.current.general}</span></>
            )}
          </span>
        </div>
      </div>

      {!!status?.roster.missing_tokens.length && (
        <div className="p-3 border border-amber-300/30 bg-amber-300/5 font-mono text-[10px] text-amber-300 tracking-widest uppercase">
          ⚠ missing tokens: {status.roster.missing_tokens.join(", ")}
        </div>
      )}

      {!!status?.queue.history.length && (
        <div className="border-t border-gold/10 pt-3">
          <div className="hud-label mb-2 flex items-center gap-2">
            <Radio size={11} /> Recent transmissions
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-[11px]">
            {status.queue.history.slice().reverse().slice(0, 15).map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <span className={h.status === "ok" ? "text-matrix" : "text-alert"}>
                  {h.status === "ok" ? "◉" : "✖"}
                </span>
                <span className="text-gold font-orbitron font-bold uppercase tracking-widest text-[10px] min-w-[120px]">
                  {h.general}
                </span>
                <span className="text-white/50 truncate flex-1">{h.text}</span>
                <span className="text-white/30 text-[9px]">{h.duration_s.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
