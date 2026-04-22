import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = 'c:/Users/user/make me a 10dll site/gravity-claw.db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get('bot_id');

  const db = new sqlite3.Database(dbPath);
  const all = promisify(db.all).bind(db);

  try {
    if (botId) {
      // Get messages for a specific bot
      const messages = await all('SELECT * FROM messages WHERE bot_id = ? ORDER BY timestamp ASC', [botId]);
      return NextResponse.json({ messages });
    } else {
      // Get all bots and overall history
      const rawBots = await all('SELECT * FROM bots');
      const bots = rawBots.map((bot: any) => {
        if (!bot.created_at) return { ...bot, age: 'New' };
        const created = new Date(bot.created_at);
        const diff = Math.floor((new Date().getTime() - created.getTime()) / (1000 * 3600 * 24));
        return { ...bot, age: `${diff}d` };
      });
      const history = await all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50');
      return NextResponse.json({ bots, history });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db.close();
  }
}
