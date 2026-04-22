"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Line = {
  id: string;
  kind: "user" | "ok" | "err" | "sys" | "ascii";
  text: string;
};

const TELEPORT_TARGETS = [
  "overview",
  "command",
  "war-room",
  "war_room",
  "warroom",
  "blitz",
  "dubai",
  "dubai-blitz",
  "activity",
  "claws",
  "omni",
  "omnichat",
  "hive",
  "vault",
  "briefings",
  "portfolio",
  "radar",
  "symphony",
  "generals",
  "home",
  "landing",
] as const;

const TELEPORT_MAP: Record<string, { tab?: string; route?: string; label: string }> = {
  overview: { tab: "overview", label: "Overview" },
  command: { tab: "command", label: "Command / Generals" },
  "war-room": { tab: "war-room", label: "War Room" },
  war_room: { tab: "war-room", label: "War Room" },
  warroom: { tab: "war-room", label: "War Room" },
  activity: { tab: "activity", label: "Activity Log" },
  claws: { tab: "claws", label: "Claw Control" },
  omni: { tab: "omni", label: "Omni-Chat Hub" },
  omnichat: { tab: "omni", label: "Omni-Chat Hub" },
  hive: { tab: "overview", label: "Agent Hive (overview)" },
  vault: { tab: "overview", label: "HNW Vault (overview)" },
  briefings: { tab: "overview", label: "Classified Briefings (overview)" },
  portfolio: { tab: "overview", label: "Portfolio Matrix (overview)" },
  radar: { tab: "overview", label: "Market Radar (overview)" },
  home: { route: "/", label: "Landing / Ingress" },
  landing: { route: "/", label: "Landing / Ingress" },
  symphony: { tab: "war-room", label: "War Room / Symphony" },
  generals: { tab: "war-room", label: "War Room / Symphony" },
  blitz: { tab: "blitz", label: "Dubai Blitz" },
  dubai: { tab: "blitz", label: "Dubai Blitz" },
  "dubai-blitz": { tab: "blitz", label: "Dubai Blitz" },
};

const BANNER = [
  "  ███████╗ █████╗ ██╗   ██╗███████╗██████╗ ███████╗██╗ ██████╗ ███╗   ██╗",
  "  ██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██║██╔════╝ ████╗  ██║",
  "  ███████╗██║  ██║██║   ██║█████╗  ██████╔╝█████╗  ██║██║  ███╗██╔██╗ ██║",
  "  ╚════██║██║  ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══╝  ██║██║   ██║██║╚██╗██║",
  "  ███████║╚█████╔╝ ╚████╔╝ ███████╗██║  ██║███████╗██║╚██████╔╝██║ ╚████║",
  "  ╚══════╝ ╚════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝",
];

let lineId = 0;
const newId = () => `ln-${++lineId}`;

