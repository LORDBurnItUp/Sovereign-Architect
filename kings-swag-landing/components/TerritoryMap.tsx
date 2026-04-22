"use client";

import { useEffect, useRef, useState } from "react";

interface Zone {
  id: string;
  name: string;
  code: string;
  cx: number;
  cy: number;
  radius: number;
  pricePerSqft: number;
  velocity: "HOT" | "RISING" | "STABLE" | "COOL";
  deals: number;
}

const ZONES: Zone[] = [
  { id: "palm", name: "Palm Jumeirah", code: "PLM-01", cx: 200, cy: 250, radius: 38, pricePerSqft: 4200, velocity: "HOT", deals: 14 },
  { id: "marina", name: "Dubai Marina", code: "MRN-02", cx: 240, cy: 330, radius: 30, pricePerSqft: 2800, velocity: "RISING", deals: 21 },
  { id: "jbr", name: "JBR Waterfront", code: "JBR-03", cx: 180, cy: 360, radius: 22, pricePerSqft: 2400, velocity: "RISING", deals: 9 },
  { id: "downtown", name: "Downtown Dubai", code: "DWN-04", cx: 440, cy: 340, radius: 36, pricePerSqft: 3600, velocity: "HOT", deals: 18 },
  { id: "business", name: "Business Bay", code: "BSB-05", cx: 420, cy: 390, radius: 28, pricePerSqft: 2100, velocity: "STABLE", deals: 11 },
  { id: "emirates", name: "Emirates Hills", code: "EMH-06", cx: 340, cy: 280, radius: 32, pricePerSqft: 3900, velocity: "HOT", deals: 7 },
  { id: "hills", name: "Dubai Hills Estate", code: "DHE-07", cx: 400, cy: 230, radius: 30, pricePerSqft: 2600, velocity: "RISING", deals: 13 },
  { id: "creek", name: "Dubai Creek Harbour", code: "DCH-08", cx: 560, cy: 310, radius: 28, pricePerSqft: 2900, velocity: "RISING", deals: 8 },
  { id: "world", name: "Jumeirah Bay Island", code: "JBI-09", cx: 300, cy: 200, radius: 20, pricePerSqft: 5100, velocity: "HOT", deals: 3 },
  { id: "meydan", name: "Meydan / MBR City", code: "MBR-10", cx: 500, cy: 430, radius: 26, pricePerSqft: 1900, velocity: "STABLE", deals: 12 },
  { id: "silicon", name: "Silicon Oasis", code: "SIL-11", cx: 620, cy: 430, radius: 22, pricePerSqft: 1100, velocity: "COOL", deals: 4 },
];

const velocityColor = (v: Zone["velocity"]) => {
  if (v === "HOT") return { fill: "rgba(255, 49, 49, 0.22)", stroke: "#FF3131", glow: "#FF3131" };
  if (v === "RISING") return { fill: "rgba(255, 215, 0, 0.18)", stroke: "#FFD700", glow: "#FFD700" };
  if (v === "STABLE") return { fill: "rgba(0, 229, 255, 0.15)", stroke: "#00E5FF", glow: "#00E5FF" };
  return { fill: "rgba(255,255,255,0.08)", stroke: "rgba(255,255,255,0.4)", glow: "#ffffff" };
};

