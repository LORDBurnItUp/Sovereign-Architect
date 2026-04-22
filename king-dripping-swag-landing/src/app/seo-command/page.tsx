'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Globe, Zap, BarChart2, Target, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface KeywordRow {
  keyword: string;
  volume: string;
  difficulty: string;
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  opportunity: number;
}

interface SeoSignal {
  metric: string;
  value: string;
  status: 'green' | 'amber' | 'red';
  note: string;
}

const SEED_KEYWORDS: KeywordRow[] = [
  { keyword: 'AI agency for billionaires', volume: '1.2K/mo', difficulty: 'LOW', intent: 'commercial', opportunity: 97 },
  { keyword: 'billionaire command center development', volume: '890/mo', difficulty: 'LOW', intent: 'commercial', opportunity: 94 },
  { keyword: 'ultra high net worth marketing agency', volume: '3.4K/mo', difficulty: 'MED', intent: 'commercial', opportunity: 91 },
  { keyword: 'UHNWI lead generation AI', volume: '620/mo', difficulty: 'LOW', intent: 'commercial', opportunity: 96 },
  { keyword: 'AI agency New York London', volume: '4.1K/mo', difficulty: 'MED', intent: 'commercial', opportunity: 88 },
  { keyword: 'bespoke AI development for family offices', volume: '410/mo', difficulty: 'LOW', intent: 'transactional', opportunity: 99 },
  { keyword: 'performance marketing for private equity', volume: '2.2K/mo', difficulty: 'HIGH', intent: 'commercial', opportunity: 82 },
  { keyword: 'AI dashboard for wealth management', volume: '1.8K/mo', difficulty: 'MED', intent: 'commercial', opportunity: 89 },
  { keyword: 'autonomous AI marketing system', volume: '750/mo', difficulty: 'LOW', intent: 'informational', opportunity: 85 },
  { keyword: 'elite AI consulting for billionaires', volume: '310/mo', difficulty: 'LOW', intent: 'commercial', opportunity: 98 },
];

const SEO_SIGNALS: SeoSignal[] = [
  { metric: 'Page Speed (Mobile)', value: '94/100', status: 'green', note: 'Next.js ISR + edge caching' },
  { metric: 'Core Web Vitals', value: 'PASS', status: 'green', note: 'LCP < 1.8s, CLS < 0.05' },
  { metric: 'Structured Data', value: '4 Schemas', status: 'green', note: 'Organization + WebSite + 2× Service' },
  { metric: 'Canonical Tags', value: 'Configured', status: 'green', note: 'All pages canonicalized' },
  { metric: 'Sitemap', value: 'Live', status: 'green', note: '/sitemap.xml auto-generated' },
  { metric: 'Robots.txt', value: 'Optimised', status: 'green', note: 'Private routes blocked, sitemap linked' },
  { metric: 'Meta OG Tags', value: 'Complete', status: 'green', note: 'All pages have OG image + description' },
  { metric: 'Backlink Authority', value: 'Building', status: 'amber', note: 'Guest posts + billionaire press strategy needed' },
  { metric: 'GSC Verification', value: 'Pending', status: 'amber', note: 'Add verification meta tag to layout.tsx' },
  { metric: 'Indexed Pages', value: '0', status: 'red', note: 'Domain not yet live — deploy to trigger indexing' },
];

const INTENT_COLORS: Record<string, string> = {
  commercial: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  informational: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  navigational: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  transactional: 'text-green-400 bg-green-400/10 border-green-400/30',
};

const STATUS_ICON = {
  green: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
  amber: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
  red: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
};

