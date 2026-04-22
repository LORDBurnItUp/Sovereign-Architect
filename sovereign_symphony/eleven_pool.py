"""ElevenLabs multi-key rotator.

Reads every `ELEVENLABS_API_KEY=` line from .env directly so duplicate
variable names (all 10 keys share the same name) are all captured
round-robin for rotation. Calls the REST API via aiohttp — no SDK
dependency.
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
from pathlib import Path
from typing import List, Optional

import aiohttp

logger = logging.getLogger(__name__)


def _env_path() -> Path:
    explicit = os.getenv("SOVEREIGN_ENV_PATH")
    if explicit and Path(explicit).exists():
        return Path(explicit)
    here = Path(__file__).resolve()
    for p in [here.parent.parent / ".env", Path.cwd() / ".env"]:
        if p.exists():
            return p
    return here.parent.parent / ".env"


_KEY_LINE = re.compile(r"^\s*ELEVENLABS_API_KEY\s*=\s*(\S+)\s*$")


def load_all_keys() -> List[str]:
    """Return every ELEVENLABS_API_KEY value in .env (dedup, order-preserved)."""
    path = _env_path()
    if not path.exists():
        logger.warning("eleven_pool: .env not found at %s", path)
        return []
    seen: set[str] = set()
    keys: List[str] = []
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        m = _KEY_LINE.match(line)
        if not m:
            continue
        val = m.group(1).strip()
        if val and val not in seen:
            seen.add(val)
            keys.append(val)
    return keys


class ElevenLabsPool:
    """Round-robin TTS across a pool of ElevenLabs keys.

    Each call uses the next key; on 401/429, the key is suspended for the
    cooldown window and the next key is tried. Returns the MP3 bytes.
    """

    BASE_URL = "https://api.elevenlabs.io/v1"
    COOLDOWN_SECONDS = 600  # 10 min when a key 429s or 401s

    def __init__(
        self,
        keys: Optional[List[str]] = None,
        model_id: str = "eleven_turbo_v2_5",
    ):
        self.keys = keys if keys is not None else load_all_keys()
        self.model_id = model_id
        self._idx = 0
        self._lock = asyncio.Lock()
        self._suspended: dict[str, float] = {}  # key -> resume_epoch
        self._account_voices: Optional[List[dict]] = None  # lazy cache
        self._voice_remap: dict[str, str] = {}  # preferred_id -> working_id
        self._paywall_flagged: set[str] = set()  # voice_ids known-paywalled

    async def _ensure_account_voices(self) -> List[dict]:
        if self._account_voices is not None:
            return self._account_voices
        info = await self.list_voices()
        self._account_voices = info.get("voices") or []
        logger.info("eleven_pool: account has %d voices", len(self._account_voices))
        return self._account_voices

    async def _fallback_voice_id(self, preferred: str) -> Optional[str]:
        """Pick a user-available voice_id deterministically by the preferred's hash."""
        if preferred in self._voice_remap:
            return self._voice_remap[preferred]
        voices = await self._ensure_account_voices()
        if not voices:
            return None
        # Prefer non-paywalled voices in the account
        pool = [v["voice_id"] for v in voices if v.get("voice_id") and v["voice_id"] not in self._paywall_flagged]
        if not pool:
            return None
        idx = sum(ord(c) for c in preferred) % len(pool)
        chosen = pool[idx]
        self._voice_remap[preferred] = chosen
        logger.info("eleven_pool: remapped voice %s -> %s (account fallback)", preferred[:8], chosen[:8])
        return chosen

    def __repr__(self) -> str:
        return f"ElevenLabsPool(keys={len(self.keys)}, model={self.model_id})"

    def usable_count(self) -> int:
        now = asyncio.get_event_loop().time()
        return sum(1 for k in self.keys if self._suspended.get(k, 0) <= now)

    async def _next_key(self) -> Optional[str]:
        async with self._lock:
            if not self.keys:
                return None
            now = asyncio.get_event_loop().time()
            attempts = len(self.keys)
            while attempts > 0:
                key = self.keys[self._idx % len(self.keys)]
                self._idx = (self._idx + 1) % len(self.keys)
                if self._suspended.get(key, 0) <= now:
                    return key
                attempts -= 1
            return None

    async def _suspend(self, key: str, reason: str) -> None:
        resume = asyncio.get_event_loop().time() + self.COOLDOWN_SECONDS
        self._suspended[key] = resume
        logger.warning("eleven_pool: suspended key ...%s (%s) for %ds", key[-6:], reason, self.COOLDOWN_SECONDS)

    async def list_voices(self) -> dict:
        """Return voices available on the user's actual ElevenLabs account.

        Useful when default voice IDs return 402 'library voice' errors —
        the user can see what they DO have access to and remap the personas.
        """
        if not self.keys:
            return {"error": "no keys", "voices": []}
        last_err = None
        for key in self.keys[:3]:  # try up to 3 keys, they should share account
            try:
                timeout = aiohttp.ClientTimeout(total=15)
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.get(
                        f"{self.BASE_URL}/voices",
                        headers={"xi-api-key": key, "accept": "application/json"},
                    ) as resp:
                        body = await resp.text()
                        if resp.status == 200:
                            import json as _json
                            data = _json.loads(body)
                            voices = [
                                {
                                    "voice_id": v.get("voice_id"),
                                    "name": v.get("name"),
                                    "category": v.get("category"),
                                    "labels": v.get("labels") or {},
                                }
                                for v in data.get("voices", [])
                            ]
                            return {"count": len(voices), "voices": voices, "queried_with": f"...{key[-6:]}"}
                        last_err = f"{resp.status}: {body[:180]}"
            except Exception as e:  # noqa: BLE001
                last_err = repr(e)
        return {"error": last_err, "voices": []}

    async def synthesize(
        self,
        text: str,
        voice_id: str,
        stability: float = 0.35,
        similarity_boost: float = 0.75,
        style: float = 0.20,
        use_speaker_boost: bool = True,
    ) -> bytes:
        """Return MP3 bytes. Raises RuntimeError if all keys exhausted."""
        if not text.strip():
            raise ValueError("empty text")
        if not self.keys:
            raise RuntimeError("eleven_pool: no API keys loaded (check .env)")

        # If we've already remapped this preferred voice_id (paywall), use the remap
        vid = self._voice_remap.get(voice_id, voice_id)

        async def _attempt(use_vid: str) -> Optional[bytes]:
            payload = {
                "text": text,
                "model_id": self.model_id,
                "voice_settings": {
                    "stability": stability,
                    "similarity_boost": similarity_boost,
                    "style": style,
                    "use_speaker_boost": use_speaker_boost,
                },
            }
            nonlocal_last: Optional[str] = None
            max_attempts = max(len(self.keys), 1)
            paywalled = False
            for _ in range(max_attempts):
                key = await self._next_key()
                if not key:
                    break
                url = f"{self.BASE_URL}/text-to-speech/{use_vid}"
                headers = {"xi-api-key": key, "accept": "audio/mpeg", "content-type": "application/json"}
                try:
                    timeout = aiohttp.ClientTimeout(total=60)
                    async with aiohttp.ClientSession(timeout=timeout) as session:
                        async with session.post(url, json=payload, headers=headers) as resp:
                            if resp.status == 200:
                                return await resp.read()
                            body = await resp.text()
                            if resp.status == 402:
                                paywalled = True
                                nonlocal_last = f"402: {body[:160]}"
                                logger.warning("eleven_pool: 402 paywall on voice %s", use_vid[:8])
                                break  # switching voice, not key
                            if resp.status in (401, 403):
                                await self._suspend(key, f"auth {resp.status}")
                                nonlocal_last = f"auth {resp.status}: {body[:120]}"
                                continue
                            if resp.status == 429:
                                await self._suspend(key, "rate-limited")
                                nonlocal_last = f"429: {body[:120]}"
                                continue
                            nonlocal_last = f"{resp.status}: {body[:200]}"
                            logger.warning("eleven_pool: %s on key ...%s", nonlocal_last, key[-6:])
                except asyncio.TimeoutError:
                    nonlocal_last = "timeout"
                    logger.warning("eleven_pool: timeout on key ...%s", key[-6:])
                except Exception as e:  # noqa: BLE001
                    nonlocal_last = f"exception: {e!r}"
                    logger.exception("eleven_pool: unexpected error on key ...%s", key[-6:])
            if paywalled:
                self._paywall_flagged.add(use_vid)
                raise _PaywallError(nonlocal_last or "402")
            raise RuntimeError(f"eleven_pool: all keys failed — last error: {nonlocal_last}")

        try:
            return await _attempt(vid)
        except _PaywallError:
            fallback = await self._fallback_voice_id(vid)
            if not fallback or fallback == vid:
                raise RuntimeError(
                    f"eleven_pool: voice {vid[:8]} is a paid-plan 'library' voice and no free voice "
                    f"in your account worked as fallback. Either upgrade your ElevenLabs plan or "
                    f"update personas.py DEFAULT_ELEVEN_VOICES with voice IDs from GET /symphony/voices."
                )
            logger.info("eleven_pool: paywall fallback %s -> %s", vid[:8], fallback[:8])
            return await _attempt(fallback)


class _PaywallError(Exception):
    pass


_singleton: Optional[ElevenLabsPool] = None


def get_pool() -> ElevenLabsPool:
    global _singleton
    if _singleton is None:
        _singleton = ElevenLabsPool()
    return _singleton
