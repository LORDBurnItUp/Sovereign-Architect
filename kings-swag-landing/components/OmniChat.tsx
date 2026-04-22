"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Users,
  Sparkles,
  Megaphone,
  Gift,
  Bot,
  Hash,
  Loader2,
  Zap,
} from "lucide-react";

type Provider = "discord" | "telegram" | "whatsapp" | "messenger" | "global";
type Brain = "gemma" | "claude" | "gpt";

type Msg = {
  id: string;
  provider: Provider;
  author: string;
  handle?: string;
  text: string;
  ts: string;
  kind?: "user" | "agent" | "seed" | "system";
};

const PROVIDERS: { id: Provider; label: string; color: string; glyph: string; bridged: boolean }[] = [
  { id: "global",    label: "Global",    color: "text-amber-300", glyph: "◈", bridged: true },
  { id: "discord",   label: "Discord",   color: "text-indigo-300", glyph: "⌘", bridged: false },
  { id: "telegram",  label: "Telegram",  color: "text-cyan-300",   glyph: "✈", bridged: false },
  { id: "whatsapp",  label: "WhatsApp",  color: "text-emerald-300", glyph: "◉", bridged: false },
  { id: "messenger", label: "Messenger", color: "text-blue-300",   glyph: "▲", bridged: false },
];

const BRAINS: { id: Brain; label: string; tag: string; color: string }[] = [
  { id: "gemma",  label: "Gemma 4 · 26B", tag: "local", color: "text-matrix" },
  { id: "claude", label: "Claude Opus 4.7", tag: "api", color: "text-amber-300" },
  { id: "gpt",    label: "GPT-4o", tag: "api", color: "text-cyan-300" },
];

let mid = 0;
const nextId = () => `m-${++mid}`;

function fmtTime(d: Date = new Date()) {
  return d.toTimeString().slice(0, 8);
}

