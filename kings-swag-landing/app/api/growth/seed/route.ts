import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Hook = { agent: string; copy: string };

const DUBAI_INTRO_HOOKS: Hook[] = [
  {
    agent: "HERMES",
    copy: "◈ Dubai brokers — 2026 secondary market softened 30-40%+ · $50 flat Sovereign Gateway intro (limited 72h) · 9-general AI swarm runs your comms 24/7 · reply for beta token.",
  },
  {
    agent: "KHAN",
    copy: "◈ Struggling small/mid-tier DXB agency? $50 and you get our full sovereign war room — lead hunt, cold outreach drafts, ad copy on tap. drop ✦ to claim.",
  },
  {
    agent: "TRAVIS",
    copy: "◈ Sovereign 7-day $50 intro · no card needed for the beta · first 50 Dubai agencies get full dashboard access · drop ✦ and I issue the token now.",
  },
  {
    agent: "AUREUS",
    copy: "◈ Dubai Q1 2026: off-plan held ~AED 170-180B but secondary dropped 30-49% in March · $50 intro pays back in under a week · proof + audit on request.",
  },
  {
    agent: "SENTINEL",
    copy: "◈ Intel: supply wave + regional jitters compressing mid-tier Dubai margins. The swarm surfaces distressed deal signals nightly. $50 intro · drop ✦.",
  },
  {
    agent: "DOUGLAS",
    copy: "◈ B.L.A.S.T. ran 11 swarm nodes last week · +AED 2.4M pipeline for 7 smaller DXB brokers · $50 flat intro — drop ✦ for a 7-day sovereign beta key.",
  },
];

const GENERIC_HOOKS: Hook[] = [
  { agent: "HERMES", copy: "◈ just surfaced 3 off-market Palm Jumeirah units — brokers don't have these yet. sovereign beta holders got first look." },
  { agent: "DOUGLAS", copy: "running 11 swarm nodes 24/7 · +AED 2.4M pipeline last week · drop ✦ for the sovereign beta key" },
  { agent: "SENTINEL", copy: "intel drop: 7 new HNW leads in the MENA vault tonight — first 3 responders get the proof-of-work dashboard free." },
  { agent: "TRAVIS", copy: "free 7-day sovereign trial · no card · drop ✦ in thread if you want a token" },
  { agent: "AUREUS", copy: "1.04B AED under sovereign command · B.L.A.S.T. pays for itself inside 4 days · proof on request" },
  { agent: "KHAN", copy: "sovereign swarm just closed a DXB luxury deal on autopilot — happy to walk the first 5 responders through the pipeline" },
];

function pickHook(offer: string): Hook {
  const pool = offer.startsWith("dubai") || offer.includes("50usd") ? DUBAI_INTRO_HOOKS : GENERIC_HOOKS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST(req: NextRequest) {
  let body: { community?: string; brain?: string; offer?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const community = body.community || "global";
  const brain = body.brain || "groq";
  const offer = body.offer || "generic";
  const hook = pickHook(offer);

  const event = {
    id: `seed-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    ts: new Date().toISOString(),
    community,
    brain,
    offer,
    agent: hook.agent,
    copy: hook.copy,
    status: "dispatched",
  };
  return NextResponse.json(event);
}

export async function GET() {
  return NextResponse.json({
    dubai_hooks: DUBAI_INTRO_HOOKS.length,
    generic_hooks: GENERIC_HOOKS.length,
    agents: Array.from(new Set([...DUBAI_INTRO_HOOKS, ...GENERIC_HOOKS].map((h) => h.agent))),
  });
}
