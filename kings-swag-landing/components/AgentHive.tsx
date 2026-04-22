"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

interface Agent {
  id: string;
  label: string;
  role: string;
  x: number;
  y: number;
  status: string;
  orbit?: number;
}

const AGENTS: Agent[] = [
  { id: "brain",     label: "SOVEREIGN",     role: "Prime Cortex",         x: 400, y: 250, status: "EXECUTING" },
  { id: "architect", label: "ARCHITECT",     role: "Product Systems",      x: 400, y: 110, status: "THINKING" },
  { id: "hunter",    label: "HUNTER",        role: "HNW Prospecting",      x: 600, y: 150, status: "ACTIVE" },
  { id: "auditor",   label: "AUDITOR",       role: "ROI Governance",       x: 200, y: 150, status: "EXECUTING" },
  { id: "executor",  label: "EXECUTOR",      role: "Ops & Closings",       x: 600, y: 350, status: "ACTIVE" },
  { id: "sentinel",  label: "SENTINEL",      role: "Threat Counter-Intel", x: 200, y: 350, status: "IDLE" },
  { id: "hermes",    label: "HERMES",        role: "Outbound Messaging",   x: 400, y: 400, status: "ACTIVE" },
  { id: "douglas",   label: "DOUGLAS",       role: "Legal & Compliance",   x: 720, y: 250, status: "IDLE" },
  { id: "apex",      label: "APEX",          role: "Final-Mile Closer",    x: 80,  y: 250, status: "EXECUTING" },
  { id: "nexus",     label: "NEXUS",         role: "Data Integration",     x: 550, y: 80,  status: "THINKING" },
  { id: "echo",      label: "ECHO",          role: "Feedback Loop",        x: 250, y: 80,  status: "ACTIVE" },
];

const STATUS_COLORS: Record<string, string> = {
  EXECUTING: "#FFD700",
  ACTIVE:    "#00FF41",
  THINKING:  "#00E5FF",
  IDLE:      "#555555",
  ALERT:     "#FF3131",
};

