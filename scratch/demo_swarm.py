import os
import sys
import time
import logging

# Ensure project root is in path
sys.path.append(os.getcwd())

from tools.brain_router import brain_route_inference
from tools.ollama_client import query_ollama
from tools.openrouter_client import query_openrouter

# Setup minimalist logging for the demo
logging.basicConfig(level=logging.INFO, format="%(message)s")

def demo_scenario(name, prompt, high_reasoning=False):
    print(f"\n{'='*20} SCENARIO: {name} {'='*20}")
    print(f"INPUT: {prompt}")
    print(f"HIGH REASONING REQ: {high_reasoning}")
    print("-" * 50)
    
    start_time = time.time()
    response = brain_route_inference(prompt, high_reasoning_req=high_reasoning)
    end_time = time.time()
    
    print(f"RESPONSE: {response}")
    print(f"TIME TAKEN: {end_time - start_time:.2f}s")
    print(f"{'='*60}")

if __name__ == "__main__":
    print("👑 KING DRIPPING SWAG: SWARM INTELLIGENCE DEMO 👑")
    print("Demonstrating how the hybrid brain routes tasks based on priority and availability.")

    # Scenario 1: High Stakes Billionaire Hunting (Vertex AI / Open Router Fallback)
    demo_scenario(
        "BILLIONAIRE HUNTING (High Reasoning)",
        "Identify top 5 AI investors in Dubai and draft a personalized elite pitch for King Dripping Swag services.",
        high_reasoning=True
    )

    # Scenario 2: Routine Meta-Strategy (Standard Swarm)
    demo_scenario(
        "ROUTINE SEO STRATEGY (Standard)",
        "Generate SEO keywords for 'Exclusive AI Command Centers' in high-net-worth niches.",
        high_reasoning=False
    )

    # Scenario 3: Local Recovery (Simulating Network Latency/Failure)
    # We use a prompt that clearly indicates it's local if internet fails
    demo_scenario(
        "LOCAL FALLBACK (Routine Task)",
        "Summarize the last 10 execution cycles for local archival.",
        high_reasoning=False
    )
