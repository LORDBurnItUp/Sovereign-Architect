"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Loader2, Target, Sparkles, Gift, TrendingDown, TrendingUp, Radio } from "lucide-react";

type AdVariant = { title: string; body: string };
type Lead = { firm: string; note: string; public_dir: string };

// Public-directory framing only — these are illustrative categories, not scraped private PII.
// Real deployments should query propsearch.ae / yellowpages-uae.com / DLD public listings.
const DIRECTORY_SAMPLE: Lead[] = [
  { firm: "Smaller RERA-licensed brokers (bottom 20% volume)", note: "thin secondary pipeline, needs lead-gen", public_dir: "DLD / propsearch.ae" },
  { firm: "Off-plan resellers · secondary specialists", note: "pressure from 30-49% YoY secondary dip", public_dir: "DLD" },
  { firm: "Indie RERA brokers in Business Bay / JVC / Dubai South", note: "low-mid tier walk-in drop", public_dir: "yellowpages-uae.com" },
  { firm: "Mid-market agencies with < 10 listings live", note: "margin compression, need cheap AI tooling", public_dir: "propsearch.ae" },
  { firm: "Distressed-deal specialists", note: "10-20% negotiation room opening", public_dir: "DLD" },
];

const CONVERSION_SEED = { started: Date.now(), seed: 0 };

