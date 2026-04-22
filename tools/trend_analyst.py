import os
import json
import datetime
import time
from typing import List, Dict
from tools.tier3_memory_supabase import log_activity

class TrendAnalyst:
    def __init__(self, niche: str, audience: str, pillars: List[str], channel_url: str):
        self.niche = niche
        self.audience = audience
        self.pillars = pillars
        self.channel_url = channel_url
        self.min_engagement = 500
        
    def calculate_score(self, signal: Dict) -> Dict:
        """
        Implements the Scoring Matrix:
        F1: Primacy (30%) - 5 pts
        F2: Authority (15%) - 5 pts
        F3: Velocity (35%) - 5 pts
        F4: Content Fit (20%) - 5 pts
        """
        # F1: Primacy (Recency)
        days_old = (datetime.datetime.now() - signal['timestamp']).days
        f1 = 5 if days_old <= 1 else (4 if days_old <= 3 else (3 if days_old <= 5 else (2 if days_old <= 7 else 0)))
        if days_old > 7 or signal['engagement'] < self.min_engagement:
            return None # Disqualified
            
        # F2: Authority (Follower/Star counts)
        auth = signal['authority_metric'] # e.g. followers or stars
        f2 = 5 if auth >= 100000 else (4 if auth >= 50000 else (3 if auth >= 10000 else (2 if auth >= 1000 else 1)))
        
        # F3: Velocity (Engagement / Time)
        # Simplified: (Current Engagement / Hours Since Post) vs Average
        elapsed_hours = max((datetime.datetime.now() - signal['timestamp']).total_seconds() / 3600, 1)
        velocity = signal['engagement'] / elapsed_hours
        # Heuristic for explosive growth
        f3 = 5 if velocity > 500 else (4 if velocity > 200 else (3 if velocity > 100 else (2 if velocity > 50 else 1)))
        
        # F4: Content Fit (Pillar Match)
        fit_score = 1
        for pillar in self.pillars:
            if pillar.lower() in signal['title'].lower() or pillar.lower() in signal['description'].lower():
                fit_score = 5
                break
            # Add adjacent matching logic here...
        f4 = fit_score
        
        # Weighted Composite (Scaled to 20)
        # F1: 30% of 20 = 6 max
        # F2: 15% of 20 = 3 max
        # F3: 35% of 20 = 7 max
        # F4: 20% of 20 = 4 max
        composite = (f1/5 * 6) + (f2/5 * 3) + (f3/5 * 7) + (f4/5 * 4)
        
        return {
            "composite": round(composite, 2),
            "breakdown": {"F1": f1, "F2": f2, "F3": f3, "F4": f4},
            "signal": signal
        }

    def generate_report_html(self, ranked_signals: List[Dict]):
        # Mock HTML generation for the dashboard
        report_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        html = f"""
        <div class="p-8 bg-black text-white font-sans">
            <h1 class="text-4xl font-black mb-8 border-b border-amber-500 pb-4">X INSIGHT SIGNAL REPORT: {report_id}</h1>
            <div class="grid gap-6">
                {" ".join([self._signal_card(s) for s in ranked_signals])}
            </div>
        </div>
        """
        # Save to artifacts/reports/
        os.makedirs("artifacts/reports", exist_ok=True)
        with open(f"artifacts/reports/insight_{report_id}.html", "w") as f:
            f.write(html)
        return f"artifacts/reports/insight_{report_id}.html"

    def _signal_card(self, s: Dict):
        return f"""
        <div class="p-6 bg-zinc-900 rounded-2xl border border-white/10 hover:border-amber-500 transition-all">
            <div class="flex justify-between items-start mb-4">
                <span class="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">Score: {s['composite']}/20</span>
                <span class="text-zinc-500 text-[10px] uppercase font-bold">{s['signal']['platform']}</span>
            </div>
            <h3 class="text-xl font-bold mb-2 uppercase">{s['signal']['title']}</h3>
            <p class="text-zinc-400 text-sm mb-4">"{s['signal']['description']}"</p>
            <div class="grid grid-cols-4 gap-2 text-[8px] font-black tracking-tighter uppercase opacity-50">
                <div>P: {s['breakdown']['F1']}</div>
                <div>A: {s['breakdown']['F2']}</div>
                <div>V: {s['breakdown']['F3']}</div>
                <div>F: {s['breakdown']['F4']}</div>
            </div>
        </div>
        """

def run_insight_scan(setup_data: Dict):
    analyst = TrendAnalyst(
        niche=setup_data['niche'],
        audience=setup_data['audience'],
        pillars=setup_data['pillars'],
        channel_url=setup_data['channel_url']
    )
    
    log_activity("Trend Scan", f"Initiating scan for niche: {setup_data['niche']}")
    
    # In a real execution, we'd call web_search/X-API/GitHub-API
    # For now, we simulate the 'Grok' scan results
    mock_signals = [
        {
            "title": "Claude Code Release 2.0",
            "description": "Native terminal agent now supports multi-file edits and automated testing pipelines.",
            "timestamp": datetime.datetime.now() - datetime.timedelta(hours=6),
            "engagement": 12500,
            "authority_metric": 250000,
            "platform": "X",
            "link": "https://x.com/anthropic"
        },
        {
            "title": "King Dripping Swag Blueprint Leaked",
            "description": "UHNWIs are pivoting to automated AI command centers. The 'Drip' architecture is replacing standard SaaS.",
            "timestamp": datetime.datetime.now() - datetime.timedelta(hours=2),
            "engagement": 850,
            "authority_metric": 1200,
            "platform": "X",
            "link": "https://x.com/profit_machine"
        },
        {
            "title": "Bolt.new - AI Fullstack Agent",
            "description": "Next.js + Supabase + Tailwind in one prompt. Exploding on GitHub.",
            "timestamp": datetime.datetime.now() - datetime.timedelta(days=1),
            "engagement": 5000,
            "authority_metric": 8000,
            "platform": "GitHub",
            "link": "https://github.com/stackblitz/bolt.new"
        }
    ]
    
    scored = []
    for sig in mock_signals:
        res = analyst.calculate_score(sig)
        if res:
            scored.append(res)
            
    # Rank by composite
    ranked = sorted(scored, key=lambda x: x['composite'], reverse=True)
    report_path = analyst.generate_report_html(ranked[:5])
    
    return {
        "report_path": report_path,
        "top_signal": ranked[0] if ranked else None
    }
