"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  code: string;
  nationality: string;
  flag: string;
  netWorth: number; // USD millions
  interest: string;
  budget: number; // AED millions
  temp: number; // 0-100
  status: "QUALIFYING" | "ENGAGED" | "NEGOTIATION" | "VIEWING" | "CLOSED" | "COLD";
  lastContact: string;
  notes: string;
}

const LEADS: Lead[] = [
  { id: "L1", code: "VIP-7801", nationality: "Saudi Arabia", flag: "🇸🇦", netWorth: 2400, interest: "Palm Jumeirah · Signature Villa", budget: 180, temp: 94, status: "NEGOTIATION", lastContact: "2m ago", notes: "Requested drone survey · Legal review with Al-Rashid Group" },
  { id: "L2", code: "VIP-7802", nationality: "Russia", flag: "🇷🇺", netWorth: 1800, interest: "Emirates Hills Mansion", budget: 220, temp: 87, status: "VIEWING", lastContact: "14m ago", notes: "Site visit scheduled 03:00 GMT · Private terminal arrival" },
  { id: "L3", code: "VIP-7803", nationality: "India", flag: "🇮🇳", netWorth: 960, interest: "Downtown Penthouse", budget: 75, temp: 78, status: "ENGAGED", lastContact: "1h ago", notes: "Comparing vs Burj Khalifa Armani Residence" },
  { id: "L4", code: "VIP-7804", nationality: "China", flag: "🇨🇳", netWorth: 3100, interest: "Dubai Hills Estate", budget: 140, temp: 82, status: "ENGAGED", lastContact: "3h ago", notes: "Family office review in progress" },
  { id: "L5", code: "VIP-7805", nationality: "United Kingdom", flag: "🇬🇧", netWorth: 540, interest: "Marina Yacht-Facing Duplex", budget: 42, temp: 71, status: "QUALIFYING", lastContact: "6h ago", notes: "Golden Visa process initiated" },
  { id: "L6", code: "VIP-7806", nationality: "USA", flag: "🇺🇸", netWorth: 1200, interest: "Creek Harbour Twin-Tower", budget: 96, temp: 65, status: "QUALIFYING", lastContact: "12h ago", notes: "Tax residency shift — Miami to DXB" },
  { id: "L7", code: "VIP-7807", nationality: "UAE", flag: "🇦🇪", netWorth: 4800, interest: "Jumeirah Bay · Bulgari", budget: 320, temp: 97, status: "NEGOTIATION", lastContact: "40s ago", notes: "Emirati royal family office — closed-door offer" },
  { id: "L8", code: "VIP-7808", nationality: "Kuwait", flag: "🇰🇼", netWorth: 780, interest: "Business Bay · Dual Apartment", budget: 58, temp: 44, status: "COLD", lastContact: "2d ago", notes: "Re-engage next quarter" },
];

const statusColor = (s: Lead["status"]) => {
  if (s === "NEGOTIATION") return "text-alert border-alert/40 bg-alert/5";
  if (s === "VIEWING" || s === "CLOSED") return "text-gold border-gold/40 bg-gold/5";
  if (s === "ENGAGED") return "text-matrix border-matrix/40 bg-matrix/5";
  if (s === "QUALIFYING") return "text-cyan border-cyan/40 bg-cyan/5";
  return "text-white/40 border-white/20 bg-white/5";
};

const tempColor = (t: number) =>
  t >= 90 ? "#FF3131" : t >= 75 ? "#FFD700" : t >= 55 ? "#00FF41" : "#00E5FF";

