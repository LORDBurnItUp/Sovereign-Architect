'use client';

export default function HolographicUI() {
  return (
    <div className="absolute inset-0 z-10 p-8 pointer-events-auto">
      {/* Top Bar */}
      <div className="glass-panel flex justify-between items-center px-8 py-6 text-white border-b border-white/10 backdrop-blur-xl rounded-2xl mb-8">
        <h1 className="text-5xl font-bold tracking-tighter text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]">BURJ PENTHOUSE 163</h1>
        <div className="text-xl text-cyan-400 font-mono">LIVE SWARM • DUBAI • 23:17</div>
      </div>

      {/* Agent Cards */}
      <div className="absolute bottom-12 left-12 grid grid-cols-3 gap-8">
        {['Scout', 'Executor', 'Debugger', 'Manager', 'Analyst', 'Voice'].map((agent) => (
          <div key={agent} className="holo-card p-8 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 border border-cyan-400 rounded-3xl backdrop-blur-2xl transition-all hover:scale-105 hover:bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <div className="text-cyan-300 text-2xl font-semibold mb-2">{agent} Agent</div>
            <div className="text-white/80 font-mono text-sm uppercase tracking-wider">Mode: <span className="text-green-400 animate-pulse">God Mode</span> • Running</div>
          </div>
        ))}
      </div>
    </div>
  );
}
