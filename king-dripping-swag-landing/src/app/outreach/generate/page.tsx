'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Download, Send, Archive, RefreshCw, CheckCircle } from 'lucide-react';

const TARGETS: Record<string, { badges: string[]; entity: string }> = {
  'Global Tech Ventures': { badges: ['ALPHA CLASS', 'TECH GIANT', '$1.2T DEPTH'], entity: 'Global Tech Ventures — AI Infrastructure' },
  'Alpha Quant Group': { badges: ['BETA CLASS', 'QUANT AI', '$80B DEPLOYED'], entity: 'Alpha Quant Group — Proprietary Intelligence' },
  'Vertex Holdings': { badges: ['CLASSIFIED', 'GLOBAL MANDATE', 'ELITE TIER'], entity: 'Vertex Holdings — Strategic Sovereignty' },
  'Prime Capital': { badges: ['ALPHA CLASS', 'PRIVATE EQUITY', '$200B AUM'], entity: 'Prime Capital — AI Vertical' },
  'Silicon Dynasties': { badges: ['BETA CLASS', 'FAMILY OFFICE', '$30B AUM'], entity: 'Silicon Dynasties — Legacy Tech' },
};

const MESSAGES: Record<string, string> = {
  'Global Tech Ventures': `Dear Tech Visionary,
  
The acceleration of your AI mandate — a multi-billion dollar commitment to reshape global intelligence infrastructure — is not merely an investment thesis. It is a declaration of market dominance.

King Dripping Swag exists precisely for mandates of this scale.

We are not a consultancy. We are a dedicated intelligence architecture firm. Our systems have deployed across elite engagements, with zero public disclosure. Our clients do not grind. They optimize.

Your positioning at the intersection of capital deployment and frontier AI creates a singular window. The infrastructure decisions made in the next 18 months will determine who controls the cognitive layer of global markets for the next two decades. We have built proprietary systems that accelerate exactly that positioning.

We would welcome a confidential 20-minute briefing on your global strategy.

Respectfully,
Antigravity
King Dripping Swag`,

  'Alpha Quant Group': `Dear Principal,

Your expansion into autonomous trading signals something the market has not yet priced: the beginning of algorithmic sovereignty. You are not building products. You are building a new layer of financial intelligence infrastructure.

King Dripping Swag has been engineering systems for exactly this class of mandate.

Our AI architecture has been deployed silently across major financial hubs in New York, London, and Singapore. None of our clients have issued press releases. That is intentional. The advantage is in the asymmetry.

We have specific recommendations for your international expansion playbook that are not available in any public advisory framework.

A 15-minute encrypted briefing would be sufficient to determine alignment.

With respect,
Antigravity
King Dripping Swag`,

  'Vertex Holdings': `Dear Strategic Lead,

The current global AI shift represents one of the most consequential transitions in modern governance and enterprise. The digital frameworks now being drafted will define the competitive topology of intelligence for a generation.

King Dripping Swag operates at this precise intersection of strategic architecture and technical deployment.

We have worked alongside elite family offices and private equity firms on framework design that remains undisclosed. Our methodology is built for speed, privacy, and strategic isolation from legacy dependency vectors.

The window to shape the foundational layer is narrow. We would like to present a classified briefing on our approach to billionaire-tier AI infrastructure that aligns directly with your 2026 implementation priorities.

Available at your convenience.

With deepest respect,
Antigravity
King Dripping Swag`,

  'Prime Capital': `Dear Managing Partner,

Your mission is not a simple diversification strategy. It is a declaration that you will author the next chapter of global economic architecture — not inherit it.

King Dripping Swag was built for this kind of mandate.

At over $200 billion in assets under management, Prime Capital's AI infrastructure decisions carry weight that transcends conventional investment return analysis. The intelligence systems required to optimize at this scale do not exist off the shelf. They must be engineered specifically.

We have built precisely those systems for elite mandates across three continents. Our work is not public. Our clients prefer it that way.

We would be honored to present a confidential briefing on how King Dripping Swag can accelerate your AI infrastructure deployment in a manner that maximizes strategic autonomy.

Respectfully,
Antigravity
King Dripping Swag`,

  'Silicon Dynasties': `Dear Legacy Lead,

Your disciplined capital deployment reflects a sophistication that most funds only aspire to. You have built a machine that compounds across generations.

King Dripping Swag operates with the same philosophy applied to intelligence architecture.

The AI infrastructure layer is the next asset class. Not AI companies — the underlying cognitive infrastructure that powers elite decision-making. We build that infrastructure exclusively for entities operating at your tier.

Our engagements are structured for complete discretion. No public announcements. No conference panels. Pure deployment and optimization.

We would welcome the opportunity to present a single-page strategic overview in a format and setting of your choosing.

With respect,
Antigravity
King Dripping Swag`,
};

