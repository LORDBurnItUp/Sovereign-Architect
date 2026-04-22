import os
from dotenv import load_dotenv, set_key

# =========================================================================
# B.L.A.S.T. SOVEREIGN CONFIGURATOR
# =========================================================================

ENV_FILE = ".env"
REQUIRED_KEYS = [
    "GCP_PROJECT_ID", "GCP_API_KEY", "DISCORD_BOT_TOKEN", 
    "GUMROAD_API_KEY", "STRIPE_SECRET_KEY", "MERCADOPAGO_ACCESS_TOKEN", 
    "WHATSAPP_API_KEY", "WHATSAPP_SENDER_ID", "MAKE_WEBHOOK_URL"
]

def configure():
    # Ensure .env exists
    if not os.path.exists(ENV_FILE):
        with open(ENV_FILE, "w") as f:
            f.write("# Sovereign Environment Variables\n")

    load_dotenv(ENV_FILE)
    print("\n" + "="*40)
    print("   B.L.A.S.T. SOVEREIGN CONFIGURATOR")
    print("="*40)
    
    any_missing = False
    for key in REQUIRED_KEYS:
        # We use os.environ directly to check the freshly loaded state
        if not os.getenv(key):
            any_missing = True
            val = input(f"Missing {key}. Enter value: ")
            set_key(ENV_FILE, key, val)
            # Reload env to reflect changes
            load_dotenv(ENV_FILE, override=True)
            print(f"✅ {key} saved.")
        else:
            print(f"✅ {key} is already configured.")
    
    if not any_missing:
        print("\n[VERIFIED] All Sovereign Keys are locked in. Swarm is lethal.")
    else:
        print("\n[SUCCESS] Configurations updated. System ready for boot.")

if __name__ == "__main__":
    try:
        configure()
    except EOFError:
        print("\n[ERROR] Input stream interrupted.")
    except Exception as e:
        print(f"\n[CRITICAL ERROR] {str(e)}")
