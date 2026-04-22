"""Manages a fleet of discord.py bots — one per general.

Each bot logs in with its own token, exposing its own Discord identity
(name, avatar, presence). The global SovereignQueue serializes speaking
so no two generals talk over each other. Per-bot actions:

  - post_with_audio(channel_id, text, mp3_bytes) — standard path,
    no ffmpeg required. Posts text + attached MP3.
  - play_in_voice(guild_id, channel_id, mp3_bytes) — voice-channel
    playback if ffmpeg is on the system PATH. Silently skipped otherwise.
"""

from __future__ import annotations

import asyncio
import io
import logging
import os
import shutil
import tempfile
from pathlib import Path
from typing import Dict, Optional

import discord

from .personas import PERSONAS, Persona

logger = logging.getLogger(__name__)


FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None
if not FFMPEG_AVAILABLE:
    logger.warning("bot_manager: ffmpeg NOT found — voice-channel playback disabled; MP3 attachment mode will still work")


class GeneralBot(discord.Client):
    def __init__(self, persona: Persona, *args, **kwargs):
        # Default intents only — this bot posts embeds + files, it does NOT read
        # user messages. Adding message_content here would force every bot to
        # have the Message Content privileged intent enabled in the Discord
        # Developer Portal, and any bot that doesn't has its session invalidated
        # during IDENTIFY (Shard ID None session has been invalidated).
        intents = discord.Intents.default()
        intents.voice_states = True
        intents.guilds = True
        super().__init__(intents=intents, *args, **kwargs)
        self.persona = persona
        self._ready = asyncio.Event()
        self._voice: Dict[int, discord.VoiceClient] = {}  # guild_id -> vc

    async def on_ready(self) -> None:
        logger.info("bot[%s]: logged in as %s (id=%s)", self.persona.slug, self.user, self.user.id if self.user else "?")
        try:
            await self.change_presence(
                activity=discord.Activity(
                    type=discord.ActivityType.watching,
                    name=f"the sovereign command · {self.persona.division}",
                )
            )
        except Exception:  # noqa: BLE001
            logger.exception("bot[%s]: could not set presence", self.persona.slug)
        self._ready.set()

    async def wait_ready(self, timeout: float = 30.0) -> bool:
        try:
            await asyncio.wait_for(self._ready.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            return False

    async def post_with_audio(
        self,
        channel_id: int,
        text: str,
        mp3_bytes: Optional[bytes],
    ) -> None:
        """Post styled message + (optional) MP3 attachment to a text channel."""
        channel = self.get_channel(channel_id) or await self.fetch_channel(channel_id)
        if channel is None:
            raise RuntimeError(f"bot[{self.persona.slug}]: channel {channel_id} not found")

        embed = discord.Embed(
            description=text,
            color=self.persona.color,
        )
        embed.set_author(
            name=f"{self.persona.display_name}  ·  {self.persona.rank}",
        )
        embed.set_footer(text=f"division: {self.persona.division}  ·  sovereign symphony")

        file = None
        if mp3_bytes:
            file = discord.File(
                fp=io.BytesIO(mp3_bytes),
                filename=f"{self.persona.slug}.mp3",
            )

        await channel.send(embed=embed, file=file)

    async def play_in_voice(
        self,
        guild_id: int,
        channel_id: int,
        mp3_bytes: bytes,
    ) -> None:
        """Join voice channel, play audio, disconnect."""
        if not FFMPEG_AVAILABLE:
            logger.debug("bot[%s]: ffmpeg unavailable, skipping voice playback", self.persona.slug)
            return
        guild = self.get_guild(guild_id)
        if not guild:
            logger.warning("bot[%s]: guild %s not found", self.persona.slug, guild_id)
            return
        channel = guild.get_channel(channel_id)
        if not isinstance(channel, discord.VoiceChannel):
            logger.warning("bot[%s]: %s is not a voice channel", self.persona.slug, channel_id)
            return

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp.write(mp3_bytes)
            tmp_path = Path(tmp.name)

        try:
            vc = self._voice.get(guild_id)
            if vc is None or not vc.is_connected():
                vc = await channel.connect(timeout=10.0, reconnect=True)
                self._voice[guild_id] = vc
            elif vc.channel.id != channel_id:
                await vc.move_to(channel)

            done = asyncio.Event()
            def _after(_err):
                self.loop.call_soon_threadsafe(done.set)

            source = discord.FFmpegPCMAudio(str(tmp_path))
            vc.play(source, after=_after)
            await done.wait()
        finally:
            try:
                tmp_path.unlink()
            except Exception:  # noqa: BLE001
                pass

    async def voice_disconnect_all(self) -> None:
        for vc in list(self._voice.values()):
            try:
                await vc.disconnect(force=True)
            except Exception:  # noqa: BLE001
                logger.exception("bot[%s]: voice disconnect failed", self.persona.slug)
        self._voice.clear()


class BotManager:
    def __init__(self) -> None:
        self.bots: Dict[str, GeneralBot] = {}
        self._tasks: Dict[str, asyncio.Task] = {}
        self._missing_tokens: list[str] = []

    async def start_all(self) -> Dict[str, bool]:
        """Start every persona whose token env var is set. Returns slug->started."""
        results: Dict[str, bool] = {}
        for p in PERSONAS:
            token = os.getenv(p.token_env, "").strip()
            if not token:
                self._missing_tokens.append(p.token_env)
                results[p.slug] = False
                logger.warning("bot_manager: %s has no token (%s)", p.slug, p.token_env)
                continue

            bot = GeneralBot(p)
            self.bots[p.slug] = bot
            task = asyncio.create_task(bot.start(token), name=f"bot:{p.slug}")
            self._tasks[p.slug] = task
            results[p.slug] = True
        return results

    async def wait_ready(self, timeout: float = 30.0) -> Dict[str, bool]:
        return {
            slug: await bot.wait_ready(timeout=timeout)
            for slug, bot in self.bots.items()
        }

    async def close_all(self) -> None:
        for slug, bot in list(self.bots.items()):
            try:
                await bot.voice_disconnect_all()
            except Exception:  # noqa: BLE001
                logger.exception("bot_manager: disconnect failed for %s", slug)
            try:
                await bot.close()
            except Exception:  # noqa: BLE001
                logger.exception("bot_manager: close failed for %s", slug)
        for task in self._tasks.values():
            if not task.done():
                task.cancel()
        self.bots.clear()
        self._tasks.clear()

    def get(self, slug: str) -> GeneralBot:
        bot = self.bots.get(slug)
        if not bot:
            raise KeyError(f"bot_manager: no live bot for '{slug}'")
        return bot

    def roster(self) -> dict:
        return {
            "live": [
                {
                    "slug": slug,
                    "display_name": bot.persona.display_name,
                    "rank": bot.persona.rank,
                    "division": bot.persona.division,
                    "ready": bot._ready.is_set(),
                    "user": str(bot.user) if bot.user else None,
                }
                for slug, bot in self.bots.items()
            ],
            "missing_tokens": self._missing_tokens,
            "ffmpeg": FFMPEG_AVAILABLE,
        }


_singleton: Optional[BotManager] = None


def get_manager() -> BotManager:
    global _singleton
    if _singleton is None:
        _singleton = BotManager()
    return _singleton
