"""
SOVEREIGN CITADEL — DISCORD ROUTING HUB
================================================================================
Divisional multi-channel router. Every General gets their own "Bunker"; High
Command gets the War Room / Decrees / Profit Stream; the Growth Engine gets the
viral + strategy + outreach channels; the Vault gets cloud-backup confirmations.

All channel IDs are resolved from .env. If a specific channel isn't configured,
the payload falls back to the webhook (or logs a simulated dispatch).
================================================================================
"""

from __future__ import annotations

import os
import logging
from typing import Any, Dict, List, Optional

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# BOT TOKEN  +  WEBHOOK FALLBACK
# ---------------------------------------------------------------------------

DISCORD_TOKEN = (
    os.getenv("DISCORD_TOKEN")
    or os.getenv("DISCORD_BOT_TOKEN")
    or os.getenv("DISCORD_BOT_TOKEN_OVERLORD")
)
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")


# ---------------------------------------------------------------------------
# CITADEL CHANNEL MAP  (resolved from .env)
# ---------------------------------------------------------------------------
#
# Fill these env keys to light up each channel. Any key missing here simply
# routes to the webhook (or logs a simulated dispatch).
#
# HIGH COMMAND
#   DISCORD_CHAN_WAR_ROOM               # #🛰️-war-room
#   DISCORD_CHAN_SOVEREIGN_DECREES      # #📜-sovereign-decrees
#   DISCORD_CHAN_PROFIT_STREAM          # #💸-profit-stream
#
# DIVISIONAL BUNKERS
#   DISCORD_CHAN_HUNTER_BUNKER          # #🎯-hunter-bunker
#   DISCORD_CHAN_HERALD_BUNKER          # #📢-herald-bunker
#   DISCORD_CHAN_AUDITOR_BUNKER         # #💰-auditor-bunker
#   DISCORD_CHAN_SENTINEL_BUNKER        # #🛡️-sentinel-bunker
#   DISCORD_CHAN_AUREUS_BUNKER          # #🌀-aureus-bunker
#   DISCORD_CHAN_KHAN_BUNKER            # #⚙️-khan-bunker
#
# GROWTH ENGINE
#   DISCORD_CHAN_GROWTH_STRATEGY        # #📈-growth-strategy
#   DISCORD_CHAN_VIRAL_LAB              # #🔥-viral-lab
#   DISCORD_CHAN_OUTREACH_LOG           # #🤝-outreach-log
#   DISCORD_CHAN_CASE_STUDIES           # #🏆-case-studies
#
# SOVEREIGN VAULT
#   DISCORD_CHAN_CLOUD_BACKUPS          # #📦-cloud-backups
# ---------------------------------------------------------------------------

_CITADEL = {
    # High Command
    "war_room":          os.getenv("DISCORD_CHAN_WAR_ROOM")           or os.getenv("DISCORD_WARROOM_CHANNEL_ID") or os.getenv("CHAN_WAR_ROOM"),
    "sovereign_decrees": os.getenv("DISCORD_CHAN_SOVEREIGN_DECREES"),
    "profit_stream":     os.getenv("DISCORD_CHAN_PROFIT_STREAM"),
    # Divisional Bunkers
    "hunter_bunker":     os.getenv("DISCORD_CHAN_HUNTER_BUNKER")      or os.getenv("CHAN_HUNTING"),
    "herald_bunker":     os.getenv("DISCORD_CHAN_HERALD_BUNKER")      or os.getenv("CHAN_HERALD"),
    "auditor_bunker":    os.getenv("DISCORD_CHAN_AUDITOR_BUNKER")     or os.getenv("CHAN_AUDITOR"),
    "sentinel_bunker":   os.getenv("DISCORD_CHAN_SENTINEL_BUNKER"),
    "aureus_bunker":     os.getenv("DISCORD_CHAN_AUREUS_BUNKER"),
    "khan_bunker":       os.getenv("DISCORD_CHAN_KHAN_BUNKER"),
    # Growth Engine
    "growth_strategy":   os.getenv("DISCORD_CHAN_GROWTH_STRATEGY"),
    "viral_lab":         os.getenv("DISCORD_CHAN_VIRAL_LAB"),
    "outreach_log":      os.getenv("DISCORD_CHAN_OUTREACH_LOG"),
    "case_studies":      os.getenv("DISCORD_CHAN_CASE_STUDIES"),
    # Vault
    "cloud_backups":     os.getenv("DISCORD_CHAN_CLOUD_BACKUPS"),
}

