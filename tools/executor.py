import os
import requests
import stripe
import logging
import json
import sys
import io
import time
import socket
from dotenv import load_dotenv

# Force UTF-8 early to prevent Unicode crashes on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8','utf-8-sig'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from tools.tier1_memory_sqlite import log_execution_event
from tools.communication_payload import dispatch_payload

load_dotenv()

# Initialize API Keys
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
GUMROAD_API_KEY = os.getenv("GUMROAD_API_KEY")
MAKE_WEBHOOK_URL = os.getenv("MAKE_WEBHOOK_URL")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

class Executor:
    """
    B.L.A.S.T. Execution Layer: The 'Hands' of the Sovereign Brain.
    """

    @staticmethod
    def NetworkCheck():
        """Verifies internet connectivity by pinging Google DNS. Enters sleep mode if down."""
        try:
            # Ping 8.8.8.8 on port 53 (DNS)
            socket.setdefaulttimeout(3)
            socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("8.8.8.8", 53))
            return True
        except (socket.error, Exception):
            logging.error("[NETWORK ALERT] DNS failure detected. Pausing API execution to prevent loop degradation.")
            print("\n[!] [NETWORK ALERT] DNS failure detected. Entering Sovereign Sleep Mode (60s)...")
            time.sleep(60)
            return False

    @staticmethod
    def deploy_product(name: str, price: float, description: str, content: str = None) -> str:
        """
        Class A: The Storefront (Asset Deployment) - Gumroad Integration.
        """
        Executor.NetworkCheck()
        logging.info(f"[EXECUTOR] Deploying Asset: {name}")
        
        if not GUMROAD_API_KEY:
            logging.warning("[EXECUTOR] GUMROAD_API_KEY missing. Entering SIMULATION MODE.")
            sim_url = f"https://gumroad.com/l/simulated-{name.lower().replace(' ', '-')}"
            return sim_url

        try:
            url = "https://api.gumroad.com/v2/products"
            payload = {
                "name": name,
                "price": int(price * 100),  # Gumroad expects cents
                "description": description,
                "currency": "usd"
            }
            headers = {
                "Authorization": f"Bearer {GUMROAD_API_KEY}",
                "Content-Type": "application/json"
            }
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                product_url = data.get("product", {}).get("short_url")
                logging.info(f"[EXECUTOR] Product Deployed: {product_url}")
                return product_url
            else:
                logging.error(f"[EXECUTOR] Gumroad Error: {response.text}")
                return None
        except Exception as e:
            logging.error(f"[EXECUTOR] Deployment failed: {str(e)}")
            return None

    @staticmethod
    def create_payment_link(amount: float, currency: str = "usd") -> str:
        """
        Class B: The Cashier (Payment Gateway) - Stripe Payment Links.
        """
        Executor.NetworkCheck()
        logging.info(f"[EXECUTOR] Generating Payment Link for ${amount}")

        if not STRIPE_SECRET_KEY:
            logging.warning("[EXECUTOR] STRIPE_SECRET_KEY missing. Returning placeholder.")
            return "https://buy.stripe.com/mock_payment_link"

        try:
            # First, we need a Price ID. For simplicity, we create a one-off product/price
            # In a production setting, you'd likely reuse existing Price IDs.
            product = stripe.Product.create(name=f"Billionaire Strategy: {amount} Tier")
            price = stripe.Price.create(
                unit_amount=int(amount * 100),
                currency=currency,
                product=product.id,
            )
            payment_link = stripe.PaymentLink.create(
                line_items=[{"price": price.id, "quantity": 1}]
            )
            logging.info(f"[EXECUTOR] Payment Link Created: {payment_link.url}")
            return payment_link.url
        except Exception as e:
            logging.error(f"[EXECUTOR] Stripe Link Failure: {str(e)}")
            dispatch_payload("both", "RevenueAlert", f"⚠️ Payment Link Failure: {str(e)}", agent_profile="sentinel")
            return None

    @staticmethod
    def blast_content(platform: str, content_payload: str) -> bool:
        """
        Class C: The Amplifier (Distribution) - Make.com Webhooks.
        """
        Executor.NetworkCheck()
        logging.info(f"[EXECUTOR] Blasting content to {platform}...")

        if not MAKE_WEBHOOK_URL:
            logging.warning("[EXECUTOR] MAKE_WEBHOOK_URL missing. Simulation only.")
            print(f"[BLAST SIMULATION] Platform: {platform} | Content: {content_payload[:50]}...")
            return True

        try:
            data = {
                "platform": platform,
                "content": content_payload,
                "timestamp": os.popen("date /t").read().strip() # Simple timestamp
            }
            response = requests.post(MAKE_WEBHOOK_URL, json=data)
            return response.status_code == 200
        except Exception as e:
            logging.error(f"[EXECUTOR] Blast Failure: {str(e)}")
            return False

    @staticmethod
    def scarcity_engine(product_name: str) -> str:
        """
        The Psychology Hack: Updates scarcity state for high conversion.
        """
        logging.info(f"[SCARCITY] Calculating urgency for {product_name}...")
        
        # In a real system, this would read from execution_logs via tier1_memory_sqlite
        # For now, we simulate a 'Stock' decrease
        try:
            state_file = "scarcity_manifest.json"
            if os.path.exists(state_file):
                with open(state_file, "r") as f:
                    manifest = json.load(f)
            else:
                manifest = {}

            current_stock = manifest.get(product_name, 10)
            new_stock = max(1, current_stock - 1)
            manifest[product_name] = new_stock
            
            with open(state_file, "w") as f:
                json.dump(manifest, f, indent=4)
            
            urgency_msg = f"ONLY {new_stock} LEFT" if new_stock < 5 else "Limited Availability"
            logging.info(f"[SCARCITY] {product_name}: {urgency_msg}")
            return urgency_msg
        except Exception as e:
            logging.error(f"[SCARCITY ERROR] {str(e)}")
            return "Limited Supply"

