import os
import random
import json
from typing import List, Dict
from tools.apify_client import ApifyClient

# =========================================================================
# SENTINEL: LEAD SCRAPER & INTEL GATHERER
# =========================================================================

class SentinelScraper:
    def __init__(self):
        self.apify = ApifyClient()
        self.expert_niches = ["AI Ghostwriter", "SaaS Growth Engineer", "Appointment Setter Elite"]
        self.target_industries = ["FinTech", "HealthTech", "AI Startup", "B2B SaaS"]

    def hunt_experts(self) -> List[Dict]:
        """
        SENTINEL Role: Find specialized experts with high skills but low marketing power.
        Simulates scraping from Upwork/LinkedIn.
        """
        names = ["Satoshi G.", "Alex P.", "Elena M.", "Marcus V.", "Sarah L."]
        experts = []
        for name in names:
            niche = random.choice(self.expert_niches)
            experts.append({
                "name": name,
                "niche": niche,
                "portfolio_strength": "TOP 5%",
                "status": "UNMANAGED",
                "intel": f"Expert in {niche}. Has 50+ closed deals on Upwork but no standalone presence."
            })
        return experts

    def hunt_b2b_leads(self, count: int = 5) -> List[Dict]:
        """
        SENTINEL Role: Identify companies for the strike.
        Simulates Apollo.io / LinkedIn Sales Navigator data.
        """
        companies = ["Nexus Dynamics", "Quantum Scale", "Vertex Solutions", "Prime Logic", "Elite Cloud"]
        leads = []
        for i in range(min(count, len(companies))):
            industry = random.choice(self.target_industries)
            leads.append({
                "company": companies[i],
                "founder": f"{random.choice(['John', 'Jane', 'Michael', 'Emma'])} {random.choice(['Smith', 'Doe', 'Vance', 'King'])}",
                "email": f"ceo@{companies[i].lower().replace(' ', '')}.io",
                "revenue": "$1M - $5M",
                "industry": industry,
                "pain_point": "Poor appointment flow despite strong product."
            })
        return leads

    def generate_loom_script(self, lead: Dict, expert: Dict) -> str:
        """
        SENTINEL Role: Generate the high-ticket personalized script.
        """
        script = f"""
Hey {lead['founder']},

I was looking at {lead['company']} and noticed your {lead['industry']} operations are scaling, but your outbound seems to have a gap.

I have {expert['name']}, an elite {expert['niche']}, who usually charges $5k+ for this setup.

We are running a 'Pay-Per-Appointment' test. I'll book 5 calls on your calendar. You pay zero unless they show up.

Is this worth a 2-minute conversation?
"""
        return script.strip()

if __name__ == "__main__":
    sentinel = SentinelScraper()
    print("[SENTINEL] Testing Hunt...")
    expert = sentinel.hunt_experts()[0]
    lead = sentinel.hunt_b2b_leads(1)[0]
    print(f"Targeting {lead['company']} with Expert {expert['name']}")
    print(f"Script:\n{sentinel.generate_loom_script(lead, expert)}")
