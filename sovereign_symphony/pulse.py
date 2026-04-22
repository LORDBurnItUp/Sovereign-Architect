"""Sovereign Pulse — multi-general briefing macros.

Each 'focus' defines a team of generals and a briefing intent. For each
general, we synthesize a 2-3 sentence spoken briefing via the configured
LLM brain (default Groq/Llama), optionally enriched with Grok-scouted X
signals when XAI_API_KEY is present. Briefings are enqueued through the
global SovereignQueue so the War Room stays no-overlap.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Dict, List, Optional

from .grok_scout import scout, ScoutResult
from .llm_brain import Message, brain
from .personas import BY_SLUG, Persona
from .voice_queue import get_queue

logger = logging.getLogger(__name__)


@dataclass
class Focus:
    slug: str
    title: str
    team: List[str]           # persona slugs in speak order
    grok_query: str           # scout query (used if XAI_API_KEY present)
    briefing_intent: str      # high-level briefing purpose passed to each general
    context: str              # shared context block (baseline facts)


PULSE_PLAYBOOK: Dict[str, Focus] = {
    "dubai-blitz": Focus(
        slug="dubai-blitz",
        title="Dubai Blitz · 2026 cooling market · $50 Sovereign intro",
        team=["hermes", "khan", "travis", "aureus", "sentinel", "douglas"],
        grok_query="dubai real estate 2026 secondary market slowdown smaller brokers lead generation",
        briefing_intent=(
            "Give a 2-3 sentence war-room briefing to the Sovereign (operator). "
            "Focus on the Dubai real-estate cooling market split (off-plan strong, "
            "secondary slowing 30%+) and how smaller/mid-tier agencies are a prime "
            "target for the $50 Sovereign Gateway intro."
        ),
        context=(
            "Ground truth for Dubai 2026: off-plan holds ~70-73% share and AED 170-180B Q1 volume; "
            "secondary/resale softened 30-40% YoY in March; mid-market negotiation room 10-20%; "
            "smaller RERA brokers (bottom 20% by volume of ~33k licensed) feeling pipeline pressure. "
            "Offer: $50 flat limited intro for full Sovereign Gateway access (SpaceFall + Terminal + OmniChat + 9 generals + lead-gen swarms)."
        ),
    ),
    "baja-ensenada": Focus(
        slug="baja-ensenada",
        title="Baja · Ensenada off-plan cross-sell",
        team=["khan", "travis", "hermes", "aureus"],
        grok_query="baja california ensenada real estate investment off-plan 2026",
        briefing_intent=(
            "Give a 2-3 sentence war-room briefing on Baja/Ensenada real-estate pipeline "
            "and cross-sell opportunities to Dubai-facing investors."
        ),
        context=(
            "Baja California secondary-home demand persists from US/Canadian buyers; "
            "Ensenada off-plan sees interest as a USD-priced hedge play. Cross-sell angle: "
            "buyers diversifying between Dubai and Baja via the same Sovereign pipeline."
        ),
    ),
    "general": Focus(
        slug="general",
        title="Sovereign General Pulse",
        team=["overlord", "douglas", "hermes", "sentinel"],
        grok_query="b.l.a.s.t. sovereign ai agent swarm real estate lead generation",
        briefing_intent=(
            "Give a 2-3 sentence sovereign status check: where the swarm is focused, "
            "what just shifted, and the single next best move."
        ),
        context=(
            "B.L.A.S.T. Sovereign OS runs a 9-general swarm across comms, intel, ops, acquisition, finance, "
            "strategy, and infrastructure. Operator is ANTIGRAVITY. Node: DXB-01."
        ),
    ),
}


def list_focuses() -> List[dict]:
    return [
        {"slug": f.slug, "title": f.title, "team": f.team}
        for f in PULSE_PLAYBOOK.values()
    ]


async def _compose_briefing(persona: Persona, focus: Focus, scout_data: Optional[ScoutResult], provider: str) -> str:
    """Ask the brain to compose a 2-3 sentence briefing in the general's voice."""
    signals_block = ""
    if scout_data:
        if scout_data.configured and scout_data.signals:
            signals_block = "\n\nLive X intel (scout):\n- " + "\n- ".join(scout_data.signals[:5])
        elif not scout_data.configured and scout_data.signals:
            signals_block = "\n\nBaseline intel (no live X key yet):\n- " + "\n- ".join(scout_data.signals[:5])

    system = (
        f"You are {persona.display_name} — {persona.rank} of {persona.division}. "
        f"{persona.system_prompt}\n\n"
        f"Voice: {persona.style}. Speak out loud — this will be converted to speech. "
        "Write only what you SAY (no stage directions, no markdown, no bullet points). "
        "2-3 sentences. Crisp. No filler words. Address the Sovereign directly."
    )
    user = (
        f"Pulse focus: {focus.title}\n"
        f"Intent: {focus.briefing_intent}\n\n"
        f"Context: {focus.context}"
        f"{signals_block}\n\n"
        f"Deliver your briefing now, in-character."
    )

    try:
        reply = await brain(
            provider,
            [Message(role="system", content=system), Message(role="user", content=user)],
            max_tokens=220,
            temperature=0.75,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning("pulse: brain failed for %s — using deterministic fallback (%s)", persona.slug, e)
        reply = (
            f"{persona.display_name} reporting. {focus.title} is active. "
            f"{focus.context.split('.')[0]}. Awaiting orders."
        )

    # Strip common wrappers the LLM may add
    for prefix in (f"{persona.display_name}:", f"{persona.display_name.title()}:"):
        if reply.startswith(prefix):
            reply = reply[len(prefix):].strip()
    return reply.strip().strip('"').strip("'")


async def fire_pulse(
    focus_slug: str,
    channel_id: int,
    guild_id: Optional[int] = None,
    brain_provider: str = "auto",
    generals_override: Optional[List[str]] = None,
) -> dict:
    """Generate briefings + enqueue them in order. Returns dispatch summary."""
    focus = PULSE_PLAYBOOK.get(focus_slug.lower())
    if not focus:
        raise KeyError(f"unknown pulse focus '{focus_slug}' — valid: {', '.join(PULSE_PLAYBOOK)}")

    team_slugs = [s for s in (generals_override or focus.team) if s in BY_SLUG]
    if not team_slugs:
        raise ValueError(f"pulse '{focus_slug}' has no valid generals")

    # Scout once per pulse; share across generals.
    scout_data: Optional[ScoutResult] = None
    try:
        scout_data = await scout(focus.grok_query)
    except Exception:  # noqa: BLE001
        logger.exception("pulse: scout raised")

    # Compose briefings concurrently, enqueue in the team order.
    personas = [BY_SLUG[s] for s in team_slugs]
    tasks = [_compose_briefing(p, focus, scout_data, brain_provider) for p in personas]
    briefings = await asyncio.gather(*tasks, return_exceptions=True)

    queue = get_queue()
    dispatched: List[dict] = []
    for persona, maybe_text in zip(personas, briefings):
        if isinstance(maybe_text, Exception):
            logger.error("pulse: briefing gen failed for %s: %s", persona.slug, maybe_text)
            continue
        text = (maybe_text or "").strip()
        if not text:
            continue
        req_id = await queue.enqueue(
            persona,
            text,
            meta={"channel_id": channel_id, "guild_id": guild_id, "pulse": focus.slug},
        )
        dispatched.append({"id": req_id, "general": persona.slug, "text": text})

    return {
        "focus": focus.slug,
        "title": focus.title,
        "team": team_slugs,
        "dispatched": dispatched,
        "scout": {
            "configured": bool(scout_data and scout_data.configured),
            "summary": scout_data.summary if scout_data else "",
            "error": scout_data.error if scout_data else None,
        },
        "brain": brain_provider,
        "queue_depth_after": queue.status()["depth"],
    }
