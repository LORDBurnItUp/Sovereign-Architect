import sqlite3
import datetime
import os
from tools.tier1_memory_sqlite import init_db

def map_entity_relation(source: str, target: str, rel_type: str, strength: float = 1.0) -> dict:
    """
    Tier 4: Relational Entity Graph Tool
    Maps a relationship between two entities. If entity doesn't exist, it creates it.
    """
    conn = init_db()
    if not conn:
        return {"status": "error", "message": "Memory Layer Offline"}
    
    try:
        cur = conn.cursor()
        now = datetime.datetime.now().isoformat()
        
        # Ensure Source exists
        cur.execute("INSERT OR IGNORE INTO entities (name, type, timestamp) VALUES (?, ?, ?)", (source, "Unknown", now))
        cur.execute("SELECT id FROM entities WHERE name = ?", (source,))
        source_id = cur.fetchone()[0]
        
        # Ensure Target exists
        cur.execute("INSERT OR IGNORE INTO entities (name, type, timestamp) VALUES (?, ?, ?)", (target, "Unknown", now))
        cur.execute("SELECT id FROM entities WHERE name = ?", (target,))
        target_id = cur.fetchone()[0]
        
        # Create relation
        cur.execute("INSERT INTO relations (source_id, target_id, relation_type, strength, timestamp) VALUES (?, ?, ?, ?, ?)", 
                    (source_id, target_id, rel_type, strength, now))
        
        conn.commit()
        return {"status": "success", "relation": f"{source} -> {rel_type} -> {target}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

def query_relations(entity_name: str) -> dict:
    """Queries all related entities for a given name."""
    conn = init_db()
    if not conn: return {}
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT e2.name, r.relation_type, r.strength
            FROM entities e1
            JOIN relations r ON e1.id = r.source_id
            JOIN entities e2 ON r.target_id = e2.id
            WHERE e1.name = ?
        """, (entity_name,))
        
        results = cur.fetchall()
        return {"entity": entity_name, "relations": [{"target": r[0], "type": r[1], "strength": r[2]} for r in results]}
    finally:
        conn.close()

if __name__ == "__main__":
    # Test link
    res = map_entity_relation("MGX", "G42", "Strategic Partner")
    print(res)
