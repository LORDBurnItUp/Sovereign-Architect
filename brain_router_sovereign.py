"""
SOVEREIGN OS BRAIN ROUTER
================================================================================
Hierarchical command architecture (Discord-native, Telegram decommissioned):
  OVERLORD (AgentZero) → HIGH COMMAND (2x OpenClaw) → 6 GENERALS (Commanders)

Every node carries:
  - discord_token_env : the .env key that holds its distinct Discord bot token
  - voice_id          : ElevenLabs voice profile for War Room TTS
  - last_heartbeat    : timestamp used by AutoHealbot to detect hangs/crashes
================================================================================
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

try:
    from lead_archiver import Lead, get_archiver
    _LEAD_ARCHIVER_AVAILABLE = True
except Exception as _e:  # archiver optional — router must still boot without it
    Lead = None  # type: ignore
    get_archiver = None  # type: ignore
    _LEAD_ARCHIVER_AVAILABLE = False

try:
    from growth_engine import get_growth_engine
    _GROWTH_ENGINE_AVAILABLE = True
except Exception:
    get_growth_engine = None  # type: ignore
    _GROWTH_ENGINE_AVAILABLE = False

try:
    from sovereign_network import get_network
    _NETWORK_AVAILABLE = True
except Exception:
    get_network = None  # type: ignore
    _NETWORK_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Hang threshold (seconds) — if a node has not beat in this window, Healbot respawns it
HEARTBEAT_STALE_SECONDS = int(os.getenv("HEARTBEAT_STALE_SECONDS", 45))


class CommandRank(Enum):
    OVERLORD = "overlord"
    HIGH_COMMAND = "high_command"
    GENERAL = "general"


def _now_ts() -> float:
    return time.time()


def _iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class General:
    """Individual General with distinct persona, Discord identity, and voice."""

    def __init__(
        self,
        name: str,
        rank: str,
        division: str,
        specialty: str,
        persona: str,
        discord_token_env: str,
        voice_id: str = "default",
        voice_key_env: str = "ELEVENLABS_API_KEY",
    ):
        self.name = name
        self.rank = rank
        self.division = division
        self.specialty = specialty
        self.persona = persona
        self.discord_token_env = discord_token_env
        self.voice_id = voice_id
        self.voice_key_env = voice_key_env
        self.active = True
        self.last_action: Optional[Dict[str, Any]] = None
        self.action_history: List[Dict[str, Any]] = []
        self.last_heartbeat: float = _now_ts()
        self.crash_count: int = 0

    # ---------- lifecycle ----------
    def beat(self) -> None:
        self.last_heartbeat = _now_ts()

    def activate(self) -> None:
        self.active = True
        self.beat()

    def deactivate(self) -> None:
        self.active = False

    def is_stale(self, threshold: int = HEARTBEAT_STALE_SECONDS) -> bool:
        return self.active and (_now_ts() - self.last_heartbeat) > threshold

    # ---------- execution ----------
    def speak(self, text: str) -> Optional[bytes]:
        """Synthesize speech using this general's unique voice key and ID."""
        from sovereign_voice_gateway import VoiceGateway
        api_key = os.getenv(self.voice_key_env)
        return VoiceGateway.synthesize_speech(text, voice_id=self.voice_id, api_key=api_key)

    def execute_division_logic(self, task: Dict[str, Any]) -> Dict[str, Any]:
        action = {
            "timestamp": _iso(),
            "general": self.name,
            "rank": self.rank,
            "division": self.division,
            "task": task.get("type", "unknown"),
            "status": "executing",
            "result": None,
        }

        if not self.active:
            action["status"] = "inactive"
            return action

        handlers = {
            "Marketing": self._handle_marketing,
            "Lead Generation": self._handle_lead_gen,
            "Email Campaigns": self._handle_email,
            "Social Media": self._handle_social,
            "Memory Management": self._handle_memory,
            "Analytics": self._handle_analytics,
            "Strategic Ops": self._handle_strategy,
            "Comms": self._handle_comms,
            "Intel": self._handle_intel,
            "Operations": self._handle_operations,
        }
        handler = handlers.get(self.division, self._handle_generic)
        action["result"] = handler(task)
        action["status"] = "completed"

        self.action_history.append(action)
        if len(self.action_history) > 200:
            self.action_history.pop(0)
        self.last_action = action
        self.beat()
        return action

    # ---------- division handlers ----------
    def _handle_marketing(self, task):      return f"[MARKETING] {task.get('content','Campaign deployed')}"
    def _handle_email(self, task):          return f"[EMAIL] {task.get('recipient_count',100)} emails dispatched"
    def _handle_social(self, task):         return f"[SOCIAL] Content pushed to {task.get('platform','multi-platform')}"
    def _handle_memory(self, task):         return f"[MEMORY] Knowledge base updated: {task.get('topic','general')}"
    def _handle_analytics(self, task):      return f"[ANALYTICS] {task.get('metric','conversion_rate')} analyzed"
    def _handle_strategy(self, task):       return f"[STRATEGY] {task.get('objective','high-ticket close')} executed"
    def _handle_comms(self, task):          return f"[COMMS] Outreach dispatched to {task.get('channel','all')}"
    def _handle_operations(self, task):     return f"[OPS] {task.get('op','maneuver')} complete"
    def _handle_generic(self, task):        return f"[{self.division.upper()}] {task.get('content','executed')}"

    # ---------- Hunter / Sentinel: structured lead extraction ----------
    def _handle_lead_gen(self, task):
        """General Hunter (Travis) — acquires targets and routes them through the archiver."""
        lead_payload = task.get("lead") or task.get("target")
        if lead_payload:
            archive_result = self._acquire_target(lead_payload)
            return {
                "summary": f"[LEAD GEN] {archive_result['status'].upper()} — {lead_payload.get('company','?')}",
                "archive": archive_result,
            }
        return f"[LEAD GEN] Acquired {task.get('lead_count',10)} qualified leads"

    def _handle_intel(self, task):
        """Sentinel — market surveillance. If a validated target is attached, archive it."""
        lead_payload = task.get("lead") or task.get("target")
        if lead_payload:
            archive_result = self._acquire_target(lead_payload)
            return {
                "summary": f"[INTEL] {archive_result['status'].upper()} — {lead_payload.get('company','?')}",
                "archive": archive_result,
            }
        return f"[INTEL] {task.get('scope','market')} scanned — {task.get('hits','0')} hits"

    def _acquire_target(self, lead_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validated-target hook. Runs CSV append + Discord lead-card broadcast
        simultaneously, with Tier 1 (SQLite) dedup guarding against spam.
        """
        if not _LEAD_ARCHIVER_AVAILABLE:
            return {"status": "unavailable", "reason": "lead_archiver import failed"}

        try:
            lead = Lead(
                agent_name=self.name,
                company=str(lead_payload.get("company", "")).strip(),
                contact_name=str(lead_payload.get("contact_name") or lead_payload.get("contact") or "").strip(),
                email=str(lead_payload.get("email", "")).strip(),
                phone=str(lead_payload.get("phone", "")).strip(),
                source=str(lead_payload.get("source", "unspecified")).strip(),
                priority_score=int(lead_payload.get("priority_score", lead_payload.get("priority", 0)) or 0),
                status=str(lead_payload.get("status", "VALIDATED")).strip(),
            )
            return get_archiver().archive_lead(lead)
        except Exception as e:
            logger.exception("[%s] lead archive failed: %s", self.name, e)
            return {"status": "error", "message": str(e)}


class OpenClaw:
    """Tactical Commander — bridges Overlord and Generals."""

    def __init__(
        self,
        name: str,
        specialization: str,
        generals: List[General],
        discord_token_env: str,
    ):
        self.name = name
        self.specialization = specialization  # "Infrastructure" | "Strategic Pivoting"
        self.generals = generals
        self.discord_token_env = discord_token_env
        self.active = True
        self.last_heartbeat: float = _now_ts()

    def beat(self) -> None:
        self.last_heartbeat = _now_ts()

    def is_stale(self, threshold: int = HEARTBEAT_STALE_SECONDS) -> bool:
        return self.active and (_now_ts() - self.last_heartbeat) > threshold

    def coordinate_division(self, division_name: str, task: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        for g in self.generals:
            if g.division == division_name and g.active:
                results.append(g.execute_division_logic(task))
        self.beat()
        return results

    def broadcast_to_all(self, task: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = [g.execute_division_logic(task) for g in self.generals if g.active]
        self.beat()
        return results


class AgentZero:
    """OVERLORD — autonomous system executor at the top of the hierarchy."""

    def __init__(
        self,
        openclaw_instances: List[OpenClaw],
        discord_token_env: str = "DISCORD_BOT_TOKEN_OVERLORD",
    ):
        self.openclaw_instances = openclaw_instances
        self.discord_token_env = discord_token_env
        self.active = True
        self.promoter_mode: bool = False  # Citadel — Growth Engine toggle
        self.operation_log: List[Dict[str, Any]] = []
        self.heal_log: List[Dict[str, Any]] = []
        self.last_heartbeat: float = _now_ts()
        self.network = get_network() if _NETWORK_AVAILABLE else None  # 4-node mesh

    def speak(self, text: str) -> Optional[bytes]:
        """Synthesize speech using Overlord's unique voice key and ID."""
        from sovereign_voice_gateway import VoiceGateway
        api_key = os.getenv(self.voice_key_env, os.getenv("ELEVENLABS_API_KEY"))
        return VoiceGateway.synthesize_speech(text, voice_id=self.voice_id, api_key=api_key)

    # ---------- hierarchy traversal ----------
    def _all_generals(self) -> List[General]:
        return [g for oc in self.openclaw_instances for g in oc.generals]

    def find_agent_by_name(self, name: str) -> Optional[Any]:
        """Return any node in the hierarchy matching `name` (case-insensitive)."""
        needle = name.strip().lower()
        if needle in ("overlord", "agentzero", "agent_zero"):
            return self
        for oc in self.openclaw_instances:
            if oc.name.lower() == needle or needle in oc.name.lower():
                return oc
            for g in oc.generals:
                if g.name.lower() == needle:
                    return g
        return None

    # ---------- UI toggle wiring ----------
    def set_agent_active(self, name: str, active: bool) -> Dict[str, Any]:
        """Used by dashboard /api/agent_command to toggle a general on/off."""
        node = self.find_agent_by_name(name)
        if node is None:
            return {"ok": False, "error": f"unknown agent '{name}'"}
        if isinstance(node, General):
            node.activate() if active else node.deactivate()
        else:
            node.active = active
            if active and hasattr(node, "beat"):
                node.beat()
        return {
            "ok": True,
            "agent": name,
            "active": active,
            "timestamp": _iso(),
        }

    # ---------- Promoter mode (Growth Engine toggle) ----------
    def set_promoter_mode(self, enabled: bool) -> Dict[str, Any]:
        """Dashboard toggle — when ON the revenue loop biases toward marketing output."""
        self.promoter_mode = bool(enabled)
        return {
            "ok":             True,
            "promoter_mode":  self.promoter_mode,
            "timestamp":      _iso(),
        }

    def _build_promoter_task(self, base: Dict[str, Any]) -> Dict[str, Any]:
        """Rewrite a revenue task into a Promoter-biased task for Hunter/Herald/Khan."""
        promoter = dict(base)
        promoter["promoter_mode"] = True
        promoter.setdefault("priorities", [
            "influence_targets",   # find people who can promote the tool
            "proof_of_work",       # generate content showing the tool making money
            "scheduled_posts",     # cross-post across social APIs
        ])
        return promoter

    async def run_promotion_cycle(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Fire the Growth Engine end-to-end (viral hook + tool promo + case study)."""
        if not _GROWTH_ENGINE_AVAILABLE:
            return {"status": "unavailable", "reason": "growth_engine not importable"}
        results = get_growth_engine().run_promotion_cycle(context or {})
        return {"status": "ok", "assets": results, "timestamp": _iso()}

    # ---------- revenue operations ----------
    async def execute_revenue_operation(self, operation: Dict[str, Any]) -> Dict[str, Any]:
        operation_result = {
            "operation_id":         operation.get("id", "op_unknown"),
            "overlord":             "AgentZero",
            "status":               "executing",
            "promoter_mode":        self.promoter_mode,
            "timestamp":            _iso(),
            "high_command_results": [],
            "growth_cycle":         None,
        }

        task = self._build_promoter_task(operation) if self.promoter_mode else operation

        for openclaw in self.openclaw_instances:
            if not openclaw.active:
                continue
            if task.get("target_division"):
                results = openclaw.coordinate_division(task["target_division"], task)
            else:
                results = openclaw.broadcast_to_all(task)
            operation_result["high_command_results"].extend(results)

        # Promoter mode: also run a Growth Engine cycle in parallel with the divisions
        if self.promoter_mode:
            operation_result["growth_cycle"] = await self.run_promotion_cycle(task)

        self.last_heartbeat = _now_ts()
        operation_result["status"] = "completed"
        self.operation_log.append(operation_result)
        if len(self.operation_log) > 500:
            self.operation_log.pop(0)
        return operation_result

    # ---------- autohealbot ----------
    async def auto_healbot(self, crashed_agent: str) -> Dict[str, Any]:
        """Respawn a specific named agent from its last-known 6-Tier memory state."""
        heal_result = {
            "action": "auto_healbot",
            "target_agent": crashed_agent,
            "timestamp": _iso(),
            "status": "not_found",
        }
        node = self.find_agent_by_name(crashed_agent)
        if isinstance(node, General):
            node.crash_count += 1
            node.activate()
            heal_result["status"] = "respawned"
            heal_result["memory_state"] = {
                "agent": node.name,
                "division": node.division,
                "last_action": node.last_action,
                "crash_count": node.crash_count,
            }
        elif isinstance(node, OpenClaw):
            node.active = True
            node.beat()
            heal_result["status"] = "respawned"
            heal_result["memory_state"] = {"commander": node.name, "scope": node.specialization}
        self.heal_log.append(heal_result)
        if len(self.heal_log) > 200:
            self.heal_log.pop(0)
        return heal_result

    async def heartbeat(self) -> Dict[str, Any]:
        """Watchdog sweep — respawn any agent whose heartbeat has gone stale."""
        self.last_heartbeat = _now_ts()
        revived: List[Dict[str, Any]] = []
        for oc in self.openclaw_instances:
            if oc.is_stale():
                oc.active = True
                oc.beat()
                revived.append({"node": oc.name, "level": "high_command"})
            for g in oc.generals:
                if g.is_stale():
                    result = await self.auto_healbot(g.name)
                    revived.append({"node": g.name, "level": "general", "heal": result})
        return {"timestamp": _iso(), "revived": revived, "checked": len(self._all_generals()) + len(self.openclaw_instances)}

    # ---------- status ----------
    def get_hierarchy_status(self) -> Dict[str, Any]:
        status = {
            "overlord": "AgentZero",
            "status": "ACTIVE" if self.active else "INACTIVE",
            "promoter_mode": self.promoter_mode,
            "discord_token_env": self.discord_token_env,
            "discord_token_loaded": bool(os.getenv(self.discord_token_env, "")),
            "last_heartbeat": self.last_heartbeat,
            "high_command": [],
        }
        for oc in self.openclaw_instances:
            command = {
                "name": oc.name,
                "specialization": oc.specialization,
                "status": "ACTIVE" if oc.active else "INACTIVE",
                "discord_token_env": oc.discord_token_env,
                "discord_token_loaded": bool(os.getenv(oc.discord_token_env, "")),
                "last_heartbeat": oc.last_heartbeat,
                "generals": [],
            }
            for g in oc.generals:
                command["generals"].append({
                    "name": g.name,
                    "rank": g.rank,
                    "division": g.division,
                    "status": "ACTIVE" if g.active else "INACTIVE",
                    "discord_token_env": g.discord_token_env,
                    "discord_token_loaded": bool(os.getenv(g.discord_token_env, "")),
                    "voice_id": g.voice_id,
                    "last_heartbeat": g.last_heartbeat,
                    "crash_count": g.crash_count,
                    "last_action": g.last_action,
                })
            status["high_command"].append(command)

        # 4-node network snapshot (cached — does not hit the network)
        if self.network is not None:
            try:
                status["network"] = self.network.snapshot()
                status["registry_configured"] = self.network.registry.configured()
            except Exception as e:
                status["network"] = {"error": str(e)}
        return status

    def mirror_to_registry(self) -> Dict[str, Any]:
        """Push current hierarchy snapshot to the Hostinger Sovereign Registry (MySQL)."""
        if self.network is None:
            return {"status": "unavailable", "reason": "sovereign_network not loaded"}
        try:
            return self.network.registry.mirror_hierarchy(self.get_hierarchy_status())
        except Exception as e:
            return {"status": "error", "message": str(e)}


# ====================================================================
# INITIALIZATION
# ====================================================================

def initialize_sovereign_hierarchy() -> AgentZero:
    """Build the full OVERLORD → OPENCLAW → GENERALS tree with Discord tokens."""

    # OpenClaw-Infra: Comms/Intel/Strategic-Ops Generals
    douglas = General(
        name="Douglas", rank="General", division="Strategic Ops",
        specialty="High-ticket deals", persona="The Guardian: Calm, echoing, vigilant",
        discord_token_env="DISCORD_BOT_TOKEN_DOUGLAS", voice_id="sentinel_guardian",
        voice_key_env="VOICE_KEY_SENTINEL"
    )
    hermes = General(
        name="Hermes", rank="General", division="Comms",
        specialty="Outreach", persona="The Influencer: Smooth, charismatic, persuasive",
        discord_token_env="DISCORD_BOT_TOKEN_HERMES", voice_id="herald_smooth",
        voice_key_env="VOICE_KEY_HERALD"
    )
    sentinel = General(
        name="Sentinel", rank="General", division="Intel",
        specialty="Lead scraping & market surveillance", persona="The Accountant: Cold, precise, monotone",
        discord_token_env="DISCORD_BOT_TOKEN_SENTINEL", voice_id="auditor_cold",
        voice_key_env="VOICE_KEY_AUDITOR"
    )

    # OpenClaw-Strategy: Acquisition / Finance / Operations Colonels
    travis = General(
        name="Travis", rank="Colonel", division="Lead Generation",
        specialty="Acquisition", persona="The Mercenary: Sharp, aggressive, fast-talking",
        discord_token_env="DISCORD_BOT_TOKEN_TRAVIS", voice_id="hunter_sharp",
        voice_key_env="VOICE_KEY_HUNTER"
    )
    aureus = General(
        name="Aureus", rank="Colonel", division="Email Campaigns",
        specialty="Finance & negotiation", persona="The Billionaire: Rich, luxurious, slow",
        discord_token_env="DISCORD_BOT_TOKEN_AUREUS", voice_id="aureus_rich",
        voice_key_env="VOICE_KEY_AUREUS"
    )
    khan = General(
        name="Khan", rank="Colonel", division="Operations",
        specialty="Viral operations & social", persona="The Strategist: Disciplined, rhythmic, commanding",
        discord_token_env="DISCORD_BOT_TOKEN_KHAN", voice_id="khan_disciplined",
        voice_key_env="VOICE_KEY_KHAN"
    )

    openclaw_infra = OpenClaw(
        name="OpenClaw-Infra",
        specialization="Infrastructure",
        generals=[douglas, hermes, sentinel],
        discord_token_env="DISCORD_BOT_TOKEN_OPENCLAW_INFRA",
    )
    openclaw_strategy = OpenClaw(
        name="OpenClaw-Strategy",
        specialization="Strategic Pivoting",
        generals=[travis, aureus, khan],
        discord_token_env="DISCORD_BOT_TOKEN_OPENCLAW_STRATEGY",
    )

    overlord = AgentZero(
        openclaw_instances=[openclaw_infra, openclaw_strategy],
        discord_token_env="DISCORD_BOT_TOKEN_OVERLORD",
    )
    # Overlord also needs its voice key
    overlord.voice_key_env = "VOICE_KEY_OVERLORD"
    overlord.voice_id = "overlord_god_mode"

    logger.info("🔱 SOVEREIGN OS HIERARCHY INITIALIZED")
    logger.info("OVERLORD: AgentZero (%s)", "loaded" if os.getenv(overlord.discord_token_env) else "MISSING TOKEN")
    for oc in overlord.openclaw_instances:
        logger.info(
            "  HIGH COMMAND: %s — %s (%s)",
            oc.name, oc.specialization,
            "loaded" if os.getenv(oc.discord_token_env) else "MISSING TOKEN",
        )
        for g in oc.generals:
            logger.info(
                "    %s %s (%s) — %s",
                g.rank, g.name, g.division,
                "loaded" if os.getenv(g.discord_token_env) else "MISSING TOKEN",
            )
    return overlord


# ====================================================================
# SINGLETON + WATCHDOG
# ====================================================================

_overlord: Optional[AgentZero] = None
_watchdog_task: Optional[asyncio.Task] = None


def get_overlord() -> AgentZero:
    global _overlord
    if _overlord is None:
        _overlord = initialize_sovereign_hierarchy()
    return _overlord


async def run_watchdog(interval_seconds: int = 15) -> None:
    """Long-running heartbeat loop — the Eternal Heartbeat."""
    overlord = get_overlord()
    while overlord.active:
        try:
            report = await overlord.heartbeat()
            if report["revived"]:
                logger.warning("[HEALBOT] revived: %s", report["revived"])
        except Exception as e:
            logger.exception("[HEALBOT] sweep failed: %s", e)
        await asyncio.sleep(interval_seconds)


def start_watchdog(loop: Optional[asyncio.AbstractEventLoop] = None, interval_seconds: int = 15):
    """Kick off the watchdog as a background task on the given loop."""
    global _watchdog_task
    if _watchdog_task and not _watchdog_task.done():
        return _watchdog_task
    loop = loop or asyncio.get_event_loop()
    _watchdog_task = loop.create_task(run_watchdog(interval_seconds))
    logger.info("[HEALBOT] Eternal Heartbeat started (%ss interval)", interval_seconds)
    return _watchdog_task


if __name__ == "__main__":
    overlord = get_overlord()
    print(json.dumps(overlord.get_hierarchy_status(), indent=2, default=str))
