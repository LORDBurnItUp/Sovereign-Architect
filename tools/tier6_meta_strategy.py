import json
import datetime
import os
from tools.tier1_memory_sqlite import init_db

def package_blueprint(title: str, tactics: list, price: float = 99.0) -> dict:
    """
    Tier 6: Meta-Strategy Brain
    Distills winning tactics into a sellable blueprint schema.
    """
    blueprint = {
        "product_id": f"BP-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
        "title": title,
        "journey_summary": f"Autonomous extraction of winning strategy: {title}",
        "winning_tactics_included": tactics,
        "price_usd": price,
        "format": "Blueprint",
        "delivery_links": ["https://kingsdrippingswag.io/blueprints/active"]
    }
    
    # Save to Tier 1 for record keeping
    try:
        conn = init_db()
        if conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO core_memory (fact, timestamp) VALUES (?, ?)", 
                        (f"Generated Blueprint: {title}", datetime.datetime.now().isoformat()))
            conn.commit()
            conn.close()
    except:
        pass
        
    return blueprint

if __name__ == "__main__":
    bp = package_blueprint("Dubai Billionaire Outreach Playbook", ["Direct DM to MGX", "Data Center ROI Analysis"])
    print(json.dumps(bp, indent=2))
