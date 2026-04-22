"""
Antigravity Watchdog v1
Monitors Dashboard API and Agent Loop. Restarts them on crash.
"""
import subprocess
import time
import sys
import os
import urllib.request
import urllib.error
import io

# Force UTF-8 early to prevent Unicode crashes on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
PROCESSES = [
    {"name": "Dashboard API", "cmd": [sys.executable, "dashboard_api.py"], "port": 5050, "check_health": True},
    {"name": "Agent Loop",    "cmd": [sys.executable, "agent_loop.py"], "check_health": False},
]

RESTART_DELAY = 5 # seconds to wait before restart
HEALTH_CHECK_INTERVAL = 10
API_URL = "http://localhost:5050/api/health"

def start_process(config):
    print(f"[HERMES HEALBOT] Starting {config['name']}...")
    return subprocess.Popen(config['cmd'], creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0)

def main():
    print("="*64)
    print("  HERMES AUTO-HEALBOT - ACTIVE MONITORING")
    print("="*64)
    
    running = []
    for p_cfg in PROCESSES:
        p_handle = start_process(p_cfg)
        running.append({"cfg": p_cfg, "handle": p_handle})

    last_health_check = time.time()

    try:
        while True:
            # 1. Check if processes died
            for item in running:
                retcode = item["handle"].poll()
                if retcode is not None:
                    print(f"[HERMES] ⚠️ {item['cfg']['name']} stopped with code {retcode}. Restarting in {RESTART_DELAY}s...")
                    time.sleep(RESTART_DELAY)
                    item["handle"] = start_process(item["cfg"])
            
            # 2. Check API health if due
            if time.time() - last_health_check > HEALTH_CHECK_INTERVAL:
                for item in running:
                    if item["cfg"].get("check_health"):
                        try:
                            # 3s timeout
                            req = urllib.request.urlopen(API_URL, timeout=3)
                            if req.getcode() != 200:
                                raise Exception(f"HTTP {req.getcode()}")
                        except Exception as e:
                            print(f"[HERMES] ⚠️ Health check failed for {item['cfg']['name']}: {e}. Restarting...")
                            item["handle"].terminate()
                            try:
                                item["handle"].wait(timeout=5)
                            except:
                                item["handle"].kill()
                            time.sleep(RESTART_DELAY)
                            item["handle"] = start_process(item["cfg"])
                last_health_check = time.time()
                
            time.sleep(2)
    except KeyboardInterrupt:
        print("\n[HERMES] Shutting down all processes...")
        for item in running:
            item["handle"].terminate()
        print("[HERMES] Done.")

if __name__ == "__main__":
    main()