export default function AgentHive() {
  const [agents, setAgents] = useState(AGENTS);
  const [selected, setSelected] = useState<Agent | null>(null);
  const particleContainerRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/agent_hive");
        const json = await res.json();
        setAgents((prev) =>
          prev.map((a) => {
            const m = json.find((j: { id: string; status: string }) => j.id === a.id);
            return m ? { ...a, status: m.status } : a;
          })
        );
      } catch {
        // Cycle fallback so UI breathes even offline
        setAgents((prev) =>
          prev.map((a) => {
            if (Math.random() > 0.85) {
              const pool = ["EXECUTING", "ACTIVE", "THINKING", "IDLE"];
              return { ...a, status: pool[Math.floor(Math.random() * pool.length)] };
            }
            return a;
          })
        );
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    agents.forEach((agent) => {
      const active = ["EXECUTING", "THINKING", "ACTIVE"].includes(agent.status);
      const color = STATUS_COLORS[agent.status];
      if (active) {
        gsap.to(`#pulse-${agent.id}`, {
          scale: 2.2,
          opacity: 0,
          duration: 1.8,
          repeat: -1,
          ease: "sine.out",
        });
      } else {
        gsap.killTweensOf(`#pulse-${agent.id}`);
        gsap.set(`#pulse-${agent.id}`, { scale: 1, opacity: 0 });
      }
      gsap.to(`#node-${agent.id}`, {
        fill: color,
        duration: 0.5,
      });
    });
  }, [agents]);

  const onHover = (agent: Agent) => {
    if (!particleContainerRef.current) return;
    for (let i = 0; i < 10; i++) {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      p.setAttribute("cx", agent.x.toString());
      p.setAttribute("cy", agent.y.toString());
      p.setAttribute("r", "1.5");
      p.setAttribute("fill", STATUS_COLORS[agent.status] || "#FFD700");
      particleContainerRef.current.appendChild(p);
      gsap.to(p, {
        cx: agent.x + (Math.random() - 0.5) * 80,
        cy: agent.y + (Math.random() - 0.5) * 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => p.remove(),
      });
    }
  };

  const activeCount = agents.filter((a) =>
    ["EXECUTING", "THINKING", "ACTIVE"].includes(a.status)
  ).length;

  const connections = useMemo(() => {
    const brain = agents[0];
    return agents.slice(1).map((a) => ({ id: a.id, x: a.x, y: a.y, bx: brain.x, by: brain.y, status: a.status }));
  }, [agents]);

  return (
    <div className="relative w-full h-[520px] glass-deep sovereign-border overflow-hidden group">
      {/* Header */}
      <div className="absolute top-5 left-6 right-6 z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-gold anim-pulse-gold rounded-full" />
            <span className="hud-label">Lattice · Neural Swarm</span>
          </div>
          <h3 className="text-xl font-orbitron font-black tracking-wider uppercase">
            Agent Hive // 11-Node Mesh
          </h3>
        </div>
        <div className="text-right">
          <div className="hud-label mb-0.5">Active</div>
          <div className="font-orbitron font-black text-2xl text-matrix">
            {activeCount.toString().padStart(2, "0")}
            <span className="text-xs text-white/30 ml-1">/{agents.length}</span>
          </div>
        </div>
      </div>

      {/* Corner HUD ticks */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-3 left-3 text-[9px] font-mono text-gold/40 tracking-widest">◤</div>
        <div className="absolute top-3 right-3 text-[9px] font-mono text-gold/40 tracking-widest">◥</div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-gold/40 tracking-widest">◣</div>
        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-gold/40 tracking-widest">◢</div>
      </div>

      <svg viewBox="0 0 800 500" className="w-full h-full px-10 pt-16 pb-10" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="hive-bg">
            <stop offset="0%" stopColor="rgba(255,215,0,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="brain-glow">
            <stop offset="0%" stopColor="rgba(255,215,0,0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx="400" cy="250" r="200" fill="url(#hive-bg)" />

        {/* Concentric rings */}
        {[60, 120, 180, 240].map((r) => (
          <circle
            key={r}
            cx="400"
            cy="250"
            r={r}
            fill="none"
            stroke="rgba(255,215,0,0.06)"
            strokeDasharray="2 4"
          />
        ))}

        {/* Radial spokes */}
        {[0, 30, 60, 90, 120, 150].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={400 - Math.cos(rad) * 250}
              y1={250 - Math.sin(rad) * 250}
              x2={400 + Math.cos(rad) * 250}
              y2={250 + Math.sin(rad) * 250}
              stroke="rgba(255,215,0,0.03)"
            />
          );
        })}

        {/* Connections with pulse */}
        <g>
          {connections.map((c) => {
            const active = ["EXECUTING", "THINKING", "ACTIVE"].includes(c.status);
            return (
              <line
                key={c.id}
                x1={c.bx}
                y1={c.by}
                x2={c.x}
                y2={c.y}
                stroke={active ? STATUS_COLORS[c.status] : "rgba(255,255,255,0.05)"}
                strokeWidth={active ? "0.6" : "0.3"}
                strokeOpacity={active ? 0.45 : 0.3}
                strokeDasharray={active ? "3 6" : "none"}
              >
                {active && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-18"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
            );
          })}
        </g>

        {/* Brain halo */}
        <circle cx="400" cy="250" r="50" fill="url(#brain-glow)" />

        <g ref={particleContainerRef} />

        {/* Nodes */}
        {agents.map((agent) => {
          const color = STATUS_COLORS[agent.status];
          const isBrain = agent.id === "brain";
          const isSelected = selected?.id === agent.id;
          return (
            <g
              key={agent.id}
              onMouseEnter={() => {
                onHover(agent);
                setSelected(agent);
              }}
              onMouseLeave={() => setSelected(null)}
              className="cursor-crosshair"
            >
              {/* Pulse ring */}
              <circle
                id={`pulse-${agent.id}`}
                cx={agent.x}
                cy={agent.y}
                r={isBrain ? 18 : 12}
                fill={color}
                opacity="0"
                style={{ transformOrigin: `${agent.x}px ${agent.y}px` }}
              />

              {/* Scan ring */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r={(isBrain ? 22 : 14) + (isSelected ? 8 : 0)}
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                strokeOpacity={isSelected ? "0.8" : "0.3"}
                strokeDasharray="2 3"
                style={{ transition: "all 0.3s" }}
              />

              {/* Main node */}
              <circle
                id={`node-${agent.id}`}
                cx={agent.x}
                cy={agent.y}
                r={isBrain ? 14 : 8}
                fill={color}
                style={{ filter: `drop-shadow(0 0 ${isBrain ? 14 : 8}px ${color})`, transition: "r 0.3s" }}
              />

              {/* Core dot */}
              <circle cx={agent.x} cy={agent.y} r={isBrain ? 5 : 2.5} fill="#020202" />
              <circle cx={agent.x} cy={agent.y} r={isBrain ? 2.5 : 1.2} fill={color} />

              {/* Label */}
              <g>
                <rect
                  x={agent.x - 48}
                  y={agent.y + (isBrain ? 24 : 18)}
                  width="96"
                  height="14"
                  fill="rgba(2,2,2,0.6)"
                  stroke={isSelected ? color : "rgba(255,215,0,0.15)"}
                  strokeWidth="0.5"
                />
                <text
                  x={agent.x}
                  y={agent.y + (isBrain ? 34 : 28)}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontFamily="monospace"
                  letterSpacing="2"
                  fill={isSelected ? color : "rgba(255,255,255,0.7)"}
                  style={{ transition: "fill 0.3s" }}
                >
                  {agent.label}
                </text>
              </g>

              {/* Hitbox */}
              <circle cx={agent.x} cy={agent.y} r="24" fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10 grid grid-cols-[1fr_auto] gap-4 items-end">
        <div className="p-3 bg-obsidian/80 border border-gold/10 backdrop-blur-md">
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: STATUS_COLORS[selected.status],
                    boxShadow: `0 0 8px ${STATUS_COLORS[selected.status]}`,
                  }}
                />
                <span className="font-orbitron text-[11px] font-black tracking-widest uppercase">
                  {selected.label}
                </span>
                <span className="font-mono text-[9px] text-white/30 tracking-widest">
                  · {selected.status}
                </span>
              </div>
              <div className="font-mono text-[10px] text-white/50">{selected.role}</div>
            </>
          ) : (
            <div className="font-mono text-[10px] text-white/30 tracking-widest">
              ◈ Hover node to inspect swarm actor
            </div>
          )}
        </div>

        <div className="px-3 py-2 bg-obsidian/80 border border-gold/10 backdrop-blur-md">
          <div className="font-mono text-[9px] text-white/40 tracking-widest">LATTICE SYNC</div>
          <div className="font-orbitron text-sm font-black text-matrix tracking-widest">LOCKED</div>
        </div>
      </div>
    </div>
  );
}
