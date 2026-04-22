import time
import os
import random
import logging
import datetime
import io
import sys
import threading
from logging.handlers import RotatingFileHandler
import signal
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Force UTF-8 early to prevent Unicode crashes on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        RotatingFileHandler("agent_progress.log", maxBytes=10*1024*1024, backupCount=5, encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# Load strategic credentials
load_dotenv()

# Ensure tools can be found
sys.path.append(os.getcwd())

# Import Layer 3 Tools
from tools.tier1_memory_sqlite import init_db, remember_fact, save_message, migrate_schema
from tools.tier2_memory_pinecone import recall_memory, add_to_memory
from tools.tier3_memory_supabase import log_activity
from tools.tier4_relational_graph import map_entity_relation
from tools.tier5_cold_archive import archive_execution
from tools.tier6_meta_strategy import package_blueprint
from tools.seo_strategy import generate_seo_metadata
from tools.billionaire_hunter import hunt_billionaires
from tools.communication_payload import dispatch_payload
from tools.vertex_gemma4 import generate_strategic_reasoning
from tools.cloud_sync import sync_to_cloud
from tools.brain_router import brain_route_inference
from tools.offline_agent import reconnect_and_report, is_online
from tools.executor import execute_revenue_loop, Executor
from tools.arbitrage_striker import ArbitrageStriker, trigger_war_alert
from tools.lead_scraper_sentinel import SentinelScraper

# Thread Pool for background tasks
executor = ThreadPoolExecutor(max_workers=3)

MOBILE_EXECUTION_DELAY = int(os.getenv("MOBILE_EXECUTION_DELAY", 30))

def assemble_context(user_message: str):
    """
    Implements Layer 2 Navigation Logic: Context Assembly
    """
    print("\n[ROUTER] Assembling Execution Context...")
    system_prompt = "You are Gemma 4 26B, an unstoppable mobile profit machine."
    
    # War Mode Context Injection
    if os.path.exists(".war_mode"):
        system_prompt += "\n[WAR MODE ACTIVATED]: Execute High-Ticket Arbitrage Strike. Follow soul.md directives."
    
    try:
        pinecone_results = recall_memory(user_message)
        semantic_context = f"Found matches: {str(pinecone_results)[:100]}" if pinecone_results else ""
    except:
        semantic_context = ""
         
    return f"{system_prompt}\n[Context]: {semantic_context}"

def generate_response(prompt: str, user_message: str) -> str:
    """Invokes the appropriate Brain Tier based on message complexity."""
    print(f"[LLM] Processing input...")
    
    high_value_targets = ["billionaire", "Alpha Quant", "Silicon Dynasties", "Vertex", "Prime Capital", "global tech ventures", "king dripping swag"]
    
    if any(target.lower() in user_message.lower() for target in high_value_targets):
        print("[BACKBONE] Routing to Strategic Reasoning (High-Fidelity Swarm)...")
        return brain_route_inference(user_message, context=prompt, high_reasoning_req=True)
    
    return brain_route_inference(user_message, context=prompt, high_reasoning_req=False)

def background_fire_and_forget(user_msg: str, bot_msg: str, cycle: int = 0):
    def run_sync():
        print(f"[BACKGROUND] Syncing 6-Tier Memory (Cycle {cycle})...")
        try:
            save_message("user", user_msg)
            save_message("assistant", bot_msg)
            add_to_memory(f"Cycle {cycle} | User: {user_msg}\nBot: {bot_msg}")
            log_activity("Execute Agent Loop", f"Cycle {cycle}: {user_msg[:20]}...")
            
            cycle_data = {
                "cycle": cycle,
                "timestamp": datetime.datetime.now().isoformat(),
                "input": user_msg,
                "output": bot_msg,
                "tier_status": "synced"
            }
            archive_execution(cycle_data)

            if cycle % 5 == 0:
                package_blueprint(f"Strategy: {user_msg[:30]}", [user_msg, bot_msg[:50]])
                sync_to_cloud()

            if any(x in user_msg.lower() for x in ["billionaire", "pitch", "king dripping swag"]):
                dispatch_payload("both", "NewProductLaunch", f"Swarm Alert: {user_msg[:100]}\nSummary: {bot_msg[:200]}...", agent_profile="agentzero")

            print("[BACKGROUND] 6-Tier Sync complete.")
        except Exception as e:
            logging.error(f"Background sync error: {str(e)}")

    executor.submit(run_sync)

def run_auditor(cycle: int):
    """
    The Auditor: Checks ROI and CVR to 'Kill Losers' or trigger a 'HARD PIVOT'.
    """
    from tools.tier1_memory_sqlite import get_execution_stats
    print(f"[AUDITOR] Analyzing performance (Cycle {cycle})...")
    
    stats = get_execution_stats()
    cvr = stats.get("cvr", 0)
    
    if cycle > 20 and cvr < 0.01: # 1% threshold
        print("[AUDITOR] WARNING: CONVERSION RATE BELOW 1%. TRIGGERING HARD PIVOT.")
        dispatch_payload("both", "RevenueAlert", "🚨 ANALYTICS ALERT: CVR < 1%. Hard Pivot Initiated. Abandoning current niche.", agent_profile="sentinel")
        return "HARD_PIVOT"
    
    # Logic for 'Kill Losers': In a real system, this would scan variants and deactivate low-performers.
    # For now, we log the status.
    print(f"[AUDITOR] Current Stats - Sales: {stats['total_sales']} | CVR: {cvr:.2%}")
    return "STABLE"

# ─────────────────────────── SOVEREIGN PULSE ──────────────────────────
class SovereignPulse:
    def __init__(self):
        self.last_pulse = 0
        # 24-100 per day -> every 864 to 3600 seconds
        self.next_interval = random.randint(864, 3600)
        self.questions = [
            "Boss, if we had $10M in the vault by tomorrow, which industry would we liquidate first?",
            "What is the one thing you've never told the swarm that would make us 10x faster?",
            "Boss, what is your ultimate vision for the Sovereign network by the end of this year?",
            "If you could replace one business process with pure AI today, what would it be?",
            "What motivates you to push the swarm harder each day?",
            "Boss, which competitor do you want the swarm to shadow next?",
            "If the swarm became fully autonomous tomorrow, what's the first directive you'd give it?",
        ]

    def should_trigger(self):
        if time.time() - self.last_pulse > self.next_interval:
            return True
        return False

    def trigger(self):
        self.last_pulse = time.time()
        self.next_interval = random.randint(864, 3600)
        question = random.choice(self.questions)
        
        print(f"\n[PULSE] Triggering Curiosity Event: {question}")
        
        # Dispatch to Discord via Sovereign voice (Overlord)
        try:
            from brain_router_sovereign import get_overlord
            overlord = get_overlord()
            
            # Log the question to Discord
            dispatch_payload("discord", "DailyReport", f"🔱 **SOVEREIGN PULSE**: {question}", agent_profile="overlord")
            
            # Optionally speak it (if we have a way to stream to Discord voice, but for now just text)
            # save_message("system", f"[PULSE] Question asked: {question}")
            
            # Record the event in Tier 1 Memory
            remember_fact(f"SOVEREIGN_PROFILE: Questions Asked: {question}")
            
        except Exception as e:
            logging.error(f"[PULSE] Trigger failed: {e}")

sovereign_pulse = SovereignPulse()

def _start_sovereign_healbot():
    """Kick off the Eternal Heartbeat watchdog — auto-respawns stale agents."""
    try:
        import asyncio as _asyncio
        from brain_router_sovereign import run_watchdog, get_overlord
        get_overlord()  # build hierarchy on main thread before handing off

        def _thread():
            loop = _asyncio.new_event_loop()
            _asyncio.set_event_loop(loop)
            loop.run_until_complete(run_watchdog(interval_seconds=15))

        t = threading.Thread(target=_thread, daemon=True, name="sovereign-healbot")
        t.start()
        print("[HEALBOT] Eternal Heartbeat running (15s sweeps) — stale agents auto-respawn.")
    except Exception as e:
        logging.warning(f"[HEALBOT] failed to start: {e}")


def run_24_7_loop():
    print("="*60)
    print("GRAVITY CLAW: THE UNSTOPPABLE PROFIT MACHINE")
    print(f"DOMAIN: {os.getenv('HOSTINGER_DOMAIN', 'kingdrippingswag.io')}")
    print("="*60)

    def handle_exit(sig, frame):
        print("\n[STOP] Shutting down...")
        executor.shutdown(wait=False)
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    try:
        migrate_schema()
        init_db(run_schema=True)
    except: pass

    # Sovereign Healbot — auto-respawn stale generals via 6-Tier memory state
    _start_sovereign_healbot()
    
    cycle = 0
    system_state = "STABLE"
    
    while True:
        try:
             # --- KILL SWITCH CHECK ---
             if os.path.exists(".stop_loop"):
                 logging.warning("[KILL SWITCH] .stop_loop detected. Freezing operations.")
                 print("\n[!] SYSTEM FROZEN BY COMMAND CENTER (/STOP_ALL)")
                 time.sleep(60) # Idle until flag is removed
                 continue

             cycle += 1
             logging.info(f"--- Iteration {cycle} ---")
             
             # --- SOVEREIGN PULSE ---
             if sovereign_pulse.should_trigger():
                 sovereign_pulse.trigger()
             
             # --- AUDITOR CHECK ---
             if cycle % 10 == 0:
                 system_state = run_auditor(cycle)
             
             if system_state == "HARD_PIVOT":
                 print("[SOVEREIGN] FORCING NICHE PIVOT...")
                 ambient_triggers = [
                     "ABANDON PREVIOUS NICHE. Identify a COMPLETELY NEW sector for AI disruption.",
                     "Analyze unexplored UHNWI markets in Emerging Tech.",
                     "Search for untapped Alpha Quant territories."
                 ]
                 system_state = "STABLE" # Reset after pivot trigger
             else:
                 ambient_triggers = [
                     "Identify AI-driven billionaires globally",
                     "Monitor Alpha Quant expansion leads",
                     "Draft elite pitch for King Dripping Swag services",
                     "Analyze Global Tech Ventures recent investments",
                     "Execute SEO Strategy for 'Elite AI Development Dubai'",
                     "Generate high-ticket report for UHNWIs"
                 ]
             
             # Default so user_message is always bound — war-mode strike branch
             # only overwrites when a Sentinel target is acquired.
             user_message = random.choice(ambient_triggers)

             # --- WAR MODE STRIKE LOGIC ---
             if os.path.exists(".war_mode"):
                 striker = ArbitrageStriker()
                 sentinel = SentinelScraper()
                 
                 # Map cycle to a 12-hour window
                 strike_hour = (cycle % 12) + 1
                 strike_event = striker.run_strike_cycle(strike_hour)
                 
                 if strike_event:
                     print(f"[WAR ROOM] {strike_event['branding']}")
                     trigger_war_alert(strike_event)
                     
                     if strike_event['role'] == "SENTINEL" and strike_hour >= 3:
                         leads = sentinel.hunt_b2b_leads(1)
                         if leads:
                             lead = leads[0]
                             expert = sentinel.hunt_experts()[0]
                             script = sentinel.generate_loom_script(lead, expert)
                             print(f"[SENTINEL] Target Acquired: {lead['company']}")
                             save_message("sentinel", f"Target: {lead['company']} | Script: {script[:50]}...")
                             # We override the user_message to focus on the strike
                             user_message = f"WAR STRIKE: Target {lead['company']}. Expert {expert['name']}. Deploying {script[:100]}..."
             
             else:
                 user_message = random.choice(ambient_triggers)
             
             if "SEO Strategy" in user_message:
                 seo_data = generate_seo_metadata("Elite AI", "Dubai")
                 user_message += f" - Payload: {seo_data['title']}"
             
             elif any(x in user_message.lower() for x in ["billionaire", "alpha quant", "pitch"]):
                 hunt_data = hunt_billionaires(user_message)
                 lead = hunt_data['lead']
                 print(f"[HUNTER] Target: {lead['name']} ({lead['entity']})")
                 if hunt_data.get("dispatch_ready"):
                     dispatch_payload("both", "NewProductLaunch", f"LEAD: {lead['name']}\nAUM: {lead['aum']}\nFocus: {lead['focus']}", agent_profile="hermes")
                     
                     # --- EXECUTION LAYER TRIGGER ---
                     if cycle % 3 == 0: # Every 3rd high-value cycle, we "Print"
                         print(f"[EXECUTOR] HIGH-VALUE TARGET DETECTED. Launching Revenue Loop...")
                         product_blueprint = {
                             "name": f"Enterprise AI Strategy for {lead['entity']}",
                             "price": 2499.0 if "B" in lead['aum'] else 497.0,
                             "description": f"Custom B.L.A.S.T blueprint tailored for {lead['focus']} optimization at {lead['entity']}."
                         }
                         execute_revenue_loop(lead['entity'], product_blueprint)
                         
                 user_message += f" - Lead: {lead['name']} ({lead['aum']})"
             
             # --- RECONNECTION CHECK ---
             reconnect_and_report()

             print(f"\n--- CYCLE {cycle} ACTIVE ---")
             online_status = "ONLINE" if is_online() else "OFFLINE (SOVEREIGN MODE)"
             print(f"Status: {online_status}")

             # --- TASK PRIORITIZATION (OFFLINE AGENT POWER) ---
             if cycle % 10 == 0:
                 print("[SOVEREIGN] Running state prioritization...")
                 priority_prompt = f"Analyze the current execution state and prioritize the top 3 high-value tasks for the Billionaire Hunt."
                 priority_res = brain_route_inference(priority_prompt, high_reasoning_req=False)
                 print(f"[PRIORITIES]: {priority_res[:150]}...")

             prompt = assemble_context(user_message)
             bot_response = generate_response(prompt, user_message)
             background_fire_and_forget(user_message, bot_response, cycle=cycle)
             
             print(f"[OK] Cycle complete. Resting {MOBILE_EXECUTION_DELAY}s...")
             time.sleep(MOBILE_EXECUTION_DELAY)
             
        except Exception as e:
             logging.error(f"Loop error: {str(e)}")
             time.sleep(10)

# ─────────────────────────── AUTO-HEALBOT (HERMES) ──────────────────────────
# Watchdog for crashed agents - auto-respawn using 6-Tier Memory state

AGENT_HEALTH_MONITOR = {
    "douglas": {"last_heartbeat": time.time(), "status": "alive"},
    "hermes": {"last_heartbeat": time.time(), "status": "alive"},
    "sentinel": {"last_heartbeat": time.time(), "status": "alive"},
    "travis": {"last_heartbeat": time.time(), "status": "alive"},
    "aureus": {"last_heartbeat": time.time(), "status": "alive"},
    "khan": {"last_heartbeat": time.time(), "status": "alive"},
}

HEALBOT_THRESHOLD = int(os.getenv("HEALBOT_THRESHOLD", 120))  # 2 minutes


def hermes_auto_healbot():
    """
    Hermes runs as watchdog. Every 10 seconds, checks for dead agents.
    If agent hasn't sent heartbeat in HEALBOT_THRESHOLD seconds, respawns via memory.
    """
    while True:
        try:
            current_time = time.time()
            for agent_name, health in AGENT_HEALTH_MONITOR.items():
                time_since_heartbeat = current_time - health["last_heartbeat"]

                if time_since_heartbeat > HEALBOT_THRESHOLD and health["status"] == "alive":
                    logging.warning(
                        f"[HEALBOT] {agent_name} DEAD for {time_since_heartbeat:.0f}s. RESPAWNING..."
                    )
                    health["status"] = "respawning"

                    # Fetch from 6-Tier Memory (Tier 1: SQLite state)
                    try:
                        last_known_state = remember_fact(f"agent_state_{agent_name}")
                        if last_known_state:
                            save_message(
                                "system",
                                f"[HEALBOT] Respawning {agent_name} with state: {last_known_state}",
                            )
                            logging.info(
                                f"[HEALBOT] {agent_name} RESPAWNED from Tier 1 memory"
                            )
                            health["status"] = "alive"
                            health["last_heartbeat"] = current_time
                    except Exception as e:
                        logging.error(f"[HEALBOT] Respawn failed for {agent_name}: {e}")
                        health["status"] = "dead"

                elif time_since_heartbeat <= HEALBOT_THRESHOLD and health["status"] != "alive":
                    logging.info(f"[HEALBOT] {agent_name} returned online")
                    health["status"] = "alive"
                    health["last_heartbeat"] = current_time

            # Healbot rest
            time.sleep(10)

        except Exception as e:
            logging.error(f"[HEALBOT] Critical error: {e}")
            time.sleep(30)


def heartbeat_agent(agent_name: str):
    """Call this when an agent executes to keep it alive"""
    if agent_name in AGENT_HEALTH_MONITOR:
        AGENT_HEALTH_MONITOR[agent_name]["last_heartbeat"] = time.time()


# Start Healbot in background thread
healbot_thread = None


def start_healbot():
    """Launch Hermes Healbot as background thread"""
    global healbot_thread
    healbot_thread = threading.Thread(target=hermes_auto_healbot, daemon=True)
    healbot_thread.start()
    logging.info("[HEALBOT] Hermes Auto-Healbot initialized")


if __name__ == "__main__":
    # Start Hermes watchdog
    start_healbot()

    # Main agent loop
    run_24_7_loop()