export default function SovereignTerminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const push = useCallback((kind: Line["kind"], text: string) => {
    setLines((prev) => [...prev, { id: newId(), kind, text }]);
  }, []);

  const pushMany = useCallback((entries: Array<Pick<Line, "kind" | "text">>) => {
    setLines((prev) => [
      ...prev,
      ...entries.map((e) => ({ id: newId(), ...e })),
    ]);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "`" && !typing) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    const opener = () => setOpen(true);
    window.addEventListener("sovereign:terminal:open", opener);
    return () => window.removeEventListener("sovereign:terminal:open", opener);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (lines.length === 0) {
        pushMany([
          ...BANNER.map((l) => ({ kind: "ascii" as const, text: l })),
          { kind: "sys", text: "" },
          { kind: "sys", text: "SOVEREIGN TERMINAL // NEURAL LINK ACTIVE" },
          { kind: "sys", text: "AUTH: Ω-5 · OPERATOR: ANTIGRAVITY · NODE: DXB-01" },
          { kind: "sys", text: "type `/help` — or `/teleport <target>` to warp" },
          { kind: "sys", text: "" },
        ]);
      }
    }
  }, [open, lines.length, pushMany]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines]);

  const teleport = useCallback(
    (raw: string) => {
      const target = raw.trim().toLowerCase().replace(/\s+/g, "-");
      const entry = TELEPORT_MAP[target];
      if (!entry) {
        push("err", `✖ unknown target: \"${raw}\"`);
        push("sys", `try one of: ${Array.from(new Set(TELEPORT_TARGETS)).join(", ")}`);
        return;
      }
      push("ok", `◈ warping → ${entry.label}`);
      window.dispatchEvent(
        new CustomEvent("sovereign:teleport", {
          detail: { tab: entry.tab, route: entry.route },
        })
      );
    },
    [push]
  );

  const runCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      push("user", `> ${trimmed}`);

      const [head, ...rest] = trimmed.startsWith("/") ? trimmed.slice(1).split(/\s+/) : trimmed.split(/\s+/);
      const cmd = head.toLowerCase();
      const arg = rest.join(" ");

      switch (cmd) {
        case "help":
        case "?":
          pushMany([
            { kind: "sys", text: "╔═ SOVEREIGN COMMAND REFERENCE ════════════════════════" },
            { kind: "sys", text: "║ /teleport <target>     warp to a section" },
            { kind: "sys", text: "║ /whoami                operator identity" },
            { kind: "sys", text: "║ /myrank                sovereign rank readout" },
            { kind: "sys", text: "║ /swarm_status          agent swarm diagnostics" },
            { kind: "sys", text: "║ /omni                  jump to Omni-Chat Hub" },
            { kind: "sys", text: "║ /pivot                 trigger hard pivot alert" },
            { kind: "sys", text: "║ /brain <groq|claude|gpt|grok|gemma>   set LLM brain" },
            { kind: "sys", text: "║ /seed <community>      dispatch growth seed" },
            { kind: "sys", text: "║ /trial <handle>        issue free trial token" },
            { kind: "sys", text: "║ /pulse <focus>         fire sovereign pulse (dubai-blitz|baja|general)" },
            { kind: "sys", text: "║ /grok <query>          scout X via Grok (needs XAI_API_KEY)" },
            { kind: "sys", text: "║ /clear                 clear terminal" },
            { kind: "sys", text: "║ /exit                  close terminal" },
            { kind: "sys", text: "╚════════════════════════════════════════════════════" },
          ]);
          break;

        case "teleport":
        case "warp":
        case "tp":
          if (!arg) {
            push("err", "usage: /teleport <target> — try `/teleport war-room`");
          } else {
            teleport(arg);
          }
          break;

        case "whoami":
          pushMany([
            { kind: "ok", text: "◆ OPERATOR: ANTIGRAVITY" },
            { kind: "sys", text: "  Rank       : SOVEREIGN PRIME" },
            { kind: "sys", text: "  Tier       : Ω-5 (Omega / Absolute)" },
            { kind: "sys", text: "  Status     : PRINTING MONEY" },
            { kind: "sys", text: "  Node       : DXB-01 · Dubai Edition" },
            { kind: "sys", text: "  Mandate    : Elite Realty · MENA" },
            { kind: "sys", text: "  Session    : 0x7B3A2F91" },
          ]);
          break;

        case "myrank":
        case "rank":
          pushMany([
            { kind: "ok", text: "▲ RANK SCAN COMPLETE" },
            { kind: "sys", text: "  Sovereign Class   : PRIME" },
            { kind: "sys", text: "  Command Level     : OMEGA" },
            { kind: "sys", text: "  Encryption        : AES-256 · Sentinel Ω-5" },
            { kind: "sys", text: "  Authority         : ABSOLUTE" },
            { kind: "sys", text: "  Mandate Vol.      : 1.04B AED under sovereign command" },
          ]);
          break;

        case "swarm_status":
        case "swarm":
          push("sys", "… querying sovereign swarm at localhost:5050 …");
          try {
            const res = await fetch("http://localhost:5050/api/agent_hive");
            if (!res.ok) throw new Error(`status ${res.status}`);
            const data = await res.json();
            const agents = Array.isArray(data) ? data : [];
            if (agents.length === 0) {
              push("err", "✖ hive returned empty — seed agents first");
            } else {
              push("ok", `◈ ${agents.length} agents online`);
              agents.slice(0, 12).forEach((a: { name?: string; status?: string; role?: string }) => {
                push(
                  "sys",
                  `  ${String(a.name || "unknown").padEnd(14)} ${String(a.status || "-").padEnd(8)} ${a.role || ""}`
                );
              });
            }
          } catch {
            pushMany([
              { kind: "err", text: "✖ hive offline — showing cached readout" },
              { kind: "sys", text: "  DOUGLAS         ACTIVE   strategic ops" },
              { kind: "sys", text: "  HERMES          ACTIVE   comms" },
              { kind: "sys", text: "  SENTINEL        ACTIVE   intel" },
              { kind: "sys", text: "  TRAVIS          STANDBY  acquisition" },
              { kind: "sys", text: "  AUREUS          STANDBY  finance" },
              { kind: "sys", text: "  KHAN            STANDBY  operations" },
              { kind: "sys", text: "  — 11 nodes total · 3 active · 8 standby" },
            ]);
          }
          break;

        case "omni":
        case "omnichat":
          teleport("omni");
          break;

        case "pivot":
          window.dispatchEvent(
            new CustomEvent("sovereign:pivot", {
              detail: {
                reason:
                  "TERMINAL-TRIGGERED HARD PIVOT · OPERATOR OVERRIDE · REALLOCATING SOVEREIGN SWARM",
              },
            })
          );
          push("ok", "◈ hard pivot dispatched");
          break;

        case "brain":
          if (!["gemma", "claude", "gpt", "grok", "groq"].includes(arg.toLowerCase())) {
            push("err", "usage: /brain <groq|gemma|claude|gpt|grok>");
          } else {
            window.dispatchEvent(
              new CustomEvent("sovereign:brain", { detail: { brain: arg.toLowerCase() } })
            );
            push("ok", `◈ brain switched → ${arg.toUpperCase()}`);
          }
          break;

        case "pulse":
          {
            const focus = (arg || "dubai-blitz").toLowerCase().trim();
            const norm =
              focus === "dubai" || focus === "blitz" || focus === "dubai-blitz" ? "dubai-blitz" :
              focus === "baja" || focus === "ensenada" || focus === "baja-ensenada" ? "baja-ensenada" :
              focus === "general" || focus === "status" ? "general" :
              focus;
            push("sys", `… firing sovereign pulse → ${norm}`);
            try {
              const res = await fetch("/api/symphony/pulse", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ focus: norm }),
              });
              const data = await res.json();
              if (!res.ok) {
                push("err", `✖ pulse failed: ${data.detail || data.error || res.status}`);
              } else {
                push("ok", `◈ pulse '${data.focus}' dispatched · ${data.team.length} generals · queue=${data.queue_depth_after}`);
                if (data.scout) {
                  if (data.scout.configured) {
                    push("sys", `  grok: live · ${data.scout.summary?.slice(0, 180) || ""}`);
                  } else {
                    push("sys", `  grok: baseline (no XAI_API_KEY yet)`);
                  }
                }
                (data.dispatched || []).slice(0, 6).forEach((d: { general: string; text: string }) => {
                  push("sys", `  ${d.general.padEnd(14)} → ${d.text.slice(0, 160)}`);
                });
              }
            } catch {
              push("err", "✖ symphony offline — start start_symphony.bat");
            }
            // Also open the War Room so the user can watch the queue drain
            window.dispatchEvent(new CustomEvent("sovereign:teleport", { detail: { tab: "war-room" } }));
          }
          break;

        case "grok":
        case "scout":
          if (!arg) {
            push("err", "usage: /grok <query>");
          } else {
            push("sys", `… scouting X via grok: ${arg}`);
            try {
              const res = await fetch("/api/symphony/grok-scout", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query: arg }),
              });
              const data = await res.json();
              if (!data.configured) {
                push("err", "✖ grok not configured — add XAI_API_KEY (or GROK_API_KEY) to .env and restart symphony");
                if (data.summary) push("sys", `  baseline: ${data.summary}`);
              }
              if (data.summary) push("ok", `◈ ${data.summary}`);
              (data.signals || []).slice(0, 6).forEach((s: string) => push("sys", `  · ${s}`));
              (data.citations || []).slice(0, 3).forEach((c: string) => push("sys", `  ↳ ${c}`));
            } catch {
              push("err", "✖ symphony offline");
            }
          }
          break;

        case "seed":
          if (!arg) {
            push("err", "usage: /seed <community> — e.g. /seed r/entrepreneur");
          } else {
            push("sys", `… dispatching growth seed to ${arg} …`);
            try {
              const res = await fetch("/api/growth/seed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ community: arg }),
              });
              const data = await res.json();
              push("ok", `◈ seed ${data.id || "dispatched"} → ${arg}`);
              if (data.copy) push("sys", `  hook: "${data.copy}"`);
            } catch {
              push("err", "✖ growth relay offline");
            }
          }
          break;

        case "trial":
          if (!arg) {
            push("err", "usage: /trial <handle>");
          } else {
            try {
              const res = await fetch("/api/trial/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handle: arg }),
              });
              const data = await res.json();
              push("ok", `◈ trial token issued for ${arg}`);
              push("sys", `  token   : ${data.token}`);
              push("sys", `  expires : ${data.expires}`);
            } catch {
              push("err", "✖ trial dispatcher offline");
            }
          }
          break;

        case "clear":
        case "cls":
          setLines([]);
          break;

        case "exit":
        case "quit":
          setOpen(false);
          break;

        default:
          push("err", `✖ unknown command: ${cmd} — try /help`);
      }
    },
    [push, pushMany, teleport]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input;
    setInput("");
    if (v.trim()) {
      setHistory((h) => [...h, v]);
      setHistIdx(-1);
    }
    runCommand(v);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  if (!open) {
    return (
      <button
        aria-label="Open Sovereign Terminal"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[80] px-3 py-2 border border-gold/30 bg-obsidian/80 backdrop-blur-md hover:border-gold hover:bg-gold/10 text-gold font-mono text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(255,215,0,0.15)]"
      >
        <span className="opacity-60 mr-2">`</span>
        <span>SOVEREIGN TERMINAL</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => setOpen(false)}
      />
      <div
        className="relative pointer-events-auto w-full max-w-4xl m-4 border border-gold/30 bg-obsidian/95 backdrop-blur-xl shadow-[0_0_60px_rgba(255,215,0,0.15)]"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        <div className="flex items-center justify-between border-b border-gold/20 px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-matrix rounded-full anim-pulse-matrix" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold">
              Sovereign Terminal · Neural Link
            </span>
            <span className="text-[9px] text-white/30 tracking-widest">Ω-5 / DXB-01</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/30 tracking-widest">ESC to close</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-alert text-[10px] px-2"
              aria-label="Close terminal"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="h-[60vh] max-h-[520px] overflow-y-auto px-4 py-3 text-[12px] leading-[1.6] relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,215,0,0.4) 0px, rgba(255,215,0,0.4) 1px, transparent 1px, transparent 3px)",
            }}
          />
          {lines.map((l) => (
            <div
              key={l.id}
              className={
                l.kind === "user"
                  ? "text-cyan"
                  : l.kind === "ok"
                  ? "text-matrix"
                  : l.kind === "err"
                  ? "text-alert"
                  : l.kind === "ascii"
                  ? "text-gold whitespace-pre"
                  : "text-white/70"
              }
            >
              {l.text || " "}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-gold/20 px-4 py-3">
          <span className="text-gold text-[13px]">◆</span>
          <span className="text-gold/60 text-[12px]">sovereign@dxb-01:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-white text-[13px] placeholder:text-white/20"
            placeholder="type /help"
          />
          <span className="w-2 h-4 bg-gold animate-pulse" />
        </form>
      </div>
    </div>
  );
}
