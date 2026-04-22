import random
import os
from datetime import datetime
from tools.seo_strategy import generate_seo_metadata

# ── Target Intelligence Database ──────────────────────────────────────────────
LEADS = [
    {
        "name": "Billionaire Tech Founder",
        "entity": "Global Tech Ventures",
        "title": "Chair & Founder",
        "focus": "AI Infrastructure & Productivity",
        "aum": "$50B+",
        "trigger_keywords": ["tech founder", "AI infrastructure", "productivity", "SaaS"],
        "intel": "Expanding global presence. Looking for elite-tier visualization to manage complex operations.",
        "angle": "King Dripping Swag command centers provide the ultimate visibility for high-stakes decision making.",
    },
    {
        "name": "Hedge Fund Principal",
        "entity": "Alpha Quant Group",
        "title": "Managing Partner",
        "focus": "Algorithmic Trading & System Visibility",
        "aum": "$120B+",
        "trigger_keywords": ["hedge fund", "quant", "algorithmic", "trading"],
        "intel": "Scaling data infrastructure. Needs a unified dashboard to monitor real-time AI agents and market sentiment.",
        "angle": "Our dashboard tech turns raw data into a 'billionaire's view' of the global landscape.",
    },
    {
        "name": "Private Equity Titan",
        "entity": "Vertex Holdings",
        "title": "Chairman",
        "focus": "Industrial Automation & AI Integration",
        "aum": "$30B+",
        "trigger_keywords": ["private equity", "automation", "industrial", "integration"],
        "intel": "Acquiring AI-first companies. Desires a master command center to oversee multiple portfolio companies.",
        "angle": "B.L.A.S.T protocol is the master key for diversified billionaire portfolios.",
    },
]

# ── Pitch Templates ────────────────────────────────────────────────────────────
PITCH_TEMPLATES = [
    """SUBJECT: Strategic Intelligence Partnership | King Dripping Swag × {entity}

Dear {name},

We have been tracking {entity}'s moves in {focus}. {intel}

King Dripping Swag is not a typical AI agency. We build the "Billionaire Dashboard" — the ultimate command center for high-stakes visibility.

Our B.L.A.S.T protocol — a six-tier autonomous intelligence architecture — is purpose-built for entities operating at your scale. {angle}

I would like to propose a confidential 20-minute briefing to outline a proprietary dashboard tailored to {entity}'s specific objectives.

No decks. No proposals. Just absolute visibility.

Regards,
King Dripping Swag""",

    """SUBJECT: For {name}'s Eyes Only — {entity} AI Opportunity

{name},

{intel}

This is the opening King Dripping Swag was designed for.

Our systems don't optimize campaigns. They build the cognitive infrastructure that makes optimization irrelevant.

For {entity}'s {focus} mandate, we've identified three strategic leverage points your current stack is missing. I'd share them privately — no strings attached.

One conversation. No obligation.

King Dripping Swag""",

    """SUBJECT: {entity} × King Dripping Swag — Confidential

{name},

Most AI agencies will pitch you automation.
We pitch dominance.

{intel}

{angle}

King Dripping Swag has been retained by principals globally to build proprietary AI systems that do not appear on any vendor list. We operate with discretion.

If {entity}'s {focus} roadmap has gaps our architecture could fill, I'd welcome a private dialogue.

King Dripping Swag Intelligence Division""",
]


def hunt_billionaires(query: str, location: str = "Global", force_lead: str = None) -> dict:
    """
    Identifies elite targets and generates personalized high-ticket pitches.

    Args:
        query: The trigger query from the agent loop
        location: Geographic focus (default: Dubai)
        force_lead: Force a specific entity name for testing
    """
    # ── Select Lead ────────────────────────────────────────────────
    if force_lead:
        lead = next((l for l in LEADS if force_lead.lower() in l["entity"].lower()), None)
        if not lead:
            lead = random.choice(LEADS)
    else:
        # Keyword-matched selection
        matched = [
            l for l in LEADS
            if any(kw.lower() in query.lower() for kw in l["trigger_keywords"])
        ]
        lead = random.choice(matched) if matched else random.choice(LEADS)

    # ── Generate Pitch ─────────────────────────────────────────────
    template = random.choice(PITCH_TEMPLATES)
    pitch = template.format(
        name=lead["name"],
        entity=lead["entity"],
        focus=lead["focus"],
        intel=lead["intel"],
        angle=lead["angle"],
    )

    # ── Pull SEO Hook ──────────────────────────────────────────────
    seo_data = generate_seo_metadata("AI Development Agency", location)
    outreach_hook = seo_data["outreach_hooks"].get(lead["entity"].split("/")[0].strip(), "")

    # ── Build Full Payload ─────────────────────────────────────────
    return {
        "lead": {
            "name": lead["name"],
            "entity": lead["entity"],
            "title": lead["title"],
            "focus": lead["focus"],
            "aum": lead["aum"],
            "intel": lead["intel"],
        },
        "pitch": pitch,
        "outreach_hook": outreach_hook,
        "seo_context": seo_data["title"],
        "generated_at": datetime.now().isoformat(),
        "status": "success",
        "action": "Lead Identified & Pitch Generated",
        "dispatch_ready": True,
    }


def get_all_leads() -> list:
    """Returns the full lead intelligence database."""
    return LEADS


if __name__ == "__main__":
    result = hunt_billionaires("Analyze MGX Fund recent AI data center investments")
    print(f"\n[HUNTER] Target: {result['lead']['name']} ({result['lead']['entity']})")
    print(f"[HUNTER] AUM: {result['lead']['aum']}")
    print(f"[HUNTER] Focus: {result['lead']['focus']}")
    print(f"\n[PITCH PREVIEW]\n{result['pitch'][:300]}...")
    print(f"\n[HUNTER] Dispatch ready: {result['dispatch_ready']}")
