import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logPath = 'c:/Users/user/make me a 10dll site/agent_progress.log';
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: ["No logs found yet."] });
    }

    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n').filter(Boolean).slice(-50);
    
    return NextResponse.json({ logs: lines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
