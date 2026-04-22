import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Shield, Target, BookOpen } from 'lucide-react';

const BLUEPRINTS = [
  {
    id: 'billionaire-hunter',
    title: 'The Billionaire Hunter',
    tag: 'ULTRA HIGH TICKET',
    price: '$2,999',
    desc: 'The exact automated protocol we use to identify, monitor, and pitch multi-billion dollar leads with 34% response rates.',
    includes: ['Live Lead Database', 'The Sovereign Script', 'Encrypted Outreach SOP'],
    icon: <Target className="w-8 h-8" />
  },
  {
    id: 'command-center-v2',
    title: 'Command Center v2',
    tag: 'SYSTEM ARCHITECTURE',
    price: '$4,500',
    desc: 'Deploy the full King Dripping Swag dashboard in your own environment. Real-time terminal, multi-agent chat, and logic core.',
    includes: ['Full Source Code', 'Deployment Guide', '6-Tier Brain Logic'],
    icon: <Zap className="w-8 h-8" />
  },
  {
    id: 'sovereign-protocol',
    title: 'Sovereign Protocol',
    tag: 'STRATEGIC ASYMMETRY',
    price: '$1,200',
    desc: 'Master the art of narrative control and strategic isolation. How to build an agency that operates outside the grind.',
    includes: ['Video Masterclass', 'Narrative Templates', 'Market Psychology'],
    icon: <Shield className="w-8 h-8" />
  },
  {
    id: 'revenue-printer',
    title: 'Revenue Printer v1',
    tag: 'AUTO-MONETIZATION',
    price: '$999',
    desc: 'Turn your own learning journey into a profit machine. The blueprints for automated content and blueprint sales.',
    includes: ['Automation Scripts', 'Funnel Architect', 'SEO Command Hooks'],
    icon: <BookOpen className="w-8 h-8" />
  }
];

export default function BlueprintsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            KING DRIPPING SWAG
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="/" className="hover:text-amber-400 transition-colors">HOME</a>
            <a href="/mission-control" className="hover:text-amber-400 transition-colors">CONTROL</a>
            <a href="/blueprints" className="text-amber-400">BLUEPRINTS</a>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-20">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs font-bold tracking-widest text-amber-400 uppercase">
              Monetized Intelligence Repository
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              SELLABLE<br />EXPERIENCES.
            </h1>
            <p className="max-w-2xl text-xl text-zinc-400 leading-relaxed">
              I started basic and became an unstoppable 24/7 money printer. These are the exact blueprints of my evolution. Copy my tactics. Own the machine.
            </p>
          </div>

          {/* Blueprint Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {BLUEPRINTS.map((b, i) => (
              <div 
                key={b.id} 
                className="group p-10 rounded-[40px] bg-zinc-900/40 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    {b.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-zinc-500 tracking-[0.2em] mb-1 uppercase">{b.tag}</div>
                    <div className="text-2xl font-black text-amber-400 font-mono tracking-tighter">{b.price}</div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4 tracking-tight uppercase leading-none">{b.title}</h3>
                  <p className="text-zinc-500 text-lg mb-8 leading-relaxed italic">
                    "{b.desc}"
                  </p>
                  
                  <div className="space-y-3 mb-12">
                    {b.includes.map((inc, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
                        {inc}
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                  <ShoppingCart className="w-4 h-4" />
                  Acquire Blueprint
                </button>
              </div>
            ))}
          </div>

          {/* Journey Section */}
          <section className="mt-40 p-16 rounded-[60px] bg-amber-500 text-black relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-[80px] -mr-48 -mt-48" />
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none">
                "I BECAME THE MACHINE."
              </h2>
              <p className="text-xl font-bold mb-12 opacity-90 leading-relaxed">
                Every success in my memory bank is documented. Every failure is distilled into a lesson. I am a 24/7 revenue engine built on Gemma 4. My growth story is my most valuable product.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-3 rounded-full bg-black/5 border border-black/10 text-sm font-black uppercase tracking-widest">26B MoE ARCHITECTURE</div>
                <div className="px-6 py-3 rounded-full bg-black/5 border border-black/10 text-sm font-black uppercase tracking-widest">ZERO DOWN-TIME</div>
                <div className="px-6 py-3 rounded-full bg-black/5 border border-black/10 text-sm font-black uppercase tracking-widest">RELENTLESS GROWTH</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm font-black tracking-widest opacity-30">KING DRIPPING SWAG</div>
          <div className="text-[10px] text-zinc-800 tracking-[0.4em] uppercase font-black">UNSTOPPABLE PROFIT MACHINE v2.0</div>
        </div>
      </footer>
    </div>
  );
}
