"use client";

import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getApiUrl } from "@/lib/api-config";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TickerData {
  roi: string;
  cvr: string;
  profit: string;
  deployments: number;
}

export default function RevenueTicker() {
  const [data, setData] = useState<TickerData>({
    roi: "4.82x",
    cvr: "4.42%",
    profit: "AED 284.6M",
    deployments: 247,
  });
  const [aedUsd, setAedUsd] = useState(0.2723);
  const [btcAed, setBtcAed] = useState(368420);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(getApiUrl("/api/revenue_ticker"));
        const json = await res.json();
        setData(json);
      } catch {
        // Keep demo data
      }
      setAedUsd(0.2723 + (Math.random() - 0.5) * 0.0004);
      setBtcAed(360000 + Math.random() * 20000);
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "ROI", value: data.roi, color: "text-gold", glyph: "⬧" },
    { label: "CVR", value: data.cvr, color: "text-matrix", glyph: "▲" },
    { label: "PROFIT", value: data.profit, color: "text-gold font-black", glyph: "♛" },
    { label: "DEPLOY", value: data.deployments.toString(), color: "text-white/80", glyph: "◉" },
    { label: "NODES", value: "11 ACTIVE", color: "text-matrix", glyph: "⬢" },
    { label: "AED/USD", value: aedUsd.toFixed(4), color: "text-cyan", glyph: "≡" },
    { label: "BTC/AED", value: btcAed.toLocaleString("en-US", { maximumFractionDigits: 0 }), color: "text-gold-soft", glyph: "◈" },
    { label: "STRATEGY", value: "DUBAI · LUX RESI", color: "text-alert", glyph: "▸" },
    { label: "GPS", value: "25.2048°N 55.2708°E", color: "text-white/60", glyph: "✚" },
    { label: "SIGNAL", value: "OMEGA-5", color: "text-gold", glyph: "⟁" },
  ];

  const doubled = [...items, ...items, ...items];

  return (
    <div className="relative w-full h-9 bg-obsidian/95 backdrop-blur-xl border-b border-gold/30 overflow-hidden z-50">
      {/* Top & bottom accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Left HUD */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-2 px-3 bg-obsidian border-r border-gold/30">
        <div className="w-1.5 h-1.5 bg-alert rounded-full anim-pulse-gold" />
        <span className="font-mono text-[10px] text-alert tracking-[0.3em] font-bold">LIVE</span>
      </div>

      {/* Right HUD */}
      <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center gap-2 px-3 bg-obsidian border-l border-gold/30">
        <span className="font-mono text-[10px] text-gold tracking-[0.3em]">SOVEREIGN TERMINAL</span>
        <span className="w-1.5 h-1.5 bg-gold rounded-full anim-pulse-gold" />
      </div>

      {/* Ticker track */}
      <div className="ticker-track h-full flex items-center gap-12 px-32">
        {doubled.map((item, idx) => (
          <TickerItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({
  label,
  value,
  color,
  glyph,
}: {
  label: string;
  value: string;
  color: string;
  glyph: string;
}) {
  return (
    <div className="flex gap-2 items-center text-[10px] font-mono tracking-widest uppercase whitespace-nowrap flex-shrink-0">
      <span className="text-gold opacity-60">{glyph}</span>
      <span className="text-white/40">{label}:</span>
      <span className={cn(color, "tabular-nums")}>{value}</span>
      <span className="text-gold/20 ml-3">|</span>
    </div>
  );
}
