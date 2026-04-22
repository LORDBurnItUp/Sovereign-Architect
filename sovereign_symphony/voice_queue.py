"""Global sovereign speak queue.

One speaker at a time across all 9 bots. Requests land on the queue;
a single worker drains them serially. The persona (and the speak fn
it was bound to) are captured in the item.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from typing import Awaitable, Callable, Optional

from .personas import Persona

logger = logging.getLogger(__name__)


SpeakFn = Callable[[Persona, str, dict], Awaitable[None]]


@dataclass
class SpeakRequest:
    persona: Persona
    text: str
    meta: dict = field(default_factory=dict)
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:10])
    enqueued_at: float = field(default_factory=lambda: asyncio.get_event_loop().time())


class SovereignQueue:
    """Global FIFO queue. Serialized. No overlap, ever."""

    def __init__(self) -> None:
        self._queue: asyncio.Queue[SpeakRequest] = asyncio.Queue()
        self._worker_task: Optional[asyncio.Task] = None
        self._speak_fn: Optional[SpeakFn] = None
        self._current: Optional[SpeakRequest] = None
        self._history: list[dict] = []  # completed request summaries (bounded 200)

    def bind(self, speak_fn: SpeakFn) -> None:
        """Bind the function that actually produces + ships the audio."""
        self._speak_fn = speak_fn

    async def start(self) -> None:
        if self._worker_task is None or self._worker_task.done():
            self._worker_task = asyncio.create_task(self._worker(), name="sovereign_queue_worker")
            logger.info("sovereign_queue: worker started")

    async def stop(self) -> None:
        if self._worker_task and not self._worker_task.done():
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
            self._worker_task = None

    async def enqueue(self, persona: Persona, text: str, meta: Optional[dict] = None) -> str:
        req = SpeakRequest(persona=persona, text=text, meta=meta or {})
        await self._queue.put(req)
        logger.info("sovereign_queue: +%s %s: %r (depth=%d)", req.id, persona.slug, text[:60], self._queue.qsize())
        return req.id

    def status(self) -> dict:
        return {
            "depth": self._queue.qsize(),
            "current": {
                "id": self._current.id,
                "general": self._current.persona.slug,
                "text": self._current.text[:120],
            } if self._current else None,
            "history": list(self._history[-20:]),
        }

    async def _worker(self) -> None:
        logger.info("sovereign_queue: worker loop entering")
        while True:
            try:
                req = await self._queue.get()
            except asyncio.CancelledError:
                logger.info("sovereign_queue: worker cancelled")
                raise
            self._current = req
            t0 = asyncio.get_event_loop().time()
            status = "ok"
            err: Optional[str] = None
            try:
                if not self._speak_fn:
                    raise RuntimeError("sovereign_queue: no speak_fn bound")
                await self._speak_fn(req.persona, req.text, req.meta)
            except Exception as e:  # noqa: BLE001
                status = "err"
                err = repr(e)
                logger.exception("sovereign_queue: speak failed for %s (%s)", req.id, req.persona.slug)
            finally:
                dt = asyncio.get_event_loop().time() - t0
                self._history.append({
                    "id": req.id,
                    "general": req.persona.slug,
                    "text": req.text[:120],
                    "status": status,
                    "err": err,
                    "duration_s": round(dt, 3),
                })
                if len(self._history) > 200:
                    self._history = self._history[-200:]
                self._current = None
                self._queue.task_done()


_singleton: Optional[SovereignQueue] = None


def get_queue() -> SovereignQueue:
    global _singleton
    if _singleton is None:
        _singleton = SovereignQueue()
    return _singleton
