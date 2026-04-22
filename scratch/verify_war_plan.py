from tools.arbitrage_striker import ArbitrageStriker
from tools.lead_scraper_sentinel import SentinelScraper
import os
import sys
import io

# Force UTF-8 early to prevent Unicode crashes on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def test_war_logic():
    print("--- TESTING WAR MODE LOGIC ---")
    striker = ArbitrageStriker()
    sentinel = SentinelScraper()
    
    for h in [1, 2, 9, 12]:
        print(f"\n[HOUR {h}]")
        strike_event = striker.run_strike_cycle(h)
        if strike_event:
            print(f"Action: {strike_event['action']}")
            print(f"Role: {strike_event['role']}")
            print(f"Branding: {strike_event['branding']}")
            
            if strike_event['role'] == "SENTINEL" and h >= 3:
                leads = sentinel.hunt_b2b_leads(1)
                expert = sentinel.hunt_experts()[0]
                script = sentinel.generate_loom_script(leads[0], expert)
                print(f"Loom Script Preview: {script[:100]}...")

if __name__ == "__main__":
    test_war_logic()
