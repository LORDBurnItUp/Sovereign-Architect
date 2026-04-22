"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Command {
  id: string;
  category: string;
  label: string;
  hint: string;
  shortcut?: string;
  action?: () => void;
}

const COMMANDS: Command[] = [
  { id: "deploy-hunter", category: "DEPLOY", label: "Deploy Billionaire Hunter // Palm Jumeirah", hint: "Launch sovereign agent on territory PLM-01" },
  { id: "deploy-hermes", category: "DEPLOY", label: "Deploy Hermes // Outbound HNW Engagement", hint: "Initiate encrypted outreach sequence" },
  { id: "deploy-auditor", category: "DEPLOY", label: "Run Auditor Sweep", hint: "Recalculate ROI across all active variants" },
  { id: "deploy-apex", category: "DEPLOY", label: "Launch APEX Closer Protocol", hint: "Final-mile negotiation assistance" },
  { id: "nav-territory", category: "NAVIGATE", label: "Open Territory Map", hint: "Focus Dubai heatmap panel" },
  { id: "nav-leads", category: "NAVIGATE", label: "View HNW Pipeline", hint: "Classified target dossier" },
  { id: "nav-money", category: "NAVIGATE", label: "Capital Stream", hint: "Live revenue feed" },
  { id: "intel-market", category: "INTELLIGENCE", label: "Market Pulse Briefing", hint: "Today's territory velocity report" },
  { id: "intel-competitor", category: "INTELLIGENCE", label: "Competitor Intelligence", hint: "Scan rival agency listings" },
  { id: "intel-regs", category: "INTELLIGENCE", label: "RERA / DLD Regulatory Feed", hint: "Latest Dubai Land Dept updates" },
  { id: "op-pivot", category: "OPERATION", label: "▲ TRIGGER HARD PIVOT", hint: "Force swarm reallocation to top variant" },
  { id: "op-encrypt", category: "OPERATION", label: "Rotate AES-256 Key", hint: "Cycle session encryption" },
  { id: "op-export", category: "OPERATION", label: "Export Pipeline → Encrypted PDF", hint: "Generate signed VIP briefing" },
  { id: "cfg-sound", category: "CONFIG", label: "Toggle Ambient Hum", hint: "Background OS resonance" },
  { id: "cfg-theme", category: "CONFIG", label: "Toggle Midnight Obsidian", hint: "Switch between obsidian depth levels" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIdx(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const g: Record<string, Command[]> = {};
    filtered.forEach((c) => {
      g[c.category] = g[c.category] || [];
      g[c.category].push(c);
    });
    return g;
  }, [filtered]);

  const flat = filtered;

  useEffect(() => {
    if (activeIdx >= flat.length) setActiveIdx(0);
  }, [flat.length, activeIdx]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = flat[activeIdx];
      if (selected?.action) {
        selected.action();
      } else {
        // Post action to the Python backend
        fetch("http://localhost:5050/api/infra/commands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: selected.id }),
        }).then(res => res.json())
          .then(data => console.log("Command Result:", data))
          .catch(console.error);
      }
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center pt-[12vh] px-6"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-md" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl glass-deep sovereign-border"
      >
        <div className="corner-tl corner-tr corner-bl corner-br absolute inset-0 pointer-events-none" />

        {/* Prompt */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gold/15">
          <span className="font-mono text-gold text-sm">▸</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Issue sovereign directive..."
            className="flex-1 bg-transparent outline-none font-mono text-sm text-white placeholder:text-white/20 tracking-wide"
          />
          <span className="kbd">ESC</span>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {Object.entries(grouped).map(([cat, cmds]) => (
            <div key={cat} className="py-2">
              <div className="px-5 pb-1 text-[9px] font-mono text-gold/50 tracking-[0.4em] uppercase">
                {cat}
              </div>
              {cmds.map((c) => {
                const globalIdx = flat.indexOf(c);
                const isActive = activeIdx === globalIdx;
                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    className={`relative px-5 py-2.5 flex items-center gap-4 ${
                      isActive ? "bg-gold/10" : ""
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold" style={{ boxShadow: "0 0 10px #FFD700" }} />
                    )}
                    <span
                      className={`font-mono text-xs ${
                        isActive ? "text-gold" : "text-white/30"
                      }`}
                    >
                      {isActive ? "▸" : "·"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-orbitron text-sm tracking-wide ${
                          isActive ? "text-gold" : "text-white/80"
                        }`}
                      >
                        {c.label}
                      </div>
                      <div className="font-mono text-[10px] text-white/30 truncate">
                        {c.hint}
                      </div>
                    </div>
                    {isActive && <span className="kbd">⏎</span>}
                  </div>
                );
              })}
            </div>
          ))}

          {flat.length === 0 && (
            <div className="p-10 text-center font-mono text-xs text-white/30 tracking-wider">
              NO DIRECTIVE MATCHES — REWORD QUERY
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-5 py-3 border-t border-gold/10 flex justify-between items-center">
          <div className="flex gap-4 font-mono text-[9px] text-white/30 tracking-widest">
            <span><span className="kbd">↑↓</span> navigate</span>
            <span><span className="kbd">⏎</span> execute</span>
            <span><span className="kbd">ESC</span> abort</span>
          </div>
          <span className="font-mono text-[9px] text-gold/40 tracking-widest">
            SOVEREIGN OS · L5
          </span>
        </div>
      </div>
    </div>
  );
}
