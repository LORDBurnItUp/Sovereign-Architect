import os
import json
from datetime import datetime

def generate_seo_metadata(niche: str, location: str) -> dict:
    """
    Generates a full elite SEO strategy with structured data,
    Open Graph, Twitter Card, and long-tail keyword clusters
    for the King Dripping Swag high-ticket AI niche.
    """
    timestamp = datetime.now().isoformat()

    # ── Keyword clusters ──────────────────────────────────────────
    primary_keywords = [
        f"AI development agency {location}",
        f"elite AI consulting {location}",
        f"bespoke LLM development {location}",
        f"sovereign AI infrastructure {location}",
        f"AI strategy consulting UAE",
    ]
    long_tail_keywords = [
        f"proprietary {niche} for sovereign wealth funds",
        f"billionaire-grade AI automation {location}",
        f"UHNWI AI development agency {location}",
        f"MGX AI partner {location}",
        f"G42 AI development services {location}",
        f"family office AI automation {location}",
        f"high-ticket {niche} results",
        f"B.L.A.S.T AI protocol {location}",
    ]
    semantic_keywords = [
        "sovereign intelligence systems",
        "AI-driven performance marketing",
        "autonomous agent swarms",
        "RAG pipeline development",
        "enterprise LLM deployment",
        "AI infrastructure consulting",
        "state fund AI strategy",
    ]

    # ── Titles & Descriptions ─────────────────────────────────────
    title = f"King Dripping Swag | Elite {niche} in {location} | Sovereign AI Systems"
    og_title = f"King Dripping Swag | {location}'s Elite AI Development Agency"
    description = (
        f"King Dripping Swag builds sovereign intelligence systems and hyper-scale "
        f"AI infrastructure for the world's most demanding family offices and billionaires."
    )
    
    # Tier 2: Entity Schema (Structured Data)
    schema = {
        "@context": "https://schema.org",
        "@type": "AIAdvisors",
        "name": "King Dripping Swag",
        "url": "https://kingdrippingswag.io",
        "logo": "https://kingdrippingswag.io/logo.png",
        "description": description,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": location,
            "addressRegion": "Global",
            "addressCountry": "US/Global"
        }
    }

    # Tier 3: High-Intent Keyword Cloud
    keywords = [
        f"Billionaire {niche}",
        f"Family Office {niche} Strategy",
        "Ultra High Net Worth AI Advisory",
        "Private AI Infrastructure Deployment",
        "Quant AI Systems Global",
        "Elite AI Automation Billionaire",
        "Confidential AI Portfolio Strategy"
    ]

    # Tier 4: Strategic Signal Analysis (Signals we track)
    signals = {
        "Global Markets": f"Major AI data center expansion aligns with King Dripping Swag's {niche} capabilities.",
        "Silicon Valley": "Venture flow into AGIs mandates a professional intelligence layer.",
        "Alpha Quant": f"Proprietary quant systems complement King Dripping Swag's LLM stack expertise."
    }

    # Tier 5: Outreach Hooks (Strategic entry points)
    outreach_hooks = {
        "Global Tech Ventures": "Proposing sovereign intelligence layer for global portfolio management.",
        "Alpha Quant Group": "Unified dashboard visibility for real-time AI and market sentiment.",
        "Vertex Holdings": "B.L.A.S.T protocol for mission-critical industrial AI integration.",
        "AI Development Agency": "Proprietary LLM stack for confidential wealth fund operations."
    }

    return {
        "title": title, # Flat title for easy access
        "meta": {
            "title": title,
            "ogTitle": og_title,
            "description": description,
            "keywords": keywords
        },
        "schema": schema,
        "signals": signals,
        "outreach_hooks": outreach_hooks,
        "siteName": "King Dripping Swag",
        "analyticsId": "KDS-UHNW-01"
    }

def export_next_metadata(niche: str, location: str, output_path: str = None) -> str:
    """
    Exports SEO metadata as a Next.js-compatible metadata object string.
    Paste directly into layout.tsx or page.tsx.
    """
    data = generate_seo_metadata(niche, location)
    keywords_flat = data["meta"]["keywords"]

    next_metadata = f"""export const metadata = {{
  title: "{data['title']}",
  description: "{data['meta']['description']}",
  keywords: {json.dumps(keywords_flat, indent=4)},
  openGraph: {{
    title: "{data['meta']['ogTitle']}",
    description: "{data['meta']['description']}",
    type: "website",
    locale: "en_US",
    siteName: "King Dripping Swag",
  }},
  twitter: {{
    card: "summary_large_image",
    title: "{data['meta']['ogTitle']}",
    description: "{data['meta']['description']}",
  }},
  robots: {{ index: true, follow: true }},
  alternates: {{ canonical: "https://kingsdrippingswag.io" }},
}};"""

    if output_path:
        with open(output_path, "w") as f:
            f.write(next_metadata)
        print(f"[SEO] Metadata exported to {output_path}")

    return next_metadata


if __name__ == "__main__":
    result = generate_seo_metadata("AI Development Agency", "Dubai")
    print(f"[SEO] Title: {result['title']}")
    print(f"[SEO] Primary keywords: {result['meta']['keywords']}")
    print(f"[SEO] Structured data type: {result['schema']['@type']}")
    print(f"[SEO] Outreach hooks: {list(result['outreach_hooks'].keys())}")
    print("[SEO] Strategy generation complete.")
