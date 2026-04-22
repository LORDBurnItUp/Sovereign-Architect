"""
SOVEREIGN CITADEL — GROWTH ENGINE
================================================================================
The marketing swarm. Generates three asset classes and routes each to its
own Citadel channel:

  • Case studies  → #🏆-case-studies   (before/after proof of automation)
  • Viral hooks   → #🔥-viral-lab      (X/IG/TikTok scripts + hooks)
  • Tool promos   → #📈-growth-strategy (plan-of-attack posts)
  • Outreach      → #🤝-outreach-log   (who the bots are pitching)

The engine works in two modes:
  1. Deterministic template mode (always available — zero deps)
  2. LLM mode (Ollama / OpenRouter) if a generator is attached via
     GrowthEngine.use_generator(callable)
================================================================================
"""

from __future__ import annotations

import logging
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from tools.communication_payload import (
    post_case_study,
    post_growth_strategy,
    post_outreach,
    post_viral_drop,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# ASSET TEMPLATES (deterministic fallbacks)
# ---------------------------------------------------------------------------

VIRAL_HOOKS = [
    "We fired the marketing team. Now a swarm of AI agents runs the ads, writes the copy, and closes the leads. Revenue is up {pct}%.",
    "This bot just booked {count} qualified calls in {hours}h. No humans touched the funnel.",
    "Most founders are still cold-emailing. We have agents dogfight-optimizing subject lines at 3am.",
    "Your competitors are posting on LinkedIn. Mine are scraping LinkedIn and closing deals while I sleep.",
    "Built a Sovereign OS. It sends emails, schedules posts, and archives leads to the cloud — on autopilot.",
]

TOOL_PROMOS = [
    "Plan of Attack — Week {week}: deploy Hunter to {vertical}, Herald to {platform}, Auditor to track ROI in real time.",
    "Sovereign OS Phase {phase}: 6 Generals, 1 Overlord, full Discord command layer. Target acquisition: {vertical}.",
    "Citadel v4 drops today. Multi-channel Discord routing + Google Drive auto-backup + dedup’d lead pipeline.",
]

CASE_STUDY_TEMPLATE = (
    "**BEFORE:** {client} was spending {before_hours}h/wk on lead prospecting with "
    "{before_leads} qualified leads.\n"
    "**AFTER:** Sovereign OS deployed — {after_leads} leads in {after_hours}h. "
    "ROI: **{roi}x** in {days} days."
)

OUTREACH_SCRIPT = (
    "Pitching **{target}** ({channel}).\n"
    "Angle: {angle}\n"
    "Offer: {offer}"
)


# ---------------------------------------------------------------------------
# DATA MODEL
# ---------------------------------------------------------------------------

@dataclass
class MarketingAsset:
    kind:      str   # "viral_hook" | "tool_promo" | "case_study" | "outreach"
    content:   str
    agent:     str   # posting general
    metadata:  Dict[str, Any]
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# GROWTH ENGINE
# ---------------------------------------------------------------------------

GeneratorFn = Callable[[str, Dict[str, Any]], str]


class GrowthEngine:
    """Generates marketing assets and ships them to the Growth Engine channels."""

    def __init__(self, generator: Optional[GeneratorFn] = None):
        self._generator = generator
        self.asset_log: List[MarketingAsset] = []

    # Optional LLM plug-in: pass a callable that takes (prompt, context) -> str
    def use_generator(self, generator: GeneratorFn) -> None:
        self._generator = generator

    # -- generation primitives --------------------------------------------

    def _render(self, template: str, context: Dict[str, Any]) -> str:
        if self._generator:
            try:
                return self._generator(template, context)
            except Exception as e:
                logger.warning("[GrowthEngine] LLM generator failed — falling back: %s", e)
        try:
            return template.format(**context)
        except KeyError:
            return template  # missing placeholder — ship the raw line

    def generate_viral_hook(self, context: Optional[Dict[str, Any]] = None) -> MarketingAsset:
        ctx = {"pct": 312, "count": 47, "hours": 6, **(context or {})}
        template = random.choice(VIRAL_HOOKS)
        return MarketingAsset(kind="viral_hook", content=self._render(template, ctx),
                              agent="herald", metadata=ctx)

    def generate_tool_promo(self, context: Optional[Dict[str, Any]] = None) -> MarketingAsset:
        ctx = {"week": 1, "phase": "II", "vertical": "high-ticket coaching",
               "platform": "X/LinkedIn", **(context or {})}
        template = random.choice(TOOL_PROMOS)
        return MarketingAsset(kind="tool_promo", content=self._render(template, ctx),
                              agent="khan", metadata=ctx)

    def generate_case_study(self, context: Optional[Dict[str, Any]] = None) -> MarketingAsset:
        ctx = {"client": "Palm Jumeirah Holdings", "before_hours": 20, "before_leads": 3,
               "after_hours": 4, "after_leads": 41, "roi": 12, "days": 7,
               **(context or {})}
        return MarketingAsset(kind="case_study", content=self._render(CASE_STUDY_TEMPLATE, ctx),
                              agent="auditor", metadata=ctx)

    def generate_outreach(self, target: str, channel: str,
                          angle: str, offer: str) -> MarketingAsset:
        ctx = {"target": target, "channel": channel, "angle": angle, "offer": offer}
        return MarketingAsset(kind="outreach", content=self._render(OUTREACH_SCRIPT, ctx),
                              agent="hermes", metadata=ctx)

    # -- dispatch ----------------------------------------------------------

    def post(self, asset: MarketingAsset) -> Dict[str, Any]:
        """Route a generated asset to its correct Citadel channel."""
        dispatcher = {
            "viral_hook": post_viral_drop,
            "tool_promo": post_growth_strategy,
            "case_study": post_case_study,
            "outreach":   post_outreach,
        }.get(asset.kind)

        if dispatcher is None:
            return {"status": "error", "reason": f"unknown asset kind '{asset.kind}'"}

        result = dispatcher(asset.content, agent=asset.agent)
        self.asset_log.append(asset)
        if len(self.asset_log) > 500:
            self.asset_log.pop(0)
        return {"asset": asset.kind, "agent": asset.agent, "dispatch": result}

    # -- batch orchestration ----------------------------------------------

    def run_promotion_cycle(self, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        One full pass: a viral hook + a tool promo + a case study.
        Called by the brain router when Promoter mode is active.
        """
        context = context or {}
        results = []
        for asset in (
            self.generate_viral_hook(context),
            self.generate_tool_promo(context),
            self.generate_case_study(context),
        ):
            results.append(self.post(asset))
        return results


# ---------------------------------------------------------------------------
# SINGLETON
# ---------------------------------------------------------------------------

_engine: Optional[GrowthEngine] = None


def get_growth_engine() -> GrowthEngine:
    global _engine
    if _engine is None:
        _engine = GrowthEngine()
    return _engine


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    engine = get_growth_engine()
    cycle = engine.run_promotion_cycle()
    for r in cycle:
        print(r)
