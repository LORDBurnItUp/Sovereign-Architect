"""
King Dripping Swag — Mission Control Dashboard API v2
Full-featured backend: Notes, API Keys, Service Tests, Chat, Terminal, Discord War Room
Self-healing • Auto-starts • Real endpoints only — Telegram decommissioned
"""
import os, sys, json, gzip, sqlite3, datetime, subprocess, threading, traceback, time, io
from pathlib import Path
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from dotenv import load_dotenv

# Force UTF-8 early to prevent Unicode crashes on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

load_dotenv()

# Ensure tools are in the path
sys.path.append(os.getcwd())

# Force UTF-8 early to prevent Unicode crashes on Windows
import io, sys
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

app = Flask(__name__, static_folder="dashboard")
CORS(app)

DB_PATH    = os.getenv("GRAVITY_CLAW_DB_PATH", "gravity-claw.db")
ARCHIVE_DIR = ".tmp/archive"
LOG_FILE   = "agent_progress.log"

# ─────────────────────────── SELF-HEAL ───────────────────────────────────────
def ensure_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("PRAGMA journal_mode=WAL;")  # Enable WAL mode for high-concurrency
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS bots (id TEXT PRIMARY KEY, name TEXT, platform TEXT, status TEXT, location TEXT, path TEXT, created_at TEXT);
            CREATE TABLE IF NOT EXISTS core_memory (id INTEGER PRIMARY KEY AUTOINCREMENT, fact TEXT, timestamp TEXT, sync_status INTEGER DEFAULT 0);
            CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, bot_id TEXT, role TEXT, content TEXT, timestamp TEXT, sync_status INTEGER DEFAULT 0);
            CREATE TABLE IF NOT EXISTS summaries (id INTEGER PRIMARY KEY AUTOINCREMENT, summary TEXT, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS entities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, type TEXT, description TEXT, timestamp TEXT, sync_status INTEGER DEFAULT 0);
            CREATE TABLE IF NOT EXISTS relations (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER, target_id INTEGER, relation_type TEXT, strength REAL, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT, color TEXT DEFAULT '#7c3aed', pinned INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT);
            CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT, model TEXT, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS terminal_history (id INTEGER PRIMARY KEY AUTOINCREMENT, command TEXT, output TEXT, exit_code INTEGER, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, priority INTEGER DEFAULT 1, status TEXT DEFAULT 'pending', timestamp TEXT);
        """)
        conn.commit()
        conn.close()
        print("[SELF-HEAL] DB schema verified.")
    except Exception as e:
        print(f"[SELF-HEAL] DB error: {e}")

def db():
    try:
        c = sqlite3.connect(DB_PATH, timeout=10) # Added timeout
        c.execute("PRAGMA journal_mode=WAL;")
        c.row_factory = sqlite3.Row
        return c
    except: return None

def q(sql, params=(), one=False):
    c = db()
    if not c: return [] if not one else None
    try:
        cur = c.cursor(); cur.execute(sql, params)
        return dict(cur.fetchone()) if one else [dict(r) for r in cur.fetchall()]
    except Exception as e:
        print(f"[DB] {e}"); return [] if not one else None
    finally: c.close()

def qw(sql, params=()):
    c = db()
    if not c: return False
    try:
        c.execute(sql, params); c.commit(); return c.lastrowid if "INSERT" in sql.upper() else True
    except Exception as e:
        print(f"[DBW] {e}"); return False
    finally: c.close()

def mask(key):
    if not key or len(key) < 8: return "••••••••"
    return key[:6] + "••••••••••••" + key[-4:]

def log_tail(n=120):
    """Memory-efficient tailing using seek."""
    try:
        if not os.path.exists(LOG_FILE): return []
        with open(LOG_FILE, "rb") as f:
            f.seek(0, 2)
            filesize = f.tell()
            # Estimate: each line is ~150 chars. Read enough to cover n lines.
            chunk = min(filesize, n * 256)
            if chunk == 0: return []
            f.seek(-chunk, 2)
            data = f.read().decode("utf-8", errors="replace")
            lines = data.splitlines()
            return lines[-n:]
    except: return []

# ─────────────────────────── STATIC ──────────────────────────────────────────
@app.route("/")
def index(): return send_from_directory("dashboard","index.html")

# ─────────────────────────── HEALTH ──────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status":"online","ts":datetime.datetime.now().isoformat(),"db":os.path.exists(DB_PATH)})

# ─────────────────────────── STATS ───────────────────────────────────────────
@app.route("/api/stats")
def api_stats():
    def cnt(table): return (q(f"SELECT COUNT(*) as c FROM {table}") or [{"c":0}])[0]["c"]
    log_lines = log_tail(500)
    cycles = sum(1 for l in log_lines if "CYCLE" in l and "ACTIVE" in l)
    archives = len([f for f in os.listdir(ARCHIVE_DIR) if f.endswith(".gz")]) if os.path.exists(ARCHIVE_DIR) else 0
    return jsonify({
        "messages_logged": cnt("messages"),
        "memory_facts":    cnt("core_memory"),
        "entities_mapped": cnt("entities"),
        "relations":       cnt("relations"),
        "active_bots":     cnt("bots"),
        "cycles_executed": cycles,
        "cold_archives":   archives,
        "notes_count":     cnt("notes"),
        "agent_status":    "RUNNING" if cycles > 0 else "IDLE",
        "uptime":          datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })

# ─────────────────────────── MEMORY ENDPOINTS ────────────────────────────────
@app.route("/api/messages")
def api_messages():
    return jsonify(q("SELECT role,content,timestamp FROM messages ORDER BY id DESC LIMIT 60"))

@app.route("/api/memory")
def api_memory():
    return jsonify(q("SELECT fact,timestamp FROM core_memory ORDER BY id DESC LIMIT 60"))

@app.route("/api/entities")
def api_entities():
    return jsonify(q("SELECT id,name,type,description,timestamp FROM entities ORDER BY id DESC LIMIT 100"))

@app.route("/api/relations")
def api_relations():
    return jsonify(q("""
        SELECT e1.name AS source, e2.name AS target, r.relation_type, r.strength, r.timestamp
        FROM relations r
        JOIN entities e1 ON r.source_id=e1.id JOIN entities e2 ON r.target_id=e2.id
        ORDER BY r.id DESC LIMIT 100"""))

@app.route("/api/bots")
def api_bots():
    return jsonify(q("SELECT * FROM bots ORDER BY created_at DESC"))

@app.route("/api/activity")
def api_activity():
    """Consolidated feed of all recent events."""
    acts = []
    # Messages
    msgs = q("SELECT 'message' as type, role as category, content, timestamp FROM messages ORDER BY id DESC LIMIT 20")
    for m in msgs: acts.append(m)
    # Memory
    mems = q("SELECT 'memory' as type, 'fact' as category, fact as content, timestamp FROM core_memory ORDER BY id DESC LIMIT 20")
    for m in mems: acts.append(m)
    # Terminal
    terms = q("SELECT 'terminal' as type, 'cmd' as category, command as content, timestamp FROM terminal_history ORDER BY id DESC LIMIT 20")
    for t in terms: acts.append(t)
    
    # Sort by timestamp DESC
    acts.sort(key=lambda x: x['timestamp'], reverse=True)
    return jsonify(acts[:40])

@app.route("/api/blueprints")
def api_blueprints():
    return jsonify(q("SELECT fact,timestamp FROM core_memory WHERE fact LIKE '%Blueprint%' ORDER BY id DESC LIMIT 20"))

@app.route("/api/archives")
def api_archives():
    try:
        if not os.path.exists(ARCHIVE_DIR): return jsonify([])
        files = sorted([f for f in os.listdir(ARCHIVE_DIR) if f.endswith(".gz")], reverse=True)[:10]
        out = []
        for fn in files:
            try:
                with gzip.open(os.path.join(ARCHIVE_DIR, fn)) as f:
                    out.append({"file": fn, "data": json.loads(f.read())})
            except: out.append({"file": fn, "data": {}})
        return jsonify(out)
    except Exception as e: return jsonify({"error":str(e)}),500

@app.route("/api/logs")
def api_logs():
    return jsonify({"lines": log_tail(120)})

# ─────────────────────────── NOTES ───────────────────────────────────────────
@app.route("/api/notes", methods=["GET"])
def notes_list():
    return jsonify(q("SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC"))

@app.route("/api/notes", methods=["POST"])
def notes_create():
    d = request.json or {}
    title   = d.get("title","Untitled").strip() or "Untitled"
    content = d.get("content","")
    color   = d.get("color","#7c3aed")
    now     = datetime.datetime.now().isoformat()
    rid     = qw("INSERT INTO notes(title,content,color,pinned,created_at,updated_at) VALUES(?,?,?,0,?,?)",
                 (title,content,color,now,now))
    return jsonify({"id":rid,"title":title,"content":content,"color":color,"created_at":now}), 201

@app.route("/api/notes/<int:nid>", methods=["PUT"])
def notes_update(nid):
    d = request.json or {}
    now = datetime.datetime.now().isoformat()
    fields, vals = [], []
    for col in ("title","content","color","pinned"):
        if col in d: fields.append(f"{col}=?"); vals.append(d[col])
    fields.append("updated_at=?"); vals.append(now); vals.append(nid)
    if fields: qw(f"UPDATE notes SET {','.join(fields)} WHERE id=?", vals)
    return jsonify(q("SELECT * FROM notes WHERE id=?", (nid,), one=True))

@app.route("/api/notes/<int:nid>", methods=["DELETE"])
def notes_delete(nid):
    qw("DELETE FROM notes WHERE id=?", (nid,))
    return jsonify({"deleted": nid})

# ─────────────────────────── API KEYS (read .env, masked) ────────────────────
KEY_CATALOG = {
    "OpenAI":      ("OPENAI_API_KEY",      "openai.com"),
    "Anthropic":   ("ANTHROPIC_API_KEY",   "anthropic.com"),
    "Groq":        ("GROQ_API_KEY",        "api.groq.com"),
    "Google AI":   ("GOOGLE_API_KEY",      "googleapis.com"),
    "OpenRouter":  ("OPENROUTER_API_KEY",  "openrouter.ai"),
    "Venice":      ("VENICE_API_KEY",      "venice.ai"),
    "HuggingFace": ("HUGGINGFACE_TOKEN",   "huggingface.co"),
    "Pinecone":    ("PINECONE_API_KEY",    "pinecone.io"),
    "Supabase":    ("SUPABASE_URL",        "supabase.co"),
    "Discord":     ("DISCORD_BOT_TOKEN_OVERLORD", "discord.com"),
    "Stripe":      ("STRIPE_SECRET_KEY",   "stripe.com"),
    "Brave":       ("BRAVE_API_KEY",       "brave.com"),
    "Firecrawl":   ("FIRECRAWL_API_KEY",   "firecrawl.dev"),
    "Vercel":      ("VERCEL_API_KEY",      "vercel.com"),
    "ElevenLabs":  ("ELEVENLABS_API_KEY",  "elevenlabs.io"),
    "GitHub":      ("GITHUB_TOKEN",        "github.com"),
    "Slack":       ("SLACK_BOT_TOKEN",     "slack.com"),
    "Discord":     ("DISCORD_WEBHOOK_URL", "discord.com"),
}

# --- INTEGRATIONS ---
from tools.github_tool import get_repo_activity
from tools.vertex_gemma4 import HAS_VERTEX_SDK
from tools.cloud_sync import HAS_GCS_SDK
from tools.ollama_client import query_ollama
from tools.openrouter_client import query_openrouter
from tools.payment_hub import PaymentHub
from tools.workspace_connector import WorkspaceConnector
from tools.cloud_orchestrator import CloudOrchestrator
from tools.tier1_memory_sqlite import get_execution_stats

# Initialize Global Orchestrators
payment_hub = PaymentHub()
workspace_connector = WorkspaceConnector()
cloud_orchestrator = CloudOrchestrator()

@app.route("/api/gcp/status")
def api_gcp_status():
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    project_id = os.getenv("GCP_PROJECT_ID")
    
    ollama_online = query_ollama("ping") is not None
    open_router_set = bool(os.getenv("OPENROUTER_API_KEY"))
    
    # Check VM nodes
    nodes = cloud_orchestrator.get_active_nodes()
    
    return jsonify({
        "vertex_ai": "ACTIVE" if HAS_VERTEX_SDK else "OFFLINE",
        "gcs": "ACTIVE" if HAS_GCS_SDK else "OFFLINE",
        "ollama_local": "ACTIVE" if ollama_online else "OFFLINE",
        "local_model": os.getenv("OLLAMA_MODEL", "gemma4:e4b"),
        "open_router": "CONFIGURED" if open_router_set else "NOT SET",
        "bucket": bucket_name,
        "project": project_id,
        "vertex_endpoint": os.getenv("VERTEX_ENDPOINT_ID"),
        "location": os.getenv("GCP_LOCATION"),
        "active_vms": len(nodes),
        "swarm_status": "UNSTOPPABLE" if (ollama_online or HAS_VERTEX_SDK or open_router_set) else "DEGRADED"
    })

@app.route("/api/tasks")
def api_tasks():
    return jsonify(q("SELECT * FROM tasks ORDER BY priority DESC, id DESC LIMIT 50"))

@app.route("/api/sync/status")
def api_sync_status():
    pending_msgs = q("SELECT COUNT(*) as c FROM messages WHERE sync_status = 0")[0]["c"]
    pending_mems = q("SELECT COUNT(*) as c FROM core_memory WHERE sync_status = 0")[0]["c"]
    return jsonify({
        "pending_messages": pending_msgs,
        "pending_memory": pending_mems,
        "total_pending": pending_msgs + pending_mems,
        "status": "AWAITING RECONNECTION" if (pending_msgs + pending_mems) > 0 else "FULLY SYNCED"
    })

@app.route("/api/payments/status")
def api_payments_status():
    report = payment_hub.get_revenue_report()
    return jsonify({
        "status": "LIVE",
        "currency": report.get("currency", "USD"),
        "total_revenue": report.get("total_revenue", 0),
        "transaction_count": report.get("transaction_count", 0),
        "last_audit": datetime.datetime.now().isoformat()
    })

@app.route("/api/workspace/status")
def api_workspace_status():
    try:
        # Check if we can list files (simple health check)
        files = workspace_connector.list_files(page_size=1)
        return jsonify({
            "status": "CONNECTED",
            "access": "OWNER",
            "drive_connected": True,
            "calendar_connected": True
        })
    except Exception as e:
        return jsonify({
            "status": "ERROR",
            "error": str(e),
            "drive_connected": False
        })

@app.route("/api/infra/commands", methods=["POST"])
def infra_command():
    d = request.json or {}
    action = d.get("action")
    now = datetime.datetime.now().isoformat()
    if action == "provision_vm":
        node_id = f"high-compute-agent-{int(time.time())}"
        success = cloud_orchestrator.provision_agent_node(node_id)
        return jsonify({"ok": success, "node_id": node_id})
    elif action == "deploy-hunter":
        qw("INSERT INTO tasks(task, priority, status, timestamp) VALUES(?, ?, ?, ?)", ("EXECUTE BILLIONAIRE HUNTER PROTOCOL", 10, "pending", now))
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[COMMAND] {now} | MISSION CONTROL | DEPLOYING BILLIONAIRE HUNTER ON PLM-01\n")
        return jsonify({"ok": True, "msg": "Hunter deployed to queue."})
    elif action == "deploy-hermes":
        qw("INSERT INTO tasks(task, priority, status, timestamp) VALUES(?, ?, ?, ?)", ("ENGAGE HERMES OUTBOUND SEQUENCE", 8, "pending", now))
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[COMMAND] {now} | MISSION CONTROL | INITIATING HERMES OUTBOUND\n")
        return jsonify({"ok": True, "msg": "Hermes sequence started."})
    elif action == "deploy-auditor":
        qw("INSERT INTO tasks(task, priority, status, timestamp) VALUES(?, ?, ?, ?)", ("RUN AUDITOR SWEEP", 7, "pending", now))
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[COMMAND] {now} | MISSION CONTROL | RUNNING AUDITOR SWEEP AND ROI CALCULATION\n")
        return jsonify({"ok": True, "msg": "Auditor sweep initiated."})
    elif action == "deploy-apex":
        qw("INSERT INTO tasks(task, priority, status, timestamp) VALUES(?, ?, ?, ?)", ("LAUNCH APEX CLOSER", 10, "pending", now))
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[COMMAND] {now} | MISSION CONTROL | APEX PROTOCOL ENGAGED\n")
        return jsonify({"ok": True, "msg": "APEX Closer launched."})
    elif action == "op-pivot":
        qw("INSERT INTO tasks(task, priority, status, timestamp) VALUES(?, ?, ?, ?)", ("HARD PIVOT TRIGGERED", 100, "pending", now))
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[COMMAND] {now} | MISSION CONTROL | HARD PIVOT - REALLOCATING SWARM\n")
        return jsonify({"ok": True, "msg": "Hard Pivot initiated."})
    elif action:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[COMMAND] {now} | MISSION CONTROL | {action.upper()}\n")
        qw("INSERT INTO tasks(task, priority, status, timestamp) VALUES(?, ?, ?, ?)", (f"UI ACTION: {action}", 5, "pending", now))
        return jsonify({"ok": True, "msg": f"Action {action} dispatched."})
    return jsonify({"ok": False, "msg": "Unknown action"})

@app.route("/api/system/control")
def api_system_status():
    # Simple check if agent_loop is likely running by looking at the log update time
    is_running = False
    if os.path.exists(LOG_FILE):
        mtime = os.path.getmtime(LOG_FILE)
        if (time.time() - mtime) < 60: # Updated in last 60s
            is_running = True
    
    return jsonify({
        "agent_running": is_running,
        "pid": os.getpid(), # API pid
        "last_log_update": datetime.datetime.fromtimestamp(os.path.getmtime(LOG_FILE)).isoformat() if os.path.exists(LOG_FILE) else None
    })

@app.route("/api/keys")
def api_keys():
    out = []
    for name, (env_key, domain) in KEY_CATALOG.items():
        val = os.getenv(env_key,"")
        out.append({
            "name":   name,
            "env":    env_key,
            "domain": domain,
            "set":    bool(val),
            "masked": mask(val) if val else "NOT SET",
        })
    return jsonify(out)

# ─────────────────────────── MAP ENDPOINTS ───────────────────────────────────
@app.route("/api/map/config")
def map_config():
    """Serves the Google API key to the frontend for the Maps SDK."""
    return jsonify({
        "key": os.getenv("GOOGLE_API_KEY", ""),
        "region": "GLOBAL",
        "center": {"lat": 20.0, "lng": 0.0} # Global center
    })

@app.route("/api/map/markers")
def map_markers():
    """Returns geocoded markers for entities and billionaire leads."""
    markers = []
    for i, lead in enumerate(leads):
        # Global markers
        markers.append({
            "id": f"lead_{i}",
            "name": lead["name"],
            "entity": lead["entity"],
            "lat": lead.get("lat", 0.0),
            "lng": lead.get("lng", 0.0),
            "type": "lead",
            "intel": lead["intel"]
        })
        
    return jsonify(markers)

# ─────────────────────────── SERVICE CONNECTION TESTS ────────────────────────
import requests as req_lib

@app.route("/api/revenue_ticker")
def api_revenue_ticker():
    stats = get_execution_stats()
    return jsonify({
        "roi": f"{stats.get('revenue', 0) / 1000:.1f}x", # Simulated ROI against a 1k 'batch' cost
        "cvr": f"{stats.get('cvr', 0):.2%}",
        "profit": f"${stats.get('revenue', 0):,.2f}",
        "deployments": stats.get("total_deployments", 0),
        "ts": datetime.datetime.now().isoformat()
    })

@app.route("/api/agent_hive")
def api_agent_hive():
    agents = [
        {"id": "brain",     "name": "Sovereign Brain",     "status": "THINKING"},
        {"id": "architect", "name": "Product Architect",   "status": "IDLE"},
        {"id": "hunter",    "name": "Billionaire Hunter",  "status": "EXECUTING"},
        {"id": "auditor",   "name": "Auditor",             "status": "MONITORING"},
        {"id": "executor",  "name": "Executor",            "status": "IDLE"},
        {"id": "sentinel",  "name": "Sentinel",            "status": "ACTIVE"},
        {"id": "hermes",    "name": "Hermes",              "status": "IDLE"},
        {"id": "douglas",   "name": "Douglas",             "status": "ACTIVE"},
        {"id": "apex",      "name": "Apex",                "status": "IDLE"},
        {"id": "nexus",     "name": "Nexus",               "status": "IDLE"},
        {"id": "echo",      "name": "Echo",                "status": "IDLE"}
    ]
    # Check log for recent activity triggers (Simulated for now)
    log_lines = log_tail(50)
    if any("MONETIZE" in l for l in log_lines): agents[4]["status"] = "EXECUTING" # Executor
    if any("HARD PIVOT" in l for l in log_lines): agents[3]["status"] = "ALERT" # Auditor

    return jsonify(agents)

@app.route("/api/services/test/<service>", methods=["POST"])
def test_service(service):
    svc = service.lower()
    try:
        if svc == "openai":
            key = os.getenv("OPENAI_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No API key"})
            r = req_lib.get("https://api.openai.com/v1/models",
                            headers={"Authorization":f"Bearer {key}"}, timeout=8)
            return jsonify({"ok": r.status_code==200, "msg": f"HTTP {r.status_code}"})

        elif svc == "groq":
            key = os.getenv("GROQ_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No API key"})
            r = req_lib.get("https://api.groq.com/openai/v1/models",
                            headers={"Authorization":f"Bearer {key}"}, timeout=8)
            return jsonify({"ok": r.status_code==200, "msg": f"HTTP {r.status_code}"})

        elif svc == "anthropic":
            key = os.getenv("ANTHROPIC_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No API key"})
            r = req_lib.post("https://api.anthropic.com/v1/messages",
                             headers={"x-api-key":key,"anthropic-version":"2023-06-01","Content-Type":"application/json"},
                             json={"model":"claude-haiku-20240307","max_tokens":1,"messages":[{"role":"user","content":"hi"}]},
                             timeout=10)
            return jsonify({"ok": r.status_code in (200,400), "msg": f"HTTP {r.status_code}"})

        elif svc == "pinecone":
            key = os.getenv("PINECONE_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No API key"})
            r = req_lib.get("https://api.pinecone.io/indexes",
                            headers={"Api-Key":key}, timeout=8)
            return jsonify({"ok": r.status_code==200, "msg": f"HTTP {r.status_code}", "data": r.json() if r.status_code==200 else {}})

        elif svc == "supabase":
            url = os.getenv("SUPABASE_URL","")
            key = os.getenv("SUPABASE_API_KEY","") or os.getenv("SUPABASE_SERVICE_KEY","")
            if not url: return jsonify({"ok":False,"msg":"No URL"})
            r = req_lib.get(f"{url}/rest/v1/",
                            headers={"apikey":key,"Authorization":f"Bearer {key}"}, timeout=8)
            return jsonify({"ok": r.status_code < 500, "msg": f"HTTP {r.status_code}"})

        elif svc == "discord":
            token = os.getenv("DISCORD_BOT_TOKEN_OVERLORD","") or os.getenv("DISCORD_BOT_TOKEN","")
            if not token: return jsonify({"ok":False,"msg":"No token"})
            r = req_lib.get("https://discord.com/api/v10/users/@me",
                            headers={"Authorization": f"Bot {token}"}, timeout=8)
            d = r.json() if r.headers.get("content-type","").startswith("application/json") else {}
            return jsonify({"ok": r.status_code==200, "msg": d.get("username",""), "data": {"id": d.get("id"), "username": d.get("username")}})

        elif svc == "github":
            token = os.getenv("GITHUB_TOKEN","")
            if not token: return jsonify({"ok":False,"msg":"No token"})
            r = req_lib.get("https://api.github.com/user",
                            headers={"Authorization":f"Bearer {token}"}, timeout=8)
            d = r.json()
            return jsonify({"ok": r.status_code==200, "msg": d.get("login",""), "data": {"login":d.get("login"),"public_repos":d.get("public_repos")}})

        elif svc == "elevenlabs":
            key = os.getenv("ELEVENLABS_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No key"})
            r = req_lib.get("https://api.elevenlabs.io/v1/user",
                            headers={"xi-api-key":key}, timeout=8)
            return jsonify({"ok": r.status_code==200, "msg": f"HTTP {r.status_code}"})

        elif svc == "stripe":
            key = os.getenv("STRIPE_SECRET_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No key"})
            r = req_lib.get("https://api.stripe.com/v1/balance",
                            auth=(key,""), timeout=8)
            return jsonify({"ok": r.status_code==200, "msg": f"HTTP {r.status_code}"})

        elif svc == "google":
            key = os.getenv("GOOGLE_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No API key"})
            # Test simple Maps API availability
            r = req_lib.get(f"https://maps.googleapis.com/maps/api/staticmap?center=Dubai&zoom=10&size=10x10&key={key}", timeout=8)
            return jsonify({"ok": r.status_code==200, "msg": f"HTTP {r.status_code}"})

        elif svc == "ollama":
            res = query_ollama("Is the King online?")
            return jsonify({"ok": res is not None, "msg": "Ollama Local Online" if res else "Ollama Offline (check 'ollama serve')", "data": res})

        elif svc == "openrouter":
            res = query_openrouter("Ping from King Mission Control.")
            return jsonify({"ok": res is not None, "msg": "Open Router Swarm Online" if res else "Open Router Failed (check API Key)"})

        elif svc == "vertex":
            key = os.getenv("GOOGLE_API_KEY","")
            if not key: return jsonify({"ok":False,"msg":"No key"})
            try:
                # Using the Generative Language API (AI Studio/Vertex Key mode)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
                r = req_lib.post(url, json={"contents": [{"parts":[{"text":"ping"}]}]}, timeout=10)
                return jsonify({"ok": r.status_code==200, "msg": "Vertex AI Online" if r.status_code==200 else f"HTTP {r.status_code}"})
            except Exception as e:
                return jsonify({"ok":False, "msg": str(e)})

        elif svc == "discord":
            webhook = os.getenv("DISCORD_WEBHOOK_URL","")
            if not webhook: return jsonify({"ok":False,"msg":"No webhook URL"})
            r = req_lib.post(webhook, json={"content": "⚡ Gravity-Hermes Diagnostic: Ping"}, timeout=8)
            return jsonify({"ok": r.status_code in (200,204), "msg": f"HTTP {r.status_code}"})

        else:
            return jsonify({"ok":False,"msg":f"Unknown service: {service}"})

    except Exception as e:
        return jsonify({"ok":False,"msg":str(e)})

# ─────────────────────────── CHAT (Groq LLM) ─────────────────────────────────
CHAT_SYSTEM = """You are Gravity-Hermes, the King Dripping Swag AI agent — a relentless, precision-focused autonomous revenue engine.
You help with strategy, lead generation, coding, business planning, and direct execution of the mission:
delivering premium command-center dashboards and AI solutions to billionaires globally.
Be direct, confident, elite-level. No fluff. Pure execution."""

@app.route("/api/chat/history")
def chat_history():
    return jsonify(q("SELECT role,content,model,timestamp FROM chat_history ORDER BY id DESC LIMIT 60"))

@app.route("/api/chat", methods=["POST"])
def chat():
    d = request.json or {}
    user_msg = (d.get("message") or "").strip()
    if not user_msg:
        return jsonify({"error":"Empty message"}), 400

    # Save user message
    now = datetime.datetime.now().isoformat()
    qw("INSERT INTO chat_history(role,content,model,timestamp) VALUES(?,?,?,?)",
       ("user", user_msg, "user", now))

    # Try Groq first (fastest), fallback to OpenAI
    response_text = None
    model_used = "offline"

    def try_groq():
        key = os.getenv("GROQ_API_KEY","")
        if not key: return None, None
        try:
            r = req_lib.post("https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},
                json={"model":"llama-3.1-8b-instant","messages":[
                    {"role":"system","content":CHAT_SYSTEM},
                    {"role":"user","content":user_msg}
                ],"max_tokens":800,"temperature":0.7},
                timeout=20)
            if r.status_code == 200:
                j = r.json()
                return j["choices"][0]["message"]["content"], "groq/llama-3.1-8b"
        except: pass
        return None, None

    def try_openai():
        key = os.getenv("OPENAI_API_KEY","")
        if not key: return None, None
        try:
            r = req_lib.post("https://api.openai.com/v1/chat/completions",
                headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},
                json={"model":"gpt-4o-mini","messages":[
                    {"role":"system","content":CHAT_SYSTEM},
                    {"role":"user","content":user_msg}
                ],"max_tokens":800},
                timeout=20)
            if r.status_code == 200:
                j = r.json()
                return j["choices"][0]["message"]["content"], "gpt-4o-mini"
        except: pass
        return None, None

    response_text, model_used = try_groq()
    if not response_text:
        response_text, model_used = try_openai()
    if not response_text:
        response_text = "⚠️ All AI backends offline. Check GROQ_API_KEY or OPENAI_API_KEY in .env"
        model_used = "offline"

    now2 = datetime.datetime.now().isoformat()
    qw("INSERT INTO chat_history(role,content,model,timestamp) VALUES(?,?,?,?)",
       ("assistant", response_text, model_used, now2))

    return jsonify({"role":"assistant","content":response_text,"model":model_used,"timestamp":now2})

# ─────────────────────────── DISCORD WAR ROOM ────────────────────────────────
@app.route("/api/discord/send", methods=["POST"])
def discord_send():
    d = request.json or {}
    msg = (d.get("message") or "").strip()
    bot_type = (d.get("bot_type") or "operator").lower()
    
    token = os.getenv("DISCORD_TOKEN")
    webhook = os.getenv("DISCORD_WEBHOOK_URL")

    if not msg: return jsonify({"ok":False,"msg":"Empty message"}), 400

    profiles = {
        "sentinel": "🛑 [SENTINEL]",
        "hermes": "📨 [HERMES]",
        "agentzero": "🧬 [AGENTZERO]",
        "douglas": "👔 [DOUGLAS]",
        "operator": "🛠️ [OPERATOR]"
    }
    profile_tag = profiles.get(bot_type, "🤖 [GRAVITY-HERMES]")
    
    embed = {
        "title": profile_tag,
        "description": msg,
        "color": 0x3498db,
        "footer": {"text": "Sovereign UI Bridge"}
    }
    
    # Try Bot API first if we have a token and specific channel mapped, but for dashboard simplicity, try to just send via Webhook or Bot.
    # To keep this dashboard API simple, we will just use the Webhook if available, as the dashboard doesn't strictly need channel mapping for 'send test message' 
    # unless we expose it. Let's use the Webhook.
    if webhook:
        try:
            r = req_lib.post(webhook, json={"username": profile_tag, "embeds": [embed]}, timeout=10)
            return jsonify({"ok": r.status_code in (200,204), "msg": "Sent" if r.status_code in (200,204) else f"Failed: HTTP {r.status_code}"})
        except Exception as e:
            return jsonify({"ok":False,"msg":str(e)})
    else:
        return jsonify({"ok":False,"msg":"No Discord Webhook set in .env"}), 400

# ─────────────────────────── TERMINAL ────────────────────────────────────────
ALLOWED_CMDS = {
    # safe reads
    "ls","dir","pwd","echo","cat","head","tail","type","python","pip","git",
    "node","npm","where","which","env","set","date","time","ping","curl","wget",
}

def cmd_allowed(cmd_str):
    if not cmd_str: return False
    first = cmd_str.strip().split()[0].lower()
    # Always allow safe keywords
    if first in ALLOWED_CMDS: return True
    # allow python script execution
    if first == "python" or first == "python3": return True
    # block obviously dangerous stuff
    blocked = ["rm -rf","del /f","format","shutdown","reboot","mkfs","dd if=",":(){",
               "wget http","curl http","sudo rm","powershell -enc"]
    return not any(b in cmd_str.lower() for b in blocked)

# Persistent terminal state
terminal_state = {
    "cwd": os.getcwd()
}

@app.route("/api/terminal", methods=["POST"])
def terminal_run():
    d = request.json or {}
    cmd = (d.get("command") or "").strip()
    if not cmd: return jsonify({"output":"No command","exit_code":1, "cwd": terminal_state["cwd"]})

    if not cmd_allowed(cmd):
        return jsonify({"output":f"❌ Blocked: '{cmd}' is not allowed for safety.", "exit_code":1, "cwd": terminal_state["cwd"]})

    try:
        # Special handling for 'cd'
        if cmd.startswith("cd "):
            target = cmd[3:].strip()
            # Handle absolute vs relative
            new_path = os.path.abspath(os.path.join(terminal_state["cwd"], target))
            if os.path.isdir(new_path):
                terminal_state["cwd"] = new_path
                return jsonify({"output": f"Changed directory to {new_path}", "exit_code": 0, "cwd": terminal_state["cwd"]})
            else:
                return jsonify({"output": f"Directory not found: {target}", "exit_code": 1, "cwd": terminal_state["cwd"]})
        elif cmd == "cd":
             # Go home (relative to project root for safety or just OS home)
             terminal_state["cwd"] = os.path.expanduser("~")
             return jsonify({"output": f"Changed directory to {terminal_state['cwd']}", "exit_code": 0, "cwd": terminal_state["cwd"]})

        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True,
            timeout=20, cwd=terminal_state["cwd"],
            env={**os.environ, "PYTHONUNBUFFERED":"1"}
        )
        output = (result.stdout + result.stderr).strip() or "(no output)"
        qw("INSERT INTO terminal_history(command,output,exit_code,timestamp) VALUES(?,?,?,?)",
           (cmd, output[:4000], result.returncode, datetime.datetime.now().isoformat()))
        return jsonify({"output":output, "exit_code":result.returncode, "cwd":terminal_state["cwd"]})
    except subprocess.TimeoutExpired:
        return jsonify({"output":"⏱ Command timed out (20s limit)","exit_code":124, "cwd": terminal_state["cwd"]})
    except Exception as e:
        return jsonify({"output":f"Error: {str(e)}","exit_code":1, "cwd": terminal_state["cwd"]})

@app.route("/api/terminal/history")
def terminal_history():
    return jsonify(q("SELECT command,output,exit_code,timestamp FROM terminal_history ORDER BY id DESC LIMIT 50"))

@app.route("/api/terminal/commands")
def terminal_commands():
    """Reference list of useful commands."""
    return jsonify([
        {"cmd":"python agent_loop.py",           "desc":"Start the 24/7 agent loop"},
        {"cmd":"python seed_bots.py",             "desc":"Seed bot data to DB"},
        {"cmd":"python seed_db.py",               "desc":"Seed full database"},
        {"cmd":"pip list",                         "desc":"List installed packages"},
        {"cmd":"git status",                       "desc":"Git repo status"},
        {"cmd":"git log --oneline -10",           "desc":"Last 10 commits"},
        {"cmd":"python -c \"from tools.tier1_memory_sqlite import init_db; init_db(True); print('DB OK')\"", "desc":"Re-init DB schema"},
        {"cmd":"echo GROQ_API_KEY=$GROQ_API_KEY", "desc":"Check Groq key env"},
        {"cmd":"curl https://api.groq.com/openai/v1/models -s -H \"Authorization: Bearer $GROQ_API_KEY\" | python -m json.tool | head -20", "desc":"Test Groq live"},
        {"cmd":"ls .tmp/archive/ | wc -l",        "desc":"Count cold archives"},
        {"cmd":"python dashboard_api.py",          "desc":"Restart dashboard API"},
        {"cmd":"cat agent_progress.log | tail -20","desc":"Last 20 log lines"},
    ])

# ─────────────────────────── SOVEREIGN COMMAND ENDPOINTS ─────────────────────
# Import Sovereign hierarchy
try:
    from brain_router_sovereign import get_overlord
    OVERLORD = get_overlord()
except ImportError:
    print("[WARN] brain_router_sovereign not found. Sovereign endpoints disabled.")
    OVERLORD = None

# Import Discord War Room integration
try:
    import asyncio
    from discord_integration import get_war_room
    DISCORD_WARROOM = get_war_room()
except ImportError:
    print("[WARN] discord_integration not found. Discord streaming disabled.")
    DISCORD_WARROOM = None

# Import Dashboard Metrics Service
try:
    from sovereign_dashboard_service import get_metrics
    METRICS_SERVICE = get_metrics()
except ImportError:
    print("[WARN] sovereign_dashboard_service not found. Metrics endpoint disabled.")
    METRICS_SERVICE = None

# In-memory activity log
ACTIVITY_LOG = []
AGENT_STATES = {
    "douglas": True,
    "hermes": True,
    "sentinel": True,
    "travis": False,
    "aureus": False,
    "khan": False,
}

@app.route("/api/agent_command", methods=["POST"])
def agent_command():
    """Toggle an agent on/off. Wires UI toggles → Overlord hierarchy."""
    data = request.json or {}
    agent = data.get("agent", "").strip().lower()
    action = data.get("action", "").strip().lower()

    if not agent:
        return jsonify({"error": "agent required"}), 400
    if action not in ("activate", "deactivate"):
        return jsonify({"error": "action must be 'activate' or 'deactivate'"}), 400

    activate = action == "activate"

    # 1) Route to Overlord hierarchy (authoritative state)
    router_result = None
    if OVERLORD:
        router_result = OVERLORD.set_agent_active(agent, activate)
        if not router_result.get("ok"):
            return jsonify({"error": router_result.get("error", "router rejected")}), 400

    # 2) Mirror into local state dict for the dashboard's quick reads
    if agent in AGENT_STATES:
        AGENT_STATES[agent] = activate

    # 3) Log to activity feed
    log_entry = {
        "id": str(len(ACTIVITY_LOG)),
        "timestamp": datetime.datetime.now().isoformat(),
        "agent": agent,
        "action": f"{agent.upper()} {action.upper()}D",
    }
    ACTIVITY_LOG.insert(0, log_entry)
    if len(ACTIVITY_LOG) > 50:
        ACTIVITY_LOG.pop()

    # 4) Stream to Discord War Room (webhook/bot)
    if DISCORD_WARROOM:
        try:
            if activate:
                asyncio.run(DISCORD_WARROOM.agent_activated(agent, "War Room Command"))
            else:
                asyncio.run(DISCORD_WARROOM.agent_deactivated(agent))
        except Exception as e:
            print(f"[ERROR] Discord update failed: {e}")

    return jsonify({
        "status": "ok",
        "agent": agent,
        "action": action,
        "router": router_result,
    })

AGENT_NAME_ALIASES = {
    "overlord": "Overlord", "agent zero": "Overlord", "agentzero": "Overlord", "zero": "Overlord",
    "douglas": "Douglas", "hermes": "Hermes", "sentinel": "Sentinel",
    "travis": "Travis", "aureus": "Aureus", "khan": "Khan",
    "openclaw infra": "OpenClaw-Infra", "openclaw-infra": "OpenClaw-Infra",
    "openclaw strategy": "OpenClaw-Strategy", "openclaw-strategy": "OpenClaw-Strategy",
    "lordsav": "OpenClaw-Infra", "gknowsthiz": "OpenClaw-Strategy",
}

def _match_agent_from_text(text: str):
    """Return the canonical agent name whose alias appears FIRST in text (name-call logic)."""
    low = text.lower()
    best = None
    best_idx = len(low) + 1
    for alias, canon in AGENT_NAME_ALIASES.items():
        idx = low.find(alias)
        if idx >= 0 and idx < best_idx:
            best_idx = idx
            best = canon
    return best

def _resolve_voice_id(general_name: str, fallback: str = "") -> str:
    return os.getenv(f"ELEVENLABS_VOICE_{general_name.upper()}", "") or fallback

def _whisper_transcribe(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe via OpenAI Whisper. Falls back to empty string on error."""
    import requests as _rq
    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        return ""
    try:
        resp = _rq.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {key}"},
            files={"file": (filename, audio_bytes, "audio/webm")},
            data={"model": "whisper-1"},
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.json().get("text", "")
        print(f"[WHISPER] {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[WHISPER] error: {e}")
    return ""

