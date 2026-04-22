"""FastAPI surface for the Sovereign Symphony.

Endpoints:
  GET  /symphony/status         — roster + queue + pool diagnostics
  POST /symphony/speak          — { general, text, channel_id?, voice_channel_id?, guild_id? }
  POST /symphony/broadcast      — { text, generals?, channel_id?, stagger_ms? } (queues N, queue serializes)
  POST /symphony/summon         — { general, guild_id, voice_channel_id }
  POST /symphony/disband        — disconnects all voice channels
  GET  /symphony/generals       — persona list (no tokens, no secrets)
"""

from __future__ import annotations

import logging
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .bot_manager import FFMPEG_AVAILABLE, get_manager
from .eleven_pool import get_pool
from .grok_scout import scout as grok_scout
from .llm_brain import provider_status
from .personas import BY_SLUG, PERSONAS, all_slugs
from .pulse import PULSE_PLAYBOOK, fire_pulse, list_focuses
from .voice_queue import get_queue

logger = logging.getLogger(__name__)


DEFAULT_WARROOM_CHANNEL = int(os.getenv("DISCORD_WARROOM_CHANNEL_ID", "0") or 0)
DEFAULT_GUILD_ID = int(os.getenv("DISCORD_SERVER_ID", "0") or 0)


class SpeakBody(BaseModel):
    general: str
    text: str = Field(min_length=1, max_length=2000)
    channel_id: Optional[int] = None
    voice_channel_id: Optional[int] = None
    guild_id: Optional[int] = None