export default function OmniChat() {
  const [provider, setProvider] = useState<Provider>("global");
  const [brain, setBrain] = useState<Brain>("gemma");
  const [messages, setMessages] = useState<Record<Provider, Msg[]>>({
    global: [],
    discord: [],
    telegram: [],
    whatsapp: [],
    messenger: [],
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSeed, setAutoSeed] = useState(false);
  const [viewers, setViewers] = useState(142);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { brain?: Brain };
      if (detail?.brain && BRAINS.some((b) => b.id === detail.brain)) {
        setBrain(detail.brain);
      }
    };
    window.addEventListener("sovereign:brain", handler);
    return () => window.removeEventListener("sovereign:brain", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/omnichat/messages?provider=${provider}`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as Msg[];
        if (!cancelled) {
          setMessages((prev) => ({ ...prev, [provider]: data }));
        }
      } catch {
        if (!cancelled) {
          setMessages((prev) =>
            prev[provider].length > 0 ? prev : { ...prev, [provider]: fallbackSeed(provider) }
          );
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  useEffect(() => {
    const t = setInterval(() => {
      setViewers((v) => Math.max(60, v + (Math.floor(Math.random() * 7) - 3)));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, provider]);

  useEffect(() => {
    if (!autoSeed) return;
    const t = setInterval(() => {
      const seeds = AGENT_SEEDS;
      const s = seeds[Math.floor(Math.random() * seeds.length)];
      setMessages((prev) => ({
        ...prev,
        [provider]: [
          ...prev[provider],
          {
            id: nextId(),
            provider,
            author: s.agent,
            kind: "seed",
            text: s.copy,
            ts: fmtTime(),
          },
        ],
      }));
    }, 7000);
    return () => clearInterval(t);
  }, [autoSeed, provider]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg: Msg = {
      id: nextId(),
      provider,
      author: "ANTIGRAVITY",
      handle: "sovereign",
      kind: "user",
      text,
      ts: fmtTime(),
    };
    setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], userMsg] }));
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/omnichat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, brain, text }),
      });
      const data = await res.json();
      const reply: Msg = {
        id: nextId(),
        provider,
        author: data.author || `SWARM-${brain.toUpperCase()}`,
        kind: "agent",
        text: data.reply || "...",
        ts: fmtTime(),
      };
      setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], reply] }));
    } catch {
      const fallback: Msg = {
        id: nextId(),
        provider,
        author: `SWARM-${brain.toUpperCase()}`,
        kind: "agent",
        text: cannedReply(text, brain),
        ts: fmtTime(),
      };
      setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], fallback] }));
    } finally {
      setBusy(false);
    }
  }, [input, busy, provider, brain]);

  const dispatchSeed = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community: provider, brain }),
      });
      const data = await res.json();
      const seedMsg: Msg = {
        id: nextId(),
        provider,
        author: data.agent || "HERMES",
        kind: "seed",
        text: data.copy || "◆ sovereign beta drops for first 12 responders — drop your handle",
        ts: fmtTime(),
      };
      setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], seedMsg] }));
    } catch {
      const seedMsg: Msg = {
        id: nextId(),
        provider,
        author: "HERMES",
        kind: "seed",
        text: "◆ sovereign beta drops for first 12 responders — drop your handle",
        ts: fmtTime(),
      };
      setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], seedMsg] }));
    }
  }, [provider, brain]);

  const issueTrial = useCallback(async () => {
    try {
      const res = await fetch("/api/trial/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: `omnichat-${provider}-${Date.now()}` }),
      });
      const data = await res.json();
      const msg: Msg = {
        id: nextId(),
        provider,
        author: "AUREUS",
        kind: "system",
        text: `✦ FREE TRIAL TOKEN · ${data.token} · expires ${data.expires}`,
        ts: fmtTime(),
      };
      setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], msg] }));
    } catch {
      const msg: Msg = {
        id: nextId(),
        provider,
        author: "AUREUS",
        kind: "system",
        text: "✦ trial dispatcher offline — wire /api/trial/issue",
        ts: fmtTime(),
      };
      setMessages((prev) => ({ ...prev, [provider]: [...prev[provider], msg] }));
    }
  }, [provider]);

  const current = messages[provider] ?? [];
  const activeProv = useMemo(
    () => PROVIDERS.find((p) => p.id === provider)!,
    [provider]
  );

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6">
      <div className="col-span-12 lg:col-span-9">
        <div className="glass-panel sovereign-border flex flex-col h-[680px]">
          <div className="flex items-center justify-between border-b border-gold/10 px-5 py-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Hash size={14} className="text-gold" />
              <span className={`font-orbitron text-sm font-black uppercase tracking-widest ${activeProv.color}`}>
                {activeProv.glyph} {activeProv.label}
              </span>
              <span className="font-mono text-[9px] text-white/40 tracking-widest uppercase">
                {activeProv.bridged ? "sovereign-bridged" : "api-pending · mock feed"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase">
              <span className="flex items-center gap-1 text-matrix">
                <Users size={11} /> {viewers} online
              </span>
              <span className="text-white/30">· brain:</span>
              <span className={BRAINS.find((b) => b.id === brain)!.color}>
                {BRAINS.find((b) => b.id === brain)!.label}
              </span>
            </div>
          </div>

          <div className="flex gap-1 px-3 pt-3 overflow-x-auto">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`px-3 py-2 text-[10px] font-orbitron font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${
                  provider === p.id
                    ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                    : "border-white/5 bg-white/[0.015] text-white/40 hover:text-white/70 hover:border-gold/20"
                }`}
              >
                <span className={`${p.color} mr-1`}>{p.glyph}</span>
                {p.label}
                {!p.bridged && <span className="ml-1 opacity-30 text-[8px]">· mock</span>}
              </button>
            ))}
          </div>

          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-3 relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,215,0,0.3) 0px, rgba(255,215,0,0.3) 1px, transparent 1px, transparent 3px)",
              }}
            />
            {current.length === 0 && (
              <div className="text-center py-12 text-white/30 font-mono text-xs">
                <Bot size={28} className="mx-auto mb-3 opacity-30" />
                <p>channel is quiet — seed it</p>
              </div>
            )}
            {current.map((m) => (
              <ChatBubble key={m.id} msg={m} />
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-white/40 text-xs font-mono pl-1">
                <Loader2 size={12} className="animate-spin" />
                swarm composing via {brain.toUpperCase()}…
              </div>
            )}
          </div>

          <div className="border-t border-gold/10 px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gold text-[14px]">◆</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`broadcast to ${activeProv.label.toLowerCase()} …`}
                className="flex-1 min-w-[200px] bg-transparent outline-none text-white text-sm font-mono placeholder:text-white/20"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="px-4 py-2 bg-gold/10 border border-gold/40 text-gold font-orbitron text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 disabled:opacity-30 transition-all flex items-center gap-2"
              >
                <Send size={11} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <div className="glass-panel sovereign-border p-5">
          <div className="hud-label mb-3 flex items-center gap-2">
            <Sparkles size={11} /> Brain Switch
          </div>
          <div className="flex flex-col gap-2">
            {BRAINS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBrain(b.id)}
                className={`text-left p-3 border transition-all ${
                  brain === b.id
                    ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(255,215,0,0.1)]"
                    : "border-white/5 bg-white/[0.015] text-white/50 hover:border-gold/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-orbitron text-[11px] font-black uppercase tracking-widest ${brain === b.id ? "text-gold" : b.color}`}>
                    {b.label}
                  </span>
                  <span className="font-mono text-[8px] uppercase text-white/30 tracking-widest">
                    {b.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] text-white/30 leading-relaxed tracking-wide">
            Switches the LLM used by the sovereign swarm for the active channel.
          </p>
        </div>

        <div className="glass-panel sovereign-border p-5">
          <div className="hud-label mb-3 flex items-center gap-2">
            <Megaphone size={11} /> Growth Swarm
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={dispatchSeed}
              className="p-3 border border-matrix/40 bg-matrix/5 text-matrix hover:bg-matrix/15 text-left transition-all"
            >
              <div className="font-orbitron text-[11px] font-black uppercase tracking-widest">
                ◈ Dispatch Seed
              </div>
              <div className="font-mono text-[9px] text-white/40 mt-1">
                Post a sovereign hook to current channel
              </div>
            </button>
            <button
              onClick={issueTrial}
              className="p-3 border border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 text-left transition-all"
            >
              <div className="font-orbitron text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                <Gift size={11} /> Issue Free Trial
              </div>
              <div className="font-mono text-[9px] text-white/40 mt-1">
                Drop a 7-day sovereign beta key
              </div>
            </button>
            <label className="p-3 border border-white/10 bg-white/[0.015] flex items-center justify-between cursor-pointer hover:border-cyan/30 transition-all">
              <span className="font-orbitron text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-2">
                <Zap size={11} /> Auto-seed
              </span>
              <input
                type="checkbox"
                checked={autoSeed}
                onChange={(e) => setAutoSeed(e.target.checked)}
                className="accent-gold"
              />
            </label>
          </div>
          <p className="mt-3 font-mono text-[9px] text-white/30 leading-relaxed tracking-wide">
            Agents drop hooks & proof-of-work into the channel every ~7s when auto-seed is on.
          </p>
        </div>

        <div className="glass-panel sovereign-border p-5">
          <div className="hud-label mb-3">Bridge Status</div>
          <div className="space-y-2 text-[10px] font-mono">
            {PROVIDERS.filter((p) => p.id !== "global").map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <span className={p.color}>
                  {p.glyph} {p.label}
                </span>
                <span className={p.bridged ? "text-matrix" : "text-white/30"}>
                  {p.bridged ? "◉ LIVE" : "◯ MOCK"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[8px] text-white/30 leading-relaxed tracking-wide">
            Wire real API creds in <span className="text-gold">.env</span>: DISCORD_BOT_TOKEN, TELEGRAM_BOT_TOKEN, META_GRAPH_TOKEN.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.kind === "user";
  const isSeed = msg.kind === "seed";
  const isSystem = msg.kind === "system";
  const isAgent = msg.kind === "agent";

  const border = isUser
    ? "border-cyan/30"
    : isSeed
    ? "border-matrix/30"
    : isSystem
    ? "border-amber-300/30"
    : "border-gold/20";

  const authorColor = isUser
    ? "text-cyan"
    : isSeed
    ? "text-matrix"
    : isSystem
    ? "text-amber-300"
    : "text-gold";

  return (
    <div className={`relative border-l-2 ${border} pl-3 py-1`}>
      <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest uppercase mb-0.5">
        <span className={`${authorColor} font-orbitron font-black`}>{msg.author}</span>
        {msg.handle && <span className="text-white/30">@{msg.handle}</span>}
        <span className="text-white/20">· {msg.ts}</span>
        {isSeed && <span className="text-matrix/60">· seed</span>}
        {isAgent && <span className="text-gold/60">· swarm</span>}
      </div>
      <div className={`text-[13px] leading-relaxed ${isSystem ? "text-amber-200 font-mono" : "text-white/85"}`}>
        {msg.text}
      </div>
    </div>
  );
}

const AGENT_SEEDS = [
  {
    agent: "HERMES",
    copy: "◈ just dropped a sovereign market pull — 3 off-market Palm Jumeirah units surfaced before brokers got em. dm for the leak.",
  },
  {
    agent: "DOUGLAS",
    copy: "running 11 swarm nodes 24/7. last week: +AED 2.4M pipeline. ask about the sovereign beta if you want in.",
  },
  {
    agent: "SENTINEL",
    copy: "intel drop: 7 new HNW leads in the MENA vault tonight. first 3 responders get the proof-of-work dashboard for free.",
  },
  {
    agent: "TRAVIS",
    copy: "free sovereign trial: 7 days full access, no card. drop ✦ in thread if you want a token.",
  },
  {
    agent: "AUREUS",
    copy: "sovereign treasury: 1.04B AED under command. b.l.a.s.t. pays for itself in 4 days. truth.",
  },
];

function fallbackSeed(p: Provider): Msg[] {
  const now = new Date();
  const ago = (s: number) =>
    fmtTime(new Date(now.getTime() - s * 1000));
  const base: Msg[] = [
    {
      id: nextId(),
      provider: p,
      author: "DOUGLAS",
      kind: "agent",
      text: "◈ sovereign neural link synced · channel armed",
      ts: ago(420),
    },
    {
      id: nextId(),
      provider: p,
      author: "HERMES",
      kind: "seed",
      text: "◆ dropped 3 HNW leads into the vault 12 min ago — anyone want the scan?",
      ts: ago(300),
    },
    {
      id: nextId(),
      provider: p,
      author: "cipher_42",
      kind: "user",
      handle: "cipher_42",
      text: "how do i get sovereign beta?",
      ts: ago(120),
    },
    {
      id: nextId(),
      provider: p,
      author: "TRAVIS",
      kind: "agent",
      text: "drop ✦ in the thread — issuing free 7-day tokens to first 12 responders.",
      ts: ago(60),
    },
  ];
  return base;
}

function cannedReply(input: string, brain: Brain) {
  const lower = input.toLowerCase();
  const flavor =
    brain === "gemma" ? "[local · gemma-4]" : brain === "claude" ? "[api · opus-4.7]" : "[api · gpt-4o]";
  if (lower.includes("help") || lower.includes("?")) {
    return `${flavor} sovereign swarm online — seed growth via the right panel, or teleport via the terminal (backtick).`;
  }
  if (lower.includes("trial") || lower.includes("beta")) {
    return `${flavor} dispatch an /api/trial/issue call — you'll get a 7-day sovereign key.`;
  }
  if (lower.includes("price") || lower.includes("cost")) {
    return `${flavor} sovereign tier runs 10/mo — first week is free, no card. scale to pro at 99/mo when you want the full swarm.`;
  }
  return `${flavor} received: "${input.slice(0, 80)}" — swarm logged for follow-up.`;
}
