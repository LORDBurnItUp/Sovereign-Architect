# Architecture SOP: The Unstoppable Multi-Tier Swarm (Gemma 4 & Hybrid Fallbacks)

## 1. Executive Summary
The King's Cerebral Backbone must never sleep and never fail. To ensure 100% uptime for our money-printing agents, we implement a **Swarm Intelligence Architecture**. This system intelligently routes requests across local, cloud, and gateway providers, prioritizing local hardware for privacy/cost and cloud for high-reasoning, with a relentless fallback to free-tier aggregators.

## 2. The Swarm Hierarchy
The Brain Router implements the following priority protocol:

| Tier | Provider | Model | Use Case | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Core)** | **Ollama (Local)** | Gemma 4 2B/4B | Routine ambient tasks, local data processing. | $0 (Local Power) |
| **Tier 2 (Strat)** | **Vertex AI (GCP)** | Gemma 4 26B (A4B) | High-ticket strategy, Billionaire Hunting. | Credits (High Fidelity) |
| **Tier 3 (Global)** | **Open Router** | Free Tier Models | Global fallback when local or GCP is unreachable. | $0 (Free Tiers) |
| **Tier 4 (Edge)** | **Gemma 4 Local** | Gemma 4 27B | The local heavy-lifter (if hardware permits). | $0 (Local Power) |

## 3. Tool Logic (`tools/brain_router.py`)
1. **Health Check**: Ping local Ollama. If online, use for T1.
2. **Context Routing**: If high-value entities detected, attempt Vertex AI.
3. **Fail-safe Logic**:
   - If Vertex AI returns 4xx/5xx or timeout -> Route to Open Router.
   - If Open Router fails -> Route to local Ollama (Gemma 4).
   - If all fail -> Execute baseline heuristic-mode.

## 4. Unstoppable Agent Workflow
- **Sentinel**: Monitors network health and model availability.
- **Douglas**: Handles technical strategy via local Gemma.
- **Sentinel (Tier 6)**: Uses Vertex/OpenRouter for meta-strategy blueprints.

## 5. Deployment Instructions
1. Ensure Ollama is running (`ollama serve`).
2. Pull required models: `ollama pull gemma4:2b`, `ollama pull gemma4:7b`.
3. Configure `OPENROUTER_API_KEY` in `.env`.
4. Enable Vertex AI via Google Cloud Console (Model Garden).
