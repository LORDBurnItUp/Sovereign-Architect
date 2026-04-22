import logging
import os
import requests
from tools.vertex_gemma4 import generate_strategic_reasoning
from tools.ollama_client import query_ollama
from tools.openrouter_client import query_openrouter
from tools.tier1_memory_sqlite import get_core_memory, get_sovereign_profile

def brain_route_inference(prompt, context="", high_reasoning_req=False):
    """
    The Master Router: Implements the Unstoppable Swarm Logic.
    Sovereign Priority: Ollama (Gemma 31B) -> Vertex -> OpenRouter (Free)
    """
    # Inject Sovereign Profile context (Neural Map)
    profile_facts = get_sovereign_profile(limit=20)
    if profile_facts:
        sovereign_context = "\n".join([f"- {f}" for f in profile_facts])
        context = f"{context}\n\n[SOVEREIGN neural_profile/memory]:\n{sovereign_context}\n"
    
    # Also inject general recent memories
    recent_facts = get_core_memory(limit=5)
    filtered_facts = [f for f in recent_facts if "SOVEREIGN_PROFILE" not in f]
    if filtered_facts:
        context = f"{context}\n[Recent Memories]:\n" + "\n".join(filtered_facts)
    
    
    # 1. Sovereign Priority: Local High-Capacity Model (Ollama)
    # The user considers this their 'Default Cloud' for privacy and power.
    logging.info("[ROUTER] Attempting Sovereign Path (Ollama)...")
    ollama_model = os.getenv("OLLAMA_MODEL", "gemma31b")
    
    # Heartbeat Check
    try:
        requests.get("http://localhost:11434", timeout=2)
    except:
        print("\n" + "!"*60)
        print("[CRITICAL] SOVEREIGN BRAIN OFFLINE.")
        print("Please run 'ollama serve' in a separate terminal to restore intelligence.")
        print("!"*60 + "\n")
        logging.critical("SOVEREIGN BRAIN OFFLINE. Redirecting traffic to fallback swarms.")
        res = None
    else:
        res = query_ollama(prompt, model=ollama_model, context=context)

    if res and "[OLLAMA ERROR]" not in res:
        return f"[SOVEREIGN] {res}"

    # 2. High-Reasoning Path (Vertex AI / Gemma 4 26B)
    if high_reasoning_req:
        logging.info("[ROUTER] Attempting Vertex AI Path...")
        res = generate_strategic_reasoning(prompt, context)
        if res and "[FALLBACK]" not in res and "[SIMULATED]" not in res:
            return res

    # 2. Global Swarm Path (Open Router Free Tiers)
    logging.info("[ROUTER] Attempting Global Swarm Path (Open Router)...")
    res = query_openrouter(prompt, context=context)
    if res:
        return f"[OPENROUTER] {res}"
    
    # 3. Local Hardware Path (Ollama)
    logging.info("[ROUTER] Attempting Local Hardware Path (Ollama)...")
    res = query_ollama(prompt, context=context)
    if res:
        return f"[LOCAL-GEMMA] {res}"

    # 4. Final Heuristic Fallback
    logging.error("[ROUTER] TOTAL SYSTEM DEGRADATION. Using heuristic baseline.")
    return f"[HEURISTIC] Processing '{prompt[:30]}...' with minimal cognitive load."

if __name__ == "__main__":
    print("--- SWARM ROUTER TEST ---")
    print(brain_route_inference("Plan a high-stakes meeting.", high_reasoning_req=True))