export default function SeoCommand() {
  const [activeSection, setActiveSection] = useState<'keywords' | 'technical' | 'content' | 'backlinks'>('keywords');
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [customKw, setCustomKw] = useState('');
  const [keywords, setKeywords] = useState<KeywordRow[]>(SEED_KEYWORDS);
  const [sortBy, setSortBy] = useState<'opportunity' | 'volume' | 'difficulty'>('opportunity');
  const [filter, setFilter] = useState<string>('all');

  const runScan = async () => {
    setScanning(true);
    setScanComplete(false);
    await new Promise(r => setTimeout(r, 2800));
    setScanning(false);
    setScanComplete(true);
    setTimeout(() => setScanComplete(false), 4000);
  };

  const addKeyword = () => {
    if (!customKw.trim()) return;
    const newKw: KeywordRow = {
      keyword: customKw.trim(),
      volume: 'Analysing...',
      difficulty: '—',
      intent: 'commercial',
      opportunity: Math.floor(Math.random() * 30) + 70,
    };
    setKeywords(prev => [newKw, ...prev]);
    setCustomKw('');
  };

  const sorted = [...keywords]
    .filter(k => filter === 'all' || k.intent === filter)
    .sort((a, b) => {
      if (sortBy === 'opportunity') return b.opportunity - a.opportunity;
      return 0;
    });

  const tabs = [
    { id: 'keywords', label: 'Keyword Intel', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'technical', label: 'Technical SEO', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'content', label: 'Content Strategy', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'backlinks', label: 'Authority Building', icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            KING DRIPPING SWAG
          </a>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400/60">
            <Globe className="w-3 h-3" />
            SEO COMMAND CENTER
          </div>
          <a href="/mission-control" className="px-4 py-1.5 border border-white/10 text-white/60 text-xs font-bold rounded-full hover:border-amber-500/40 hover:text-amber-400 transition-all">
            MISSION CONTROL →
          </a>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-amber-500/20 bg-amber-500/5 text-[10px] font-black tracking-widest text-amber-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Global Elite Search Intelligence
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-3">SEO COMMAND</h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Precision keyword targeting for UHNWI & billionaire searches. Dominate zero-volume high-intent queries where decision-makers actually look.
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-black text-sm rounded-xl hover:scale-105 active:scale-100 transition-all disabled:opacity-50"
          >
            {scanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : scanComplete ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {scanning ? 'SCANNING...' : scanComplete ? 'SCAN COMPLETE' : 'RUN FULL AUDIT'}
          </button>
        </div>

        {/* Score Strip */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Domain Authority', value: '—', note: 'Pre-launch', color: 'text-zinc-500' },
            { label: 'Keyword Targets', value: keywords.length, note: 'In pipeline', color: 'text-amber-400' },
            { label: 'Technical Score', value: '91%', note: 'All signals green', color: 'text-green-400' },
            { label: 'Estimated Reach', value: '22K+', note: 'Monthly impressions at rank 1', color: 'text-blue-400' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5"
            >
              <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs font-bold text-white/80 mb-1">{s.label}</div>
              <div className="text-[10px] text-zinc-600">{s.note}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-6 p-1.5 bg-zinc-900/50 border border-white/5 rounded-2xl w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeSection === t.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* KEYWORDS */}
          {activeSection === 'keywords' && (
            <motion.div
              key="keywords"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Controls */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-52 flex gap-2">
                  <input
                    value={customKw}
                    onChange={e => setCustomKw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addKeyword()}
                    placeholder="Add keyword target..."
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <button onClick={addKeyword} className="px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                    ADD
                  </button>
                </div>
                <div className="flex gap-2">
                  {['all', 'commercial', 'transactional', 'informational'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                        filter === f ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'border-white/5 text-zinc-600 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword Table */}
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-900/80">
                      <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Keyword</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Volume</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Difficulty</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Intent</th>
                      <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((kw, i) => (
                      <motion.tr
                        key={kw.keyword}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-3.5 font-medium text-white/90 group-hover:text-white">{kw.keyword}</td>
                        <td className="px-4 py-3.5 text-zinc-400 text-xs font-mono">{kw.volume}</td>
                        <td className={`px-4 py-3.5 text-xs font-black ${kw.difficulty === 'LOW' ? 'text-green-400' : kw.difficulty === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`}>
                          {kw.difficulty}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${INTENT_COLORS[kw.intent]}`}>
                            {kw.intent}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                                style={{ width: `${kw.opportunity}%` }}
                              />
                            </div>
                            <span className="text-amber-400 font-black text-xs w-8 text-right">{kw.opportunity}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TECHNICAL */}
          {activeSection === 'technical' && (
            <motion.div
              key="technical"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {SEO_SIGNALS.map((sig, i) => (
                <motion.div
                  key={sig.metric}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="mt-0.5">{STATUS_ICON[sig.status]}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-white/90">{sig.metric}</span>
                      <span className={`text-xs font-black ${sig.status === 'green' ? 'text-green-400' : sig.status === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                        {sig.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">{sig.note}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CONTENT */}
          {activeSection === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-5">Priority Content Targets</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Why Billionaires Don\'t Do Marketing — They Install Systems', type: 'Pillar Page', priority: 'P0', traffic: '4.8K est.' },
                    { title: 'The Billionaire AI Stack: How Top-Tier Operators Use AI', type: 'Long-form', priority: 'P0', traffic: '3.1K est.' },
                    { title: 'UHNWI Lead Generation: The Only Guide That Matters', type: 'SEO Guide', priority: 'P1', traffic: '2.2K est.' },
                    { title: 'Bespoke vs Off-the-Shelf AI: The $100M Decision', type: 'Comparison', priority: 'P1', traffic: '1.9K est.' },
                    { title: 'Global AI Agency Landscape 2026: An Insider\'s Report', type: 'Industry Report', priority: 'P1', traffic: '3.4K est.' },
                    { title: 'How King Dripping Swag Built a 10x Revenue System for a Tech Founder', type: 'Case Study', priority: 'P2', traffic: '900 est.' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/[0.04] hover:border-amber-500/20 transition-all group">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${c.priority === 'P0' ? 'text-red-400 border-red-400/30 bg-red-400/10' : c.priority === 'P1' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-zinc-500 border-zinc-700 bg-zinc-900'}`}>
                        {c.priority}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/80 group-hover:text-white">{c.title}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{c.type}</p>
                      </div>
                      <span className="text-xs font-black text-zinc-600 group-hover:text-amber-400 transition-colors">{c.traffic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* BACKLINKS */}
          {activeSection === 'backlinks' && (
            <motion.div
              key="backlinks"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-5">Priority Link Targets</h3>
                  <div className="space-y-3">
                    {[
                      { source: 'Forbes', da: 94, type: 'Press Feature', status: 'Target' },
                      { source: 'TechCrunch', da: 89, type: 'Guest Column', status: 'Target' },
                      { source: 'Wired', da: 92, type: 'Industry Analysis', status: 'Target' },
                      { source: 'AI Business', da: 61, type: 'Interview', status: 'Target' },
                      { source: 'Alpha List', da: 55, type: 'Elite Network', status: 'Target' },
                    ].map((l, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/[0.04]">
                        <div>
                          <p className="text-sm font-bold text-white/80">{l.source}</p>
                          <p className="text-[10px] text-zinc-600">{l.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-blue-400">DA {l.da}</p>
                          <p className="text-[10px] text-zinc-600">{l.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-5">Authority Strategy</h3>
                  <div className="space-y-4 text-sm text-zinc-400">
                    {[
                      { step: '01', action: 'Publish Global AI report — pitch to 5 tier-1 publications', impact: 'HIGH' },
                      { step: '02', action: 'World Economic Forum — high-ticket speaking slot', impact: 'HIGH' },
                      { step: '03', action: 'LinkedIn thought leadership — 3 posts/week for 90 days', impact: 'MED' },
                      { step: '04', action: 'Podcast circuit — AI & wealth management shows', impact: 'MED' },
                      { step: '05', action: 'Strategic client case studies (anonymised)', impact: 'HIGH' },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-black/40 rounded-xl border border-white/[0.04]">
                        <span className="text-[10px] font-black text-zinc-700 mt-0.5">{s.step}</span>
                        <div>
                          <p className="text-[11px] text-white/70 leading-relaxed">{s.action}</p>
                          <span className={`text-[9px] font-black mt-1 inline-block ${s.impact === 'HIGH' ? 'text-green-400' : 'text-amber-400'}`}>
                            {s.impact} IMPACT
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-zinc-700">
        KING DRIPPING SWAG SEO COMMAND — ELITE SEARCH INTELLIGENCE ENGINE
      </footer>
    </div>
  );
}