export default function TerritoryMap() {
  const [hovered, setHovered] = useState<Zone | null>(null);
  const [selected, setSelected] = useState<Zone>(ZONES[0]);
  const [pulse, setPulse] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 1000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full glass-panel sovereign-border rounded-none overflow-hidden group">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-5 border-b border-gold/10 bg-obsidian/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gold anim-pulse-gold" />
            <span className="hud-label">Territory Intelligence // Dubai Sector</span>
          </div>
          <h3 className="text-xl font-orbitron font-black tracking-wider uppercase">
            Dominion Heatmap
          </h3>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase">
            <div className="w-1.5 h-1.5 bg-alert" />
            <span className="text-white/50">HOT</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase">
            <div className="w-1.5 h-1.5 bg-gold" />
            <span className="text-white/50">RISE</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase">
            <div className="w-1.5 h-1.5 bg-cyan" />
            <span className="text-white/50">STBL</span>
          </div>
        </div>
      </div>

      {/* SVG MAP */}
      <svg
        ref={svgRef}
        viewBox="0 0 760 520"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,215,0,0.06)" strokeWidth="0.5" />
          </pattern>
          <pattern id="mapgrid-fine" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.5" fill="rgba(255,215,0,0.15)" />
          </pattern>
          {/* Radial glow */}
          <radialGradient id="zone-glow">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {/* Land mass */}
          <linearGradient id="land" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,215,0,0.03)" />
            <stop offset="100%" stopColor="rgba(255,215,0,0.01)" />
          </linearGradient>
        </defs>

        {/* Base grid */}
        <rect width="760" height="520" fill="url(#mapgrid)" />
        <rect width="760" height="520" fill="url(#mapgrid-fine)" opacity="0.5" />

        {/* Coastline (abstract Dubai coast) */}
        <path
          d="M 0 420 Q 80 410, 140 400 Q 200 380, 260 360 Q 320 340, 400 320 Q 480 310, 560 290 Q 640 280, 720 260 L 760 250 L 760 520 L 0 520 Z"
          fill="url(#land)"
          stroke="rgba(255,215,0,0.2)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />

        {/* The Palm iconic outline */}
        <g transform="translate(200, 250)" opacity="0.3">
          <circle cx="0" cy="0" r="25" fill="none" stroke="rgba(255,215,0,0.35)" strokeWidth="0.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1="0"
                y1="0"
                x2={Math.cos(rad) * 38}
                y2={Math.sin(rad) * 38}
                stroke="rgba(255,215,0,0.25)"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="0" cy="-42" r="10" fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth="0.5" strokeDasharray="1 2" />
        </g>

        {/* Sheikh Zayed Rd - reference line */}
        <line x1="100" y1="400" x2="680" y2="260" stroke="rgba(255,215,0,0.15)" strokeWidth="1" strokeDasharray="4 6" />
        <text x="410" y="335" fill="rgba(255,215,0,0.25)" fontSize="7" fontFamily="monospace" letterSpacing="2">E11 SHEIKH ZAYED</text>

        {/* Zone rings */}
        {ZONES.map((zone) => {
          const c = velocityColor(zone.velocity);
          const isSelected = selected.id === zone.id;
          const isHovered = hovered?.id === zone.id;
          return (
            <g
              key={zone.id}
              onMouseEnter={() => setHovered(zone)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(zone)}
              style={{ cursor: "none" }}
            >
              {/* Pulse ring */}
              {zone.velocity === "HOT" && (
                <circle
                  cx={zone.cx}
                  cy={zone.cy}
                  r={zone.radius}
                  fill="none"
                  stroke={c.glow}
                  strokeWidth="1"
                  opacity={0.6}
                  style={{ animation: `breath 2.4s ease-in-out infinite` }}
                />
              )}

              {/* Outer scan ring */}
              <circle
                cx={zone.cx}
                cy={zone.cy}
                r={zone.radius + 6}
                fill="none"
                stroke={c.stroke}
                strokeOpacity={isHovered || isSelected ? 0.8 : 0.3}
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />

              {/* Main fill */}
              <circle
                cx={zone.cx}
                cy={zone.cy}
                r={zone.radius}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={isHovered || isSelected ? 1.5 : 0.8}
                style={{
                  filter: `drop-shadow(0 0 ${isHovered || isSelected ? 16 : 6}px ${c.glow})`,
                  transition: "all 0.3s ease",
                }}
              />

              {/* Core dot */}
              <circle cx={zone.cx} cy={zone.cy} r="2.5" fill={c.stroke} />

              {/* Crosshair */}
              <line x1={zone.cx - 6} y1={zone.cy} x2={zone.cx + 6} y2={zone.cy} stroke={c.stroke} strokeWidth="0.5" opacity="0.8" />
              <line x1={zone.cx} y1={zone.cy - 6} x2={zone.cx} y2={zone.cy + 6} stroke={c.stroke} strokeWidth="0.5" opacity="0.8" />

              {/* Label */}
              <g transform={`translate(${zone.cx}, ${zone.cy + zone.radius + 14})`}>
                <text
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="2"
                  fill={isHovered || isSelected ? c.stroke : "rgba(255,255,255,0.55)"}
                  style={{ transition: "fill 0.3s" }}
                >
                  {zone.code} · {zone.name.toUpperCase()}
                </text>
                <text
                  y="10"
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="monospace"
                  fill="rgba(255,255,255,0.35)"
                >
                  AED {zone.pricePerSqft.toLocaleString()}/sqft · {zone.deals} deals
                </text>
              </g>

              {/* Click target */}
              <circle cx={zone.cx} cy={zone.cy} r={zone.radius + 8} fill="transparent" />
            </g>
          );
        })}

        {/* Scanning radar beam from selected */}
        <g key={pulse}>
          <circle
            cx={selected.cx}
            cy={selected.cy}
            r={selected.radius + 2}
            fill="none"
            stroke="#FFD700"
            strokeWidth="1.5"
            opacity="0"
            style={{ animation: "breath 2s ease-out" }}
          >
            <animate attributeName="r" from={selected.radius + 2} to={selected.radius + 80} dur="2s" />
            <animate attributeName="opacity" from="0.8" to="0" dur="2s" />
          </circle>
        </g>

        {/* Coordinates HUD */}
        <g opacity="0.4">
          <text x="12" y="510" fontSize="8" fontFamily="monospace" fill="#FFD700">
            25.2048°N / 55.2708°E — DUBAI EMIRATE — UAE
          </text>
          <text x="680" y="510" fontSize="8" fontFamily="monospace" fill="#FFD700" textAnchor="end">
            ZOOM 1:12,000 · UTM 40R
          </text>
        </g>
      </svg>

      {/* DETAIL PANEL */}
      <div className="absolute bottom-4 left-4 right-4 z-10 p-4 bg-obsidian/90 border border-gold/20 backdrop-blur-md grid grid-cols-4 gap-4">
        <div>
          <div className="hud-label mb-1">Selected Territory</div>
          <div className="font-orbitron font-bold text-sm text-gold">{selected.name}</div>
          <div className="font-mono text-[9px] text-white/30 mt-0.5">{selected.code}</div>
        </div>
        <div>
          <div className="hud-label mb-1">AED / sqft</div>
          <div className="font-orbitron font-black text-xl text-white">
            {selected.pricePerSqft.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="hud-label mb-1">Active Deals</div>
          <div className="font-orbitron font-black text-xl text-matrix">
            {selected.deals.toString().padStart(2, "0")}
          </div>
        </div>
        <div>
          <div className="hud-label mb-1">Velocity</div>
          <div
            className={`font-orbitron font-black text-xl ${
              selected.velocity === "HOT"
                ? "text-alert"
                : selected.velocity === "RISING"
                ? "text-gold"
                : selected.velocity === "STABLE"
                ? "text-cyan"
                : "text-white/50"
            }`}
          >
            {selected.velocity}
          </div>
        </div>
      </div>
    </div>
  );
}
