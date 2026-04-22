"use client";

import { useEffect, useState } from "react";

interface Blip {
  id: number;
  angle: number;
  distance: number;
  type: "LISTING" | "OFFER" | "CLOSE" | "OUTBID";
  label: string;
  intensity: number;
}

const TYPE_CONFIG = {
  LISTING: { color: "#FFD700", symbol: "◈" },
  OFFER: { color: "#00E5FF", symbol: "◉" },
  CLOSE: { color: "#00FF41", symbol: "◆" },
  OUTBID: { color: "#FF3131", symbol: "⬟" },
};

const LABELS = [
  "Palm Signature 7-br",
  "Downtown 5-br Penthouse",
  "Marina Duplex",
  "Emirates Hills Mansion",
  "Business Bay 3-br",
  "JBR Waterfront",
  "Creek Harbour Penthouse",
  "Dubai Hills Villa",
  "Bulgari Residence",
  "Armani Penthouse",
];

export default function MarketRadar() {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    let raf: number;
    let last = Date.now();
    const animate = () => {
      const now = Date.now();
      const dt = now - last;
      last = now;
      setSweepAngle((a) => (a + dt / 22) % 360);
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setBlips((prev) => {
        const types: Blip["type"][] = ["LISTING", "OFFER", "CLOSE", "OUTBID"];
        const newBlip: Blip = {
          id: nextId,
          angle: Math.random() * 360,
          distance: 20 + Math.random() * 70,
          type: types[Math.floor(Math.random() * types.length)],
          label: LABELS[Math.floor(Math.random() * LABELS.length)],
          intensity: 1,
        };
        setNextId((n) => n + 1);
        return [...prev.slice(-7), newBlip];
      });
    }, 1800);

    const fadeInterval = setInterval(() => {
      setBlips((prev) =>
        prev
          .map((b) => ({ ...b, intensity: b.intensity * 0.92 }))
          .filter((b) => b.intensity > 0.05)
      );
    }, 120);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(fadeInterval);
    };
  }, [nextId]);

  return (
    <div className="relative h-full glass-panel sovereign-border rounded-none overflow-hidden p-5 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-cyan rounded-full anim-pulse-matrix" />
            <span className="hud-label">Market Pulse Sensor</span>
          </div>
          <h3 className="text-base font-orbitron font-black tracking-wider uppercase">
            Velocity Radar
          </h3>
        </div>
        <span className="font-mono text-[9px] text-cyan tracking-widest">
          FREQ 2.4 GHz
        </span>
      </div>

      {/* Radar */}
      <div className="relative flex-1 flex items-center justify-center">
        <svg viewBox="-100 -100 200 200" className="w-full h-full max-w-[320px] max-h-[320px]">
          <defs>
            <radialGradient id="radar-gradient">
              <stop offset="0%" stopColor="rgba(0,229,255,0.05)" />
              <stop offset="70%" stopColor="rgba(0,229,255,0.02)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <linearGradient id="sweep-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
              <stop offset="0%" stopColor="rgba(255,215,0,0)" />
              <stop offset="80%" stopColor="rgba(255,215,0,0.4)" />
              <stop offset="100%" stopColor="rgba(255,215,0,0.9)" />
            </linearGradient>
          </defs>

          <circle cx="0" cy="0" r="95" fill="url(#radar-gradient)" />

          {/* Concentric rings */}
          {[25, 50, 75, 95].map((r) => (
            <circle
              key={r}
              cx="0"
              cy="0"
              r={r}
              fill="none"
              stroke="rgba(255,215,0,0.15)"
              strokeWidth="0.3"
              strokeDasharray="1 2"
            />
          ))}

          {/* Cross lines */}
          <line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,215,0,0.12)" strokeWidth="0.3" />
          <line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,215,0,0.12)" strokeWidth="0.3" />
          <line x1="-67" y1="-67" x2="67" y2="67" stroke="rgba(255,215,0,0.06)" strokeWidth="0.3" />
          <line x1="-67" y1="67" x2="67" y2="-67" stroke="rgba(255,215,0,0.06)" strokeWidth="0.3" />

          {/* Degree markers */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <text
                key={deg}
                x={Math.cos(rad) * 100 - 4}
                y={Math.sin(rad) * 100 + 3}
                fontSize="6"
                fontFamily="monospace"
                fill="rgba(255,215,0,0.4)"
                textAnchor={deg === 180 ? "end" : deg === 0 ? "start" : "middle"}
              >
                {deg}°
              </text>
            );
          })}

          {/* Sweep arm */}
          <g transform={`rotate(${sweepAngle})`}>
            <path
              d="M 0 0 L 95 -20 A 95 95 0 0 1 95 0 Z"
              fill="url(#sweep-gradient)"
              opacity="0.7"
            />
            <line x1="0" y1="0" x2="95" y2="0" stroke="#FFD700" strokeWidth="1" />
          </g>

          {/* Blips */}
          {blips.map((blip) => {
            const rad = (blip.angle * Math.PI) / 180;
            const x = Math.cos(rad) * blip.distance;
            const y = Math.sin(rad) * blip.distance;
            const cfg = TYPE_CONFIG[blip.type];
            return (
              <g key={blip.id} opacity={blip.intensity}>
                <circle cx={x} cy={y} r="3" fill={cfg.color} style={{ filter: `drop-shadow(0 0 4px ${cfg.color})` }} />
                <circle cx={x} cy={y} r="6" fill="none" stroke={cfg.color} strokeWidth="0.5" opacity="0.5" />
              </g>
            );
          })}

          {/* Center dot */}
          <circle cx="0" cy="0" r="2" fill="#FFD700" />
          <circle cx="0" cy="0" r="4" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {(Object.entries(TYPE_CONFIG) as [Blip["type"], typeof TYPE_CONFIG.LISTING][]).map(([key, cfg]) => {
          const count = blips.filter((b) => b.type === key).length;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
              />
              <span className="font-mono text-[8px] tracking-widest text-white/50">
                {key.slice(0, 4)}·{count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
