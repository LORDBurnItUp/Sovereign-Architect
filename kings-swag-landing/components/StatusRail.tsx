"use client";

import { useEffect, useState } from "react";

export default function StatusRail() {
  const [time, setTime] = useState("");
  const [latency, setLatency] = useState(42);
  const [bandwidth, setBandwidth] = useState(847);
  const [bpm, setBpm] = useState(68);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dubaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
      const hh = dubaiTime.getHours().toString().padStart(2, "0");
      const mm = dubaiTime.getMinutes().toString().padStart(2, "0");
      const ss = dubaiTime.getSeconds().toString().padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
      setLatency(38 + Math.random() * 10);
      setBandwidth(800 + Math.random() * 120);
      setBpm(64 + Math.random() * 14);
      setFrame((f) => f + 1);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-7 bg-obsidian/95 backdrop-blur-xl border-t border-gold/20 flex items-center">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="flex items-center gap-6 px-4 font-mono text-[9px] tracking-widest flex-1 min-w-0 overflow-hidden">
        <PillGroup label="DXB" value={time} color="gold" active />
        <PillGroup label="GPS" value="25.2048°N 55.2708°E" color="white" />
        <PillGroup label="ENC" value="AES-256-GCM" color="matrix" />
        <PillGroup label="LAT" value={`${latency.toFixed(0)}ms`} color={latency < 45 ? "matrix" : "alert"} />
        <PillGroup label="BW" value={`${bandwidth.toFixed(0)} Mb/s`} color="cyan" />
        <PillGroup label="OP HR" value={`${bpm.toFixed(0)} BPM`} color="gold" />
      </div>

      <div className="flex items-center gap-3 px-4 flex-shrink-0">
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          FRAME {frame.toString().padStart(6, "0")}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-white/40 tracking-widest">CMD</span>
          <span className="kbd">⌘K</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-matrix rounded-full anim-pulse-matrix" />
          <span className="font-mono text-[9px] text-matrix tracking-widest">LINK OK</span>
        </div>
      </div>
    </div>
  );
}

function PillGroup({
  label,
  value,
  color,
  active = false,
}: {
  label: string;
  value: string;
  color: "gold" | "matrix" | "cyan" | "white" | "alert";
  active?: boolean;
}) {
  const colorClass =
    color === "gold"
      ? "text-gold"
      : color === "matrix"
      ? "text-matrix"
      : color === "cyan"
      ? "text-cyan"
      : color === "alert"
      ? "text-alert"
      : "text-white/70";
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-white/30">{label}</span>
      <span className={`${colorClass} tabular-nums`}>{value}</span>
      {active && (
        <div className="w-1 h-1 rounded-full bg-gold anim-pulse-gold" />
      )}
    </div>
  );
}
