"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Cpu,
  Radio,
  Map,
  TrendingUp,
  Settings,
  X,
  Mic,
  MicOff,
  Phone,
  MapPin,
} from "lucide-react";

interface Agent {
  name: string;
  rank: string;
  division: string;
  status: "ACTIVE" | "INACTIVE";
  revenue: number;
  current_task: string;
  monitoring: Record<string, any>;
  recent_actions: Array<{ time: string; action: string }>;
  location: { latitude: number; longitude: number; address: string };
  [key: string]: any;
}

interface DashboardData {
  agents: Record<string, Agent>;
  total_revenue: number;
  active_agents: number;
  total_leads: number;
  activity_log: Array<any>;
}

export default function InteractiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>("douglas");
  const [detailPanel, setDetailPanel] = useState<"metrics" | "streetview" | "actions" | null>("metrics");
  const [micActive, setMicActive] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState("");

  // Fetch metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/dashboard/metrics");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const apiData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setData(null);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (!data || !selectedAgent || !data.agents[selectedAgent]) {
    return <div className="text-white text-center pt-20">Loading...</div>;
  }

  const agent = data.agents[selectedAgent];
  const statusColor = agent.status === "ACTIVE" ? "text-green-400" : "text-red-400";

  return (
    <main className="min-h-screen bg-obsidian text-white p-6">
      <div className="max-w-8xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-orbitron font-black text-gold mb-2">SOVEREIGN COMMAND CENTER</h1>
          <div className="flex justify-between items-center text-sm text-white/60">
            <span>Total Revenue: ${data.total_revenue.toLocaleString()}</span>
            <span>Active Agents: {data.active_agents}/6</span>
            <span>Total Leads: {data.total_leads}</span>
          </div>
        </div>

        {/* AGENT GRID - CLICKABLE */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {Object.values(data.agents).map((agent) => (
            <button
              key={agent.name}
              onClick={() => setSelectedAgent(agent.name.toLowerCase())}
              className={`p-4 border transition-all cursor-pointer ${
                selectedAgent === agent.name.toLowerCase()
                  ? "bg-gold/20 border-gold shadow-lg shadow-gold/50"
                  : "bg-white/5 border-white/10 hover:border-gold/30"
              }`}
            >
              <div className={`text-2xl font-black ${agent.status === "ACTIVE" ? "text-green-400" : "text-red-400"}`}>
                {agent.name[0]}
              </div>
              <div className="text-[10px] font-orbitron uppercase tracking-widest mt-2">{agent.name}</div>
              <div className="text-[8px] text-white/40 mt-1">{agent.division}</div>
              <div className="text-[9px] text-gold mt-2">${agent.revenue.toLocaleString()}</div>
            </button>
          ))}
        </div>

        {/* MAIN CONTENT - Split View */}
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT: Agent Details */}
          <div className="col-span-1 space-y-4">
            {/* Agent Overview */}
            <div className="bg-white/5 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gold">{agent.name}</h2>
                  <p className="text-[10px] text-white/60 mt-1">{agent.rank} • {agent.division}</p>
                </div>
                <div className={`text-3xl font-black ${statusColor}`}>{agent.status === "ACTIVE" ? "●" : "○"}</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Revenue</span>
                  <span className="text-gold font-mono">${agent.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Current Task</span>
                  <span className="text-white/80 text-right max-w-xs">{agent.current_task}</span>
                </div>
              </div>

              {/* Clickable Tab Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <button
                  onClick={() => setDetailPanel("metrics")}
                  className={`p-2 text-[9px] font-orbitron transition-all ${
                    detailPanel === "metrics"
                      ? "bg-gold/20 border border-gold"
                      : "bg-white/5 border border-white/10 hover:border-gold/30"
                  }`}
                >
                  <Cpu size={14} className="mx-auto mb-1" />
                  METRICS
                </button>
                <button
                  onClick={() => setDetailPanel("streetview")}
                  className={`p-2 text-[9px] font-orbitron transition-all ${
                    detailPanel === "streetview"
                      ? "bg-gold/20 border border-gold"
                      : "bg-white/5 border border-white/10 hover:border-gold/30"
                  }`}
                >
                  <Map size={14} className="mx-auto mb-1" />
                  LOCATION
                </button>
                <button
                  onClick={() => setDetailPanel("actions")}
                  className={`p-2 text-[9px] font-orbitron transition-all ${
                    detailPanel === "actions"
                      ? "bg-gold/20 border border-gold"
                      : "bg-white/5 border border-white/10 hover:border-gold/30"
                  }`}
                >
                  <Radio size={14} className="mx-auto mb-1" />
                  ACTIONS
                </button>
              </div>
            </div>

            {/* Detail Panel Content */}
            {detailPanel === "metrics" && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-black text-gold mb-4">MONITORING</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">CPU</span>
                    <div className="w-32 h-2 bg-white/10">
                      <div
                        className="h-full bg-cyan transition-all"
                        style={{ width: `${agent.monitoring.cpu || 0}%` }}
                      />
                    </div>
                    <span className="text-white/80">{agent.monitoring.cpu}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Memory</span>
                    <div className="w-32 h-2 bg-white/10">
                      <div
                        className="h-full bg-gold transition-all"
                        style={{ width: `${agent.monitoring.memory || 0}%` }}
                      />
                    </div>
                    <span className="text-white/80">{agent.monitoring.memory}%</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="text-white/60">Network</span>
                    <span className="text-matrix">{agent.monitoring.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Latency</span>
                    <span className="text-matrix">{agent.monitoring.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Uptime</span>
                    <span className="text-green-400">{agent.monitoring.uptime}</span>
                  </div>
                </div>
              </div>
            )}

            {detailPanel === "streetview" && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-black text-gold mb-4 flex items-center gap-2">
                  <MapPin size={16} />
                  {agent.location.address}
                </h3>
                <div className="bg-black/50 h-48 flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <Map size={32} className="mx-auto mb-2 text-gold/50" />
                    <p className="text-sm text-white/60">Google Maps Street View</p>
                    <p className="text-[10px] text-white/40 mt-2">
                      {agent.location.latitude}, {agent.location.longitude}
                    </p>
                    <button className="mt-4 px-4 py-2 bg-gold/10 border border-gold text-gold text-xs font-orbitron hover:bg-gold/20 transition-all">
                      OPEN IN MAPS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {detailPanel === "actions" && (
              <div className="bg-white/5 border border-white/10 p-6 max-h-64 overflow-y-auto">
                <h3 className="text-lg font-black text-gold mb-4">RECENT ACTIONS</h3>
                <div className="space-y-2">
                  {agent.recent_actions.map((action, idx) => (
                    <div key={idx} className="text-[10px] border-l border-gold/30 pl-3 py-1">
                      <span className="text-white/40">[{action.time}]</span>
                      <span className="text-white/70 ml-2">{action.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CENTER: War Room */}
          <div className="col-span-1 bg-white/5 border border-white/10 p-6 flex flex-col">
            <h2 className="text-lg font-black text-gold mb-6">WAR ROOM</h2>

            {/* Voice Interface */}
            <div className="flex-1 flex flex-col items-center justify-center mb-6">
              <div className="w-40 h-40 relative">
                <div className="absolute inset-0 rounded-full border-4 border-gold/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full border-4 border-cyan/20 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`absolute inset-8 rounded-full flex items-center justify-center transition-all ${
                    micActive
                      ? "bg-red-500/20 border-2 border-red-500"
                      : "bg-gold/10 border-2 border-gold hover:bg-gold/20"
                  }`}
                >
                  {micActive ? <MicOff size={48} className="text-red-500" /> : <Mic size={48} className="text-gold" />}
                </button>
              </div>

              <p className={`text-[10px] font-orbitron tracking-widest mt-8 ${micActive ? "text-red-400" : "text-white/60"}`}>
                {micActive ? "LISTENING..." : "PRESS TO SPEAK"}
              </p>
            </div>

            {/* Voice Output */}
            {voiceOutput && (
              <div className="bg-white/5 border border-gold/30 p-3 mb-4">
                <p className="text-[10px] text-white/70">{voiceOutput}</p>
              </div>
            )}

            {/* Quick Commands */}
            <div className="space-y-2">
              <button className="w-full p-2 bg-white/5 border border-white/10 hover:border-gold/30 text-[9px] font-orbitron text-white/60 hover:text-gold transition-colors">
                DEPLOY LEADS
              </button>
              <button className="w-full p-2 bg-white/5 border border-white/10 hover:border-gold/30 text-[9px] font-orbitron text-white/60 hover:text-gold transition-colors">
                SEND EMAILS
              </button>
              <button className="w-full p-2 bg-white/5 border border-white/10 hover:border-gold/30 text-[9px] font-orbitron text-white/60 hover:text-gold transition-colors">
                EXECUTE CAMPAIGN
              </button>
            </div>
          </div>

          {/* RIGHT: Activity Feed */}
          <div className="col-span-1 bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-black text-gold mb-4">ACTIVITY FEED</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.activity_log.map((log, idx) => (
                <div key={idx} className="border-l-2 border-gold/30 pl-3 py-2">
                  <div className="flex justify-between items-start">
                    <span className="text-gold font-mono text-[10px]">{log.agent.toUpperCase()}</span>
                    <span className="text-white/40 text-[8px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white/70 text-[10px] mt-1">{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