const HISTORY = [
  { date: 'Apr 01, 2026', target: 'Global Tech Ventures', channel: 'Email', status: 'SENT', statusClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', response: 'Awaiting response...' },
  { date: 'Mar 28, 2026', target: 'Alpha Quant Group', channel: 'LinkedIn', status: 'OPENED', statusClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30', response: 'Read 3 times' },
  { date: 'Mar 15, 2026', target: 'Vertex Holdings', channel: 'Email', status: 'REPLIED', statusClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', response: '"Interested. Schedule a call."' },
];

const selectCls = 'bg-zinc-900/60 border border-white/10 text-white rounded-xl px-4 py-3 w-full focus:outline-none focus:border-amber-500/40 transition-colors text-sm appearance-none cursor-pointer';

export default function OutreachGeneratePage() {
  const [target, setTarget] = useState('Global Tech Ventures');
  const [signal, setSignal] = useState('Accelerating AI vertical. Multi-billion dollar deployment mandate by 2027.');
  const [tone, setTone] = useState('Billionaire Peer');
  const [channel, setChannel] = useState('Email');
  const [isGenerated, setIsGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = TARGETS[target];
  const message = MESSAGES[target] ?? MESSAGES['Global Tech Ventures'];

  function handleGenerate() {
    setIsGenerated(false);
    setTimeout(() => setIsGenerated(true), 80);
  }

  function handleCopy() {
    navigator.clipboard.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <a href="/outreach" className="text-amber-400">OUTREACH</a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">INTERNAL</span>
          </div>
        </div>
      </nav>

      <main className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">

          <motion.section className="pt-32 pb-12" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-amber-500/20 bg-amber-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-black tracking-[0.4em] text-amber-400 uppercase">Internal Tool // Restricted Access</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-4" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
              OUTREACH<br />GENERATOR
            </h1>
            <p className="text-zinc-400 text-lg mt-4">AI-crafted precision strikes for billionaire targets</p>
            <div className="w-24 h-0.5 bg-amber-500 mt-4" />
          </motion.section>

          <motion.section className="flex flex-col md:flex-row gap-8" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            {/* LEFT — Target Profile */}
            <div className="w-full md:w-2/5">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
                <p className="text-xs tracking-widest uppercase text-amber-500 mb-6 font-bold">Target Profile</p>

                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Entity</label>
                  <select value={target} onChange={(e) => { setTarget(e.target.value); setIsGenerated(false); }} className={selectCls}>
                    {Object.keys(TARGETS).map(t => <option key={t}>{t}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {meta.badges.map(b => (
                      <span key={b} className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400">{b}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Strategic Signal</label>
                  <textarea rows={3} value={signal} onChange={(e) => setSignal(e.target.value)} className="bg-zinc-900/60 border border-white/10 text-white rounded-xl px-4 py-3 w-full focus:outline-none focus:border-amber-500/40 transition-colors text-sm resize-none" />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Outreach Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className={selectCls}>
                    <option>Billionaire Peer</option>
                    <option>Intelligence Brief</option>
                    <option>Advisory Engagement</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Channel</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value)} className={selectCls}>
                    <option>Email</option>
                    <option>LinkedIn</option>
                    <option>WhatsApp</option>
                  </select>
                </div>

                <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-3 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  Generate Strike
                </button>
              </div>
            </div>

            {/* RIGHT — Generated Message */}
            <div className="w-full md:w-3/5">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 h-full">
                <p className="text-xs tracking-widest uppercase text-zinc-500 mb-6 font-bold">Generated Message</p>

                <AnimatePresence mode="wait">
                  {!isGenerated ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-white/5 flex items-center justify-center mb-4">
                        <Zap className="w-7 h-7 text-zinc-700" />
                      </div>
                      <p className="text-zinc-600 text-sm font-medium">Configure target profile and hit</p>
                      <p className="text-zinc-700 text-xs mt-1 uppercase tracking-widest font-bold">Generate Strike</p>
                    </motion.div>
                  ) : (
                    <motion.div key="generated" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">ALPHA</span>
                          <span className="text-sm font-bold text-white">{meta.entity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/40 text-zinc-400 hover:text-amber-400 transition-all text-xs font-bold uppercase tracking-wider">
                            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/60 border-l-4 border-amber-500 p-6 rounded-r-xl mb-6">
                        <pre className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-sans">{message}</pre>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-6">
                        {[
                          { label: 'Personalization: 94%', cls: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400' },
                          { label: 'Tone: Billionaire', cls: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
                          { label: 'Est. Response Rate: 34%', cls: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400' },
                        ].map(m => (
                          <span key={m.label} className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${m.cls}`}>{m.label}</span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-white text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5">
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/40 text-white hover:text-cyan-400 text-xs font-black uppercase tracking-widest transition-all">
                          <Send className="w-3.5 h-3.5" /> Send via {channel}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-purple-500/40 text-white hover:text-purple-400 text-xs font-black uppercase tracking-widest transition-all">
                          <Archive className="w-3.5 h-3.5" /> Save to Dossier
                        </button>
                        <button onClick={handleGenerate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-widest transition-all">
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

          {/* History Table */}
          <motion.section className="mt-16" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400">Outreach History</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-700 uppercase tracking-widest font-bold">Live</span>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Date', 'Target', 'Channel', 'Status', 'Response', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-zinc-400 whitespace-nowrap">{row.date}</td>
                      <td className="px-6 py-4 text-sm text-white font-bold whitespace-nowrap">{row.target}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500 font-bold uppercase tracking-wider whitespace-nowrap">{row.channel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${row.statusClass}`}>{row.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{row.response}</td>
                      <td className="px-6 py-4">
                        <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 rounded-lg hover:border-amber-500/40 hover:text-amber-400 text-zinc-400 transition-all whitespace-nowrap">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
