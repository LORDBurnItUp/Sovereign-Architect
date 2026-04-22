'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, TrendingUp, DollarSign, Eye, Zap, Bell } from 'lucide-react';

const SIGNALS = [
  { level: 'ALPHA', color: 'border-red-500', badge: 'text-red-400 bg-red-500/10 border-red-500/30', entity: 'Global Tech Ventures', desc: 'New AI mandate revision announced — $100B deployment accelerated', time: '2m ago' },
  { level: 'GAMMA', color: 'border-yellow-500', badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', entity: 'Alpha Quant Group', desc: 'NVIDIA partnership for custom billionaire command systems confirmed', time: '14m ago' },
  { level: 'OPPORTUNITY', color: 'border-emerald-500', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', entity: 'Vertex Holdings', desc: 'Internal roadmap leaked — Billionaire dashboard transition in progress', time: '1h ago' },
  { level: 'INTEL', color: 'border-blue-500', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30', entity: 'Tech Visionary X', desc: 'AI dashboard keynote delivered at Global Elite Summit', time: '3h ago' },
  { level: 'GAMMA', color: 'border-yellow-500', badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', entity: 'Silicon Dynasties', desc: '$50B dedicated AI infrastructure fund formally announced', time: '5h ago' },
  { level: 'CLASSIFIED', color: 'border-purple-500', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30', entity: 'Prime Capital', desc: 'Undisclosed AI acquisition — due diligence stage', time: '8h ago' },
  { level: 'ALPHA', color: 'border-red-500', badge: 'text-red-400 bg-red-500/10 border-red-500/30', entity: 'Mega Corp AI', desc: 'AI infrastructure tender published — $2.1B contract value', time: '12h ago' },
];

const ALERT_TRIGGERS = ['Fund Formations', 'Mandate Updates', 'Key Personnel', 'RFP Publications', 'Investment News'];

const TIMELINE = [
  { date: 'Apr 01', event: 'Initial ALPHA profile — research commenced' },
  { date: 'Mar 28', event: 'Signal detected: AI mandate revision incoming' },
  { date: 'Mar 15', event: 'Internal classification: ALPHA tier confirmed' },
];

const RELATIONSHIPS = [
  { from: 'King Dripping Swag', to: 'Global Tech Ventures', rel: 'TARGETING', color: 'text-amber-400' },
  { from: 'King Dripping Swag', to: 'Alpha Quant Group', rel: 'RESEARCH', color: 'text-cyan-400' },
  { from: 'King Dripping Swag', to: 'Vertex Holdings', rel: 'ENGAGED', color: 'text-emerald-400' },
];

export default function LeadIntelPage() {
  const [activeAlerts, setActiveAlerts] = useState<string[]>(ALERT_TRIGGERS);

  function toggleAlert(a: string) {
    setActiveAlerts(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500 selection:text-black">
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            KING DRIPPING SWAG
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="/#vision" className="hover:text-amber-400 transition-colors">VISION</a>
            <a href="/#services" className="hover:text-amber-400 transition-colors">SERVICES</a>
            <a href="/mission-control" className="hover:text-amber-400 transition-colors">MISSION CONTROL</a>
            <a href="/outreach" className="hover:text-amber-400 transition-colors">OUTREACH</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">LIVE FEED</span>
          </div>
        </div>
      </nav>

      <main className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.section className="pt-32 pb-10" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black tracking-[0.4em] text-red-400 uppercase">Lead Intelligence // Classified</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 w-fit">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Live Feed Active</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-4" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
              LEAD<br />INTELLIGENCE
            </h1>
            <p className="text-zinc-400 text-lg">Real-time sovereign capital flow detection</p>
            <div className="w-24 h-0.5 bg-amber-500 mt-4" />
          </motion.section>

          {/* Stats Row */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            {[
              { icon: Target, label: 'Alpha Targets', value: '12', cls: 'text-cyan-400', iconCls: 'text-cyan-500' },
              { icon: TrendingUp, label: 'New Signals Today', value: '7', cls: 'text-amber-400', iconCls: 'text-amber-500' },
              { icon: Activity, label: 'Opportunities Open', value: '3', cls: 'text-emerald-400', iconCls: 'text-emerald-500' },
              { icon: DollarSign, label: 'Pipeline Value', value: '$847M', cls: 'text-purple-400', iconCls: 'text-purple-500' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
                <s.icon className={`w-4 h-4 ${s.iconCls} mb-3`} />
                <div className={`text-3xl font-black ${s.cls} mb-1`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Three-column intel grid */}
          <motion.section className="grid grid-cols-12 gap-6" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>

            {/* LEFT — Signal Feed */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 h-[560px] flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400">Signal Feed</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-0 pr-1">
                  {SIGNALS.map((sig, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className={`border-l-4 ${sig.color} pl-4 py-3 hover:bg-white/[0.03] transition-colors group cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${sig.badge}`}>{sig.level}</span>
                        <span className="text-[10px] text-zinc-700 font-bold">{sig.time}</span>
                      </div>
                      <p className="text-sm font-bold text-white mb-0.5">{sig.entity}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">{sig.desc}</p>
                      <button className="text-[10px] font-black uppercase tracking-wider text-amber-500/0 group-hover:text-amber-500 transition-colors mt-1.5">View →</button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER — Map */}
            <div className="col-span-12 md:col-span-5">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 h-[560px] flex flex-col">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-5">Entity Intelligence Map</p>

                {/* Stylized map */}
                <div className="flex-1 relative bg-black/40 rounded-xl border border-white/5 overflow-hidden mb-4">
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" viewBox="0 0 400 300">
                      {/* Grid lines */}
                      {[0,50,100,150,200,250,300].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#ffffff" strokeWidth="0.3" />)}
                      {[0,50,100,150,200,250,300,350,400].map(x => <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#ffffff" strokeWidth="0.3" />)}
                    </svg>
                  </div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                    <line x1="200" y1="150" x2="260" y2="160" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 3" />
                    <line x1="200" y1="150" x2="150" y2="100" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
                    <line x1="200" y1="150" x2="100" y2="200" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
                    <line x1="200" y1="150" x2="330" y2="60" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 3" />
                  </svg>

                  {/* Nodes */}
                  {[
                    { x: '15%', y: '40%', label: 'San Francisco', size: 10, color: '#f59e0b', glow: 'bg-amber-500' },
                    { x: '82%', y: '20%', label: 'London', size: 8, color: '#22d3ee', glow: 'bg-cyan-400' },
                    { x: '85%', y: '45%', label: 'Zurich', size: 7, color: '#f59e0b', glow: 'bg-amber-500' },
                    { x: '50%', y: '48%', label: 'Billionaire Base', size: 9, color: '#a855f7', glow: 'bg-purple-500' },
                    { x: '75%', y: '75%', label: 'Singapore', size: 6, color: '#22d3ee', glow: 'bg-cyan-400' },
                  ].map((node, i) => (
                    <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: node.x, top: node.y }}>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                        className={`rounded-full ${node.glow} opacity-30`}
                        style={{ width: node.size * 3, height: node.size * 3 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full" style={{ width: node.size, height: node.size, backgroundColor: node.color }} />
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{node.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Entity relationships */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2">Active Relationships</p>
                  <div className="space-y-1.5">
                    {RELATIONSHIPS.map((rel, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-zinc-400">{rel.from}</span>
                        <span className="text-zinc-700">→</span>
                        <span className="font-bold text-white">{rel.to}</span>
                        <span className={`font-black uppercase tracking-wider text-[9px] ${rel.color}`}>[{rel.rel}]</span>
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                    {[{ label: 'ALPHA', cls: 'bg-red-500' }, { label: 'GAMMA', cls: 'bg-yellow-500' }, { label: 'OPPORTUNITY', cls: 'bg-emerald-500' }, { label: 'CLASSIFIED', cls: 'bg-purple-500' }].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${l.cls}`} />
                        <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Dossier */}
            <div className="col-span-12 md:col-span-3">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 h-[560px] flex flex-col">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-5">Entity Dossier</p>

                <div className="mb-4">
                  <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>GLOBAL TECH VENTURES</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">ALPHA CLASS</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">ACTIVE TARGET</span>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    { k: 'AUM', v: '$276B' },
                    { k: 'Founded', v: '2018' },
                    { k: 'Jurisdiction', v: 'Global Focus' },
                    { k: 'Decision Maker', v: 'Tech Visionary X' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">{k}</span>
                      <span className="text-sm text-white font-bold">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-600 font-bold mb-2">
                    <span>AI Mandate Deployment</span>
                    <span className="text-amber-400">34%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '34%' }} />
                  </div>
                </div>

                <div className="mb-5 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold mb-3">Engagement Timeline</p>
                  <div className="space-y-2">
                    {TIMELINE.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="text-[9px] text-zinc-700 font-bold whitespace-nowrap pt-0.5">{t.date}</span>
                        <div className="flex flex-col gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-0.5 flex-shrink-0" />
                        </div>
                        <span className="text-xs text-zinc-400">{t.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Recommended Action</span>
                  </div>
                  <p className="text-xs text-zinc-300">Submit AI infrastructure proposal before Q2 2026 deadline</p>
                </div>

                <a href="/outreach/generate"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.02]">
                  <Eye className="w-3.5 h-3.5" />
                  Initiate Outreach
                </a>
              </div>
            </div>

          </motion.section>

          {/* Alert Triggers */}
          <motion.section className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">Alert Triggers</span>
              </div>
              {ALERT_TRIGGERS.map(a => {
                const active = activeAlerts.includes(a);
                return (
                  <button key={a} onClick={() => toggleAlert(a)}
                    className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full border transition-all ${active ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-zinc-600 hover:border-white/20'}`}>
                    {a}
                  </button>
                );
              })}
            </div>
          </motion.section>

        </div>
      </main>

      <footer className="py-16 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-sm font-bold tracking-tighter text-zinc-700">KING DRIPPING SWAG</span>
          <span className="text-xs text-zinc-800">© 2026 — GLOBAL COMMAND — ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}
