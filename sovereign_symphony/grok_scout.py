"""Grok (xAI) scouting client.

Uses Grok's native search/tool capabilities when XAI_API_KEY is present.
Returns structured results for downstream generals to quote.

Falls back to a curated 2026 Dubai/Baja real-estate briefing when key is
absent — explicitly flagged as `configured: false` so the UI can show a
banner prompting the user to add XAI_API_KEY.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from typing import Optional

import aiohttp

logger = logging.getLogger(__name__)


# Baked fallback intel — honest static facts while waiting for XAI_API_KEY.
# These reflect the framing user supplied for the 2026 Dubai market.
DUBAI_RE_BASELINE = {
    "topline": "Dubai 2026 is splitting: off-plan still accounts for ~70-73% of transactions while secondary/resale slows.",
    "signals": [
        "Q1 2026 off-plan sales held near AED 170-180B range; secondary market volume softened 30-40% YoY in March.",
        "Smaller RERA brokers reporting thinner walk-ins and longer time-to-close in secondary.",
        "Mid-market price flexibility opening — 10-20% negotiation room in ready/resale stock in select communities.",
        "Geopolitical jitters + supply wave are compressing margins at the low/mid tier.",
    ],
    "opportunity": "Struggling mid-tier agencies need cheap, fast lead-gen + content tools NOW. $50 intro is asymmetric against their pain.",
    "targets_shape": "DLD lists ~33k RERA-licensed brokers; target bottom-volume 20% via public directories (propsearch, yellowpages-uae) — no scraping, public listings only.",
}


@dataclass
class ScoutResult:
    configured: bool
    query: str
    summary: str
    signals: list = field(default_factory=list)
    citations: list = field(default_factory=list)
    raw: Optional[dict] = None
    error: Optional[str] = None


def _key() -> Optional[str]:
    return os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY")


def _fallback(query: str) -> ScoutResult:
    q = query.lower()
    if "dubai" in q or "real estate" in q or "re" in q.split():
        return ScoutResult(
            configured=False,
            query=query,
            summary=DUBAI_RE_BASELINE["topline"],
            signals=DUBAI_RE_BASELINE["signals"] + [DUBAI_RE_BASELINE["opportunity"]],
            error="XAI_API_KEY not set — returning curated baseline instead of live X scout",
        )
    return ScoutResult(
        configured=False,
        query=query,
        summary=f"Grok scouting disabled (no XAI_API_KEY). Query logged: {query!r}",
        signals=[],
        error="XAI_API_KEY not set",
    )


async def scout(query: str, max_tokens: int = 400) -> ScoutResult:
    key = _key()
    if not key:
        return _fallback(query)

    system = (
        "You are a real-time X (Twitter) search analyst for the B.L.A.S.T. Sovereign command. "
        "Use live search grounding to return: "
        "1) a 1-sentence summary, "
        "2) 3-5 concrete signal bullets with numbers/dates/handles if visible, "
        "3) short source citations. "
        "Be concise. Prefer posts from the last 7 days."
    )
    user = f"Scout query: {query}\nReturn JSON with keys: summary, signals (list of strings), citations (list of strings)."

    body = {
        "model": "grok-2-latest",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }

    try:
        timeout = aiohttp.ClientTimeout(total=45)
        async with aiohttp.ClientSession(timeout=timeout) as sess:
            async with sess.post(
                "https://api.x.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                data=json.dumps(body),
            ) as resp:
                text = await resp.text()
                if resp.status >= 400:
                    logger.warning("grok_scout: %s -> %s", resp.status, text[:200])
                    return ScoutResult(
                        configured=True, query=query, summary="", signals=[],
                        error=f"grok api {resp.status}: {text[:200]}",
                    )
                data = json.loads(text)
    except Exception as e:  # noqa: BLE001
        logger.exception("grok_scout: error")
        return ScoutResult(configured=True, query=query, summary="", signals=[], error=repr(e))

    content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "") or ""
    # Try to parse structured JSON
    parsed: dict = {}
    try:
        parsed = json.loads(content)
    except Exception:  # noqa: BLE001
        # tolerate prose — pack as summary
        parsed = {"summary": content.strip(), "signals": [], "citations": []}
    return ScoutResult(
        configured=True,
        query=query,
        summary=str(parsed.get("summary", ""))[:600],
        signals=[str(s) for s in (parsed.get("signals") or [])][:8],
        citations=[str(c) for c in (parsed.get("citations") or [])][:8],
        raw=data,
    )
