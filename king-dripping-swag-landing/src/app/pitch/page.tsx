'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Lightbulb, Lock, Check } from 'lucide-react';

const PROPOSITIONS = ['AI Infrastructure', 'Autonomous Agents', 'Performance Marketing'];
const FORMATS = ['One-Pager', '5-Slide', '10-Slide'];

const HISTORY = [
  { target: 'Global Tech Ventures', format: 'One-Pager', created: 'Apr 01, 2026', viewed: '4h ago', status: 'DELIVERED', statusClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { target: 'Alpha Quant Group', format: '5-Slide', created: 'Mar 28, 2026', viewed: '2d ago', status: 'UNDER REVIEW', statusClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { target: 'Vertex Holdings', format: '10-Slide', created: 'Mar 15, 2026', viewed: '5d ago', status: 'ACCEPTED', statusClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

const AI_RECS = ['Add ROI Calculator slide', 'Reference Billionaire Narrative Control', 'Include global case study'];

export default function PitchPage() {
  const [selectedProps, setSelectedProps] = useState<string[]>(['AI Infrastructure', 'Autonomous Agents']);
  const [format, setFormat] = useState('One-Pager');
  const [confidential, setConfidential] = useState(true);
  const [isGenerated, setIsGenerated] = useState(true);

  const proofPoints = ['47 AI systems deployed', '94% client retention', '12 sovereign clients served'];

  function toggleProp(p: string) {
    setSelectedProps(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
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
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">INTERNAL</span>
          </div>
        </div>
      </nav>

      <main className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.section className="pt-32 pb-10" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-amber-500/20 bg-amber-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-black tracking-[0.4em] text-amber-400 uppercase">Pitch Automation // Internal</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-4" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
                  PITCH<br />AUTOMATION
                </h1>
                <p className="text-zinc-400 text-lg">Sovereign-grade decks engineered for the top 0.1%</p>
                <div className="w-24 h-0.5 bg-amber-500 mt-4" />
              </div>
              {/* Stat chips */}
              <div className="flex gap-4">
                {[
                  { label: 'Pitches Generated', value: '47', cls: 'text-cyan-400' },
                  { label: 'Avg Deal Size', value: '$2.4M', cls: 'text-amber-400' },
                  { label: 'Conversion Rate', value: '23%', cls: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 text-center min-w-[100px]">
                    <div className={`text-2xl font-black ${s.cls}`}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Two-column */}
          <motion.section className="grid grid-cols-1 md:grid-cols-5 gap-8" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>

            {/* LEFT — Pitch Builder */}
            <div className="md:col-span-2">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
                <p className="text-xs tracking-widest uppercase text-amber-500 mb-6 font-bold">Pitch Builder</p>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {['TARGET', 'PROPOSITION', 'GENERATE'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-amber-500/20 border border-amber-500 text-amber-400' : 'bg-zinc-800 text-zinc-600'}`}>
                        {i === 0 ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${i === 1 ? 'text-amber-400' : i === 0 ? 'text-zinc-400' : 'text-zinc-700'}`}>{step}</span>
                      {i < 2 && <div className="w-4 h-px bg-zinc-800" />}
                    </div>
                  ))}
                </div>

                {/* Locked target */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Entity</label>
                  <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                    <Lock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    <span className="text-sm text-zinc-300 font-medium">Billionaire Target — Global Elite</span>
                  </div>
                </div>

                {/* Propositions */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Core Proposition</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPOSITIONS.map(p => {
                      const selected = selectedProps.includes(p);
                      return (
                        <button key={p} onClick={() => toggleProp(p)}
                          className={`text-xs font-black uppercase tracking-wider px-3 py-2 rounded-lg border transition-all ${selected ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Proof points */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Proof Points</label>
                  <div className="space-y-2">
                    {proofPoints.map((p, i) => (
                      <div key={i} className="flex items-center gap-0">
                        <div className="w-1 self-stretch bg-amber-500/60 rounded-l-sm flex-shrink-0" />
                        <input defaultValue={p} className="flex-1 bg-zinc-900/60 border border-white/10 border-l-0 text-white rounded-r-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/40 transition-colors text-sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Deck Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMATS.map(f => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`text-xs font-black uppercase tracking-wider py-2.5 rounded-xl border transition-all ${format === f ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidentiality */}
                <div className="flex items-center justify-between mb-8 py-3 border-t border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Confidentiality</span>
                  <button onClick={() => setConfidential(!confidential)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${confidential ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${confidential ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button onClick={() => setIsGenerated(true)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:scale-[1.02]">
                  <FileText className="w-4 h-4" />
                  Generate Pitch Deck
                </button>
              </div>
            </div>

            {/* RIGHT — Pitch Preview */}
            <div className="md:col-span-3">
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs tracking-widest uppercase text-zinc-500 font-bold">Live Preview</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>

                {/* Slide preview */}
                <div className="relative aspect-video bg-black/80 rounded-xl border border-white/10 overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-6" />
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
                      BILLIONAIRE COMMAND CENTER
                    </h2>
                    <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-6">Prepared Exclusively for Elite Principal — Classified</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-8" />
                    <div className="grid grid-cols-3 gap-4 w-full">
                      {selectedProps.slice(0, 3).map(p => (
                        <div key={p} className="text-center">
                          <div className="w-full h-0.5 bg-amber-500/40 mb-3" />
                          <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {confidential && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] uppercase tracking-widest text-amber-400 font-black">Classified</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail strips */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`aspect-video rounded-lg border ${i === 1 ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 bg-black/40'} flex items-center justify-center cursor-pointer hover:border-white/20 transition-all`}>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-700 font-bold">Slide {i}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-white/10 hover:border-white/30 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-white/5">
                    <Download className="w-3.5 h-3.5" /> Export PPTX
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-white/10 hover:border-cyan-500/40 text-white hover:text-cyan-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                    <Share2 className="w-3.5 h-3.5" /> Secure Link
                  </button>
                </div>

                {/* AI Recommendations */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">AI Recommendations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AI_RECS.map(rec => (
                      <button key={rec} className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-amber-500/40 hover:text-amber-400 text-zinc-400 transition-all font-medium">
                        + {rec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* History Table */}
          <motion.section className="mt-16" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400">Pitch History</span>
              <span className="text-xs text-zinc-700 uppercase tracking-widest font-bold">{HISTORY.length} Records</span>
            </div>
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Target Entity', 'Format', 'Created', 'Last Viewed', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-bold">{row.target}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500 font-bold uppercase tracking-wider">{row.format}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{row.created}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{row.viewed}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${row.statusClass}`}>{row.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 rounded-lg hover:border-amber-500/40 hover:text-amber-400 text-zinc-400 transition-all">View</button>
                          <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 rounded-lg hover:border-white/30 text-zinc-400 transition-all">Edit</button>
                        </div>
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
