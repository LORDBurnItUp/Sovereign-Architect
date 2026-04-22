import sqlite3
import os

db_path = "gravity-claw.db"

def seed_db():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS messages')
    cursor.execute('DROP TABLE IF EXISTS bots')
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bots (
        id TEXT PRIMARY KEY,
        name TEXT,
        platform TEXT,
        status TEXT,
        location TEXT,
        path TEXT,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id TEXT,
        role TEXT,
        content TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(bot_id) REFERENCES bots(id)
    )
    ''')
    
    # Insert Bots
    bots = [
        ('tg-001', 'Gravity-Telegram', 'Telegram', 'Active', 'Global', 'c:/Users/user/make me a 10dll site/bots/telegram'),
        ('ds-001', 'Gravity-Discord', 'Discord', 'Active', 'Global', 'c:/Users/user/make me a 10dll site/bots/discord'),
        ('wa-001', 'Gravity-WhatsApp', 'WhatsApp', 'Active', 'Global', 'c:/Users/user/make me a 10dll site/bots/whatsapp')
    ]
    cursor.executemany('INSERT OR REPLACE INTO bots (id, name, platform, status, location, path) VALUES (?,?,?,?,?,?)', bots)
    
    # Insert Sample Messages
    messages = [
        ('tg-001', 'system', 'Telegram Bot Initialized. Monitoring billionaire dashboard leads.'),
        ('tg-001', 'user', 'Status update?'),
        ('tg-001', 'bot', 'Found 3 new high-value leads looking for premium visualization.'),
        ('ds-001', 'system', 'Discord Webhook Active.'),
        ('ds-001', 'bot', 'Dashboard pitch sent to global investment group.'),
        ('wa-001', 'system', 'WhatsApp API Connected.'),
        ('wa-001', 'bot', 'Waiting for billionaire hunter trigger.')
    ]
    cursor.executemany('INSERT INTO messages (bot_id, role, content) VALUES (?,?,?)', messages)
    
    conn.commit()
    conn.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
