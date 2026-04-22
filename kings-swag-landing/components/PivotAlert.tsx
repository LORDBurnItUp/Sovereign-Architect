"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PivotAlertProps {
  isVisible: boolean;
  reason: string;
  onClose: () => void;
}

export default function PivotAlert({ isVisible, reason, onClose }: PivotAlertProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleGhostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && overlayRef.current) {
      const tl = gsap.timeline();
      tl.set(overlayRef.current, { display: "flex" });
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.15 });
      tl.fromTo(
        overlayRef.current,
        { x: -8, skewX: 6 },
        { x: 8, skewX: -6, duration: 0.04, repeat: 12, yoyo: true, ease: "none" }
      );
      tl.set(overlayRef.current, { x: 0, skewX: 0 });

      gsap.to(titleRef.current, {
        opacity: 0.8,
        scale: 1.02,
        duration: 0.08,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });

      gsap.to(titleGhostRef.current, {
        x: 4,
        opacity: 0.6,
        duration: 0.12,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
    } else if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = "none";
        },
      });
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(titleGhostRef.current);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] bg-alert/25 backdrop-blur-3xl flex-col items-center justify-center text-center p-8 hidden"
      style={{ backgroundColor: "rgba(80, 0, 0, 0.92)" }}
    >
      {/* Background glitch stripes */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 w-full bg-white anim-glitch-x"
            style={{
              top: `${i * 5}%`,
              height: `${1 + Math.random() * 3}px`,
              opacity: Math.random() * 0.5,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,49,49,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,49,49,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
        }}
      />
      <div className="absolute inset-0 scanlines-overlay pointer-events-none opacity-60" />

      {/* Classification bar */}
      <div className="mb-8 px-8 py-2 border-2 border-white bg-white text-alert font-mono text-xs tracking-[0.5em] font-black">
        ▓▓▓ SOVEREIGN PROTOCOL BREACH ▓▓▓
      </div>

      {/* Title with ghost */}
      <div className="relative">
        <div
          ref={titleGhostRef}
          className="absolute inset-0 text-[120px] font-orbitron font-black text-cyan leading-none italic uppercase"
          style={{ textShadow: "0 0 40px rgba(0,229,255,0.8)" }}
        >
          HARD PIVOT
        </div>
        <div
          ref={titleRef}
          className="relative text-[120px] font-orbitron font-black text-white leading-none italic uppercase"
          style={{ textShadow: "0 0 50px rgba(255,255,255,0.8), 0 0 100px rgba(255,49,49,0.6)" }}
        >
          HARD PIVOT
        </div>
      </div>

      <div className="mt-8 text-3xl font-orbitron font-bold text-white tracking-[0.3em] uppercase">
        Auditor · Termination Level 5
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="w-12 h-[1px] bg-white" />
        <span className="font-mono text-xs text-white/70 tracking-widest">
          SWARM REALLOCATION IN PROGRESS
        </span>
        <div className="w-12 h-[1px] bg-white" />
      </div>

      <div className="mt-12 max-w-2xl font-mono text-white/90 leading-relaxed bg-obsidian/80 p-8 border border-white/30 relative">
        <div className="absolute -top-3 left-4 px-3 bg-alert text-white font-mono text-[10px] tracking-widest">
          REASON
        </div>
        <div className="text-base">{reason}</div>
        <div className="mt-6 text-[10px] opacity-60 uppercase tracking-widest">
          ▸ Shifting all active swarm resources toward top-performing variant
        </div>
        <div className="mt-1 text-[10px] opacity-60 uppercase tracking-widest">
          ▸ Auditor logging to immutable audit trail
        </div>
        <div className="mt-1 text-[10px] opacity-60 uppercase tracking-widest">
          ▸ Sentinel active · threat counter-intel engaged
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-12 px-16 py-6 border-2 border-white bg-white/5 text-white font-orbitron font-black text-xl uppercase tracking-[0.4em] hover:bg-white hover:text-alert transition-all duration-300"
      >
        ACKNOWLEDGE BREACH
      </button>

      <div className="mt-6 font-mono text-[10px] text-white/40 tracking-widest">
        PRESS ⏎ OR CLICK TO RESUME COMMAND
      </div>
    </div>
  );
}
