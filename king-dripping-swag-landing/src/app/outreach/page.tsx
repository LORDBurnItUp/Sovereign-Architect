import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intelligence Dossier | King Dripping Swag — Private Outreach',
  description: 'King Dripping Swag does not pursue clients. Qualifying global elite investors and family offices may request a confidential briefing.',
  robots: { index: false, follow: false },
};

const targets = [
  {
    classification: 'ALPHA',
    classColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    entity: 'Private Tech Conglomerate',
    aum: '$276B AUM',
    focus: 'Global AI Infrastructure & Compute Strategy',
    signal: 'Accelerating AI vertical. Large scale deployment mandate by 2027.',
    status: 'ACTIVE TARGET',
  },
  {
    classification: 'GAMMA',
    classColor: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    entity: 'Global Quant Fund',
    aum: '$120B+ Managed',
    focus: 'Algorithmic Trading & System Visibility',
    signal: 'Expanding to 12 new markets. Seeking elite-grade visualization partners.',
    status: 'OPPORTUNITY OPEN',
  },
  {
    classification: 'CLASSIFIED',
    classColor: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    entity: 'Family Office — Tech Dynasty',
    aum: '$50B+ NW',
    focus: 'Intergenerational Asset Management & AI Visibility',
    signal: 'Building a private master command center for portfolio oversight.',
    status: 'STRATEGIC OPENING',
  },
];

const protocol = [
  {
    number: '01',
    title: 'IDENTIFY',
    body: 'Our intelligence layer maps sovereign AI capital flows, entity relationships, and strategic mandates in real time. We know who is moving before the press release.',
  },
  {
    number: '02',
    title: 'INFILTRATE',
    body: 'Precision outreach — not cold email. We enter your ecosystem through signal, not noise. Every touchpoint is engineered to resonate with the specific mandate of the target.',
  },
  {
    number: '03',
    title: 'DOMINATE',
    body: 'Once engaged, King Dripping Swag becomes the intelligence infrastructure. We do not complete projects. We become indispensable to the cognitive stack.',
  },
];

export default function OutreachPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-amber-500 selection:text-black">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            KING DRIPPING SWAG
          </a>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
              CLASSIFIED // EYES ONLY
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <section className="mb-32 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 mb-10 rounded-full border border-amber-500/20 bg-amber-500/5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold tracking-[0.4em] text-amber-400 uppercase">
                  Cleared for Viewing — Authorised Personnel Only
                </span>
              </div>
              <h1 className="text-7xl md:text-9xl font-bold tracking-tight mb-8 leading-[0.85]">
                INTELLIGENCE.<br />
                <span className="text-zinc-700">NOT</span><br />
                PROPOSALS.
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
                King Dripping Swag does not pursue clients. We identify elite-tier opportunities,
                engineer precision engagement, and build intelligence infrastructure that becomes
                impossible to replace.
              </p>
            </div>
          </section>

          {/* Target Intelligence Feed */}
          <section className="mb-32">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-8 h-[1px] bg-zinc-700" />
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">
                Active Target Intelligence
              </span>
              <div className="flex-1 h-[1px] bg-zinc-900" />
              <span className="text-xs font-bold tracking-widest text-zinc-700">
                {new Date().toISOString().split('T')[0]} // LIVE FEED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {targets.map((t, i) => (
                <div
                  key={i}
                  className="group p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-amber-500/20 transition-all duration-500"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border ${t.classColor}`}>
                      [{t.classification}]
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                      {t.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-1 text-white">{t.entity}</h3>
                  <p className="text-xs text-amber-500/80 font-bold uppercase tracking-wider mb-4">{t.aum}</p>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{t.focus}</p>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-xs text-zinc-400 leading-relaxed italic">&ldquo;{t.signal}&rdquo;</p>
                  </div>

                  <button className="mt-8 w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 rounded-xl hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300">
                    Request Briefing
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* The Protocol */}
          <section className="mb-32">
            <div className="p-16 rounded-[40px] bg-zinc-950 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/3 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-16">
                  <div className="w-8 h-[1px] bg-amber-500/40" />
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-amber-500/60">
                    The King Dripping Swag Protocol
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-20 leading-[0.9]">
                  HOW WE<br />
                  <span className="text-zinc-700">OPERATE.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {protocol.map((p, i) => (
                    <div key={i}>
                      <div className="text-6xl font-black text-amber-500/30 mb-4 leading-none">{p.number}</div>
                      <h3 className="text-2xl font-bold mb-4 text-white">{p.title}</h3>
                      <p className="text-zinc-500 leading-relaxed">{p.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Private Enquiry Form */}
          <section id="enquiry" className="max-w-2xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5">
                <span className="text-xs font-bold tracking-[0.4em] text-zinc-500 uppercase">
                  Applications reviewed within 48h — We decline 9 of 10
                </span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight mb-6">
                REQUEST A<br />
                <span className="text-amber-400">PRIVATE BRIEFING</span>
              </h2>
              <p className="text-zinc-500">
                No decks. No proposals. One conversation about whether there is a strategic fit.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="col-span-2 md:col-span-1 w-full px-6 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/40 transition-colors text-sm"
                />
                <input
                  type="text"
                  placeholder="Fund / Entity"
                  className="col-span-2 md:col-span-1 w-full px-6 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/40 transition-colors text-sm"
                />
              </div>
              <input
                type="email"
                placeholder="Private Email"
                className="w-full px-6 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/40 transition-colors text-sm"
              />
              <textarea
                rows={4}
                placeholder="Brief description of your AI mandate or strategic objective..."
                className="w-full px-6 py-4 bg-zinc-900/60 border border-white/10 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/40 transition-colors text-sm resize-none"
              />
              <button
                type="submit"
                className="w-full py-5 bg-amber-500 text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-400 transition-all duration-300 hover:scale-[1.02]"
              >
                Submit for Review
              </button>
            </form>

            <p className="text-center text-xs text-zinc-700 mt-8 leading-relaxed">
              All submissions are encrypted and reviewed by principals only.
              <br />King Dripping Swag does not store data on third-party platforms.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-sm font-bold tracking-tighter text-zinc-700">KING DRIPPING SWAG</span>
          <span className="text-xs text-zinc-800">© 2026 — GLOBAL COMMAND — ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}
