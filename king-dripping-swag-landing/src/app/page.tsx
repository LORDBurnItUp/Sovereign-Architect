import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-amber-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            KING DRIPPING SWAG
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#vision" className="hover:text-amber-400 transition-colors">VISION</a>
            <a href="#services" className="hover:text-amber-400 transition-colors">SERVICES</a>
            <a href="/lead-intel" className="hover:text-amber-400 transition-colors">INTELLIGENCE</a>
            <a href="/mission-control" className="hover:text-amber-400 transition-colors">MISSION CONTROL</a>
            <a href="/outreach" className="hover:text-amber-400 transition-colors uppercase">OUTREACH</a>
            <a href="/seo-command" className="hover:text-amber-400 transition-colors uppercase">SEO</a>
            <a href="/blueprints" className="hover:text-amber-400 transition-colors uppercase">BLUEPRINTS</a>
          </div>
          <button className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-amber-400 transition-all duration-300">
            STRATEGY CALL
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs font-bold tracking-widest text-amber-400 uppercase">
              Exclusive for Sovereigns & Billionaires
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              BECAUSE MILLIONAIRES <span className="text-zinc-600">GRIND</span><br />
              BILLIONAIRES <span className="text-amber-400 italic">OPTIMIZE.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-zinc-400 mb-12">
              King Dripping Swag is an elite AI Development & Real-Time Dashboard Agency targeting the top 0.1%. We build real-time command centers and hyper-scale marketing machines that turn dominance into a default state.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 bg-amber-500 text-black font-black text-lg rounded-xl hover:scale-105 transition-transform uppercase tracking-tight">
                BOOK BRIEFING
              </button>
              <a href="/blueprints" className="px-10 py-5 bg-zinc-900 border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-zinc-800 transition-colors inline-block uppercase tracking-tight">
                GET BLUEPRINT
              </a>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 px-6 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-12 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-500 transition-colors">
                  <svg className="w-8 h-8 text-amber-500 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">AI DEVELOPMENT</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Bespoke LLMs, proprietary RAG pipelines, and automated agent swarms tailored for multi-billion dollar family offices and global elite investors.
                </p>
              </div>
              
              <div className="p-12 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-500 transition-colors">
                  <svg className="w-8 h-8 text-amber-500 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">PERFORMANCE MARKETING</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Precision-targeted campaigns for UHNWIs. We don't chase clicks; we capture market share using AI-driven narrative control and lead extraction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Objection Handling / Trust Section */}
        <section className="py-32 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
            {[
              { q: "I don't trust this company", a: "Read our verified case studies and meet the agents in Mission Control." },
              { q: "I don't understand the product", a: "View our real-time 'How it Works' explainer in the Lead Intel section." },
              { q: "Is this worth the price?", a: "Our ROI calculator for $100M+ portfolios proves the value in 60 seconds." },
              { q: "Is this right for me?", a: "If you move >$10M in capital monthly, this is engineered for you." },
            ].map((obj, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">OBJECTION</p>
                <p className="text-white font-bold uppercase tracking-tight text-sm">"{obj.q}"</p>
                <div className="h-0.5 w-8 bg-zinc-800" />
                <p className="text-zinc-500 text-xs leading-relaxed">{obj.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Blueprint Series */}
        <section id="blueprints" className="py-32 px-6 bg-amber-500 text-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 mb-6 rounded-full border border-black/10 bg-black/5 text-[10px] font-black tracking-[0.2em] uppercase">
                Self-Monetized Intelligence
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.85]">
                THE<br />BLUEPRINT<br />SERIES
              </h2>
              <p className="text-xl font-medium mb-12 opacity-80 leading-relaxed">
                We document every success, every failure, and every winning tactic. 
                Our memory bank is now yours. Package your own legend into revenue-printing machines.
              </p>
              <a href="/blueprints" className="inline-block px-12 py-6 bg-black text-white font-black rounded-xl hover:scale-105 transition-transform uppercase tracking-widest text-sm">
                Shop the Blueprints
              </a>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { title: 'Billionaire Hunter', price: '$2,999' },
                { title: 'Command Center', price: '$4,500' },
                { title: 'Sovereign Protocol', price: '$1,200' },
                { title: 'Revenue Printer', price: '$999' },
              ].map((b, i) => (
                <div key={i} className="p-8 bg-white/10 backdrop-blur-sm border border-black/5 rounded-3xl hover:bg-white/20 transition-all flex flex-col justify-between aspect-square">
                  <div className="text-sm font-black uppercase tracking-tight">{b.title}</div>
                  <div className="text-2xl font-black mt-4">{b.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-40 px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">READY TO LEAVE THE <br/><span className="text-zinc-600">GRIND</span> BEHIND?</h2>
          <div className="flex justify-center">
            <a href="mailto:elite@kingdrippingswag.io" className="text-2xl font-bold border-b-2 border-amber-500 pb-2 hover:text-amber-400 transition-all">
              ENQUIRE PRIVATELY →
            </a>
          </div>
        </section>
      </main>

      <footer className="py-32 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <div className="text-2xl font-black tracking-tighter text-white">KING DRIPPING SWAG</div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed uppercase tracking-widest font-bold">
              Unstoppable 24/7 Profit Machine — Global Command
            </p>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase">Navigation</p>
              <div className="flex flex-col gap-2 text-sm font-bold text-zinc-400">
                <a href="/blueprints" className="hover:text-white transition-colors">BLUEPRINTS</a>
                <a href="/lead-intel" className="hover:text-white transition-colors">LEAD INTEL</a>
                <a href="/mission-control" className="hover:text-white transition-colors">CONTROL</a>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase">Protocol</p>
              <div className="flex flex-col gap-2 text-sm font-bold text-zinc-400">
                <a href="#" className="hover:text-white transition-colors">BLUEPRINTS</a>
                <a href="#" className="hover:text-white transition-colors">REVENUE</a>
                <a href="#" className="hover:text-white transition-colors">LEGEND</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-800 tracking-[0.4em] uppercase font-black">© 2026 KING DRIPPING SWAG — ALL RIGHTS RESERVED — BUILT ON GEMMA 4 26B A4B</p>
        </div>
      </footer>
    </div>
  );
}