# Per-agent routing — name is matched case-insensitively
AGENT_TO_CHANNEL = {
    "hunter":    "hunter_bunker",
    "travis":    "hunter_bunker",     # Travis = Hunter Colonel
    "herald":    "herald_bunker",
    "hermes":    "herald_bunker",     # Hermes carries the Herald voice
    "auditor":   "auditor_bunker",
    "douglas":   "auditor_bunker",    # Douglas = Auditor/Strategic Closer
    "sentinel":  "sentinel_bunker",
    "aureus":    "aureus_bunker",
    "khan":      "khan_bunker",
    "agentzero": "war_room",
    "overlord":  "war_room",
    "operator":  "war_room",
}

# Message type → channel override
MESSAGE_TYPE_CHANNEL = {
    "RevenueAlert":     "profit_stream",
    "SovereignDecree":  "sovereign_decrees",
    "CloudBackup":      "cloud_backups",
    "GrowthStrategy":   "growth_strategy",
    "ViralDrop":        "viral_lab",
    "Outreach":         "outreach_log",
    "CaseStudy":        "case_studies",
}

PRIORITY_HIGH = "high"
PRIORITY_STANDARD = "standard"


# ---------------------------------------------------------------------------
# PAYLOAD BUILDERS
# ---------------------------------------------------------------------------

def build_payload(message_type: str, content: str, attachments: Optional[List[Dict]] = None) -> Dict[str, Any]:
    """Follows the GEMINI.md Constitution payload shape."""
    return {
        "platform":       "Discord",
        "message_type":   message_type,
        "content":        content,
        "agent_profile":  None,
        "attachments":    attachments or [],
    }


def get_discord_color(message_type: str) -> int:
    colors = {
        "DailyReport":      0x3498DB,
        "NewProductLaunch": 0x2ECC71,
        "RevenueAlert":     0xF1C40F,
        "SystemAlert":      0x9B59B6,
        "WarMode":          0xE74C3C,
        "SovereignDecree":  0xFFD700,
        "CloudBackup":      0x2ECC71,
        "GrowthStrategy":   0x1ABC9C,
        "ViralDrop":        0xFF1493,
        "Outreach":         0x4169E1,
        "CaseStudy":        0xFFD700,
    }
    return colors.get(message_type, 0x95A5A6)


def _icon_for(message_type: str) -> str:
    return {
        "DailyReport":      "📊 [DAILY REPORT]",
        "NewProductLaunch": "🚀 [NEW BLUEPRINT LAUNCHED]",
        "RevenueAlert":     "💸 [REVENUE ALERT]",
        "SystemAlert":      "⚡ [SYSTEM ALERT]",
        "WarMode":          "🔥 [WAR MODE]",
        "SovereignDecree":  "📜 [SOVEREIGN DECREE]",
        "CloudBackup":      "📦 [CLOUD BACKUP]",
        "GrowthStrategy":   "📈 [GROWTH STRATEGY]",
        "ViralDrop":        "🔥 [VIRAL LAB]",
        "Outreach":         "🤝 [OUTREACH]",
        "CaseStudy":        "🏆 [CASE STUDY]",
    }.get(message_type, "⚙️ [SYSTEM]")


def _profile_tag(agent_profile: str) -> str:
    return {
        "hunter":    "🎯 [HUNTER — TARGET ACQUISITION]",
        "travis":    "🎯 [TRAVIS — LEAD ACQUISITION]",
        "herald":    "📢 [HERALD — BROADCAST]",
        "hermes":    "📨 [HERMES — STRIKE DEPLOYMENT]",
        "auditor":   "💰 [AUDITOR — ROI WATCH]",
        "douglas":   "👔 [DOUGLAS — STRATEGIC CLOSER]",
        "sentinel":  "🛡️ [SENTINEL — SECURITY & INTEL]",
        "aureus":    "🌀 [AUREUS — YIELD REGEN]",
        "khan":      "⚙️ [KHAN — SWARM COORDINATOR]",
        "agentzero": "🧬 [AGENTZERO — SOVEREIGN OVERLORD]",
        "overlord":  "🧬 [OVERLORD]",
        "operator":  "🛠️ [OPERATOR]",
    }.get(agent_profile.lower(), "🤖 [GRAVITY-HERMES]")


# ---------------------------------------------------------------------------
# CHANNEL RESOLUTION
# ---------------------------------------------------------------------------

def resolve_channel(agent_profile: str, message_type: str, priority: str = PRIORITY_STANDARD) -> Optional[str]:
    """
    Channel precedence:
      1. Explicit override by message_type  (e.g. RevenueAlert → profit_stream)
      2. Agent's own bunker
      3. War Room (fallback for High Command / unknown agents)
    """
    if message_type in MESSAGE_TYPE_CHANNEL:
        chan = _CITADEL.get(MESSAGE_TYPE_CHANNEL[message_type])
        if chan:
            return chan

    key = AGENT_TO_CHANNEL.get((agent_profile or "").lower())
    if key and _CITADEL.get(key):
        return _CITADEL[key]

    return _CITADEL.get("war_room")