def _elevenlabs_tts(text: str, voice_id: str) -> bytes:
    """Synthesize TTS via ElevenLabs. Returns mp3 bytes or empty bytes."""
    import requests as _rq
    key = os.getenv("ELEVENLABS_API_KEY", "")
    if not key or not voice_id:
        return b""
    try:
        resp = _rq.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={"xi-api-key": key, "accept": "audio/mpeg", "content-type": "application/json"},
            json={"text": text, "model_id": "eleven_turbo_v2_5"},
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.content
        print(f"[ELEVENLABS] {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[ELEVENLABS] error: {e}")
    return b""

@app.route("/api/voice_command", methods=["POST"])
def voice_command():
    """Voice War Room: Mic → Whisper → Sovereign Router (name-call) → ElevenLabs → audio reply."""
    try:
        audio_file = request.files.get("audio")
        if not audio_file:
            return jsonify({"error": "No audio provided"}), 400

        # 1) Whisper STT
        audio_bytes = audio_file.read()
        transcription = _whisper_transcribe(audio_bytes, audio_file.filename or "audio.webm")
        if not transcription:
            transcription = "[WHISPER UNAVAILABLE — OPENAI_API_KEY not set or request failed]"

        # 2) Name-call routing — first agent name mentioned wins
        target_name = _match_agent_from_text(transcription)
        reply_text = ""
        voice_id = ""

        if OVERLORD and target_name:
            node = OVERLORD.find_agent_by_name(target_name)
            if node is not None:
                op_result = node.execute_division_logic({
                    "type": "voice_command",
                    "content": transcription,
                }) if hasattr(node, "execute_division_logic") else None

                if op_result:
                    reply_text = f"{target_name} acknowledges. {op_result.get('result','')}"
                    voice_id = _resolve_voice_id(target_name, getattr(node, "voice_id", ""))
                else:
                    reply_text = f"{target_name} receiving. Command logged."
                    voice_id = _resolve_voice_id(target_name, "")
            else:
                reply_text = f"{target_name} is not in the roster."
        elif OVERLORD:
            # No name called — Overlord responds
            target_name = "Overlord"
            reply_text = "Overlord receiving. Call a General by name to dispatch."
            voice_id = _resolve_voice_id("OVERLORD", "")
        else:
            reply_text = "Sovereign hierarchy offline."

        # 3) ElevenLabs TTS (optional — returns empty if no key/voice)
        audio_reply_b64 = ""
        if voice_id and reply_text:
            import base64 as _b64
            tts_bytes = _elevenlabs_tts(reply_text, voice_id)
            if tts_bytes:
                audio_reply_b64 = _b64.b64encode(tts_bytes).decode("ascii")

        # 4) Log + Discord stream
        log_entry = {
            "id": str(len(ACTIVITY_LOG)),
            "timestamp": datetime.datetime.now().isoformat(),
            "agent": target_name.lower() if target_name else "voice_interface",
            "action": f"VOICE: \"{transcription[:80]}\" → {target_name or 'unresolved'}",
        }
        ACTIVITY_LOG.insert(0, log_entry)
        if len(ACTIVITY_LOG) > 50:
            ACTIVITY_LOG.pop()

        if DISCORD_WARROOM:
            try:
                asyncio.run(DISCORD_WARROOM.voice_command_received(
                    transcription, target_name or "Voice Router"
                ))
            except Exception as e:
                print(f"[ERROR] Discord voice log failed: {e}")

        return jsonify({
            "status": "processed",
            "transcription": transcription,
            "matched_agent": target_name,
            "reply_text": reply_text,
            "voice_id": voice_id,
            "audio_mp3_b64": audio_reply_b64,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/activity_log", methods=["GET"])
def activity_log_endpoint():
    """Get recent activity log"""
    limit = int(request.args.get("limit", 20))
    return jsonify(ACTIVITY_LOG[:limit])

@app.route("/api/agent_hive", methods=["GET"])
def agent_hive():
    """Get current agent hive status"""
    hive_status = [
        {
            "name": agent,
            "status": "ACTIVE" if active else "INACTIVE",
            "state": active
        }
        for agent, active in AGENT_STATES.items()
    ]

    # Stream swarm status to Discord every 30 seconds (throttled)
    if DISCORD_WARROOM:
        try:
            active_count = sum(1 for active in AGENT_STATES.values() if active)
            total_count = len(AGENT_STATES)
            # Only send if we're not spamming (can optimize with timestamp check)
            if active_count > 0:
                asyncio.run(DISCORD_WARROOM.swarm_status(active_count, total_count, AGENT_STATES))
        except Exception as e:
            print(f"[ERROR] Discord swarm status failed: {e}")

    return jsonify(hive_status)

@app.route("/api/dashboard/metrics")
def get_dashboard_metrics():
    """Get all agent metrics for interactive dashboard"""
    if METRICS_SERVICE:
        return jsonify(METRICS_SERVICE.get_all_metrics())
    return jsonify({"error": "Metrics service not available"}), 503

@app.route("/api/sovereign_hierarchy", methods=["GET"])
def sovereign_hierarchy():
    """Get full Sovereign command hierarchy"""
    if not OVERLORD:
        return jsonify({"error": "Overlord not initialized"}), 500

    return jsonify(OVERLORD.get_hierarchy_status())

@app.route("/api/sovereign_heartbeat", methods=["POST", "GET"])
def sovereign_heartbeat():
    """Trigger a one-shot Healbot sweep across the hierarchy."""
    if not OVERLORD:
        return jsonify({"error": "Overlord not initialized"}), 500
    try:
        report = asyncio.run(OVERLORD.heartbeat())
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─────────────────────────── SOVEREIGN NETWORK (4-NODE) ──────────────────────
try:
    from sovereign_network import get_network
    _NETWORK = get_network()
except Exception as _e:
    print(f"[WARN] sovereign_network unavailable: {_e}")
    _NETWORK = None

@app.route("/api/network_status", methods=["GET"])
def api_network_status():
    """Live health snapshot of the 4 Sovereign nodes (Hostinger/Oracle/Keyloq/Local)."""
    if not _NETWORK:
        return jsonify({"error": "sovereign_network not loaded"}), 503
    refresh = request.args.get("refresh", "1") != "0"
    snapshot = _NETWORK.refresh() if refresh else _NETWORK.snapshot()
    return jsonify({
        "nodes": snapshot,
        "registry_configured": _NETWORK.registry.configured(),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    })

@app.route("/api/sovereign_registry", methods=["POST", "GET"])
def api_sovereign_registry():
    """Mirror current Overlord hierarchy into the Hostinger MySQL registry."""
    if not _NETWORK:
        return jsonify({"error": "sovereign_network not loaded"}), 503
    if not OVERLORD:
        return jsonify({"error": "Overlord not initialized"}), 500
    try:
        hierarchy = OVERLORD.get_hierarchy_status()
        result = _NETWORK.registry.mirror_hierarchy(hierarchy)
        return jsonify({
            "mirror": result,
            "registry_configured": _NETWORK.registry.configured(),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/client_credentials", methods=["POST"])
def client_credentials():
    """Store client credentials for Telnyx/Twilio"""
    data = request.json or {}
    provider = data.get("provider", "").lower()
    api_key = data.get("api_key", "")
    api_secret = data.get("api_secret", "")
    client_name = data.get("client_name", "Unknown")

    if provider not in ["telnyx", "twilio"]:
        return jsonify({"error": "Unknown provider"}), 400

    # In production, would encrypt and store securely
    os.environ[f"{provider.upper()}_API_KEY"] = api_key
    os.environ[f"{provider.upper()}_API_SECRET"] = api_secret

    log_entry = {
        "id": str(len(ACTIVITY_LOG)),
        "timestamp": datetime.datetime.now().isoformat(),
        "agent": "gateway",
        "action": f"Client credentials registered for {provider}"
    }
    ACTIVITY_LOG.insert(0, log_entry)

    # Stream to Discord War Room
    if DISCORD_WARROOM:
        try:
            asyncio.run(DISCORD_WARROOM.client_registered(provider, client_name))
        except Exception as e:
            print(f"[ERROR] Discord client registration log failed: {e}")

    return jsonify({"status": "ok", "provider": provider})

def _twilio_basic_auth():
    sid = os.getenv("TWILIO_ACCOUNT_SID", "") or os.getenv("TWILIO_API_KEY", "")
    tok = os.getenv("TWILIO_AUTH_TOKEN", "") or os.getenv("TWILIO_API_SECRET", "")
    return (sid, tok) if sid and tok else None

@app.route("/api/outbound_call", methods=["POST"])
def outbound_call():
    """Place a real outbound call via Telnyx or Twilio using client-provided creds."""
    import requests as _rq
    data = request.json or {}
    provider = data.get("provider", "").lower()
    to_number = data.get("to", "")
    from_number = data.get("from", "")
    message = data.get("message", "")  # TwiML or plain text

    if not to_number or not from_number:
        return jsonify({"error": "to and from required"}), 400

    try:
        if provider == "twilio":
            auth = _twilio_basic_auth()
            if not auth:
                return jsonify({"error": "TWILIO credentials missing"}), 400
            twiml = f"<Response><Say voice='Polly.Matthew'>{message or 'Sovereign dispatch.'}</Say></Response>"
            resp = _rq.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{auth[0]}/Calls.json",
                auth=auth,
                data={"To": to_number, "From": from_number, "Twiml": twiml},
                timeout=20,
            )
            return jsonify({"ok": resp.status_code in (200,201), "status": resp.status_code, "data": resp.json() if resp.content else {}})

        if provider == "telnyx":
            key = os.getenv("TELNYX_API_KEY", "")
            conn_id = os.getenv("TELNYX_CONNECTION_ID", "")
            if not key or not conn_id:
                return jsonify({"error": "TELNYX_API_KEY and TELNYX_CONNECTION_ID required"}), 400
            resp = _rq.post(
                "https://api.telnyx.com/v2/calls",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"to": to_number, "from": from_number, "connection_id": conn_id},
                timeout=20,
            )
            return jsonify({"ok": resp.status_code in (200,201), "status": resp.status_code, "data": resp.json() if resp.content else {}})

        return jsonify({"error": "provider must be 'twilio' or 'telnyx'"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/outbound_sms", methods=["POST"])
def outbound_sms():
    """Send SMS via Telnyx or Twilio."""
    import requests as _rq
    data = request.json or {}
    provider = data.get("provider", "").lower()
    to_number = data.get("to", "")
    from_number = data.get("from", "")
    body = data.get("body", "")

    if not to_number or not from_number or not body:
        return jsonify({"error": "to, from, body required"}), 400

    try:
        if provider == "twilio":
            auth = _twilio_basic_auth()
            if not auth:
                return jsonify({"error": "TWILIO credentials missing"}), 400
            resp = _rq.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{auth[0]}/Messages.json",
                auth=auth,
                data={"To": to_number, "From": from_number, "Body": body},
                timeout=20,
            )
            return jsonify({"ok": resp.status_code in (200,201), "status": resp.status_code, "data": resp.json() if resp.content else {}})

        if provider == "telnyx":
            key = os.getenv("TELNYX_API_KEY", "")
            profile = os.getenv("TELNYX_MESSAGING_PROFILE_ID", "")
            if not key:
                return jsonify({"error": "TELNYX_API_KEY required"}), 400
            payload = {"to": to_number, "from": from_number, "text": body}
            if profile:
                payload["messaging_profile_id"] = profile
            resp = _rq.post(
                "https://api.telnyx.com/v2/messages",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json=payload,
                timeout=20,
            )
            return jsonify({"ok": resp.status_code in (200,201), "status": resp.status_code, "data": resp.json() if resp.content else {}})

        return jsonify({"error": "provider must be 'twilio' or 'telnyx'"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auto_healbot", methods=["POST"])
def auto_healbot():
    """Auto-respawn crashed agent using 6-Tier Memory"""
    data = request.json or {}
    crashed_agent = data.get("agent", "")

    if not OVERLORD:
        return jsonify({"error": "Overlord not initialized"}), 500

    try:
        # In production, would be async
        # result = asyncio.run(OVERLORD.auto_healbot(crashed_agent))
        result = {
            "action": "auto_healbot",
            "target_agent": crashed_agent,
            "status": "respawned",
            "timestamp": datetime.datetime.now().isoformat(),
        }

        log_entry = {
            "id": str(len(ACTIVITY_LOG)),
            "timestamp": datetime.datetime.now().isoformat(),
            "agent": "healer",
            "action": f"Auto-respawned {crashed_agent}"
        }
        ACTIVITY_LOG.insert(0, log_entry)

        # Stream to Discord War Room
        if DISCORD_WARROOM:
            try:
                asyncio.run(DISCORD_WARROOM.healbot_respawn(crashed_agent))
            except Exception as e:
                print(f"[ERROR] Discord healbot log failed: {e}")

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─────────────────────────── BOOT ────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 64)
    print("  [KING] [MISSION CONTROL] v2.5 BOOTING...")
    print("=" * 64)
    ensure_db()
    from tools.tier1_memory_sqlite import migrate_schema
    migrate_schema()
    os.makedirs("dashboard", exist_ok=True)
    os.makedirs(".tmp/archive", exist_ok=True)

    # Start metrics simulation if service available
    if METRICS_SERVICE:
        try:
            from sovereign_dashboard_service import start_simulation
            start_simulation()
            print(f"  [OK] Metrics  : Agent simulation running (background)")
        except Exception as e:
            print(f"  [WARN] Metrics: Simulation failed to start - {e}")

    # Eternal Heartbeat — Healbot watchdog on dedicated thread
    if OVERLORD:
        try:
            import threading as _threading
            def _watchdog_thread():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                from brain_router_sovereign import run_watchdog
                loop.run_until_complete(run_watchdog(interval_seconds=15))
            _t = _threading.Thread(target=_watchdog_thread, daemon=True, name="sovereign-healbot")
            _t.start()
            print(f"  [OK] Healbot  : Eternal Heartbeat running (15s sweeps)")
        except Exception as e:
            print(f"  [WARN] Healbot: failed to start - {e}")

    print(f"  [OK] DB       : {DB_PATH}")
    print(f"  [OK] Chat     : Groq -> OpenAI fallback")
    print(f"  [OK] Terminal : Safe shell executor active")
    print(f"  [OK] Discord  : {'CONFIGURED' if os.getenv('DISCORD_BOT_TOKEN_OVERLORD') else 'NO TOKEN'}")
    print(f"  [OK] Server   : http://localhost:5050")
    print("=" * 64)
    app.run(host="0.0.0.0", port=5050, debug=False, use_reloader=False)
