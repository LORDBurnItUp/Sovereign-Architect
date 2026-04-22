"""Sovereign Symphony entrypoint.

Runs:
  1. The ElevenLabs pool singleton (loads 10 keys from .env)
  2. BotManager — spawns every GeneralBot whose token is set
  3. SovereignQueue — bound to a `speak` fn that: synth via pool ->
     per-general bot posts with audio -> optionally plays in voice channel
  4. FastAPI on SOVEREIGN_SYMPHONY_PORT (default 5055)
"""

from __future__ import annotations

import asyncio
import logging
import os
import signal
import sys
from pathlib import Path

# Optional: honor .env for convenience if python-dotenv is around
try:
    from dotenv import load_dotenv  # type: ignore

    _env = Path(__file__).resolve().parent.parent / ".env"
    if _env.exists():
        load_dotenv(_env, override=False)
except Exception:  # noqa: BLE001
    pass

import uvicorn

from .bot_manager import FFMPEG_AVAILABLE, get_manager
from .eleven_pool import get_pool
from .personas import Persona
from .symphony_api import create_app
from .voice_queue import get_queue


def _setup_logging() -> None:
    lvl = os.getenv("SOVEREIGN_SYMPHONY_LOG", "INFO").upper()
    logging.basicConfig(
        level=getattr(logging, lvl, logging.INFO),
        format="%(asctime)s %(levelname)-5s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


logger = logging.getLogger("sovereign_symphony")


async def _speak_fn(persona: Persona, text: str, meta: dict) -> None:
    """Synthesize via ElevenLabs pool, then post via the matching bot."""
    pool = get_pool()
    try:
        mp3 = await pool.synthesize(text, voice_id=persona.voice_id)
    except Exception as e:  # noqa: BLE001
        logger.error("speak_fn: tts failed for %s: %s", persona.slug, e)
        mp3 = None  # still post the text even if TTS fails

    bot = get_manager().get(persona.slug)
    channel_id = int(meta.get("channel_id") or 0)
    if not channel_id:
        logger.warning("speak_fn: no channel_id for %s — skipping post", persona.slug)
        return

    await bot.post_with_audio(channel_id=channel_id, text=text, mp3_bytes=mp3)

    voice_channel_id = meta.get("voice_channel_id")
    guild_id = meta.get("guild_id")
    if voice_channel_id and guild_id and mp3 and FFMPEG_AVAILABLE:
        try:
            await bot.play_in_voice(int(guild_id), int(voice_channel_id), mp3)
        except Exception:  # noqa: BLE001
            logger.exception("speak_fn: voice playback failed for %s", persona.slug)


async def _boot() -> None:
    pool = get_pool()
    logger.info("symphony: eleven_pool loaded %d keys", len(pool.keys))
    if not pool.keys:
        logger.error("symphony: no ELEVENLABS_API_KEY entries found in .env — TTS will fail")

    queue = get_queue()
    queue.bind(_speak_fn)
    await queue.start()

    mgr = get_manager()
    results = await mgr.start_all()
    logger.info("symphony: bot spawn = %s", results)

    # Don't block startup on ready — bots log in asynchronously.
    asyncio.create_task(_log_ready(), name="symphony_ready_log")


async def _log_ready() -> None:
    ready_map = await get_manager().wait_ready(timeout=45)
    logger.info("symphony: bots ready = %s", ready_map)


async def _shutdown() -> None:
    logger.info("symphony: shutdown — closing bots + queue")
    try:
        await get_queue().stop()
    except Exception:  # noqa: BLE001
        logger.exception("symphony: queue stop failed")
    try:
        await get_manager().close_all()
    except Exception:  # noqa: BLE001
        logger.exception("symphony: bot close failed")


def run() -> None:
    _setup_logging()
    port = int(os.getenv("SOVEREIGN_SYMPHONY_PORT", "5055"))
    host = os.getenv("SOVEREIGN_SYMPHONY_HOST", "127.0.0.1")

    app = create_app()

    @app.on_event("startup")
    async def _on_startup() -> None:
        await _boot()

    @app.on_event("shutdown")
    async def _on_shutdown() -> None:
        await _shutdown()

    logger.info("symphony: starting uvicorn on %s:%s", host, port)
    uvicorn.run(app, host=host, port=port, log_level=os.getenv("SOVEREIGN_SYMPHONY_LOG", "info").lower())


if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        sys.exit(0)
