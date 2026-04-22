import os
from dotenv import load_dotenv, set_key

# The Divine Map of required keys
REQUIRED_KEYS = {
    "DISCORD_CHAN_WAR_ROOM": "Sovereign War Room ID",
    "DISCORD_CHAN_SOVEREIGN_DECREES": "Sovereign Decrees ID",
    "DISCORD_CHAN_PROFIT_STREAM": "Profit Stream ID",
    "DISCORD_CHAN_HUNTER_BUNKER": "Hunter Bunker ID",
    "DISCORD_CHAN_HERALD_BUNKER": "Herald Bunker ID",
    "DISCORD_CHAN_AUDITOR_BUNKER": "Auditor Bunker ID",
    "DISCORD_CHAN_SENTINEL_BUNKER": "Sentinel Bunker ID",
    "DISCORD_CHAN_AUREUS_BUNKER": "Aureus Bunker ID",
    "DISCORD_CHAN_KHAN_BUNKER": "Khan Bunker ID",
    "DISCORD_CHAN_GROWTH_STRATEGY": "Growth Strategy ID",
    "DISCORD_CHAN_VIRAL_LAB": "Viral Lab ID",
    "DISCORD_CHAN_OUTREACH_LOG": "Outreach Log ID",
    "DISCORD_CHAN_CASE_STUDIES": "Case Studies ID",
    "DISCORD_CHAN_CLOUD_BACKUPS": "Cloud Backups ID",
    "GOOGLE_DRIVE_VAULT_FOLDER_ID": "Google Drive Folder ID",
}

def run_wizard():
    print("\n🔱 WELCOME TO THE SOVEREIGN SETUP WIZARD 🔱")
    print("============================================")
    print("This wizard will configure your .env file automatically.\n")

    env_path = ".env"

    for key, description in REQUIRED_KEYS.items():
        val = input(f"Enter {description} (or press Enter to skip): ").strip()
        if val:
            set_key(env_path, key, val)
            print(f"✅ {key} updated.")

    print("\n--- GOOGLE CLOUD SETUP ---")
    print("1. Opening Google Cloud Console... Please create your project and service account.")
    import webbrowser
    webbrowser.open("https://console.cloud.google.com/")

    print("\n👉 ACTION REQUIRED: Download your 'service_account.json' and place it in the root folder.")
    input("Press Enter once you have placed service_account.json in the folder...")

    print("\n--- FINALIZING ---")
    print("Sovereign configuration complete. You are now ready to launch.")
    print("============================================")

if __name__ == "__main__":
    run_wizard()
