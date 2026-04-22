import os
import discord
from discord.ext import commands
from dotenv import load_dotenv
import asyncio
import sys
import io

# Force UTF-8 for Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

# =========================================================================
# GRAVITY-HERMES DISCORD MAIN BOT (SOVEREIGN EDITION)
# =========================================================================

TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CHANNEL_ID = os.getenv("DISCORD_CHANNEL_ID")

if not TOKEN or TOKEN == "YOUR_DISCORD_BOT_TOKEN_HERE":
    print("[ERROR] DISCORD_BOT_TOKEN not found in .env. Please set it.")
    # Exit gracefully if not configured, or run in simulation mode
    
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"--- GRAVITY-HERMES DISCORD BOT ACTIVE ---")
    print(f"Logged in as: {bot.user.name} ({bot.user.id})")
    print(f"Awaiting deployment orders...")
    
    if CHANNEL_ID:
        try:
            channel = bot.get_channel(int(CHANNEL_ID))
            if channel:
                await channel.send("🚀 **GRAVITY-HERMES DISCORD BOT ONLINE**\nSystems calibrated. War Mode standby.")
        except Exception as e:
            print(f"[WARNING] Could not send startup message: {e}")

@bot.command(name="status")
async def status(ctx):
    """Check the status of the Sovereign Profit Machine."""
    embed = discord.Embed(
        title="🛰️ GRAVITY-HERMES SYSTEM STATUS",
        description="System is running in **BEAST MODE**.",
        color=discord.Color.gold()
    )
    embed.add_field(name="Environment", value=os.getenv("ENVIRONMENT", "Production"), inline=True)
    embed.add_field(name="Domain", value=os.getenv("HOSTINGER_DOMAIN", "kingdrippingswag.io"), inline=True)
    embed.add_field(name="War Mode", value="ACTIVE" if os.path.exists(".war_mode") else "INACTIVE", inline=True)
    embed.set_footer(text="Gemma 4 26B | Sovereign AI")
    await ctx.send(embed=embed)

@bot.command(name="war")
async def toggle_war(ctx, action: str = None):
    """Toggle War Mode / Strike Logic."""
    if action == "on":
        with open(".war_mode", "w") as f:
            f.write("ACTIVE")
        await ctx.send("🔥 **WAR MODE ACTIVATED.** Deploying Arbitrage Striker...")
    elif action == "off":
        if os.path.exists(".war_mode"):
            os.remove(".war_mode")
        await ctx.send("🛑 **WAR MODE DEACTIVATED.** Returning to ambient observation.")
    else:
        status = "ACTIVE" if os.path.exists(".war_mode") else "INACTIVE"
        await ctx.send(f"War Mode is currently: **{status}**. Use `!war on` or `!war off`.")

@bot.command(name="ping")
async def ping(ctx):
    await ctx.send(f"🏓 Pong! Latency: {round(bot.latency * 1000)}ms")

async def main():
    if TOKEN:
        await bot.start(TOKEN)
    else:
        print("Waiting for TOKEN initialization...")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutting down bot...")
