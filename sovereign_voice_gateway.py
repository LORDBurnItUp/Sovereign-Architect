"""
SOVEREIGN OS — VOICE GATEWAY
ElevenLabs (TTS) + Deepgram (STT) + Discord streaming
Synchronous implementation that ACTUALLY WORKS
"""

import os
import requests
import json
from typing import Optional, Dict, Any
from datetime import datetime

# ─────────────────────────── CONFIG ─────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/1495881730186547404/0sSrDlnOEv7Gyk1Dt5V3R01g3oNka0fXTgUJSRZqJQJhJBp2l38CETPca9baiyk5V0Bj")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")

ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVY5iHl"  # Bella voice (can customize)
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
DEEPGRAM_API_URL = "https://api.deepgram.com/v1/listen"


class VoiceGateway:
    """Unified voice I/O gateway for Sovereign OS"""

    @staticmethod
    def send_to_discord(title: str, description: str, color: int = 16776960, fields: Optional[Dict] = None) -> bool:
        """Send embed to Discord (synchronous)"""
        if not DISCORD_WEBHOOK:
            print(f"[WARN] No Discord webhook. Message: {title}")
            return False

        embed = {
            "title": title,
            "description": description,
            "color": color,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "footer": {"text": "B.L.A.S.T. Sovereign OS"},
        }

        if fields:
            embed["fields"] = [{"name": k, "value": v, "inline": True} for k, v in fields.items()]

        payload = {"embeds": [embed]}

        try:
            response = requests.post(DISCORD_WEBHOOK, json=payload)
            return response.status_code == 204
        except Exception as e:
            print(f"[ERROR] Discord post failed: {e}")
            return False

    @staticmethod
    def transcribe_audio(audio_bytes: bytes) -> Optional[str]:
        """
        Convert audio bytes to text using Deepgram
        audio_bytes: raw audio data (WAV/MP3)
        Returns: transcribed text
        """
        if not DEEPGRAM_API_KEY:
            print("[WARN] No Deepgram API key. Returning mock transcription.")
            return "VOICE_COMMAND_RECEIVED"

        headers = {
            "Authorization": f"Token {DEEPGRAM_API_KEY}",
            "Content-Type": "application/octet-stream",
        }

        params = {
            "model": "nova-2",
            "smart_format": "true",
            "filler_words": "false",
        }

        try:
            response = requests.post(
                DEEPGRAM_API_URL,
                headers=headers,
                params=params,
                data=audio_bytes,
                timeout=30,
            )

            if response.status_code == 200:
                result = response.json()
                transcript = result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
                return transcript or "NO_SPEECH_DETECTED"
            else:
                print(f"[ERROR] Deepgram error: {response.status_code}")
                return None
        except Exception as e:
            print(f"[ERROR] Deepgram transcription failed: {e}")
            return None

    @staticmethod
    def synthesize_speech(text: str, voice_id: Optional[str] = None, api_key: Optional[str] = None) -> Optional[bytes]:
        """
        Convert text to speech using ElevenLabs
        text: input text
        voice_id: optional voice ID override
        api_key: optional API key override
        Returns: audio bytes (MP3)
        """
        key = api_key or ELEVENLABS_API_KEY
        vid = voice_id or ELEVENLABS_VOICE_ID

        if not key:
            print("[WARN] No ElevenLabs API key provided. Speech synthesis disabled.")
            return None

        headers = {
            "xi-api-key": key,
            "Content-Type": "application/json",
        }

        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
        }

        try:
            url = f"{ELEVENLABS_API_URL}/{vid}"
            response = requests.post(url, json=data, headers=headers, timeout=30)

            if response.status_code == 200:
                return response.content  # MP3 bytes
            else:
                print(f"[ERROR] ElevenLabs error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"[ERROR] ElevenLabs synthesis failed: {e}")
            return None

    @staticmethod
    def log_voice_command(transcription: str, agent_target: Optional[str] = None, confidence: Optional[float] = None) -> bool:
        """Log voice command to Discord"""
        fields = {
            "Transcription": f"```{transcription}```",
            "Source": "War Room (Browser Mic)",
            "Target": agent_target or "Auto-routing",
        }
        if confidence:
            fields["Confidence"] = f"{confidence:.1%}"

        return VoiceGateway.send_to_discord(
            title="🎙️ VOICE COMMAND RECEIVED",
            description=transcription,
            color=16776960,  # Gold
            fields=fields,
        )

    @staticmethod
    def log_agent_response(agent_name: str, response_text: str, action: str) -> bool:
        """Log agent response to Discord"""
        return VoiceGateway.send_to_discord(
            title=f"⚡ {agent_name.upper()} RESPONDING",
            description=f"```{response_text}```",
            color=0x00FF00,  # Green
            fields={
                "Agent": agent_name,
                "Action": action,
                "Status": "EXECUTING",
            },
        )

    @staticmethod
    def log_agent_activated(agent_name: str, division: str) -> bool:
        """Log agent activation"""
        return VoiceGateway.send_to_discord(
            title=f"🚀 {agent_name.upper()} ACTIVATED",
            description=f"General {agent_name} is now operational",
            color=0x00FF00,  # Green
            fields={
                "Division": division,
                "Status": "ACTIVE",
                "Method": "Voice Command",
            },
        )

    @staticmethod
    def log_agent_deactivated(agent_name: str) -> bool:
        """Log agent deactivation"""
        return VoiceGateway.send_to_discord(
            title=f"🛑 {agent_name.upper()} DEACTIVATED",
            description=f"General {agent_name} is now offline",
            color=0xFF0000,  # Red
            fields={
                "Status": "INACTIVE",
                "Method": "Voice Command",
            },
        )

    @staticmethod
    def log_swarm_status(active_count: int, total_count: int, agents: Dict[str, bool]) -> bool:
        """Log swarm status"""
        agents_list = "\n".join(
            [f"• {name}: {'🟢 ACTIVE' if active else '🔴 INACTIVE'}" for name, active in agents.items()]
        )

        return VoiceGateway.send_to_discord(
            title="📊 SWARM STATUS",
            description=f"```{agents_list}```",
            color=0x00FFFF,  # Cyan
            fields={
                "Active": f"{active_count}/{total_count}",
                "Power": f"{(active_count/total_count)*100:.0f}%",
            },
        )

    @staticmethod
    def log_lead_generated(agent: str, count: int) -> bool:
        """Log lead generation"""
        return VoiceGateway.send_to_discord(
            title="🎯 LEADS GENERATED",
            description=f"{agent} acquired {count} qualified leads",
            color=0x32CD32,  # Lime
            fields={
                "Agent": agent,
                "Count": str(count),
            },
        )

    @staticmethod
    def log_email_campaign(agent: str, recipients: int) -> bool:
        """Log email campaign"""
        return VoiceGateway.send_to_discord(
            title="📧 EMAIL CAMPAIGN DEPLOYED",
            description=f"{recipients} emails dispatched",
            color=0x4169E1,  # Royal Blue
            fields={
                "Agent": agent,
                "Recipients": str(recipients),
            },
        )

    @staticmethod
    def log_revenue(amount: str, source: str) -> bool:
        """Log revenue milestone"""
        return VoiceGateway.send_to_discord(
            title="💰 REVENUE MILESTONE",
            description=f"${amount} acquired from {source}",
            color=16776960,  # Gold
        )


# ─────────────────────────── TEST ──────────────────────────────────────────

def test_voice_gateway():
    """Test the voice gateway"""
    print("[TEST] Voice Gateway Starting...\n")

    # Test 1: Discord connectivity
    print("1. Testing Discord webhook...")
    success = VoiceGateway.send_to_discord(
        "SOVEREIGN VOICE GATEWAY ONLINE",
        "ElevenLabs + Deepgram + Discord integration active",
        color=16776960,
        fields={"Status": "READY", "Agents": "6/6"}
    )
    print(f"   Discord: {'OK' if success else 'FAILED'}\n")

    # Test 2: Agent activation logging
    print("2. Testing agent activation logging...")
    success = VoiceGateway.log_agent_activated("Douglas", "Strategic Ops")
    print(f"   Logged: {'OK' if success else 'FAILED'}\n")

    # Test 3: Swarm status
    print("3. Testing swarm status update...")
    agents = {
        "douglas": True,
        "hermes": True,
        "sentinel": True,
        "travis": False,
        "aureus": False,
        "khan": False,
    }
    success = VoiceGateway.log_swarm_status(3, 6, agents)
    print(f"   Logged: {'OK' if success else 'FAILED'}\n")

    # Test 4: Revenue milestone
    print("4. Testing revenue logging...")
    success = VoiceGateway.log_revenue("2,500", "High-Ticket Arbitrage")
    print(f"   Logged: {'OK' if success else 'FAILED'}\n")

    # Test 5: Lead generation
    print("5. Testing lead generation logging...")
    success = VoiceGateway.log_lead_generated("Sentinel", 42)
    print(f"   Logged: {'OK' if success else 'FAILED'}\n")

    # Test 6: Email campaign
    print("6. Testing email campaign logging...")
    success = VoiceGateway.log_email_campaign("Hermes", 150)
    print(f"   Logged: {'OK' if success else 'FAILED'}\n")

    # Test 7: API keys status
    print("7. Checking voice service credentials...")
    deepgram_status = "CONFIGURED" if DEEPGRAM_API_KEY else "MISSING"
    elevenlabs_status = "CONFIGURED" if ELEVENLABS_API_KEY else "MISSING"
    discord_status = "CONFIGURED" if DISCORD_WEBHOOK else "MISSING"

    print(f"   Deepgram (STT):   {deepgram_status}")
    print(f"   ElevenLabs (TTS): {elevenlabs_status}")
    print(f"   Discord Webhook:  {discord_status}\n")

    print("[OK] Voice Gateway Test Complete!")


if __name__ == "__main__":
    test_voice_gateway()
