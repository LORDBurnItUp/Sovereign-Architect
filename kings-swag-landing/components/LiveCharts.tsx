"use client";

import { useEffect, useState } from "react";

interface Series {
  id: string;
  label: string;
  unit: string;
  color: string;
  data: number[];
  value: string;
  delta: number;
}

const initial: Series[] = [
  {
    id: "roi",
    label: "ROI Index",
    unit: "×",
    color: "#FFD700",
    data: Array.from({ length: 40 }, () => 3 + Math.random() * 2),
    value: "4.82",
    delta: 0.18,
  },
  {
    id: "cvr",
    label: "Conversion",
    unit: "%",
    color: "#00FF41",
    data: Array.from({ length: 40 }, () => 2 + Math.random() * 3),
    value: "4.42",
    delta: 0.12,
  },
  {
    id: "velocity",
    label: "AED Velocity",
    unit: "M/hr",
    color: "#00E5FF",
    data: Array.from({ length: 40 }, () => 8 + Math.random() * 4),
    value: "11.6",
    delta: 0.43,
  },
  {
    id: "touchpoints",
    label: "HNW Touchpoints",
    unit: "/hr",
    color: "#FFECAA",
    data: Array.from({ length: 40 }, () => 40 + Math.random() * 30),
    value: "58",
    delta: -0.05,
  },
];

export default function LiveCharts() {
  const [series, setSeries] = useState(initial);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries((prev) =>
        prev.map((s) => {
          const next = Math.max(0.1, s.data[s.data.length - 1] + (Math.random() - 0.45) * (s.id === "touchpoints" ? 6 : 0.6));
          const newData = [...s.data.slice(1), next];
          const prevValue = parseFloat(s.value);
          const delta = (next - prevValue) / (prevValue || 1);
          return {
            ...s,
            data: newData,
            value: next.toFixed(s.id === "touchpoints" ? 0 : 2),
            delta,
          };
        })
      );
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel sovereign-border rounded-none p-5 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-gold rounded-full anim-pulse-gold" />
            <span className="hud-label">Instrumentation</span>
          </div>
          <h3 className="text-base font-orbitron font-black tracking-wider uppercase">
            Live Telemetry
          </h3>
        </div>
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          100 ms · ALPHA
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        {series.map((s) => (
          <SparkCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

function SparkCard({ s }: { s: Series }) {
  const min = Math.min(...s.data);
  const max = Math.max(...s.data);
  const range = max - min || 1;
  const width = 160;
  const height = 60;
  const step = width / (s.data.length - 1);

  const points = s.data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = "M " + points.join(" L ");
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const deltaPositive = s.delta >= 0;

  return (
    <div className="relative p-3 bg-obsidian-200/40 border border-white/5 hover:border-gold/20 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="hud-label mb-0.5" style={{ color: `${s.color}88` }}>
            {s.label}
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-orbitron font-black text-2xl tabular-nums"
              style={{ color: s.color, textShadow: `0 0 12px ${s.color}55` }}
            >
              {s.value}
            </span>
            <span className="font-mono text-[9px] text-white/40">{s.unit}</span>
          </div>
        </div>
        <div
          className={`font-mono text-[10px] tabular-nums flex items-center gap-0.5 ${
            deltaPositive ? "text-matrix" : "text-alert"
          }`}
        >
          <span>{deltaPositive ? "▲" : "▼"}</span>
          <span>{(Math.abs(s.delta) * 100).toFixed(2)}%</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[60px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${s.id})`} />
        <path
          d={pathD}
          fill="none"
          stroke={s.color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${s.color})` }}
        />
        {/* End point pulse */}
        <circle
          cx={width}
          cy={parseFloat(points[points.length - 1].split(",")[1])}
          r="2.5"
          fill={s.color}
          style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
        />
      </svg>
    </div>
  );
}
