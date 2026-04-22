import subprocess
import time
import os
import sys
import logging
from dotenv import load_dotenv

# Force UTF-8 for Windows
import io
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [MASTER] %(message)s")

def check_env():
    required = ["TELEGRAM_BOT_TOKEN", "GCP_PROJECT_ID", "STRIPE_SECRET_KEY"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        logging.warning(f"⚠️ Missing critical environment variables: {', '.join(missing)}")
    else:
        logging.info("✅ Environment variables verified.")

def start_component(name, script_path):
    logging.info(f"🚀 Launching {name}...")
    # Use 'python' on Windows, 'python3' on Linux
    interpreter = sys.executable or "python"
    return subprocess.Popen([interpreter, script_path], creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0)

def main():
    check_env()
    
    components = [
        ("Mission Control Dashboard", "dashboard_api.py"),
        ("Autonomous Agent Swarm", "agent_loop.py"),
        ("Telegram Sentinel-V Listener", "tools/telegram_listener.py")
    ]
    
    processes = []
    
    for name, script in components:
        if os.path.exists(script):
            processes.append(start_component(name, script))
            time.sleep(2) # Stagger start
        else:
            logging.error(f"❌ Could not find {script}. Skipping.")

    logging.info("👑 ALL SYSTEMS ONLINE. Sovereign Cloud Infrastructure fully operational.")
    logging.info("Dashboard available at: http://localhost:5050")
    
    try:
        while True:
            # Check if processes are still alive
            for i, p in enumerate(processes):
                if p.poll() is not None:
                    name = components[i][0]
                    logging.warning(f"⚠️ {name} has crashed or stopped.")
            time.sleep(10)
    except KeyboardInterrupt:
        logging.info("🛑 Shutting down Sovereign Systems...")
        for p in processes:
            p.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
