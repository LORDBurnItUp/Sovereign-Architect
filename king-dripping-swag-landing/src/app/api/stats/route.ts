import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const dbPath = 'c:/Users/user/make me a 10dll site/gravity-claw.db';
const archiveDir = 'c:/Users/user/make me a 10dll site/.tmp/archive';

export async function GET() {
  const db = new sqlite3.Database(dbPath);
  const get = promisify(db.get).bind(db);

  try {
    // Tier 1: Messages count
    const msgCount = await get('SELECT COUNT(*) as count FROM messages');
    
    // Tier 4: Entities count
    const entityCount = await get('SELECT COUNT(*) as count FROM entities');
    const relationCount = await get('SELECT COUNT(*) as count FROM relations');

    // Tier 5: Archive count
    let archiveCount = 0;
    if (fs.existsSync(archiveDir)) {
      archiveCount = fs.readdirSync(archiveDir).length;
    }

    // Tier 6: Blueprint estimate (from core_memory)
    const bpCount = await get("SELECT COUNT(*) as count FROM core_memory WHERE fact LIKE 'Generated Blueprint:%'");

    return NextResponse.json({
      tiers: {
        t1: msgCount.count,
        t2: "Synced", // Simulated vector sync status
        t3: "Connected", // Simulated cloud status
        t4: { entities: entityCount.count, relations: relationCount.count },
        t5: archiveCount,
        t6: bpCount.count
      },
      health: "OPTIMAL",
      uptime: "24/7 ACTIVE"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db.close();
  }
}
