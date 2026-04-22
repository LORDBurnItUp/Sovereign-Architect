"use client";

import { useEffect, useState } from "react";

interface Brief {
  id: string;
  classification: "CONFIDENTIAL" | "SECRET" | "EYES ONLY";
  source: string;
  title: string;
  body: string;
  timestamp: string;
  priority: 1 | 2 | 3;
}

const BRIEFS: Brief[] = [
  {
    id: "B1",
    classification: "EYES ONLY",
    source: "APEX Intelligence",
    title: "Saudi family office seeking 6–8 Palm villas",
    body: "Direct mandate from Al-Rashid principals. Target: waterfront signature homes ≥8,000 sqft. Budget band AED 180–260M per unit. Intercept window 72h.",
    timestamp: "00:04:18 AGO",
    priority: 1,
  },
  {
    id: "B2",
    classification: "SECRET",
    source: "Hermes Outbound",
    title: "Russian oligarch yacht docked Marina — wife signaled interest",
    body: "Subject vessel 'Avanti' moored Marina Gate 3. Female principal scouting JBR via private concierge. Recommend staged walk-by 14:00 DXB tomorrow.",
    timestamp: "00:12:44 AGO",
    priority: 1,
  },
  {
    id: "B3",
    classification: "CONFIDENTIAL",
    source: "DLD / RERA Feed",
    title: "Downtown Armani Residence — floor 54 re-listed",
    body: "Seller motivated. 12% under comparable closings. Recommend engage within 24h before mid-market brokers notice — pre-emptive offer AED 72M.",
    timestamp: "00:29:01 AGO",
    priority: 2,
  },
  {
    id: "B4",
    classification: "SECRET",
    source: "Sentinel Threat Grid",
    title: "Competitor agency bidding intercepted",
    body: "Rival broker Falcon Realty active on 3 of our top-24 leads. Executor deployed counter-offers. Auditor monitoring ROI deltas live.",
    timestamp: "01:04:22 AGO",
    priority: 2,
  },
  {
    id: "B5",
    classification: "CONFIDENTIAL",
    source: "Market Pulse",
    title: "Emirates Hills median +4.2% week-over-week",
    body: "Luxury mansion category outpacing apartment sector 3:1. 11 qualified buyers in pipeline for 7 active listings. Supply-constrained — negotiate up.",
    timestamp: "02:18:09 AGO",
    priority: 3,
  },
];

const classColor = (c: Brief["classification"]) => {
  if (c === "EYES ONLY") return { border: "border-alert/60", bg: "bg-alert/5", text: "text-alert" };
  if (c === "SECRET") return { border: "border-gold/60", bg: "bg-gold/5", text: "text-gold" };
  return { border: "border-cyan/50", bg: "bg-cyan/5", text: "text-cyan" };
};

export default function ClassifiedBriefing() {
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % BRIEFS.length);
      setAnimKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const brief = BRIEFS[idx];
  const c = classColor(brief.classification);

  return (
    <div className="relative h-full glass-panel sovereign-border rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start p-4 border-b border-gold/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-alert rounded-full anim-pulse-gold" />
            <span className="hud-label">Daily Directive</span>
          </div>
          <h3 className="text-base font-orbitron font-black tracking-wider uppercase">
            Classified Briefing
          </h3>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex gap-1">
            {BRIEFS.map((b, i) => (
              <div
                key={b.id}
                className={`w-1.5 h-1.5 ${
                  i === idx ? "bg-gold" : "bg-white/20"
                }`}
                style={{ boxShadow: i === idx ? "0 0 6px #FFD700" : "none" }}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] text-white/30 tracking-widest">
            {idx + 1}/{BRIEFS.length}
          </span>
        </div>
      </div>

      {/* Body */}
      <div key={animKey} className="p-5 animate-[float-y_6s_ease-in-out]" style={{ animation: "none" }}>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`font-mono text-[9px] tracking-[0.3em] uppercase border px-2 py-0.5 ${c.border} ${c.text} ${c.bg}`}
          >
            ▓ {brief.classification}
          </span>
          <span className="font-mono text-[9px] text-white/30 tracking-widest">
            PRIORITY P{brief.priority}
          </span>
          <span className="ml-auto font-mono text-[9px] text-white/30 tracking-widest">
            {brief.timestamp}
          </span>
        </div>

        <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase mb-2">
          ◆ SOURCE: {brief.source}
        </div>

        <h4 className="font-orbitron font-black text-xl text-white leading-tight mb-3">
          {brief.title}
        </h4>

        <p className="font-sans text-sm text-white/70 leading-relaxed">
          {brief.body}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gold/50 text-gold font-mono text-[10px] tracking-widest hover:bg-gold/10 transition-colors">
              ACKNOWLEDGE
            </button>
            <button className="px-4 py-2 border border-white/10 text-white/60 font-mono text-[10px] tracking-widest hover:border-white/30 transition-colors">
              DISPATCH AGENT
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-gold/40" />
            <span className="font-mono text-[9px] text-gold/40 tracking-widest">
              AUTO-ROTATE
            </span>
          </div>
        </div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none scanlines-overlay opacity-30" />
    </div>
  );
}
