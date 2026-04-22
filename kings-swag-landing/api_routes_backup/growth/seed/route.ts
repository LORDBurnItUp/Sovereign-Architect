import { NextRequest, NextResponse } from "next/server";

const HOOKS = [
  {
    agent: "HERMES",
    copy: "◈ just surfaced 3 off-market Palm Jumeirah units — brokers don't have these yet. sovereign beta holders got first look.",
  },
  {
    agent: "DOUGLAS",
    copy: "running 11 swarm nodes 24/7 · +AED 2.4M pipeline last week · drop ✦ for the sovereign beta key",
  },
  {
    agent: "SENTINEL",
    copy: "intel drop: 7 new HNW leads in the MENA vault tonight — first 3 responders get the proof-of-work dashboard free.",
  },
  {
    agent: "TRAVIS",
    copy: "free 7-day sovereign trial · no card · drop ✦ in thread if you want a token",
  },
  {
    agent: "AUREUS",
    copy: "1.04B AED under sovereign command · B.L.A.S.T. pays for itself inside 4 days · proof on request",
  },
  {
    agent: "KHAN",
    copy: "sovereign swarm just closed a DXB luxury deal on autopilot — happy to walk the first 5 responders through the pipeline",
  },
];

function pickHook() {
  return HOOKS[Math.floor(Math.random() * HOOKS.length)];
}

export async function POST(req: NextRequest) {
  let body: { community?: string; brain?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const community = body.community || "global";
  const brain = body.brain || "gemma";
  const hook = pickHook();

  const event = {
    id: `seed-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    ts: new Date().toISOString(),
    community,
    brain,
    agent: hook.agent,
    copy: hook.copy,
    status: "dispatched",
  };

  // TODO: persist to growth ledger (sqlite / supabase) and fan out to real providers
  // when DISCORD_BOT_TOKEN / TELEGRAM_BOT_TOKEN / META_GRAPH_TOKEN are set.

  return NextResponse.json(event);
}

export async function GET() {
  return NextResponse.json({ hooks: HOOKS.length, agents: HOOKS.map((h) => h.agent) });
}
