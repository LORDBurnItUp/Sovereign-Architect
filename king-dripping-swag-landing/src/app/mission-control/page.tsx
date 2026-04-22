'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

interface Bot {
  id: string;
  name: string;
  platform: string;
  status: string;
  location: string;
  path: string;
}

interface Service {
  name: string;
  status: 'active' | 'inactive';
  icon: string;
  description: string;
  url?: string;
  action?: string;
}

// ─── HERMES NEURAL TAB ────────────────────────────────────────────────────────

const NODE_POSITIONS: Record<string, { x: number; y: number; color: string; label: string }> = {
  TELEGRAM:   { x: 50,  y: 10,  color: '#22d3ee', label: 'TELEGRAM' },
  DISCORD:    { x: 80,  y: 25,  color: '#a855f7', label: 'DISCORD' },
  WHATSAPP:   { x: 90,  y: 50,  color: '#22c55e', label: 'WHATSAPP' },
  OPENAI:     { x: 75,  y: 80,  color: '#10b981', label: 'OPENAI' },
  SUPABASE:   { x: 50,  y: 90,  color: '#22d3ee', label: 'SUPABASE' },
  'GROQ AI':  { x: 25,  y: 80,  color: '#f59e0b', label: 'GROQ AI' },
  ANTHROPIC:  { x: 10,  y: 50,  color: '#3b82f6', label: 'ANTHROPIC' },
};

const STATE_ACTIVE_NODES: Record<string, string[]> = {
  SCANNING:  ['TELEGRAM', 'DISCORD'],
  THINKING:  ['GROQ AI', 'ANTHROPIC'],
  ACTING:    ['TELEGRAM', 'DISCORD'],
  REPORTING: ['TELEGRAM', 'DISCORD', 'WHATSAPP', 'GROQ AI', 'ANTHROPIC', 'OPENAI', 'SUPABASE'],
  LEARNING:  ['SUPABASE'],
};

const STATE_COLORS: Record<string, string> = {
  IDLE:      '#71717a',
  SCANNING:  '#22d3ee',
  THINKING:  '#f59e0b',
  ACTING:    '#fbbf24',
  REPORTING: '#3b82f6',
  LEARNING:  '#a855f7',
  HEALING:   '#ef4444',
  ATTENTIVE: '#fcd34d',
};