class BroadcastBody(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    generals: Optional[List[str]] = None  # subset; default = all live
    channel_id: Optional[int] = None


class SummonBody(BaseModel):
    general: str
    guild_id: int
    voice_channel_id: int


class PulseBody(BaseModel):
    focus: str = "dubai-blitz"
    channel_id: Optional[int] = None
    guild_id: Optional[int] = None
    brain: str = "auto"
    generals: Optional[List[str]] = None


class GrokScoutBody(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    max_tokens: int = 400


def create_app() -> FastAPI:
    app = FastAPI(title="Sovereign Symphony")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/symphony/status")
    async def status():
        q = get_queue().status()
        roster = get_manager().roster()
        pool = get_pool()
        return {
            "roster": roster,
            "queue": q,
            "eleven_pool": {
                "keys_total": len(pool.keys),
                "keys_usable": pool.usable_count(),
                "model": pool.model_id,
            },
            "ffmpeg": FFMPEG_AVAILABLE,
            "defaults": {
                "guild_id": DEFAULT_GUILD_ID,
                "warroom_channel_id": DEFAULT_WARROOM_CHANNEL,
            },
        }

    @app.get("/symphony/generals")
    async def generals():
        return {
            "count": len(PERSONAS),
            "generals": [
                {
                    "slug": p.slug,
                    "display_name": p.display_name,
                    "rank": p.rank,
                    "division": p.division,
                    "style": p.style,
                    "color": f"#{p.color:06X}",
                }
                for p in PERSONAS
            ],
        }

    @app.post("/symphony/speak")
    async def speak(body: SpeakBody):
        slug = body.general.lower()
        if slug not in BY_SLUG:
            raise HTTPException(400, f"unknown general '{body.general}' — valid: {', '.join(all_slugs())}")
        persona = BY_SLUG[slug]

        mgr = get_manager()
        try:
            _ = mgr.get(slug)
        except KeyError:
            raise HTTPException(503, f"general '{slug}' has no live bot — token missing or login failed")

        channel_id = body.channel_id or DEFAULT_WARROOM_CHANNEL
        if not channel_id:
            raise HTTPException(400, "channel_id required (or set DISCORD_WARROOM_CHANNEL_ID in .env)")

        req_id = await get_queue().enqueue(
            persona,
            body.text,
            meta={
                "channel_id": channel_id,
                "voice_channel_id": body.voice_channel_id,
                "guild_id": body.guild_id or DEFAULT_GUILD_ID,
            },
        )
        return {"queued": True, "id": req_id, "general": slug, "depth": get_queue().status()["depth"]}

    @app.post("/symphony/broadcast")
    async def broadcast(body: BroadcastBody):
        mgr = get_manager()
        live_slugs = [b["slug"] for b in mgr.roster()["live"]]
        targets = body.generals or live_slugs
        targets = [s for s in targets if s in live_slugs]
        if not targets:
            raise HTTPException(503, "no live generals to broadcast")

        channel_id = body.channel_id or DEFAULT_WARROOM_CHANNEL
        if not channel_id:
            raise HTTPException(400, "channel_id required (or set DISCORD_WARROOM_CHANNEL_ID in .env)")

        ids: List[str] = []
        for slug in targets:
            persona = BY_SLUG[slug]
            ids.append(
                await get_queue().enqueue(
                    persona,
                    body.text,
                    meta={"channel_id": channel_id, "guild_id": DEFAULT_GUILD_ID},
                )
            )
        return {"queued": True, "ids": ids, "targets": targets, "depth": get_queue().status()["depth"]}

    @app.post("/symphony/summon")
    async def summon(body: SummonBody):
        if not FFMPEG_AVAILABLE:
            raise HTTPException(
                503,
                "ffmpeg not on PATH — voice-channel playback disabled. Install with: winget install ffmpeg",
            )
        slug = body.general.lower()
        try:
            bot = get_manager().get(slug)
        except KeyError:
            raise HTTPException(503, f"general '{slug}' has no live bot")
        # A silent tick so the bot actually joins the channel without audio.
        # Real audio arrives via /speak with voice_channel_id.
        from .personas import get as get_persona
        persona = get_persona(slug)
        # Send a 1-frame silent MP3? Simpler: just connect.
        guild = bot.get_guild(body.guild_id)
        if not guild:
            raise HTTPException(404, f"guild {body.guild_id} not found for {slug}")
        channel = guild.get_channel(body.voice_channel_id)
        if channel is None or channel.type.name != "voice":
            raise HTTPException(404, f"voice channel {body.voice_channel_id} not found for {slug}")
        try:
            vc = await channel.connect(timeout=10.0, reconnect=True)
            bot._voice[body.guild_id] = vc
        except Exception as e:  # noqa: BLE001
            raise HTTPException(500, f"summon failed: {e!r}")
        return {"summoned": slug, "guild_id": body.guild_id, "voice_channel_id": body.voice_channel_id}

    @app.post("/symphony/disband")
    async def disband():
        mgr = get_manager()
        for _, bot in mgr.bots.items():
            await bot.voice_disconnect_all()
        return {"disbanded": True}

    @app.get("/symphony/pulses")
    async def pulses():
        return {"focuses": list_focuses(), "brains": provider_status()}

    @app.post("/symphony/pulse")
    async def pulse(body: PulseBody):
        focus = body.focus.lower()
        if focus not in PULSE_PLAYBOOK:
            raise HTTPException(400, f"unknown focus '{body.focus}' — valid: {', '.join(PULSE_PLAYBOOK)}")
        mgr = get_manager()
        live_slugs = {b["slug"] for b in mgr.roster()["live"]}
        team = [s for s in (body.generals or PULSE_PLAYBOOK[focus].team) if s in live_slugs]
        if not team:
            raise HTTPException(503, "no live generals available for this pulse — check /symphony/status")

        channel_id = body.channel_id or DEFAULT_WARROOM_CHANNEL
        if not channel_id:
            raise HTTPException(400, "channel_id required (or set DISCORD_WARROOM_CHANNEL_ID in .env)")

        try:
            result = await fire_pulse(
                focus,
                channel_id=channel_id,
                guild_id=body.guild_id or DEFAULT_GUILD_ID,
                brain_provider=body.brain,
                generals_override=team,
            )
        except Exception as e:  # noqa: BLE001
            logger.exception("pulse failed")
            raise HTTPException(500, f"pulse failed: {e!r}")
        return result

    @app.post("/symphony/grok-scout")
    async def grok_scout_endpoint(body: GrokScoutBody):
        result = await grok_scout(body.query, max_tokens=body.max_tokens)
        return {
            "configured": result.configured,
            "query": result.query,
            "summary": result.summary,
            "signals": result.signals,
            "citations": result.citations,
            "error": result.error,
        }

    @app.get("/symphony/voices")
    async def voices():
        """Lists voices actually available on the ElevenLabs account behind your keys."""
        return await get_pool().list_voices()

    return app
