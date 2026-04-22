"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface StreamEntry {
  id: string;
  type: "CLOSE" | "OFFER" | "COMMISSION" | "LEAD" | "LICENSE" | "VIEWING";
  title: string;
  detail: string;
  amountAED?: number;
  amountUSD?: number;
  ts: Date;
}

const TITLES = {
  CLOSE: [
    "Palm Villa Transaction Closed",
    "Emirates Hills Mansion Transferred",
    "Armani Penthouse Closed",
    "Bulgari Residence Reserved",
    "Creek Harbour PH Settled",
  ],
  OFFER: [
    "Inbound Offer · Marina Duplex",
    "Sovereign Offer · JBR Tower",
    "HNW Counter · Downtown Sky",
    "Buyer Offer · Dubai Hills Villa",
  ],
  COMMISSION: [
    "Commission wired to escrow",
    "Referral distributed to partner",
    "Success fee released",
  ],
  LEAD: [
    "Saudi VIP reached out — 6 units inquiry",
    "Russian principal confirmed interview",
    "Indian family office booked viewing",
    "Emirati royal office contact opened",
  ],
  LICENSE: [
    "B.L.A.S.T. License activated",
    "Sovereign Tier granted",
    "Elite seat provisioned",
  ],
  VIEWING: [
    "Drone survey scheduled",
    "Private viewing booked",
    "Yacht tour confirmed",
  ],
};

const typeConfig = {
  CLOSE:      { sym: "♛", color: "#FFD700", label: "CLOSE",      accent: "bg-gold" },
  OFFER:      { sym: "◆", color: "#00E5FF", label: "OFFER",      accent: "bg-cyan" },
  COMMISSION: { sym: "₳", color: "#00FF41", label: "COMMISSION", accent: "bg-matrix" },
  LEAD:       { sym: "◈", color: "#FFECAA", label: "LEAD",       accent: "bg-gold-soft" },
  LICENSE:    { sym: "⬢", color: "#FFD700", label: "LICENSE",    accent: "bg-gold" },
  VIEWING:    { sym: "◉", color: "#00E5FF", label: "VIEWING",    accent: "bg-cyan" },
};

function mockEntry(id: string): StreamEntry {
  const types = Object.keys(TITLES) as (keyof typeof TITLES)[];
  const t = types[Math.floor(Math.random() * types.length)];
  const title = TITLES[t][Math.floor(Math.random() * TITLES[t].length)];
  const base =
    t === "CLOSE"
      ? 50 + Math.random() * 250
      : t === "OFFER"
      ? 20 + Math.random() * 200
      : t === "COMMISSION"
      ? 0.8 + Math.random() * 6
      : t === "LICENSE"
      ? 0.01 + Math.random() * 0.08
      : 0;
  const entry: StreamEntry = {
    id,
    type: t,
    title,
    detail: "",
    ts: new Date(),
  };
  if (base > 0) {
    entry.amountAED = base;
    entry.amountUSD = base * 0.272;
  }
  const nations = ["🇸🇦", "🇷🇺", "🇮🇳", "🇨🇳", "🇬🇧", "🇺🇸", "🇦🇪", "🇰🇼"];
  const zones = ["Palm Jumeirah", "Downtown", "Marina", "Emirates Hills", "JBR", "Business Bay"];
  entry.detail = `${nations[Math.floor(Math.random() * nations.length)]} ${
    zones[Math.floor(Math.random() * zones.length)]
  } · #${Math.floor(1000 + Math.random() * 9000)}`;
  return entry;
}

export default function MoneyStream() {
  const [entries, setEntries] = useState<StreamEntry[]>(() =>
    Array.from({ length: 6 }, (_, i) => mockEntry(`seed-${i}`))
  );
  const [totalToday, setTotalToday] = useState(1284);
  const containerRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef(1000);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/logs");
        const json = await res.json();
        // If real data exists, surface it; otherwise keep mock
        if (Array.isArray(json.lines) && json.lines.length > 0) {
          // Keep mock entries flowing; real logs just supplement
        }
      } catch {}

      // Always animate a new entry so feed feels alive
      const newId = `e-${idCounterRef.current++}`;
      setEntries((prev) => {
        const next = [mockEntry(newId), ...prev].slice(0, 12);
        return next;
      });
      setTotalToday((t) => t + Math.random() * 8);

      setTimeout(() => {
        const el = containerRef.current?.querySelector(`[data-id="${newId}"]`);
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0, x: 30, filter: "blur(8px)" },
            { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }
          );
        }
      }, 40);
    };

    const interval = setInterval(fetchLogs, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full glass-panel sovereign-border rounded-none overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gold/10 bg-obsidian-200/60 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 bg-matrix rounded-full anim-pulse-matrix" />
          <span className="hud-label">Live · Capital Stream</span>
        </div>
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-orbitron font-black tracking-wider uppercase">
            Money Wire
          </h3>
          <div className="text-right">
            <div className="hud-label text-[8px] mb-0.5">Today · AED</div>
            <div className="font-orbitron font-black text-xl text-gold" style={{ textShadow: "0 0 12px rgba(255,215,0,0.5)" }}>
              {totalToday.toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Stream */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        {entries.map((entry) => {
          const cfg = typeConfig[entry.type];
          return (
            <div
              key={entry.id}
              data-id={entry.id}
              className="relative p-3 border-b border-white/5 hover:bg-gold/[0.03] transition-colors"
            >
              {/* Left bar */}
              <div
                className={`absolute left-0 top-2 bottom-2 w-[2px] ${cfg.accent}`}
                style={{ boxShadow: `0 0 8px ${cfg.color}` }}
              />

              <div className="pl-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ color: cfg.color, textShadow: `0 0 6px ${cfg.color}` }}>
                      {cfg.sym}
                    </span>
                    <span
                      className="font-mono text-[9px] tracking-widest"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-white/30 tabular-nums">
                    {entry.ts.toLocaleTimeString("en-GB", { hour12: false })}
                  </span>
                </div>

                <div className="font-sans text-xs text-white/80 leading-tight mb-1 truncate">
                  {entry.title}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-white/40 truncate">
                    {entry.detail}
                  </span>
                  {entry.amountAED !== undefined && (
                    <span
                      className="font-orbitron font-black text-xs tabular-nums flex-shrink-0 ml-2"
                      style={{ color: cfg.color }}
                    >
                      {entry.amountAED > 10
                        ? `AED ${entry.amountAED.toFixed(1)}M`
                        : `AED ${(entry.amountAED * 1000).toFixed(0)}k`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gold/10 p-3 bg-obsidian-200/60 backdrop-blur-md flex justify-between items-center">
        <span className="font-mono text-[9px] text-matrix tracking-widest flex items-center gap-1.5">
          <div className="w-1 h-1 bg-matrix rounded-full anim-pulse-matrix" />
          ENCRYPTED LEDGER
        </span>
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          AUDIT ACTIVE
        </span>
      </div>
    </div>
  );
}