export default function HNWLeadPipeline() {
  const [leads, setLeads] = useState(LEADS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setLeads((prev) =>
        prev.map((l) => ({
          ...l,
          temp: Math.max(10, Math.min(99, l.temp + (Math.random() - 0.5) * 2.5)),
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalAUM = leads.reduce((sum, l) => sum + l.netWorth, 0);
  const totalPipeline = leads.reduce((sum, l) => sum + l.budget, 0);

  return (
    <div className="relative h-full flex flex-col glass-panel sovereign-border rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start p-5 border-b border-gold/10 bg-obsidian-200/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-alert anim-pulse-gold rounded-full" />
            <span className="hud-label">Classified Pipeline</span>
          </div>
          <h3 className="text-lg font-orbitron font-black tracking-wider uppercase">
            HNW Target Dossier
          </h3>
        </div>
        <div className="text-right">
          <div className="hud-label mb-0.5">Σ Pipeline</div>
          <div className="font-orbitron font-black text-lg text-gold">
            AED {totalPipeline.toLocaleString()}M
          </div>
          <div className="font-mono text-[9px] text-white/40 tracking-widest mt-0.5">
            Σ AUM ${totalAUM.toLocaleString()}M
          </div>
        </div>
      </div>

      {/* Lead cards */}
      <div className="flex-1 overflow-y-auto">
        {leads
          .slice()
          .sort((a, b) => b.temp - a.temp)
          .map((lead, idx) => (
            <div
              key={lead.id}
              className="group relative p-4 border-b border-white/5 hover:bg-gold/[0.03] transition-colors striped-row"
            >
              {/* Left marker bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{
                  background: tempColor(lead.temp),
                  boxShadow: `0 0 12px ${tempColor(lead.temp)}`,
                }}
              />

              <div className="flex items-start gap-3">
                {/* Priority number */}
                <div className="flex flex-col items-center min-w-[28px]">
                  <div className="font-orbitron font-black text-xl text-white/90">
                    {(idx + 1).toString().padStart(2, "0")}
                  </div>
                  <div className="text-[8px] font-mono text-white/20 tracking-widest">RANK</div>
                </div>

                {/* Main */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{lead.flag}</span>
                    <span className="font-mono text-[10px] text-gold tracking-widest">
                      {lead.code}
                    </span>
                    <span className="font-mono text-[9px] text-white/30">
                      · {lead.nationality.toUpperCase()}
                    </span>
                    <span
                      className={`ml-auto text-[8px] font-mono tracking-widest uppercase border px-1.5 py-0.5 ${statusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <div className="font-orbitron font-bold text-sm text-white mb-1 truncate">
                    {lead.interest}
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">NW</span>
                      <span className="ml-1.5 font-mono text-xs text-white/80">
                        ${lead.netWorth.toLocaleString()}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">BUDGET</span>
                      <span className="ml-1.5 font-mono text-xs text-gold">
                        AED {lead.budget}M
                      </span>
                    </div>
                    <div className="ml-auto text-[9px] font-mono text-white/30">
                      {lead.lastContact}
                    </div>
                  </div>

                  {/* Temperature gauge */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[3px] bg-white/5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{
                          width: `${lead.temp}%`,
                          background: `linear-gradient(90deg, ${tempColor(lead.temp)}99, ${tempColor(lead.temp)})`,
                          boxShadow: `0 0 8px ${tempColor(lead.temp)}`,
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-[10px] tabular-nums w-10 text-right"
                      style={{ color: tempColor(lead.temp) }}
                    >
                      {lead.temp.toFixed(0)}°
                    </span>
                  </div>

                  <div className="mt-2 font-mono text-[10px] text-white/40 italic border-l border-gold/20 pl-2 opacity-0 group-hover:opacity-100 transition-opacity max-h-0 group-hover:max-h-20 overflow-hidden">
                    ◈ {lead.notes}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gold/10 p-3 bg-obsidian-200/60 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-matrix rounded-full anim-pulse-matrix" />
          <span className="font-mono text-[9px] text-matrix tracking-widest">
            LIVE · SYNC {tick.toString().padStart(4, "0")}
          </span>
        </div>
        <span className="font-mono text-[9px] text-white/30 tracking-widest">
          ENCRYPTED · VIP ONLY
        </span>
      </div>
    </div>
  );
}
