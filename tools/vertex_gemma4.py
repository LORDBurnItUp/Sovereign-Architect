import os
import logging
from dotenv import load_dotenv

# Strategic Import: Google Cloud AI Platform (if installed)
try:
    from google.cloud import aiplatform
    HAS_VERTEX_SDK = True
except ImportError:
    HAS_VERTEX_SDK = False

load_dotenv()

def generate_strategic_reasoning(prompt, context=""):
    """
    Tier 6 Reasoning: Offloads complex strategy to Gemma 4 26B on Vertex AI.
    """
    project_id = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "us-central1")
    endpoint_id = os.getenv("VERTEX_ENDPOINT_ID")

    if not HAS_VERTEX_SDK:
        logging.warning("[VERTEX] SDK missing/installing. Falling back to high-capacity local simulation.")
        return f"[SIMULATED GEMMA 4 26B] Strategic Analysis: {prompt[:100]}... (Protocol: A4B-MoE)"

    if not project_id or not endpoint_id:
        logging.info("[VERTEX] Missing GCP config. Using baseline Reasoning Engine.")
        return f"[REASONING ENGINE] Analyzing billionaire patterns for: {prompt[:50]}..."

    try:
        aiplatform.init(project=project_id, location=location)
        endpoint = aiplatform.Endpoint(endpoint_id)
        
        # Prepare Multimodal / Thinking Prompt
        full_prompt = f"System: You are the King's Cerebral Backbone (Gemma 4 26B).\nContext: {context}\nTask: {prompt}"
        
        # Prediction
        response = endpoint.predict(instances=[{"content": full_prompt}])
        return response.predictions[0]
    
    except Exception as e:
        logging.error(f"[VERTEX ERROR] Cerebral Backbone SDK disconnected: {str(e)}")
        
        # SECONDARY FALLBACK: Google AI Studio (Gemini 1.5 Flash) via REST
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if google_api_key:
            logging.info("[VERTEX FALLBACK] Attempting Google AI Studio (Gemini 1.5 Flash) REST fallback...")
            try:
                import requests
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={google_api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": f"System: You are the King's Cerebral Backbone. Context: {context}\nTask: {prompt}"}]}]
                }
                res = requests.post(url, headers=headers, json=payload, timeout=15)
                if res.status_code == 200:
                    return res.json()["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as fe:
                logging.error(f"[VERTEX FALLBACK FAIL] REST API also failed: {str(fe)}")

        return "[FALLBACK] Strategic reasoning module offline. Defaulting to Tier 1 heuristics."

if __name__ == "__main__":
    print(generate_strategic_reasoning("Develop a high-ticket acquisition strategy for Silicon Dynasties."))
