import os
import stripe
import logging
from dotenv import load_dotenv

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentHub:
    """
    Financial Core: Manages billionaire-tier transactions for KDS.
    """
    
    @staticmethod
    def generate_checkout_session(product_name: str, price_usd: int, success_url: str, cancel_url: str):
        """Creates a Stripe Checkout session for high-ticket products."""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"KDS | {product_name}",
                        },
                        'unit_amount': int(price_usd * 100), # Stripe uses cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
            )
            logging.info(f"[PAYMENT] Generated Checkout Session: {session.id}")
            return session.url
        except Exception as e:
            logging.error(f"[PAYMENT ERROR] Failed to create session: {str(e)}")
            return None

    @staticmethod
    def get_revenue_report():
        """Aggregates recent successful payments for the Dashboard."""
        try:
            # Only for demonstration - retrieve last 5 successful payments
            payments = stripe.PaymentIntent.list(limit=5)
            total = sum(p.amount_received for p in payments if p.status == 'succeeded') / 100.0
            return {
                "total_recent_revenue": total,
                "currency": "USD",
                "count": len(payments)
            }
        except Exception as e:
            logging.warning(f"[PAYMENT] Auth/Audit failure: {str(e)}")
            return {"status": "degraded", "revenue": 0.0}

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    hub = PaymentHub()
    # Test generation
    url = hub.generate_checkout_session("Elite AI Strategy Blueprint", 497, "https://kingdrippingswag.io/success", "https://kingdrippingswag.io/cancel")
    print(f"Test Checkout URL: {url}")
