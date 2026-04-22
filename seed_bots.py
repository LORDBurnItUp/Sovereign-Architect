import sqlite3
import os

DB_PATH = "gravity-claw.db"

def seed_bots():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    bots = [
        ("tg-001", "Hermes Alpha", "Telegram", "Active", "Dubai Node", "/agents/hermes-tg", "2026-04-10T09:00:00"),
        ("ds-001", "Hermes Beta", "Discord", "Idle", "Riyadh Node", "/agents/hermes-ds", "2026-04-11T14:30:00"),
        ("web-001", "Hermes Web", "Web Dashboard", "Active", "Global Edge", "/agents/hermes-web", "2026-04-12T10:00:00")
    ]
    
    cur.executemany("INSERT OR REPLACE INTO bots (id, name, platform, status, location, path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", bots)
    
    conn.commit()
    conn.close()
    print("Bots seeded successfully.")

if __name__ == "__main__":
    seed_bots()