export default function DubaiBlitzTab() {
  const [pulseBusy, setPulseBusy] = useState(false);
  const [ads, setAds] = useState<AdVariant[]>([]);
  const [adsBusy, setAdsBusy] = useState(false);
  const [adErr, setAdErr] = useState<string | null>(null);
  const [pulseResult, setPulseResult] = useState<{ team: string[]; scout: boolean; at: string } | null>(null);
  const [pulseErr, setPulseErr] = useState<string | null>(null);
  const [conversions, setConversions] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const mins = (Date.now() - CONVERSION_SEED.started) / 60000;
      const base = Math.floor(mins * 0.6);
      setConversions(Math.max(0, base + CONVERSION_SEED.seed));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const firePulse = useCallback(async () => {
    setPulseBusy(true);
    setPulseErr(null);
    try {
      const r = await fetch("/api/symphony/pulse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ focus: "dubai-blitz" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || data.error || `status ${r.status}`);
      setPulseResult({
        team: data.team || [],
        scout: !!data.scout?.configured,
        at: new Date().toTimeString().slice(0, 8),
      });
    } catch (e) {
      setPulseErr(String(e));
    } finally {
      setPulseBusy(false);
    }
  }, []);

  const generateAds = useCallback(async () => {
    setAdsBusy(true);
    setAdErr(null);
    try {
      const prompt =
        'Generate 4 short, high-energy ad variants for the $50 flat limited-time Sovereign Gateway intro aimed at small/mid-tier Dubai real-estate agencies struggling in the 2026 cooling secondary market. ' +
        'Return a JSON array of {title, body}. title <= 60 chars punchy. body <= 240 chars, crisp, mentions "$50", "7-day sovereign beta", and a single concrete next step. No hashtags. No emoji except ◈ or ✦ if it helps. Do not include JSON markers or commentary — just the array.';
      const r = await fetch("/api/omnichat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "global", brain: "groq", text: prompt }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.reply || "brain error");
      // Try to parse JSON array out of the reply
      let parsed: AdVariant[] = [];
      try {
        const match = String(data.reply).match(/\[[\s\S]*\]/);
        parsed = JSON.parse(match ? match[0] : data.reply);
      } catch {
        parsed = [{ title: "Sovereign $50 Intro", body: String(data.reply).slice(0, 240) }];
      }
      setAds(parsed.slice(0, 6));
    } catch (e) {
      setAdErr(String(e));
    } finally {
      setAdsBusy(false);
    }
  }, []);

  return (
    <div className="relative z-10 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="font-orbitron text-2xl font-black text-amber-200 uppercase tracking-widest flex items-center gap-3">
            <Flame className="text-amber-300 animate-pulse" /> Dubai Blitz Campaign
          </h2>
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-1">
            $50 flat limited intro · small/mid-tier DXB brokers · 2026 cooling market
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
          <span className="text-matrix flex items-center gap-1"><TrendingUp size={11} /> off-plan ~72% share</span>
          <span className="text-alert flex items-center gap-1"><TrendingDown size={11} /> secondary -30-49% YoY</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="glass-panel sovereign-border p-6 h-full flex flex-col relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="hud-label mb-3 flex items-center gap-2"><Flame size={11} /> One-Click Pulse</div>
            <p className="text-white/60 font-mono text-xs mb-4 leading-relaxed">
              Fires <span className="text-amber-300">dubai-blitz</span> across the relevant generals. They queue, compose a real briefing via Groq, and post embed + TTS through your Discord War Room — no overlap.
            </p>
            <button
              onClick={firePulse}
              disabled={pulseBusy}
              className="w-full py-4 border-2 border-amber-400 bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 text-amber-200 font-orbitron font-black uppercase tracking-[0.3em] text-sm hover:from-amber-500/25 hover:to-amber-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
            >
              {pulseBusy ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} />}
              Sovereign Pulse · Dubai
            </button>
            {pulseErr && <div className="mt-3 p-2 border border-alert/40 text-alert font-mono text-[11px]">✖ {pulseErr}</div>}
            {pulseResult && (
              <div className="mt-3 p-2 border border-matrix/30 bg-matrix/5 font-mono text-[10px] text-white/70 tracking-widest">
                <div className="text-matrix">◈ dispatched @ {pulseResult.at}</div>
                <div className="mt-1">team: {pulseResult.team.join(" · ")}</div>
                <div className="mt-1 text-[9px] text-white/40">grok: {pulseResult.scout ? "live" : "baseline (add XAI_API_KEY)"}</div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gold/10">
              <div className="hud-label mb-2 flex items-center gap-2"><Target size={11} /> Conversion tracker (placeholder)</div>
              <div className="font-orbitron text-4xl font-black text-matrix">{conversions}</div>
              <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase mt-1">
                agencies engaged · last hour · wire real attribution to replace
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="glass-panel sovereign-border p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="hud-label flex items-center gap-2"><Sparkles size={11} /> $50 Ad variants</div>
              <button
                onClick={generateAds}
                disabled={adsBusy}
                className="px-3 py-1.5 border border-gold/40 text-gold font-orbitron font-bold text-[10px] uppercase tracking-widest hover:bg-gold/10 disabled:opacity-40 flex items-center gap-2"
              >
                {adsBusy ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Generate via Groq
              </button>
            </div>
            {adErr && <div className="p-2 border border-alert/40 text-alert font-mono text-[11px] mb-2">✖ {adErr}</div>}
            <div className="flex-1 overflow-y-auto space-y-2">
              {ads.length === 0 && !adsBusy && (
                <div className="text-white/30 font-mono text-xs py-6 text-center">
                  click “Generate via Groq” — live LLM, no mock
                </div>
              )}
              {ads.map((a, i) => (
                <div key={i} className="p-3 border border-amber-400/20 bg-amber-500/[0.04]">
                  <div className="font-orbitron font-black text-amber-200 text-sm">{a.title}</div>
                  <div className="text-white/75 text-[12px] mt-1 leading-relaxed">{a.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div className="glass-panel sovereign-border p-6 h-full">
            <div className="hud-label mb-3 flex items-center gap-2"><Radio size={11} /> Target categories</div>
            <p className="font-mono text-[10px] text-white/40 leading-relaxed mb-3">
              Public directory framings only. No scraped private PII. Wire DLD / propsearch / yellowpages lookups in growth swarm.
            </p>
            <div className="space-y-2">
              {DIRECTORY_SAMPLE.map((l, i) => (
                <div key={i} className="p-2 border border-white/10 bg-white/[0.015]">
                  <div className="font-orbitron text-[11px] font-black text-gold uppercase tracking-widest">{l.firm}</div>
                  <div className="font-mono text-[9px] text-white/50 mt-1">{l.note}</div>
                  <div className="font-mono text-[8px] text-white/30 mt-1 uppercase tracking-widest">src: {l.public_dir}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gold/10">
              <div className="flex items-center gap-2 text-amber-300 font-mono text-[9px] tracking-widest uppercase">
                <Gift size={10} /> Legal note
              </div>
              <p className="font-mono text-[9px] text-white/40 mt-2 leading-relaxed">
                UAE PDPL + RERA rules restrict unsolicited WhatsApp/calls to brokers. This panel ships briefings, ad copy, and internal lists — no mass external blasting is wired in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
