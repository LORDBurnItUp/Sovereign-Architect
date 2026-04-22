"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import gsap from "gsap";
import useSound from "use-sound";
import dynamic from "next/dynamic";
import {
  MoveRight,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Cpu,
  Lock,
  Compass,
  Radar,
  Crown,
  Scroll,
  Terminal,
  Flame,
  Mic,
  MicOff,
  Radio,
  Activity,
} from "lucide-react";

import RevenueTicker from "@/components/RevenueTicker";
import AgentHive from "@/components/AgentHive";
import MoneyStream from "@/components/MoneyStream";
import PivotAlert from "@/components/PivotAlert";
import SovereignChrome from "@/components/SovereignChrome";
import BootSequence from "@/components/BootSequence";
import TerritoryMap from "@/components/TerritoryMap";
import HNWLeadPipeline from "@/components/HNWLeadPipeline";
import MarketRadar from "@/components/MarketRadar";
import LiveCharts from "@/components/LiveCharts";
import CommandPalette from "@/components/CommandPalette";
import StatusRail from "@/components/StatusRail";
import ClassifiedBriefing from "@/components/ClassifiedBriefing";
import PortfolioMatrix from "@/components/PortfolioMatrix";
import SovereignTerminal from "@/components/SovereignTerminal";
import OmniChat from "@/components/OmniChat";
import SymphonyPanel from "@/components/SymphonyPanel";
import WarRoomMic from "@/components/WarRoomMic";
import DubaiBlitzTab from "@/components/DubaiBlitzTab";
import { useRouter } from "next/navigation";

const SovereignCanvas3D = dynamic(
  () => import("@/components/SovereignCanvas3D"),
  { ssr: false, loading: () => <div className="w-full h-full bg-obsidian" /> }
);

const SovereignCanvas = dynamic(() => import("@/components/SovereignCanvas"), {
  ssr: false,
});

type DashTab = "overview" | "command" | "war-room" | "activity" | "claws" | "omni" | "blitz";

