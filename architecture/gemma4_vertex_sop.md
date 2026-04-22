# Architecture SOP: King's Cerebral Swarm (Gemma 4 Hybrid Platform)

## 1. Executive Summary
To maintain 24/7 dominance as an unstoppable profit machine, the Gravity Claw architecture utilizes a **Swarm Hybrid Infrastructure**. This ensures that high-ticket strategic reasoning, billionaire hunting, and meta-strategy generation are always available, even if specific cloud endpoints fail.

## 2. Infrastructure Tiers
1. **Premium Tier**: **Gemma 4 26B (A4B MoE)** on **Google Cloud Vertex AI**. Used for high-stakes intelligence.
2. **Global Fallback**: **Open Router Swarm**. Provides access to free-tier models (Gemma 2, Llama 3) when Vertex AI is offline.
3. **Local Sovereignty**: **Ollama (Gemma 4 Local)**. 100% local execution on mobile clusters or local hardware for privacy and zero-cost routine tasks.

## 3. Integration Logic (`tools/brain_router.py`)
The system follows the **Swarm Protocol**:
- Detects the need for "High Reasoning" (Billionaire leads/Meta-strategy).
- Attempts Vertex AI (Gemma 4 26B).
- If failure/timeout -> Dispatches to Open Router (Free tier).
- If internet is severed -> Reverts to Local Ollama (Gemma 4 2B/7B).

## 4. Local Setup (Ollama)
- Models required: `gemma4:2b`, `gemma4:7b`.
- Run: `ollama pull gemma4:2b`
- Ensure `ollama serve` is active.

## 5. Google Cloud Console Activation
To enable the Premium Tier:
1. Navigate to **Vertex AI Model Garden**.
2. Search for **Gemma 4**.
3. Deploy to an Endpoint named `gemma4-26b-prod`.
4. Ensure the Service Account has `Vertex AI User` permissions.

## 6. Fail-safe Loops
The `brain_router` ensures that bots never run out of credits by seamlessly switching to free tiers. Every failure is logged in `agent_progress.log` but execution remains UNSTOPPABLE.
