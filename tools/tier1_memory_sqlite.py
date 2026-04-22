import sqlite3
import datetime
import os

DB_PATH = os.getenv("GRAVITY_CLAW_DB_PATH", "gravity-claw.db")

def init_db(run_schema=False):
    """Initializes the Tier 1 SQLite memory layer and executes graceful failure routing."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=10) # 10s timeout
        conn.execute("PRAGMA journal_mode=WAL;")  # Enable WAL
        if run_schema:
            cur = conn.cursor()
            # Platform Bots tracking
            cur.execute('''CREATE TABLE IF NOT EXISTS bots
                           (id TEXT PRIMARY KEY, 
                            name TEXT, 
                            platform TEXT, 
                            status TEXT, 
                            location TEXT,
                            path TEXT,
                            created_at TEXT)''')

            # Core user facts
            cur.execute('''CREATE TABLE IF NOT EXISTS core_memory
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            fact TEXT, 
                            timestamp TEXT,
                            sync_status INTEGER DEFAULT 0)''')
                            
            # Conversation history
            cur.execute('''CREATE TABLE IF NOT EXISTS messages
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            bot_id TEXT,
                            role TEXT, 
                            content TEXT, 
                            timestamp TEXT,
                            sync_status INTEGER DEFAULT 0,
                            FOREIGN KEY(bot_id) REFERENCES bots(id))''')
                            
            # Conversation summaries for context saving
            cur.execute('''CREATE TABLE IF NOT EXISTS summaries
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            summary TEXT, 
                            timestamp TEXT)''')
                            
            # Tier 4: Relational Entity Graph
            cur.execute('''CREATE TABLE IF NOT EXISTS entities
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            name TEXT UNIQUE, 
                            type TEXT, 
                            description TEXT,
                            lat REAL,
                            lng REAL,
                            address TEXT,
                            timestamp TEXT,
                            sync_status INTEGER DEFAULT 0)''')

            # Task Prioritization Table
            cur.execute('''CREATE TABLE IF NOT EXISTS tasks
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            task TEXT, 
                            priority INTEGER DEFAULT 1,
                            status TEXT DEFAULT 'pending',
                            timestamp TEXT)''')

            # Migration: Add columns if they don't exist
            # This handles existing databases that were created with the older schema
            cur.execute("PRAGMA table_info(entities)")
            columns = [info[1] for info in cur.fetchall()]
            if "lat" not in columns:
                cur.execute("ALTER TABLE entities ADD COLUMN lat REAL")
            if "lng" not in columns:
                cur.execute("ALTER TABLE entities ADD COLUMN lng REAL")
            if "address" not in columns:
                cur.execute("ALTER TABLE entities ADD COLUMN address TEXT")

            cur.execute("PRAGMA table_info(messages)")
            msg_columns = [info[1] for info in cur.fetchall()]
            if "role" not in msg_columns:
                cur.execute("ALTER TABLE messages ADD COLUMN role TEXT")
            if "bot_id" not in msg_columns:
                cur.execute("ALTER TABLE messages ADD COLUMN bot_id TEXT")
            if "sync_status" not in msg_columns:
                cur.execute("ALTER TABLE messages ADD COLUMN sync_status INTEGER DEFAULT 0")

            cur.execute("PRAGMA table_info(core_memory)")
            mem_columns = [info[1] for info in cur.fetchall()]
            if "sync_status" not in mem_columns:
                cur.execute("ALTER TABLE core_memory ADD COLUMN sync_status INTEGER DEFAULT 0")

            cur.execute("PRAGMA table_info(entities)")
            ent_columns = [info[1] for info in cur.fetchall()]
            if "sync_status" not in ent_columns:
                cur.execute("ALTER TABLE entities ADD COLUMN sync_status INTEGER DEFAULT 0")

            cur.execute('''CREATE TABLE IF NOT EXISTS relations
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            source_id INTEGER, 
                            target_id INTEGER, 
                            relation_type TEXT, 
                            strength REAL,
                            timestamp TEXT,
                            FOREIGN KEY(source_id) REFERENCES entities(id),
                            FOREIGN KEY(target_id) REFERENCES entities(id))''')

            # Execution Logs for ROI & Deployment tracking
            cur.execute('''CREATE TABLE IF NOT EXISTS execution_logs
                           (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            target_niche TEXT, 
                            product_name TEXT, 
                            landing_page_url TEXT, 
                            payment_link TEXT, 
                            status TEXT,
                            sales_count INTEGER DEFAULT 0,
                            revenue REAL DEFAULT 0.0,
                            timestamp TEXT)''')

            conn.commit()
        return conn
    except Exception as e:
        print(f"[FATAL] Tier 1 SQLite Failed. Error: {str(e)}")
        # Allow the mobile loop to continue even if local persistence is temporarily interrupted
        return None

def migrate_schema():
    """Checks if execution_logs table exists and adds sales_count column if missing."""
    print("[MIGRATION] Checking database schema resilience...")
    try:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        cur = conn.cursor()
        
        # Check if execution_logs exists
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='execution_logs'")
        if cur.fetchone():
            cur.execute("PRAGMA table_info(execution_logs)")
            columns = [info[1] for info in cur.fetchall()]
            
            if "sales_count" not in columns:
                print("[MIGRATION] Patching execution_logs: Adding sales_count column.")
                cur.execute("ALTER TABLE execution_logs ADD COLUMN sales_count INTEGER DEFAULT 0")
            
            if "revenue" not in columns:
                print("[MIGRATION] Patching execution_logs: Adding revenue column.")
                cur.execute("ALTER TABLE execution_logs ADD COLUMN revenue REAL DEFAULT 0.0")
            
            conn.commit()
            print("[MIGRATION] execution_logs schema is up to date.")
        else:
            print("[MIGRATION] execution_logs table not found. Skipping migration.")
        
        conn.close()
    except Exception as e:
        print(f"[ERROR] Migration failed: {str(e)}")

def get_core_memory(limit: int = 10) -> list:
    """Retrieves the most recent core memory facts."""
    conn = init_db()
    if not conn:
        return []
    try:
        cur = conn.cursor()
        cur.execute("SELECT fact FROM core_memory ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cur.fetchall()
        return [row[0] for row in rows]
    finally:
        conn.close()

def get_sovereign_profile(limit: int = 50) -> list:
    """Retrieves specialized neural profile facts for the Sovereign Confidant."""
    conn = init_db()
    if not conn:
        return []
    try:
        cur = conn.cursor()
        # Search for facts containing the SOVEREIGN_PROFILE tag
        cur.execute("SELECT fact FROM core_memory WHERE fact LIKE 'SOVEREIGN_PROFILE:%' ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cur.fetchall()
        return [row[0].replace("SOVEREIGN_PROFILE:", "").strip() for row in rows]
    finally:
        conn.close()

def remember_fact(fact: str) -> dict:
    """Atomic tool: Saves unstructured user info into core_memory."""
    conn = init_db()
    if not conn:
        return {"status": "error", "message": "Tier 1 Offline"}
        
    try:
        cur = conn.cursor()
        now = datetime.datetime.now().isoformat()
        cur.execute("INSERT INTO core_memory (fact, timestamp) VALUES (?, ?)", (fact, now))
        conn.commit()
    finally:
        conn.close()
        
    return {"status": "success", "fact": fact}

def save_message(role: str, content: str) -> dict:
    """Atomic tool: Saves conversation message to Tier 1."""
    conn = init_db()
    if not conn:
         return {"status": "error", "message": "Tier 1 Offline"}
         
    try:
        cur = conn.cursor()
        now = datetime.datetime.now().isoformat()
        cur.execute("INSERT INTO messages (role, content, timestamp) VALUES (?, ?, ?)", (role, content, now))
        conn.commit()
        
        # Trigger Compaction Check (over 30 messages)
        cur.execute("SELECT COUNT(*) FROM messages")
        count = cur.fetchone()[0]
        if count > 30:
            return {"status": "success", "message": "Saved", "trigger_compaction": True}
    finally:
        conn.close()
        
    return {"status": "success", "message": "Saved", "trigger_compaction": False}

def log_execution_event(target_niche: str, product_name: str, landing_page_url: str, payment_link: str, status: str = "success") -> dict:
    """Saves a high-stakes execution event to Tier 1 for ROI tracking."""
    conn = init_db()
    if not conn:
        return {"status": "error", "message": "Tier 1 Offline"}
    
    try:
        cur = conn.cursor()
        now = datetime.datetime.now().isoformat()
        cur.execute("""INSERT INTO execution_logs 
                       (target_niche, product_name, landing_page_url, payment_link, status, timestamp) 
                       VALUES (?, ?, ?, ?, ?, ?)""", 
                    (target_niche, product_name, landing_page_url, payment_link, status, now))
        conn.commit()
    finally:
        conn.close()
    
    return {"status": "success", "event_logged": True}

def log_sale(product_name: str, amount: float) -> dict:
    """Records a successful sale for ROI tracking."""
    conn = init_db()
    if not conn:
        return {"status": "error", "message": "Tier 1 Offline"}
    
    try:
        cur = conn.cursor()
        now = datetime.datetime.now().isoformat()
        # Find the most recent execution log for this product
        cur.execute("SELECT id, sales_count, revenue FROM execution_logs WHERE product_name = ? ORDER BY timestamp DESC LIMIT 1", (product_name,))
        row = cur.fetchone()
        if row:
            log_id, count, rev = row
            cur.execute("UPDATE execution_logs SET sales_count = ?, revenue = ? WHERE id = ?", (count + 1, rev + amount, log_id))
            conn.commit()
            return {"status": "success", "sale_logged": True}
        else:
            return {"status": "error", "message": "Product log not found"}
    finally:
        conn.close()

def get_execution_stats() -> dict:
    """Calculates CVR and ROI for the Auditor."""
    conn = init_db()
    if not conn:
        return {"status": "error", "stats": {}}
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT SUM(sales_count), SUM(revenue), COUNT(*) FROM execution_logs")
        row = cur.fetchone()
        
        # Default to 0 if no records exist
        sales, revenue, total_deployments = row if row else (0, 0.0, 0)
        sales = sales or 0
        revenue = revenue or 0.0
        total_deployments = total_deployments or 0
        
        # A simple CVR: sales / deployments
        cvr = (sales / total_deployments) if total_deployments and total_deployments > 0 else 0
        
        return {
            "total_sales": sales,
            "revenue": revenue,
            "total_deployments": total_deployments,
            "cvr": cvr
        }
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("Tier 1 Memory Layer setup complete.")