def deploy_variants(lead_data: dict, base_blueprint: dict):
    """
    A/B Pivot Logic: Deploys 3 variations of the offer.
    """
    variants = [
        {"name": f"Standard: {base_blueprint['name']}", "price": base_blueprint['price'] * 0.8, "tier": "ENTRY"},
        {"name": f"Premium: {base_blueprint['name']}", "price": base_blueprint['price'], "tier": "PRO"},
        {"name": f"Elite: {base_blueprint['name']}", "price": base_blueprint['price'] * 2.5, "tier": "UHNWI"},
    ]
    
    results = []
    for var in variants:
        logging.info(f"[VARIANT] Deploying {var['tier']} tier...")
        url = Executor.deploy_product(
            name=var['name'],
            price=var['price'],
            description=f"{var['tier']} tier strategy for {lead_data['entity']}."
        )
        pay_link = Executor.create_payment_link(var['price'])
        results.append({"url": url, "pay": pay_link, "name": var['name']})
        
    return results

def execute_revenue_loop(target_niche: str, product_blueprint: dict, use_variants: bool = True):
    """
    Main Logic Flow for the Revenue Loop with Power-Ups.
    """
    logging.info(f"[MONETIZE] Initiating Revenue Loop for {target_niche}")
    
    if use_variants:
        deployment_results = deploy_variants({"entity": target_niche}, product_blueprint)
        # Use the Premium one for the main blast link
        main_url = deployment_results[1]["url"]
        main_pay = deployment_results[1]["pay"]
        product_name = deployment_results[1]["name"]
    else:
        main_url = Executor.deploy_product(
            name=product_blueprint.get("name", "Elite Strategy"),
            price=product_blueprint.get("price", 497.0),
            description=product_blueprint.get("description", "Exclusive billionaire-tier AI strategy.")
        )
        main_pay = Executor.create_payment_link(product_blueprint.get("price", 497.0))
        product_name = product_blueprint.get("name")

    # Scarcity Engine Call
    urgency = Executor.scarcity_engine(product_name)

    # 3. Amplification
    Executor.blast_content("X", f"🚨 {urgency}! Sovereign Strategy for {target_niche} updated. {main_url or main_pay}")

    # 4. Logging & Alerting
    log_execution_event(
        target_niche=target_niche,
        product_name=product_name,
        landing_page_url=main_url,
        payment_link=main_pay,
        status="success" if (main_url or main_pay) else "failed"
    )

    dispatch_payload(
        "telegram", 
        "NewProductLaunch", 
        f"🚀 ASSET CLUSTER DEPLOYED\nNiche: {target_niche}\nUrgency: {urgency}\nURL: {main_url}",
        agent_profile="agentzero"
    )

if __name__ == "__main__":
    from tools.tier1_memory_sqlite import init_db
    init_db(run_schema=True)
    logging.basicConfig(level=logging.INFO)
    # Test Run
    test_blueprint = {
        "name": "Alpha Quant Strategy 2026",
        "price": 997.0,
        "description": "Proprietary AI architecture for high-frequency sentiment analysis."
    }
    execute_revenue_loop("Hedge Fund Quants", test_blueprint)
