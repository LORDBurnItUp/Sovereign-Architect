"use client";

import { useEffect, useState } from "react";

interface Property {
  id: string;
  ref: string;
  title: string;
  zone: string;
  aed: number; // millions
  sqft: number;
  status: "LISTED" | "VIEWING" | "OFFER IN" | "EXCLUSIVE" | "RESERVED";
  tier: "CROWN" | "ESTATE" | "SUITE";
}

const PROPS: Property[] = [
  { id: "P1", ref: "PLM-A7-721", title: "Signature Palm Villa", zone: "Palm Jumeirah · Frond A", aed: 185, sqft: 12400, status: "EXCLUSIVE", tier: "CROWN" },
  { id: "P2", ref: "EMH-B2-114", title: "Emirates Hills Mansion", zone: "Emirates Hills · Sector E", aed: 240, sqft: 18900, status: "VIEWING", tier: "CROWN" },
  { id: "P3", ref: "DWN-P54-11", title: "Armani Sky Penthouse", zone: "Downtown · Burj Khalifa 54F", aed: 72, sqft: 6800, status: "OFFER IN", tier: "ESTATE" },
  { id: "P4", ref: "MRN-DX-312", title: "Marina Yacht-Facing Duplex", zone: "Marina · Gate 3", aed: 38, sqft: 4200, status: "LISTED", tier: "SUITE" },
  { id: "P5", ref: "JBI-BLG-09", title: "Bulgari Beachfront Manor", zone: "Jumeirah Bay Island", aed: 320, sqft: 16400, status: "EXCLUSIVE", tier: "CROWN" },
  { id: "P6", ref: "DCH-T2-44", title: "Creek Harbour Dual-Tower PH", zone: "Dubai Creek Harbour", aed: 96, sqft: 7900, status: "VIEWING", tier: "ESTATE" },
  { id: "P7", ref: "DHE-V41", title: "Dubai Hills Estate Villa", zone: "Dubai Hills · Parkside", aed: 44, sqft: 8600, status: "LISTED", tier: "ESTATE" },
  { id: "P8", ref: "BSB-X22", title: "Business Bay Sky Lofts", zone: "Business Bay", aed: 12, sqft: 1800, status: "RESERVED", tier: "SUITE" },
];

const statusColor = (s: Property["status"]) => {
  if (s === "EXCLUSIVE") return { c: "text-alert", b: "border-alert/40", g: "bg-alert" };
  if (s === "OFFER IN") return { c: "text-gold", b: "border-gold/40", g: "bg-gold" };
  if (s === "VIEWING") return { c: "text-matrix", b: "border-matrix/40", g: "bg-matrix" };
  if (s === "RESERVED") return { c: "text-cyan", b: "border-cyan/40", g: "bg-cyan" };
  return { c: "text-white/60", b: "border-white/20", g: "bg-white/40" };
};

const tierGlyph = (t: Property["tier"]) => {
  if (t === "CROWN") return "♛";
  if (t === "ESTATE") return "◆";
  return "◈";
};

export default function PortfolioMatrix() {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlighted(Math.floor(Math.random() * PROPS.length));
      setTimeout(() => setHighlighted(null), 400);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const totalValue = PROPS.reduce((sum, p) => sum + p.aed, 0);

  return (
    <div className="glass-panel sovereign-border rounded-none">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-gold/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-gold rounded-full anim-pulse-gold" />
            <span className="hud-label">Active Vault · 8 Assets</span>
          </div>
          <h3 className="text-base font-orbitron font-black tracking-wider uppercase">
            Portfolio Matrix
          </h3>
        </div>
        <div className="text-right">
          <div className="hud-label mb-0.5">Total Mandate</div>
          <div className="font-orbitron font-black text-lg">
            <span className="shimmer-gold">AED {totalValue.toLocaleString()}M</span>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="grid grid-cols-4 gap-px bg-gold/10">
        {PROPS.map((p, i) => {
          const s = statusColor(p.status);
          const isHighlighted = highlighted === i;
          return (
            <div
              key={p.id}
              className={`group relative p-4 bg-obsidian-200/70 hover:bg-gold/5 transition-colors cursor-pointer ${
                isHighlighted ? "bg-gold/10" : ""
              }`}
            >
              {/* Status dot */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg ${p.tier === "CROWN" ? "text-gold" : "text-white/60"}`}>
                    {tierGlyph(p.tier)}
                  </span>
                  <span className="font-mono text-[9px] text-white/30 tracking-widest">
                    {p.ref}
                  </span>
                </div>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${s.g} ${
                    p.status === "EXCLUSIVE" || p.status === "OFFER IN" ? "anim-pulse-gold" : ""
                  }`}
                  style={{ boxShadow: `0 0 8px currentColor` }}
                />
              </div>

              <div className="font-orbitron font-black text-xs tracking-wide uppercase text-white mb-1 truncate">
                {p.title}
              </div>
              <div className="font-mono text-[10px] text-white/40 mb-3 truncate">
                {p.zone}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-[9px] text-gold/50 tracking-widest">AED</span>
                <span className="font-orbitron font-black text-lg text-white">
                  {p.aed}
                </span>
                <span className="font-mono text-[9px] text-gold/50 tracking-widest">M</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-white/30 tracking-widest">
                  {p.sqft.toLocaleString()} sqft
                </span>
                <span className={`font-mono text-[8px] tracking-widest uppercase ${s.c}`}>
                  {p.status}
                </span>
              </div>

              {/* Highlight scan */}
              {isHighlighted && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)",
                    animation: "shimmer 0.6s ease-out",
                  }}
                />
              )}

              {/* Hover reveal */}
              <div className="absolute inset-0 border border-gold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div
                className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              />
              <div
                className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