export default function DashboardPage() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  const [showPivot, setShowPivot] = useState(false);
  const [pivotReason, setPivotReason] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({
    douglas: true,
    hermes: true,
    sentinel: true,
    travis: false,
    aureus: false,
    khan: false,
  });
  const [activityLog, setActivityLog] = useState<{ id: string; agent: string; action: string; timestamp: string }[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const gridLinesRef = useRef<SVGSVGElement>(null);
  const micRef = useRef<MediaRecorder | null>(null);

  const [playHum, { sound }] = useSound("/sounds/digital-hum.wav", {
    volume: 0.08,
    loop: true,
    interrupt: true,
  });

  useEffect(() => {
    const onTeleport = (e: Event) => {
      const detail = (e as CustomEvent).detail as { tab?: DashTab; route?: string };
      if (detail?.route) {
        router.push(detail.route);
        return;
      }
      if (detail?.tab) {
        setActiveTab(detail.tab);
        setActiveNav(detail.tab === "omni" ? "omni" : detail.tab);
      }
    };
    const onPivot = (e: Event) => {
      const detail = (e as CustomEvent).detail as { reason?: string };
      setPivotReason(detail?.reason || "TERMINAL-TRIGGERED PIVOT");
      setShowPivot(true);
    };
    window.addEventListener("sovereign:teleport", onTeleport);
    window.addEventListener("sovereign:pivot", onPivot);
    return () => {
      window.removeEventListener("sovereign:teleport", onTeleport);
      window.removeEventListener("sovereign:pivot", onPivot);
    };
  }, [router]);

  useEffect(() => {
    if (!booted) return;

    try {
      playHum();
    } catch {}

    // Mouse parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Grid Initialization
    const lines = gridLinesRef.current?.querySelectorAll(".grid-line");
    if (lines?.length) {
      tl.fromTo(
        lines,
        { strokeDasharray: 3000, strokeDashoffset: 3000, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 2, stagger: 0.1, ease: "power2.inOut" }
      );
    }

    // 2. Holographic Z-depth cards entry
    tl.fromTo(
      cardRefs.current.filter(Boolean),
      { opacity: 0, y: 60, z: -200, rotationX: 10, scale: 0.9, filter: "blur(20px)" },
      {
        opacity: 1,
        y: 0,
        z: 0,
        rotationX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.5,
        stagger: 0.1,
      },
      "-=1.2"
    );

    const checkPivot = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/agent_hive");
        const json = await res.json();
        const alertAgent = json.find((a: { status: string }) => a.status === "ALERT");
        if (alertAgent) {
          setPivotReason("LOW ROI DETECTED · AUDITOR TRIGGERED HARD PIVOT · REALLOCATING SWARM CAPACITY");
          setShowPivot(true);
        }
      } catch {}
    };
    checkPivot();
    const interval = setInterval(checkPivot, 8000);

    // Activity log polling
    const pollActivity = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/activity_log?limit=10");
        const logs = await res.json();
        setActivityLog(logs);
      } catch {}
    };
    pollActivity();
    const activityInterval = setInterval(pollActivity, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
      window.removeEventListener("mousemove", handleMouseMove);
      if (sound) sound.unload();
    };
  }, [booted, playHum, sound]);

  if (!booted) {
    return (
      <>
        <SovereignChrome />
        <BootSequence onComplete={() => setBooted(true)} />
      </>
    );
  }

  const toggleAgent = async (agent: string) => {
    const newState = !agentStates[agent];
    setAgentStates({ ...agentStates, [agent]: newState });

    try {
      await fetch("http://localhost:5050/api/agent_command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent,
          action: newState ? "activate" : "deactivate",
        }),
      });
    } catch (e) {
      console.error("Failed to toggle agent:", e);
    }
  };

  const toggleMic = async () => {
    if (!micActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        micRef.current = recorder;
        recorder.start();
        setMicActive(true);

        recorder.onstop = async () => {
          const blob = await new Promise<Blob>((resolve) => {
            recorder.ondataavailable = (e) => resolve(e.data);
          });

          const formData = new FormData();
          formData.append("audio", blob);

          try {
            const res = await fetch("http://localhost:5050/api/voice_command", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            console.log("Voice response:", data);
          } catch (e) {
            console.error("Voice command failed:", e);
          }
        };
      } catch (e) {
        console.error("Mic access denied:", e);
      }
    } else {
      micRef.current?.stop();
      setMicActive(false);
    }
  };

  return (
    <>
      <SovereignChrome />
      <CommandPalette />
      <StatusRail />
      <SovereignTerminal />

      <main
        ref={containerRef}
        className="relative min-h-screen text-white selection:bg-gold/30 pb-10 overflow-hidden"
      >
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-obsidian" />}>
            <SovereignCanvas3D />
          </Suspense>
        </div>

        {/* Overlay Canvas Grid */}
        <SovereignCanvas />

        <svg
          ref={gridLinesRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(255,215,0,0.3)" strokeWidth="1" className="grid-line" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(255,215,0,0.3)" strokeWidth="1" className="grid-line" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="rgba(255,215,0,0.3)" strokeWidth="1" className="grid-line" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="rgba(255,215,0,0.3)" strokeWidth="1" className="grid-line" />
        </svg>

        {/* TICKER */}
        <div className="sticky top-0 z-40 relative">
          <RevenueTicker />
        </div>

        {/* COMMAND TABS */}
        <div className="sticky top-14 z-39 backdrop-blur-3xl bg-obsidian/80 border-b border-gold/10">
          <div className="max-w-[2200px] mx-auto px-6 md:px-10 flex items-center gap-1 overflow-x-auto">
            {(["overview", "command", "war-room", "blitz", "activity", "claws", "omni"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-orbitron uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-gold text-gold bg-gold/5"
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
              >
                {tab === "overview" && "📊 Overview"}
                {tab === "command" && "⚡ Command"}
                {tab === "war-room" && "🎙️ War Room"}
                {tab === "blitz" && "🔥 Dubai Blitz"}
                {tab === "activity" && "📡 Activity"}
                {tab === "claws" && "🦾 Claw Control"}
                {tab === "omni" && "🌐 Omni-Chat"}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-20 px-6 md:px-10 pt-8 pb-12 max-w-[2200px] mx-auto">
          {/* ─── TOP HEADER ─── */}
          <header className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gold anim-pulse-gold rounded-full" />
                    <div className="absolute inset-0 w-3 h-3 border border-gold/40 rounded-full animate-ping" />
                  </div>
                  <span className="font-mono text-[10px] text-gold tracking-[0.5em] uppercase">
                    Sovereign Neural Interface // Node_01 // DXB
                  </span>
                  <span className="font-mono text-[9px] text-white/30 tracking-widest border border-white/10 px-2 py-0.5">
                    OPERATOR: ANTIGRAVITY
                  </span>
                </div>

                <div className="flex items-baseline gap-4 flex-wrap">
                  <h1 className="text-6xl md:text-7xl font-orbitron font-black uppercase tracking-tighter italic leading-none">
                    <span className="shimmer-gold">B.L.A.S.T.</span>
                    <span className="text-white/10 ml-3">v3.0</span>
                  </h1>
                  <div className="flex flex-col">
                    <span className="font-serif italic text-2xl text-gold-soft/80 leading-none">
                      Sovereign Black
                    </span>
                    <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] uppercase mt-0.5">
                      Dubai Edition · Elite Realty Division
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/30 tracking-widest">
                    <span className="text-gold/60">◈</span>
                    2026.04.20 · 14:42 DXB
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/30 tracking-widest">
                    <span className="text-gold/60">◆</span>
                    UPLINK · 847 Mb/s
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-matrix tracking-widest">
                    <div className="w-1 h-1 bg-matrix rounded-full anim-pulse-matrix" />
                    ALL SYSTEMS NOMINAL
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <SovereignChip icon={<Cpu size={11} />} label="Core" status="ACTIVE" color="matrix" />
                <SovereignChip icon={<Lock size={11} />} label="Cipher" status="AES-256" color="gold" />
                <SovereignChip icon={<Shield size={11} />} label="Sentinel" status="Ω-5" color="gold" />
                <SovereignChip icon={<Compass size={11} />} label="Zone" status="MENA-DXB" color="cyan" />
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-6 flex items-center gap-3">
              <div className="w-6 h-px bg-gold" />
              <span className="font-mono text-[9px] text-gold/40 tracking-[0.5em] uppercase">
                Tactical Holographic Interface — Command Authority Sovereign Level 5
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gold/40 to-transparent" />
            </div>
          </header>

          {/* ─── TAB CONTENT ─── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-12 gap-4 lg:gap-6 relative z-10" style={{ perspective: "1500px" }}>
            {/* LEFT NAV */}
            <aside
              ref={(el) => { cardRefs.current[0] = el; }}
              className="col-span-12 lg:col-span-2 flex flex-col gap-2"
            >
              <div className="hud-label px-2 mb-2">Directives</div>
              <SovereignNav
                icon={<TrendingUp size={16} />}
                label="Overview"
                active={activeNav === "overview"}
                onClick={() => setActiveNav("overview")}
              />
              <SovereignNav
                icon={<Radar size={16} />}
                label="Territory"
                active={activeNav === "territory"}
                onClick={() => setActiveNav("territory")}
              />
              <SovereignNav
                icon={<Crown size={16} />}
                label="HNW Vault"
                active={activeNav === "vault"}
                onClick={() => setActiveNav("vault")}
              />
              <SovereignNav
                icon={<Scroll size={16} />}
                label="Briefings"
                active={activeNav === "briefings"}
                onClick={() => setActiveNav("briefings")}
              />
              <SovereignNav
                icon={<Zap size={16} />}
                label="Licensing"
                onClick={() => window.open("https://gumroad.com", "_blank")}
                external
              />
              <SovereignNav
                icon={<Globe size={16} />}
                label="Marketplace"
                onClick={() => window.open("https://mercadopago.com.ar", "_blank")}
                external
              />
              <SovereignNav
                icon={<Terminal size={16} />}
                label="Terminal"
                onClick={() => window.dispatchEvent(new CustomEvent("sovereign:terminal:open"))}
              />
              <SovereignNav
                icon={<Globe size={16} />}
                label="Omni-Chat"
                active={(activeTab as string) === "omni"}
                onClick={() => setActiveTab("omni")}
              />

              <div className="mt-auto pt-4 border-t border-gold/10">
                <button
                  onClick={() => {
                    setPivotReason("OPERATOR-TRIGGERED STRATEGIC PIVOT · MANUAL OVERRIDE · REALLOCATING ALL 11 NODES TO PALM JUMEIRAH HIGH-VELOCITY VECTOR");
                    setShowPivot(true);
                  }}
                  className="w-full p-3 border border-alert/50 bg-alert/10 hover:bg-alert/20 text-alert flex items-center gap-3 transition-colors"
                >
                  <Flame size={14} />
                  <span className="font-orbitron text-[10px] font-black tracking-widest uppercase">
                    Hard Pivot
                  </span>
                </button>
                <div className="mt-3 font-mono text-[8px] text-white/30 tracking-widest text-center">
                  <span className="kbd">⌘K</span> COMMAND PALETTE
                </div>
              </div>
            </aside>

            {/* CENTER COLUMN */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 lg:gap-6">
              {/* AGENT HIVE */}
              <div ref={(el) => { cardRefs.current[1] = el; }}>
                <AgentHive />
              </div>

              {/* TERRITORY + RADAR row */}
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                <div
                  ref={(el) => { cardRefs.current[2] = el; }}
                  className="col-span-12 md:col-span-8 h-[440px]"
                >
                  <TerritoryMap />
                </div>
                <div
                  ref={(el) => { cardRefs.current[3] = el; }}
                  className="col-span-12 md:col-span-4 h-[440px]"
                >
                  <MarketRadar />
                </div>
              </div>

              {/* LIVE CHARTS */}
              <div
                ref={(el) => { cardRefs.current[4] = el; }}
                className="h-[280px]"
              >
                <LiveCharts />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:gap-6">
              <div
                ref={(el) => { cardRefs.current[5] = el; }}
                className="h-[580px]"
              >
                <HNWLeadPipeline />
              </div>
              <div
                ref={(el) => { cardRefs.current[6] = el; }}
                className="h-[400px]"
              >
                <MoneyStream />
              </div>
              <div
                ref={(el) => { cardRefs.current[7] = el; }}
                className="h-[240px]"
              >
                <ClassifiedBriefing />
              </div>
            </div>

            {/* BOTTOM FULL-WIDTH PORTFOLIO */}
            <div
              ref={(el) => { cardRefs.current[8] = el; }}
              className="col-span-12"
            >
              <PortfolioMatrix />
            </div>

            {/* BOTTOM STATS BAR */}
            <div
              ref={(el) => { cardRefs.current[9] = el; }}
              className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
            >
              <SovereignStat
                label="Sovereign Uptime"
                value="99.98"
                unit="%"
                color="text-matrix"
                icon={<Cpu size={14} />}
              />
              <SovereignStat
                label="Total Mandate AED"
                value="1.04"
                unit="B"
                color="text-gold"
                icon={<Crown size={14} />}
              />
              <SovereignStat
                label="Active Swarm"
                value="11"
                unit="Nodes"
                color="text-cyan"
                icon={<Radar size={14} />}
              />
              <SovereignStat
                label="Encryption Strength"
                value="Ω-5"
                unit="Sentinel"
                color="text-alert"
                icon={<Shield size={14} />}
              />
            </div>
          </div>
          )}

          {/* COMMAND TAB */}
          {activeTab === "command" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <div className="glass-panel sovereign-border p-8">
                  <h2 className="font-orbitron text-2xl font-black text-gold mb-6 uppercase tracking-widest">
                    🎖️ Generals Command Station
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(agentStates).map(([agent, active]) => (
                      <GeneralToggle
                        key={agent}
                        name={agent}
                        active={active}
                        onToggle={() => toggleAgent(agent)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <div className="glass-panel sovereign-border p-6 h-full">
                  <h3 className="font-orbitron text-lg font-black text-gold mb-4 uppercase">Swarm Status</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gold/10">
                      <span className="text-white/60">Active Generals</span>
                      <span className="text-gold font-mono font-bold">
                        {Object.values(agentStates).filter(Boolean).length}/6
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gold/10">
                      <span className="text-white/60">Swarm Power</span>
                      <span className="text-cyan font-mono font-bold">
                        {Math.round((Object.values(agentStates).filter(Boolean).length / 6) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-white/60">Last Sync</span>
                      <span className="text-matrix font-mono text-[10px]">NOW</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WAR ROOM TAB */}
          {activeTab === "war-room" && (
            <div className="grid grid-cols-12 gap-4 lg:gap-6">
              <div className="col-span-12 lg:col-span-4">
                <WarRoomMic />
              </div>
              <div className="col-span-12 lg:col-span-8">
                <SymphonyPanel />
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB */}
          {activeTab === "activity" && (
            <div className="glass-panel sovereign-border p-8">
              <h2 className="font-orbitron text-2xl font-black text-gold mb-6 uppercase tracking-widest">
                📡 Battle Feed
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activityLog.length === 0 ? (
                  <div className="text-center py-12 text-white/40 font-mono">
                    <Activity size={32} className="mx-auto mb-3 opacity-20" />
                    <p>Awaiting first command...</p>
                  </div>
                ) : (
                  activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 bg-white/[0.015] border border-gold/10 hover:border-gold/30 transition-colors"
                    >
                      <div className="text-gold mt-1">
                        <Radio size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-white/40">{log.timestamp}</span>
                          <span className="font-orbitron text-sm font-bold text-gold uppercase">{log.agent}</span>
                        </div>
                        <p className="text-white/70 mt-1">{log.action}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CLAW CONTROL TAB — Keyloq / Kilo Code execution surface */}
          {activeTab === "claws" && (
            <div className="glass-panel sovereign-border p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="font-orbitron text-2xl font-black text-gold uppercase tracking-widest">
                  🦾 Claw Control — Keyloq Execution
                </h2>
                <a
                  href={process.env.NEXT_PUBLIC_KEYLOQ_URL || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] uppercase tracking-widest border border-gold/30 text-gold hover:bg-gold/10 px-3 py-2 transition-colors"
                >
                  ↗ Open in new window
                </a>
              </div>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-4">
                High-throughput execution node · routed through Oracle Sentinel gateway
              </p>
              {process.env.NEXT_PUBLIC_KEYLOQ_URL ? (
                <div className="w-full border border-gold/20 bg-obsidian/50">
                  <iframe
                    src={process.env.NEXT_PUBLIC_KEYLOQ_URL}
                    title="Keyloq Claw Control"
                    className="w-full"
                    style={{ height: "75vh", minHeight: 600, border: 0 }}
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-gold/20 bg-white/[0.015]">
                  <p className="font-orbitron text-gold/70 uppercase tracking-widest text-sm mb-2">
                    Claws offline — set <code className="text-gold">NEXT_PUBLIC_KEYLOQ_URL</code> in .env
                  </p>
                  <p className="text-white/40 text-xs font-mono">
                    Add your Keyloq dashboard URL to the frontend env and restart <code>npm run dev</code>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* DUBAI BLITZ TAB */}
          {activeTab === "blitz" && <DubaiBlitzTab />}

          {/* OMNI-CHAT TAB */}
          {activeTab === "omni" && (
            <div className="relative z-10">
              <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-orbitron text-2xl font-black text-gold uppercase tracking-widest flex items-center gap-3">
                    🌐 Sovereign Omni-Chat Hub
                  </h2>
                  <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-1">
                    Unified bridge · Discord · Telegram · WhatsApp · Messenger · LLM Brain Swap
                  </p>
                </div>
                <div className="font-mono text-[9px] text-white/30 tracking-widest uppercase">
                  press <span className="kbd">`</span> to summon terminal · /teleport omni
                </div>
              </div>
              <OmniChat />
            </div>
          )}

          {/* Footer signature */}
          <footer className="mt-12 pt-8 border-t border-gold/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="font-serif italic text-2xl text-gold/60">ᛒ</div>
              <div>
                <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
                  B.L.A.S.T. Sovereign OS · v3.0.1 Alpha
                </div>
                <div className="font-serif italic text-sm text-gold/50 mt-0.5">
                  For elite operators of the MENA luxury real estate economy
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] text-white/30 tracking-widest">
              <span>◈ SESSION 0x7B3A2F91</span>
              <span className="w-[1px] h-3 bg-white/10" />
              <span>PRESS</span>
              <span className="kbd">⌘K</span>
              <span>FOR SOVEREIGN COMMAND</span>
            </div>
          </footer>
        </div>
      </main>

      <PivotAlert
        isVisible={showPivot}
        reason={pivotReason}
        onClose={() => setShowPivot(false)}
      />
    </>
  );
}

function SovereignChip({
  icon,
  label,
  status,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  color: "matrix" | "gold" | "cyan" | "alert";
}) {
  const colorMap = {
    matrix: "text-matrix border-matrix/30",
    gold: "text-gold border-gold/30",
    cyan: "text-cyan border-cyan/30",
    alert: "text-alert border-alert/30",
  };
  return (
    <div
      className={`px-3 py-2 bg-obsidian/70 backdrop-blur-md border ${colorMap[color]} text-[10px] font-mono uppercase tracking-widest flex items-center gap-2`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div style={{ transform: "translateZ(10px)" }}>{icon}</div>
      <span style={{ transform: "translateZ(15px)" }}>
        <span className="opacity-50">{label}</span>
        <span className="opacity-30 mx-1">:</span>
        <span className="font-bold">{status}</span>
      </span>
    </div>
  );
}

function SovereignNav({
  icon,
  label,
  active = false,
  external = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  external?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full p-3 flex items-center gap-3 border transition-all duration-500 group ${
        active
          ? "bg-gold/10 border-gold text-gold"
          : "bg-white/[0.015] border-white/5 text-white/50 hover:border-gold/30 hover:text-white hover:bg-white/[0.03]"
      }`}
      style={{
        boxShadow: active ? "0 0 20px rgba(255,215,0,0.15), inset 0 0 20px rgba(255,215,0,0.04)" : "",
      }}
    >
      {active && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold"
          style={{ boxShadow: "0 0 8px #FFD700" }}
        />
      )}
      <div className={`${active ? "text-gold" : "text-white/30 group-hover:text-gold"} transition-colors`}>
        {icon}
      </div>
      <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest flex-1 text-left">
        {label}
      </span>
      {external && (
        <MoveRight
          size={10}
          className={`${active ? "text-gold" : "text-white/20"} transition-colors`}
        />
      )}
    </button>
  );
}

function SovereignStat({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
}) {
  const numValue = parseFloat(value.replace(/,/g, ""));
  const isNumber = !isNaN(numValue);
  const formattedValueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isNumber && formattedValueRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: numValue,
        duration: 2.5,
        ease: "power3.out",
        delay: 1.5,
        onUpdate: () => {
          if (formattedValueRef.current) {
            const decimals = value.includes(".") ? value.split(".")[1].length : 0;
            formattedValueRef.current.innerText = obj.val.toFixed(decimals);
          }
        }
      });
    }
  }, [value, isNumber]);

  return (
    <div className="relative p-5 glass-panel sovereign-border rounded-none group overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
      <div className="flex items-center gap-2 mb-2" style={{ transform: "translateZ(20px)" }}>
        <div className="text-gold/40">{icon}</div>
        <span className="hud-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-2" style={{ transform: "translateZ(30px)" }}>
        <span ref={formattedValueRef} className={`font-orbitron font-black text-4xl tracking-tighter ${color}`}>
          {isNumber ? "0" : value}
        </span>
        <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase" style={{ transform: "translateZ(10px)" }}>
          {unit}
        </span>
      </div>
      {/* Corner scan */}
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-gold/30" style={{ transform: "translateZ(40px)" }} />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-gold/30" style={{ transform: "translateZ(40px)" }} />
      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,215,0,0.08), transparent)",
          animation: "shimmer 2s ease-in-out infinite",
          backgroundSize: "200% 100%",
          transform: "translateZ(5px)"
        }}
      />
    </div>
  );
}

function GeneralToggle({
  name,
  active,
  onToggle,
}: {
  name: string;
  active: boolean;
  onToggle: () => void;
}) {
  const generals: Record<string, { rank: string; division: string; color: string }> = {
    douglas: { rank: "General", division: "Strategic Ops", color: "text-cyan" },
    hermes: { rank: "General", division: "Comms", color: "text-gold" },
    sentinel: { rank: "General", division: "Intel", color: "text-matrix" },
    travis: { rank: "Colonel", division: "Acquisition", color: "text-alert" },
    aureus: { rank: "Colonel", division: "Finance", color: "text-gold" },
    khan: { rank: "Colonel", division: "Operations", color: "text-cyan" },
  };

  const general = generals[name] || { rank: "Agent", division: "Unknown", color: "text-white" };

  return (
    <button
      onClick={onToggle}
      className={`p-4 border transition-all ${
        active
          ? "bg-gold/15 border-gold text-gold shadow-lg shadow-gold/20"
          : "bg-white/[0.01] border-white/10 text-white/40 hover:border-gold/30"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-left">
          <div className={`font-orbitron text-sm font-bold uppercase tracking-widest ${general.color}`}>
            {name}
          </div>
          <div className="font-mono text-[9px] text-white/40 mt-1">{general.rank} • {general.division}</div>
        </div>
        <div
          className={`w-3 h-3 rounded-full transition-all ${
            active
              ? "bg-gold shadow-lg shadow-gold/50"
              : "bg-white/20"
          }`}
        />
      </div>
      <div className="h-1 bg-white/10 mt-3">
        <div
          className={`h-full transition-all ${active ? "bg-gold w-full" : "w-0 bg-gold/40"}`}
        />
      </div>
    </button>
  );
}
