import requests
import logging
from tools.tier1_memory_sqlite import init_db
from tools.ollama_client import query_ollama
from tools.communication_payload import dispatch_payload

def is_online():
    """Checks for internet connectivity with a short timeout."""
    try:
        requests.head("http://www.google.com", timeout=2)
        return True
    except:
        return False

def generate_offline_story():
    """
    The 'Storyteller' logic: Gathers offline progress and synthesizes it.
    """
    conn = init_db()
    if not conn:
        return "Local memory unavailable."
    
    try:
        cur = conn.cursor()
        # Fetch unsynced messages and activities
        cur.execute("SELECT content FROM messages WHERE sync_status = 0 ORDER BY timestamp DESC LIMIT 20")
        recent_offline = cur.fetchall()
        
        if not recent_offline:
            return None
        
        activities = "\n".join([r[0][:100] for r in recent_offline])
        
        prompt = f"System: You are the King's Sovereign Storyteller. Summarize the following offline activities and present them as a coherent 'story' of what happened while the user was away. Highlight achievements and priorities.\n\nActivities:\n{activities}"
        
        story = query_ollama(prompt, model="gemma4:e4b")
        return story
    finally:
        conn.close()

def mark_as_synced():
    """Updates the database once the story is told and cloud sync is successful."""
    conn = init_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("UPDATE messages SET sync_status = 1 WHERE sync_status = 0")
            cur.execute("UPDATE core_memory SET sync_status = 1 WHERE sync_status = 0")
            conn.commit()
        finally:
            conn.close()

def reconnect_and_report():
    """Trigger this when internet is restored."""
    if is_online():
        story = generate_offline_story()
        if story:
            logging.info("[STORYTELLER] Reconnected! Sending offline story...")
            dispatch_payload("both", "DailyReport", f"📖 THE OFFLINE STORY:\n\n{story}", agent_profile="agentzero")
            mark_as_synced()
            return True
    return False

if __name__ == "__main__":
    # Test offline story generation
    print("Generating test offline story...")
    print(generate_offline_story())