function HermesNeuralTab() {
  const [hermesState, setHermesState] = useState('IDLE');
  const [hermesActivity, setHermesActivity] = useState('Awaiting connection...');
  const [logs, setLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ role: 'hermes' | 'user'; content: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [attentionGrabbed, setAttentionGrabbed] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // SSE connection
  useEffect(() => {
    const es = new EventSource('http://localhost:3002/api/hermes/stream');

    es.addEventListener('activity', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setHermesState(data.state);
      setHermesActivity(data.activity);
    });

    es.addEventListener('state-change', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setHermesState(data.state);
      setHermesActivity(data.activity);
    });

    es.addEventListener('log', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const msg = typeof data === 'string' ? data : data.message || JSON.stringify(data);
      setLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    });

    es.addEventListener('revenue', (e: MessageEvent) => {
      setActiveNode('SUPABASE');
      setTimeout(() => setActiveNode(null), 3000);
    });

    es.addEventListener('connected', () => {
      setHermesActivity('Neural link established.');
    });

    return () => es.close();
  }, []);

  // Auto-scroll logs and chat
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  async function sendMessage() {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, time: new Date().toLocaleTimeString() }]);
    setIsTyping(true);
    try {
      const res = await fetch('http://localhost:3002/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'hermes', content: data.response, time: new Date().toLocaleTimeString() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'hermes', content: 'Neural link temporarily disrupted. Revenue cycle continues.', time: new Date().toLocaleTimeString() }]);
    }
    setIsTyping(false);
  }

  async function handleGrabAttention() {
    setAttentionGrabbed(true);
    try {
      await fetch('http://localhost:3002/api/hermes/grab', { method: 'POST' });
    } catch {}
    setTimeout(() => setAttentionGrabbed(false), 3000);
  }

  const stateColor = attentionGrabbed ? '#ef4444' : (STATE_COLORS[hermesState] || '#71717a');
  const stateActiveNodes = STATE_ACTIVE_NODES[hermesState] || [];

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── LEFT 60%: Neural Graph ── */}
      <div className="w-[60%] flex flex-col border-r border-white/10 relative bg-black/60 overflow-hidden">
        {/* State badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: stateColor }}
          />
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border"
            style={{ color: stateColor, borderColor: stateColor + '60', background: stateColor + '15' }}
          >
            {hermesState}
          </span>
        </div>

        {/* Graph container */}
        <div className="flex-1 relative m-4">
          {/* SVG connection lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <style>{`
                @keyframes dashFlow {
                  to { stroke-dashoffset: -20; }
                }
                .flow-line { animation: dashFlow 1.5s linear infinite; }
              `}</style>
            </defs>
            {Object.entries(NODE_POSITIONS).map(([key, node]) => {
              const isActive = activeNode === key || stateActiveNodes.includes(key);
              return (
                <line
                  key={key}
                  x1="50" y1="50"
                  x2={node.x} y2={node.y}
                  stroke={isActive ? node.color : '#ffffff20'}
                  strokeWidth={isActive ? '0.8' : '0.4'}
                  strokeDasharray="3 2"
                  className={isActive ? 'flow-line' : ''}
                  style={{ transition: 'stroke 0.5s, stroke-width 0.5s' }}
                />
              );
            })}
          </svg>

          {/* Hermes central node */}
          <div
            className="absolute z-10"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            {/* Floating activity tooltip */}
            <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 w-48 z-30">
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[9px] font-bold text-amber-300 bg-black/90 border border-amber-500/60 rounded-lg px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis shadow-lg shadow-amber-900/40"
              >
                🧠 {hermesActivity}
              </motion.div>
              <div className="w-px h-3 bg-amber-500/40 mx-auto" />
            </div>

            {/* Outer pulsing ring */}
            <motion.div
              animate={{
                scale: hermesState === 'ACTING' ? [1, 1.5, 1] : [1, 1.25, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: hermesState === 'ACTING' ? 0.8 : 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${stateColor}60, transparent 70%)`,
                width: 80,
                height: 80,
                left: -8,
                top: -8,
              }}
            />

            {/* Main node */}
            <motion.div
              onDoubleClick={handleGrabAttention}
              animate={{ boxShadow: `0 0 ${attentionGrabbed ? 30 : 20}px ${stateColor}` }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer select-none relative z-10"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${stateColor}cc, ${stateColor}44)`,
                border: `2px solid ${stateColor}`,
              }}
              title="Double-click to grab Hermes attention"
            >
              <span className="text-xl">🦅</span>
            </motion.div>

            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-amber-400 whitespace-nowrap">
              HERMES
            </div>
          </div>

          {/* Satellite nodes */}
          {Object.entries(NODE_POSITIONS).map(([key, node]) => {
            const isActive = activeNode === key || stateActiveNodes.includes(key);
            return (
              <div
                key={key}
                className="absolute z-10"
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Pulsing ring */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{
                      width: 40, height: 40,
                      left: -4, top: -4,
                      background: `radial-gradient(circle, ${node.color}50, transparent 70%)`,
                    }}
                  />
                )}

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black relative z-10"
                  style={{
                    background: isActive ? `${node.color}30` : '#0a0a0a',
                    border: `1.5px solid ${isActive ? node.color : node.color + '50'}`,
                    boxShadow: isActive ? `0 0 12px ${node.color}80` : 'none',
                    transition: 'all 0.5s',
                    color: node.color,
                  }}
                >
                  {key.slice(0, 2)}
                </div>

                <div
                  className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase whitespace-nowrap"
                  style={{ color: isActive ? node.color : node.color + '80' }}
                >
                  {node.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom grab button */}
        <div className="p-3 border-t border-white/10 flex justify-center">
          <button
            onClick={handleGrabAttention}
            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all active:scale-95"
          >
            {attentionGrabbed ? '⚡ ATTENTION GRABBED' : '⚡ GRAB ATTENTION'}
          </button>
        </div>
      </div>

      {/* ── RIGHT 40%: Chat + Log ── */}
      <div className="w-[40%] flex flex-col">
        {/* Chat — top half */}
        <div className="flex-1 flex flex-col border-b border-white/10 overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10 bg-black/40">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Neural Chat</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-[10px] text-white/20 text-center mt-4 font-mono">
                Transmit a directive to Hermes...
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'hermes' && (
                  <div className="max-w-[85%] bg-black/60 border-l-2 border-amber-500 rounded-r-xl px-3 py-2">
                    <div className="text-[8px] font-black uppercase text-amber-500/60 mb-1">HERMES // {m.time}</div>
                    <div className="text-[11px] text-white/90 font-mono leading-relaxed">{m.content}</div>
                  </div>
                )}
                {m.role === 'user' && (
                  <div className="max-w-[85%] bg-cyan-500/10 border border-cyan-500/30 rounded-l-xl px-3 py-2">
                    <div className="text-[8px] font-black uppercase text-cyan-400/60 mb-1 text-right">ARCHITECT // {m.time}</div>
                    <div className="text-[11px] text-cyan-100 font-mono leading-relaxed text-right">{m.content}</div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-black/60 border-l-2 border-amber-500 rounded-r-xl px-3 py-2">
                  <div className="text-[8px] font-black uppercase text-amber-500/60 mb-1">HERMES // thinking...</div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 border-t border-white/10 bg-black/40 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Transmit directive..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-cyan-300 placeholder:text-white/20 outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              onClick={sendMessage}
              className="text-[9px] font-black uppercase tracking-widest px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-all active:scale-95 whitespace-nowrap"
            >
              TRANSMIT
            </button>
          </div>
        </div>

        {/* Activity log — bottom half */}
        <div className="h-[45%] flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10 bg-black/40">
            <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Live Activity Log</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-black/80 p-3 custom-scrollbar">
            {logs.length === 0 && (
              <div className="text-[9px] text-green-900 font-mono mt-2">Awaiting signal from port 3002...</div>
            )}
            {logs.map((line, i) => (
              <div key={i} className="text-[9px] font-mono text-green-400/80 leading-relaxed hover:text-green-300 transition-colors">
                {line}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QUANTUM CORE ──────────────────────────────────────────────────────────────
const QuantumCore = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 4D Quantum Lattice Animation */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 border border-cyan-500/30 rounded-[20%]"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          />
        ))}
      </div>

      {/* 360 Spinning Logo */}
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="relative z-20 w-64 h-64 preserve-3d"
      >
        <img 
          src="/kings-drip-logo.png" 
          alt="King Dripping Swag Logo" 
          className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(34,211,238,0.5)]" 
        />
        {/* Holographic Glow */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse" />
      </motion.div>

      {/* Floating Data Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '110%', x: `${Math.random() * 100}%` }}
          animate={{ y: '-10%', opacity: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
          className="absolute w-0.5 h-12 bg-gradient-to-t from-cyan-500/0 via-cyan-400 to-cyan-500/0"
        />
      ))}

      <div className="absolute bottom-10 text-center z-30">
        <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-white animate-pulse">
          Quantum Core Stable
        </h2>
        <p className="text-[10px] text-cyan-400/60 tracking-[0.8em] font-bold uppercase mt-2">
          Hermes Intelligence Gateway
        </p>
      </div>
    </div>
  );
};

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'core' | 'logs' | 'terminal' | 'bots' | 'hermes'>('core');
  const [activeBot, setActiveBot] = useState<string>('tg-001');
  const [logs, setLogs] = useState<string[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [services, setServices] = useState<Service[]>([
    { name: 'Claude Code', status: 'active', icon: '🤖', description: 'Agentic CLI Control', action: 'focus-terminal' },
    { name: 'NotebookLM', status: 'active', icon: '📚', description: 'Advanced Research AI', url: 'https://notebooklm.google.com' },
    { name: 'Railway', status: 'active', icon: '🚆', description: 'Infrastructure Engine', url: 'https://railway.app' },
    { name: 'Clean Cache', status: 'active', icon: '🧹', description: 'Optimize & Flush System', action: 'clean-system' },
    { name: 'Pinecone', status: 'active', icon: '🌲', description: 'Vector Memory Bank', url: 'https://app.pinecone.io' },
    { name: 'Supabase', status: 'active', icon: '⚡', description: 'Postgres & Auth Mesh', url: 'https://supabase.com' },
    { name: 'OpenAI', status: 'active', icon: '🧠', description: 'GPT-4o Reasoning', url: 'https://platform.openai.com' },
    { name: 'Venice AI', status: 'active', icon: '🎭', description: 'Uncensored Inference', url: 'https://venice.ai' },
    { name: 'N8N', status: 'active', icon: '🔗', description: 'Workflow Automation', url: 'https://n8n.io' },
    { name: 'GitHub', status: 'active', icon: '🐙', description: 'Code Repository', url: 'https://github.com' },
    { name: 'Stripe', status: 'inactive', icon: '💳', description: 'Payment Processing', url: 'https://dashboard.stripe.com' },
    { name: 'Hostinger', status: 'active', icon: '🌐', description: 'Strategic Hosting', url: 'https://hpanel.hostinger.com' },
    { name: 'Discord', status: 'active', icon: '💬', description: 'High-Velocity Alerts', url: 'https://discord.com' }
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  // Fetch Bots and Messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/bots');
        const data = await res.json();
        setBots(data.bots || []);
      } catch (e) {
        console.error('Failed to fetch bots', e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeBot) {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`/api/bots?bot_id=${activeBot}`);
          const data = await res.json();
          setMessages(data.messages || []);
        } catch (e) {
          console.error('Failed to fetch messages', e);
        }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeBot]);

  // Log Streaming
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (e) {
        console.error('Failed to fetch logs', e);
      }
    };
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // XTerm Initialization
  useEffect(() => {
    if (activeTab === 'terminal' && terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        cursorBlink: true,
        theme: {
          background: '#0a0a0a',
          foreground: '#00ffcc',
          cursor: '#00ffcc',
        },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.writeln('\x1b[1;36mHermes Gateway [Secure Protocol 5.0]\x1b[0m');
      term.writeln('\x1b[1;32mAccessing King Dripping Swag Core...\x1b[0m');
      term.write('\r\nPS C:\\Users\\user\\Hermes> ');
      xtermRef.current = term;
    }
  }, [activeTab]);

  const runCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput) return;
    const cmd = terminalInput;
    setTerminalInput('');
    if (xtermRef.current) xtermRef.current.writeln(`\r\n> ${cmd}`);
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      if (xtermRef.current) {
        xtermRef.current.writeln(data.output || data.error);
        xtermRef.current.write('PS C:\\Users\\user\\Hermes> ');
      }
    } catch (err) {
      if (xtermRef.current) xtermRef.current.writeln('Fatal Error: Command Core Disconnected.');
    }
  };

  const handleServiceAction = async (service: Service) => {
    if (service.action === 'focus-terminal') {
      setActiveTab('terminal');
    } else if (service.action === 'clean-system') {
      try {
        const res = await fetch('/api/system/clean', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert('System Optimization Complete: ' + data.results.join(' '));
        }
      } catch (e) {
        alert('Optimization Failed: Neural link unstable.');
      }
    } else if (service.url) {
      window.open(service.url, '_blank', 'noopener,noreferrer');
    }
  };

  const [stats, setStats] = useState<any>(null);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white font-mono selection:bg-cyan-500/40 cursor-default overflow-hidden">
      {/* 4D Background Space */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05)_0%,transparent_70%)]" />
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/5 blur-[150px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="relative z-50 border-b border-white/10 bg-black/60 backdrop-blur-2xl px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 relative"
          >
            <div className="absolute inset-0 bg-cyan-500/40 rounded-lg blur-xl animate-pulse" />
            <img src="/kings-drip-logo.png" className="w-full h-full object-contain relative z-10" alt="Nano Logo" />
          </motion.div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-purple-500">
               HERMES CORE: 6-TIER BRAIN ACTIVE
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <p className="text-[10px] text-cyan-400/80 uppercase tracking-[0.3em] font-black">Architecture: B.L.A.S.T v2.0 // Quantum Logic Enabled</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-center text-[10px] uppercase font-black tracking-[0.2em]">
           <div className="flex flex-col items-end border-r border-white/10 pr-8">
              <span className="text-white/40">Entities Mapped</span>
              <span className="text-cyan-400 text-lg">{stats?.tiers?.t4?.entities || 0}</span>
           </div>
           <div className="flex flex-col items-end border-r border-white/10 pr-8">
              <span className="text-white/40">Blueprints Extracted</span>
              <span className="text-amber-400 text-lg">{stats?.tiers?.t6 || 0}</span>
           </div>
           <div className="flex gap-4">
              <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400">BEAST_MODE: ON</div>
              <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400">HERMES: STABLE</div>
           </div>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-12 gap-6 p-6 h-[calc(100vh-100px)]">
        {/* Left Control Column */}
        <div className="col-span-3 flex flex-col gap-6">
           <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex-1 overflow-y-auto custom-scrollbar group">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400 mb-6 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-cyan-500" /> Strategic Integrations
              </h2>
              <div className="space-y-4">
                 {services.map(s => (
                    <div key={s.name} className="group/item relative bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all duration-500">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <span className="text-xl group-hover/item:scale-125 transition-transform duration-500">{s.icon}</span>
                             <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">{s.name}</h3>
                                <p className="text-[9px] text-white/40">{s.description}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleServiceAction(s)}
                            className="text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all active:scale-90"
                          >
                            Sync
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Center Neural Column */}
        <div className="col-span-6 flex flex-col gap-6">
           {/* Top Navigation */}
           <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
             {[
               { id: 'core', label: 'Quantum Core', icon: '⚛️' },
               { id: 'logs', label: 'Neural Mesh', icon: '🕸️' },
               { id: 'terminal', label: 'Command Hub', icon: '🐚' },
               { id: 'bots', label: 'Bot Matrix', icon: '🤖' },
               { id: 'hermes', label: 'Hermes Neural', icon: '🦅' }
             ].map(t => (
               <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase font-black tracking-widest transition-all duration-500 ${
                  activeTab === t.id ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-[0_4px_30px_rgba(34,211,238,0.4)] scale-[1.02]' : 'text-white/40 hover:bg-white/5'
                }`}
               >
                 <span className="text-sm">{t.icon}</span>
                 {t.label}
               </button>
             ))}
           </div>

           {/* Main Display Area */}
           <div className="flex-1 bg-black/40 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-3xl relative group">
              {/* Dynamic Borders */}
              <div className="absolute inset-0 border-[2px] border-cyan-500/5 pointer-events-none rounded-[40px]" />
              
              <AnimatePresence mode="wait">
                 {activeTab === 'core' && (
                    <motion.div 
                      key="core"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="h-full"
                    >
                       <QuantumCore />
                    </motion.div>
                 )}

                 {activeTab === 'logs' && (
                    <motion.div 
                      key="logs"
                      initial={{ opacity: 0, rotateX: -10 }}
                      animate={{ opacity: 1, rotateX: 0 }}
                      exit={{ opacity: 0, rotateX: 10 }}
                      className="p-8 h-full overflow-y-auto custom-scrollbar space-y-2"
                    >
                       {logs.map((l, i) => (
                          <div key={i} className="flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group/log">
                             <span className="text-[9px] text-cyan-500/40 font-black pt-0.5">[{new Date().toLocaleTimeString()}]</span>
                             <p className="text-[11px] text-white/80 font-mono leading-relaxed">{l}</p>
                          </div>
                       ))}
                       <div className="h-20" />
                    </motion.div>
                 )}

                 {activeTab === 'terminal' && (
                    <motion.div 
                       key="terminal"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="h-full flex flex-col bg-black/80"
                    >
                       <div ref={terminalRef} className="flex-1 p-4" />
                       <form onSubmit={runCommand} className="p-6 bg-black border-t border-white/10 flex items-center gap-4">
                          <span className="text-cyan-400 font-black text-sm">#_</span>
                          <input 
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            className="bg-transparent border-none outline-none text-cyan-400 text-sm font-mono flex-1 placeholder:text-cyan-900" 
                            placeholder="Execute Strategic Directive..."
                          />
                       </form>
                    </motion.div>
                 )}

                 {activeTab === 'bots' && (
                    <motion.div
                      key="bots"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                       <div className="flex bg-white/5 p-2">
                          {bots.map(b => (
                             <button
                               key={b.id}
                               onClick={() => setActiveBot(b.id)}
                               className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                                 activeBot === b.id ? 'text-cyan-400 bg-white/5 rounded-xl' : 'text-white/20 hover:text-white'
                               }`}
                             >
                               {b.platform}
                             </button>
                          ))}
                       </div>

                       <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                          {messages.map(m => (
                             <div key={m.id} className={`flex ${m.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-5 rounded-3xl ${
                                  m.sender === 'User' ? 'bg-cyan-500 text-black font-black' : 'bg-white/5 border border-white/10 text-white'
                                }`}>
                                   <div className="text-[9px] uppercase font-black opacity-50 mb-2">{m.sender} // {m.timestamp}</div>
                                   <div className="text-sm font-bold">{m.content}</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'hermes' && (
                    <motion.div
                      key="hermes"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.03 }}
                      className="h-full"
                    >
                      <HermesNeuralTab />
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Right Intel Column */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
           <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-72 relative overflow-hidden">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400 mb-6 flex items-center gap-2">
                 <span className="w-4 h-[1px] bg-cyan-500" /> 6-Tier Brain Monitor
              </h2>
              <div className="space-y-3">
                 {[
                   { t: 'T1', label: 'Local context', val: stats?.tiers?.t1 || 0, unit: 'msgs' },
                   { t: 'T2', label: 'Semantic Mesh', val: stats?.tiers?.t2 || 'Pending', unit: '' },
                   { t: 'T3', label: 'Structured Sync', val: stats?.tiers?.t3 || 'Pending', unit: '' },
                   { t: 'T4', label: 'Relational Graph', val: stats?.tiers?.t4?.relations || 0, unit: 'links' },
                   { t: 'T5', label: 'Cold Archive', val: stats?.tiers?.t5 || 0, unit: 'pkgs' },
                   { t: 'T6', label: 'Meta-Strategy', val: stats?.tiers?.t6 || 0, unit: 'blueprints' }
                 ].map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between group/tier">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-white/20 group-hover/tier:text-cyan-500 transition-colors">{tier.t}</span>
                          <span className="text-[9px] uppercase font-bold text-white/60">{tier.label}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-cyan-400">{tier.val}</span>
                          <span className="text-[8px] text-white/20">{tier.unit}</span>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-[9px] font-black uppercase tracking-widest">
                 <span className="text-white/40">Neural Sync</span>
                 <span className="text-green-400 animate-pulse">99.8% Stable</span>
              </div>
           </section>

           <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex-1">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-yellow-500 mb-6 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-yellow-500" /> Strategic Intelligence
              </h2>
              <div className="space-y-4">
                 {[
                   { label: 'ALPHA', msg: 'MGX High-Value Target Identified', color: 'text-cyan-400' },
                   { label: 'GAMMA', msg: 'Hermes Logic Mesh Self-Optimized', color: 'text-purple-400' },
                   { label: 'SEC', msg: 'Quantum Encryption Handshake Complete', color: 'text-green-400' },
                   { label: 'DRIP', msg: 'System Swag Overflow: Level 99', color: 'text-pink-500' }
                 ].map((a, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-crosshair">
                       <span className={`text-[9px] font-black uppercase tracking-widest ${a.color}`}>[{a.label}]</span>
                       <p className="text-[11px] font-bold text-white/80 mt-1 leading-tight">{a.msg}</p>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.4); }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}
