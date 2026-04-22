"""
SOVEREIGN OS — DISCORD WAR ROOM INTEGRATION
Streams all agent activity + voice commands to Discord channel
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

# Discord IDs (from user)
DISCORD_SERVER_ID = "1481257843058282709"
DISCORD_WARROOM_CHANNEL_ID = "1481257844849246323"

# Get Discord token from env
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "")


class AgentStatus(Enum):
    ACTIVE = "🟢"
    INACTIVE = "🔴"
    EXECUTING = "🟡"
    CRASHED = "⚫"
    RESPAWNING = "🟠"


class DiscordWarRoom:
    """Stream all agent activity to Discord War Room channel"""

    def __init__(self):
        self.webhook_url = DISCORD_WEBHOOK_URL
        self.channel_id = DISCORD_WARROOM_CHANNEL_ID
        self.server_id = DISCORD_SERVER_ID
        self.session: Optional[aiohttp.ClientSession] = None

    async def init(self):
        """Initialize aiohttp session"""
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def close(self):
        """Close session"""
        if self.session:
            await self.session.close()

    async def send_embed(self, title: str, description: str, color: int, fields: Optional[Dict] = None) -> bool:
        """Send Discord embed message"""
        if not self.webhook_url:
            print(f"[WARN] No Discord webhook configured. Message: {title}")
            return False

        embed = {
            "title": title,
            "description": description,
            "color": color,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "footer": {"text": "B.L.A.S.T. Sovereign OS"},
        }

        if fields:
            embed["fields"] = [
                {"name": k, "value": v, "inline": True} for k, v in fields.items()
            ]

        payload = {"embeds": [embed]}

        try:
            await self.init()
            async with self.session.post(self.webhook_url, json=payload) as resp:
                return resp.status == 204
        except Exception as e:
            print(f"[ERROR] Discord send failed: {e}")
            return False

    async def agent_activated(self, agent_name: str, division: str):
        """Log agent activation"""
        await self.send_embed(
            title=f"🚀 {agent_name.upper()} ACTIVATED",
            description=f"General {agent_name} is now operational",
            color=0x00FF00,  # Green
            fields={
                "Rank": "General/Colonel",
                "Division": division,
                "Status": "ACTIVE",
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def agent_deactivated(self, agent_name: str):
        """Log agent deactivation"""
        await self.send_embed(
            title=f"🛑 {agent_name.upper()} DEACTIVATED",
            description=f"General {agent_name} is now offline",
            color=0xFF0000,  # Red
            fields={"Status": "INACTIVE", "Timestamp": datetime.now().isoformat()},
        )

    async def voice_command_received(self, transcription: str, agent_target: Optional[str] = None):
        """Log voice command from War Room"""
        await self.send_embed(
            title="🎙️ VOICE COMMAND RECEIVED",
            description=f"```{transcription}```",
            color=0xFFD700,  # Gold
            fields={
                "Source": "War Room (Browser Mic)",
                "Target Agent": agent_target or "Auto-routing",
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def agent_executing(self, agent_name: str, action: str, target: Optional[str] = None):
        """Log agent execution"""
        await self.send_embed(
            title=f"⚡ {agent_name.upper()} EXECUTING",
            description=f"```{action}```",
            color=0xFFA500,  # Orange (executing)
            fields={
                "Agent": agent_name,
                "Action": action,
                "Target": target or "General",
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def agent_completed(self, agent_name: str, result: str, stats: Optional[Dict] = None):
        """Log agent task completion"""
        fields = {
            "Agent": agent_name,
            "Result": result,
            "Timestamp": datetime.now().isoformat(),
        }
        if stats:
            fields.update(stats)

        await self.send_embed(
            title=f"✅ {agent_name.upper()} COMPLETED",
            description=result,
            color=0x00FF00,  # Green
            fields=fields,
        )

    async def agent_crashed(self, agent_name: str, error: str):
        """Log agent crash"""
        await self.send_embed(
            title=f"💥 {agent_name.upper()} CRASHED",
            description=f"```{error}```",
            color=0xFF0000,  # Red
            fields={"Status": "CRITICAL", "Timestamp": datetime.now().isoformat()},
        )

    async def healbot_respawn(self, agent_name: str, memory_state: Optional[str] = None):
        """Log Healbot respawn"""
        await self.send_embed(
            title=f"🔄 HEALBOT RESPAWNING {agent_name.upper()}",
            description="Auto-respawn initiated from 6-Tier Memory",
            color=0xFF8C00,  # Dark Orange (respawning)
            fields={
                "Agent": agent_name,
                "Source": "Tier 1 (SQLite) Memory State",
                "Status": "RECOVERING",
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def swarm_status(self, active_count: int, total_count: int, status_dict: Dict):
        """Log swarm status update"""
        agents_list = "\n".join(
            [f"• {name}: {('🟢 ACTIVE' if active else '🔴 INACTIVE')}" for name, active in status_dict.items()]
        )

        await self.send_embed(
            title="📊 SWARM STATUS UPDATE",
            description=f"```{agents_list}```",
            color=0x00FFFF,  # Cyan
            fields={
                "Active Generals": f"{active_count}/{total_count}",
                "Swarm Power": f"{(active_count/total_count)*100:.0f}%",
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def lead_generated(self, source_agent: str, lead_count: int, details: Optional[str] = None):
        """Log lead generation"""
        await self.send_embed(
            title=f"🎯 LEADS GENERATED",
            description=details or f"{source_agent} acquired {lead_count} leads",
            color=0x32CD32,  # Lime Green
            fields={
                "Agent": source_agent,
                "Count": str(lead_count),
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def email_sent(self, source_agent: str, recipient_count: int, campaign: Optional[str] = None):
        """Log email campaign"""
        await self.send_embed(
            title="📧 EMAIL CAMPAIGN DEPLOYED",
            description=campaign or f"Sent to {recipient_count} recipients",
            color=0x4169E1,  # Royal Blue
            fields={
                "Agent": source_agent,
                "Recipients": str(recipient_count),
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def social_posted(self, source_agent: str, platform: str, post_content: Optional[str] = None):
        """Log social media post"""
        await self.send_embed(
            title="📱 SOCIAL MEDIA DEPLOYED",
            description=post_content or f"Posted to {platform}",
            color=0xFF1493,  # Deep Pink
            fields={
                "Agent": source_agent,
                "Platform": platform,
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def revenue_milestone(self, amount: str, source: Optional[str] = None):
        """Log revenue milestone"""
        await self.send_embed(
            title="💰 REVENUE MILESTONE",
            description=f"${amount} acquired",
            color=0xFFD700,  # Gold
            fields={
                "Source": source or "Multiple channels",
                "Timestamp": datetime.now().isoformat(),
            },
        )

    async def client_registered(self, provider: str, client_name: Optional[str] = None):
        """Log new client credentials registered"""
        await self.send_embed(
            title="🔌 CLIENT GATEWAY REGISTERED",
            description=f"New {provider.upper()} credentials registered",
            color=0x9370DB,  # Medium Purple
            fields={
                "Provider": provider,
                "Client": client_name or "Anonymous",
                "Timestamp": datetime.now().isoformat(),
            },
        )


# Global singleton
_war_room: Optional[DiscordWarRoom] = None


def get_war_room() -> DiscordWarRoom:
    """Get or initialize War Room"""
    global _war_room
    if _war_room is None:
        _war_room = DiscordWarRoom()
    return _war_room


async def test_discord():
    """Test Discord integration"""
    war_room = get_war_room()
    await war_room.init()

    await war_room.agent_activated("Douglas", "Strategic Ops")
    await war_room.voice_command_received("deploy lead generation campaign to palm jumeirah", "Travis")
    await war_room.swarm_status(4, 6, {
        "douglas": True,
        "hermes": True,
        "sentinel": True,
        "travis": True,
        "aureus": False,
        "khan": False,
    })

    await war_room.close()
    print("[OK] Discord test complete")


if __name__ == "__main__":
    asyncio.run(test_discord())
