import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    
    // Execute command in PowerShell
    const { stdout, stderr } = await execPromise(command, { shell: 'powershell.exe' });
    
    return NextResponse.json({ output: stdout || stderr });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
