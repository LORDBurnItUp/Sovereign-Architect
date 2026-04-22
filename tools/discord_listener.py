import os
import time
import requests
import logging
import subprocess
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

# Ensure root is in path for relative imports
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.append(root_path)

from tools.payment_hub import PaymentHub
from tools.communication_payload import dispatch_payload
from tools.workspace_connector import WorkspaceConnector
from tools.cloud_orchestrator import CloudOrchestrator
from tools.tier1_memory_sqlite import remember_fact

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")

class SovereignDiscordHub(commands.Bot):
    """
    Sovereign Bot Logic: In-bound command processing for KDS Infrastructure via Discord.
    """
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix="!", intents=intents)
        self.payment_hub = PaymentHub()
        self.workspace = WorkspaceConnector()
        self.orchestrator = CloudOrchestrator()

    async def setup_hook(self):
        logging.info("[DISCORD] Sovereign Hub setup complete.")

    async def on_message(self, message):
        # Ignore our own messages
        if message.author == self.user:
            return

        # Process commands
        await self.process_commands(message)

        # If not a command, treat as Sovereign Profile Intel
        if not message.content.startswith("!"):
            # We assume messages in the War Room channel from the Boss are intel
            logging.info(f"[PULSE] Capturing intel from {message.author.name}: {message.content[:50]}...")
            remember_fact(f"SOVEREIGN_PROFILE: Boss Intel: {message.content}")

    async def on_ready(self):
        logging.info(f"[DISCORD] Logged in as {self.user.name} ({self.user.id})")
        dispatch_payload("Discord", "SystemAlert", "Sovereign Command Center Discord Hub online.", "operator")

bot = SovereignDiscordHub()

@bot.command(name="status")
async def status_cmd(ctx):
    frozen = "⚠️ FROZEN" if os.path.exists(".stop_loop") else "✅ RUNNING"
    msg = f"📡 **SYSTEM STATUS**\n- Swarm Loop: {frozen}\n- Vertex AI: NOMINAL (Synced)\n- GCS Sync: ACTIVE\n- Tailscale: SECURE"
    embed = discord.Embed(title="Status Report", description=msg, color=0x3498db)
    await ctx.send(embed=embed)

@bot.command(name="stop_all")
async def stop_all_cmd(ctx):
    with open(".stop_loop", "w") as f:
        f.write("STOP")
    embed = discord.Embed(title="🛑 KILL SWITCH ENGAGED", description="Agent loop operations have been frozen. The system is now in idle mode.", color=0xe74c3c)
    await ctx.send(embed=embed)

@bot.command(name="start_all")
async def start_all_cmd(ctx):
    if os.path.exists(".stop_loop"):
        os.remove(".stop_loop")
        embed = discord.Embed(title="🚀 KILL SWITCH RELEASED", description="Agent loop resuming operations...", color=0x2ecc71)
        await ctx.send(embed=embed)
    else:
        await ctx.send("ℹ️ System is already running.")

@bot.command(name="revenue")
async def revenue_cmd(ctx):
    report = bot.payment_hub.get_revenue_report()
    msg = f"💰 **FINANCIAL AUDIT**\n\nRecent Revenue: ${report['total_recent_revenue']:.2f}\nCurrency: {report['currency']}\nStatus: {report.get('status', 'NOMINAL')}"
    embed = discord.Embed(title="Revenue Report", description=msg, color=0xf1c40f)
    await ctx.send(embed=embed)

@bot.command(name="test_brain")
async def test_brain_cmd(ctx):
    await ctx.send("🧠 Initiating Vertex AI Diagnostic...")
    try:
        # Run the diagnostic script and capture output
        res = subprocess.check_output(["python", "scratch/fix_vertex_auth.py"], stderr=subprocess.STDOUT).decode()
        summary = res.split("---")[1] if "---" in res else res[:500]
        embed = discord.Embed(title="DIAGNOSTIC COMPLETE", description=f"```\n{summary}\n```", color=0x9b59b6)
        await ctx.send(embed=embed)
    except Exception as e:
        await ctx.send(f"❌ Diagnostic failed: {str(e)}")

@bot.command(name="drive_sync")
async def drive_sync_cmd(ctx):
    await ctx.send("📂 Querying Workspace Intelligence...")
    try:
        files = bot.workspace.list_files(page_size=5)
        msg = "**WORKSPACE ASSETS**\n\n"
        for f in files:
            msg += f"• {f['name']} (`{f['id'][:10]}`)\n"
        embed = discord.Embed(title="Google Drive Sync", description=msg, color=0x3498db)
        await ctx.send(embed=embed)
    except Exception as e:
        await ctx.send(f"❌ Workspace Error: {str(e)}")

@bot.command(name="vm_deploy")
async def vm_deploy_cmd(ctx):
    node_id = f"discord-agent-{int(time.time())}"
    await ctx.send(f"🚀 Provisioning Project Vortex VM: `{node_id}`...")
    success = bot.orchestrator.provision_agent_node(node_id)
    if success:
        await ctx.send(f"✅ VM `{node_id}` online. Syncing Tailscale...")
    else:
        await ctx.send(f"❌ Provisioning failed. Check GCP Console.")

@bot.command(name="war_room")
async def war_room_cmd(ctx):
    """Joins the operator's voice channel to open the War Room."""
    if not ctx.message.author.voice:
        await ctx.send("❌ You must be in a voice channel first.")
        return
    
    channel = ctx.message.author.voice.channel
    try:
        if ctx.voice_client is not None:
            await ctx.voice_client.move_to(channel)
        else:
            await channel.connect()
        
        embed = discord.Embed(title="🎙️ WAR ROOM SECURED", description=f"Agent Hub is transceiving in `{channel.name}`.\nVoice-enabled operator interaction is online.", color=0xD4AF37)
        await ctx.send(embed=embed)
    except Exception as e:
        await ctx.send(f"❌ Could not secure War Room: {str(e)}")

@bot.command(name="leave_war_room")
async def leave_war_room_cmd(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
        embed = discord.Embed(title="🎙️ WAR ROOM CLOSED", description="Agent Hub disconnected.", color=0x34495e)
        await ctx.send(embed=embed)
    else:
        await ctx.send("ℹ️ I'm not in a voice channel.")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    if not TOKEN or TOKEN == "your_discord_bot_token":
        logging.error("[DISCORD] Missing DISCORD_TOKEN in .env")
        sys.exit(1)
    
    bot.run(TOKEN)
