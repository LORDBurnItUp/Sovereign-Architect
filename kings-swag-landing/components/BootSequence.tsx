"use client";

import { useEffect, useState } from "react";

const BOOT_LINES = [
  { t: 80, text: "▸ Establishing sovereign uplink...", status: "OK" },
  { t: 180, text: "▸ Mounting neural cortex [11-node swarm]", status: "OK" },
  { t: 280, text: "▸ Cryptographic handshake AES-256-GCM", status: "OK" },
  { t: 380, text: "▸ GPS lock — 25.2048°N, 55.2708°E (DXB)", status: "LOCKED" },
  { t: 480, text: "▸ Loading HNW client registry [2,847 profiles]", status: "OK" },
  { t: 580, text: "▸ Territory heatmap — 14 zones online", status: "OK" },
  { t: 680, text: "▸ Market velocity sensors calibrated", status: "OK" },
  { t: 780, text: "▸ Revenue pipeline — LIVE", status: "ACTIVE" },
  { t: 860, text: "▸ Biosig auth — SOVEREIGN LEVEL 5", status: "GRANTED" },
  { t: 940, text: "▸ B.L.A.S.T. v3.0 — operator ready.", status: "READY" },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.t);
    });
    const endTimer = setTimeout(() => setEnding(true), 1300);
    const doneTimer = setTimeout(() => onComplete(), 1900);
    return () => {
      clearTimeout(endTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[200] bg-obsidian flex items-center justify-center transition-opacity duration-500 ${
        ending ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.22) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 scanlines-overlay pointer-events-none" />

      <div className="relative w-[720px] max-w-[92vw] p-10 border border-gold/30 bg-obsidian-200/60 backdrop-blur-xl sovereign-border">
        <div className="corner-tl corner-tr corner-bl corner-br absolute inset-0 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-gold rounded-full anim-pulse-gold" />
            </div>
            <span className="font-mono text-[10px] text-gold tracking-[0.4em] uppercase">
              Sovereign OS // Node_01
            </span>
          </div>
          <span className="font-mono text-[10px] text-white/30">v3.0.1 ALPHA</span>
        </div>

        {/* Logo mark */}
        <div className="text-center mb-10">
          <div className="text-[10px] font-mono tracking-[0.6em] text-gold/60 uppercase mb-2">
            B — L — A — S — T
          </div>
          <div className="text-5xl font-orbitron font-black tracking-tighter uppercase italic">
            <span className="shimmer-gold">Sovereign Black</span>
          </div>
          <div className="text-[11px] font-mono text-white/30 tracking-widest mt-3">
            BILLIONAIRE LEVEL AUTONOMOUS STRATEGIC TERMINAL
          </div>
        </div>

        {/* Boot log */}
        <div className="font-mono text-[11px] space-y-1 min-h-[280px]">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-white/70">{line.text}</span>
              <span
                className={`text-[9px] px-2 py-0.5 border ${
                  line.status === "OK"
                    ? "text-matrix border-matrix/40"
                    : line.status === "LOCKED" || line.status === "ACTIVE" || line.status === "GRANTED"
                    ? "text-gold border-gold/40"
                    : "text-cyan border-cyan/40"
                }`}
              >
                {line.status}
              </span>
            </div>
          ))}
          {visibleLines < BOOT_LINES.length && (
            <span className="text-gold anim-caret inline-block w-2 h-3 bg-gold ml-1" />
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-[2px] bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold via-gold-soft to-gold transition-all duration-150 ease-out"
            style={{
              width: `${(visibleLines / BOOT_LINES.length) * 100}%`,
              boxShadow: "0 0 12px #FFD700",
            }}
          />
        </div>

        <div className="mt-4 flex justify-between font-mono text-[9px] text-white/30">
          <span>{Math.round((visibleLines / BOOT_LINES.length) * 100)}%</span>
          <span>
            {visibleLines < BOOT_LINES.length
              ? "INITIALIZING..."
              : "HANDSHAKE COMPLETE"}
          </span>
        </div>
      </div>
    </div>
  );
}
