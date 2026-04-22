"use client";

import { useEffect, useRef } from "react";

export default function SovereignChrome() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const particleHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let coreX = mouseX;
    let coreY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let spotX = mouseX;
    let spotY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onDown = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%,-50%) scale(0.6)`;
        ringRef.current.style.borderColor = "rgba(255,49,49,0.9)";
      }
    };
    const onUp = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%,-50%) scale(1)`;
        ringRef.current.style.borderColor = "rgba(255,215,0,0.6)";
      }
    };

    const tick = () => {
      coreX += (mouseX - coreX) * 0.65;
      coreY += (mouseY - coreY) * 0.65;
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      spotX += (mouseX - spotX) * 0.08;
      spotY += (mouseY - spotY) * 0.08;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${coreX}px, ${coreY}px, 0) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${spotX}px ${spotY}px, rgba(255,215,0,0.045), transparent 60%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // Ambient rising particles
    const particleHost = particleHostRef.current;
    if (particleHost) {
      const interval = setInterval(() => {
        const p = document.createElement("div");
        const x = Math.random() * window.innerWidth;
        const dur = 8 + Math.random() * 12;
        const size = Math.random() * 2 + 1;
        p.style.cssText = `
          position:absolute;
          left:${x}px;
          bottom:-10px;
          width:${size}px;
          height:${size}px;
          background:${Math.random() > 0.85 ? "#00FF41" : "#FFD700"};
          border-radius:50%;
          opacity:0;
          box-shadow:0 0 6px currentColor;
          animation: data-stream ${dur}s linear forwards;
        `;
        particleHost.appendChild(p);
        setTimeout(() => p.remove(), dur * 1000);
      }, 420);
      return () => {
        clearInterval(interval);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousedown", onDown);
        window.removeEventListener("mouseup", onUp);
        cancelAnimationFrame(raf);
      };
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* TACTICAL GRID LAYER */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.14) 1px, transparent 1px),
            linear-gradient(rgba(255,215,0,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px, 80px 80px, 16px 16px, 16px 16px",
        }}
      />

      {/* RADIAL AMBIENT GLOW */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(1000px ellipse at 20% 0%, rgba(255,215,0,0.05), transparent 60%), radial-gradient(800px ellipse at 85% 90%, rgba(0,229,255,0.03), transparent 60%), radial-gradient(600px ellipse at 50% 50%, rgba(255,215,0,0.025), transparent 70%)",
        }}
      />

      {/* MOUSE SPOTLIGHT */}
      <div
        ref={spotlightRef}
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 transition-none"
      />

      {/* AMBIENT PARTICLES */}
      <div
        ref={particleHostRef}
        aria-hidden
        className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      />

      {/* CRT SCANLINES */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-[3] scanlines-overlay"
      />

      {/* GRAIN */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-[4] grain-overlay anim-grain"
      />

      {/* MOVING SCAN LINE */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
      >
        <div className="scan-line-gold" />
      </div>

      {/* CRT VIGNETTE */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-[6] crt-vignette"
      />

      {/* VIEWPORT CROSSHAIRS - top bars */}
      <div aria-hidden className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent z-[10] pointer-events-none" />
      <div aria-hidden className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent z-[10] pointer-events-none" />

      {/* CORNER BRACKETS */}
      <div aria-hidden className="fixed top-2 left-2 z-[10] pointer-events-none">
        <div className="w-4 h-4 border-t border-l border-gold/60" />
      </div>
      <div aria-hidden className="fixed top-2 right-2 z-[10] pointer-events-none">
        <div className="w-4 h-4 border-t border-r border-gold/60" />
      </div>
      <div aria-hidden className="fixed bottom-2 left-2 z-[10] pointer-events-none">
        <div className="w-4 h-4 border-b border-l border-gold/60" />
      </div>
      <div aria-hidden className="fixed bottom-2 right-2 z-[10] pointer-events-none">
        <div className="w-4 h-4 border-b border-r border-gold/60" />
      </div>

      {/* CUSTOM CURSOR */}
      <div ref={cursorRef} className="custom-cursor">
        <div className="cursor-core" />
      </div>
      <div
        ref={ringRef}
        className="custom-cursor anim-reticle"
        style={{ willChange: "left, top, transform" }}
      >
        <div className="cursor-ring" style={{ transform: "translate(-50%,-50%)" }}>
          <div className="cursor-reticle-h" />
          <div className="cursor-reticle-v" />
          <div
            className="absolute w-1 h-1 bg-gold rounded-full"
            style={{ top: "-3px", left: "50%", transform: "translateX(-50%)", boxShadow: "0 0 4px #FFD700" }}
          />
          <div
            className="absolute w-1 h-1 bg-gold rounded-full"
            style={{ bottom: "-3px", left: "50%", transform: "translateX(-50%)", boxShadow: "0 0 4px #FFD700" }}
          />
        </div>
      </div>
    </>
  );
}