# ---------------------------------------------------------------------------
# DISPATCH
# ---------------------------------------------------------------------------

def _post_embed(channel_id: str, embed: Dict[str, Any]) -> Dict[str, Any]:
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
    headers = {"Authorization": f"Bot {DISCORD_TOKEN}", "Content-Type": "application/json"}
    try:
        resp = requests.post(url, headers=headers, json={"embeds": [embed]}, timeout=10)
        if resp.status_code in (200, 204):
            return {"status": "success", "channel_id": channel_id}
        return {"status": "error", "code": resp.status_code, "body": resp.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def _post_webhook(embed: Dict[str, Any]) -> Dict[str, Any]:
    try:
        resp = requests.post(
            DISCORD_WEBHOOK_URL,
            json={"username": "Sovereign Citadel", "embeds": [embed]},
            timeout=10,
        )
        resp.raise_for_status()
        return {"status": "success", "platform": "Webhook"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def send_to_discord(
    payload: Dict[str, Any],
    agent_profile: str = "operator",
    priority: str = PRIORITY_STANDARD,
) -> Dict[str, Any]:
    """Builds the embed and routes it to the correct Citadel channel."""
    profile = (agent_profile or "operator").lower()
    msg_type = payload["message_type"]
    channel_id = resolve_channel(profile, msg_type, priority)

    embed = {
        "title":       _profile_tag(profile),
        "description": f"**{_icon_for(msg_type)}**\n\n{payload['content']}",
        "color":       get_discord_color(msg_type),
        "footer":      {"text": "B.L.A.S.T. Sovereign Citadel · v4.0"},
    }

    results: List[Dict[str, Any]] = []

    if channel_id and DISCORD_TOKEN:
        results.append(_post_embed(channel_id, embed))
    elif DISCORD_WEBHOOK_URL:
        results.append(_post_webhook(embed))
    else:
        logger.warning("[Citadel] No channel / webhook available — simulated dispatch (%s)", msg_type)
        results.append({"status": "simulated"})

    # HIGH-PRIORITY mirror → always echo into the War Room
    if priority == PRIORITY_HIGH and DISCORD_TOKEN:
        war_room_id = _CITADEL.get("war_room")
        if war_room_id and war_room_id != channel_id:
            mirror = dict(embed)
            mirror["title"] = f"🚨 HIGH PRIORITY · {mirror['title']}"
            results.append(_post_embed(war_room_id, mirror))

    return {
        "profile":   profile,
        "channel":   channel_id,
        "priority":  priority,
        "results":   results,
    }


def dispatch_payload(
    *args,
    agent_profile: str = "hermes",
    priority: str = PRIORITY_STANDARD,
    attachments: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """
    Main dispatch wrapper — always routes over Discord.

    Supported calling shapes:
      new:    dispatch_payload(message_type, content, agent_profile=..., priority=...)
      legacy: dispatch_payload(platform, message_type, content, agent_profile=...)
              (platform is ignored — Citadel is Discord-native)
    """
    if len(args) == 3:
        _platform, message_type, content = args  # legacy shim — platform ignored
    elif len(args) == 2:
        message_type, content = args
    else:
        raise TypeError(
            "dispatch_payload requires (message_type, content) "
            "or (platform, message_type, content)"
        )
    payload = build_payload(message_type, content, attachments=attachments)
    payload["agent_profile"] = agent_profile
    return send_to_discord(payload, agent_profile=agent_profile, priority=priority)


# ---------------------------------------------------------------------------
# CONVENIENCE HELPERS (used by growth_engine + cloud_vault)
# ---------------------------------------------------------------------------

def post_growth_strategy(content: str, agent: str = "khan") -> Dict[str, Any]:
    return dispatch_payload("GrowthStrategy", content, agent_profile=agent)


def post_viral_drop(content: str, agent: str = "herald") -> Dict[str, Any]:
    return dispatch_payload("ViralDrop", content, agent_profile=agent)


def post_outreach(content: str, agent: str = "hermes") -> Dict[str, Any]:
    return dispatch_payload("Outreach", content, agent_profile=agent)


def post_case_study(content: str, agent: str = "auditor") -> Dict[str, Any]:
    return dispatch_payload("CaseStudy", content, agent_profile=agent, priority=PRIORITY_HIGH)


def post_cloud_backup(content: str, drive_link: str = "") -> Dict[str, Any]:
    body = content + (f"\n\n🔗 {drive_link}" if drive_link else "")
    return dispatch_payload("CloudBackup", body, agent_profile="operator")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(dispatch_payload("SystemAlert", "Citadel online.", agent_profile="operator"))
