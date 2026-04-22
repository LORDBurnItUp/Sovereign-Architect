import requests
import os
import logging
from dotenv import load_dotenv

load_dotenv()

def query_openrouter(prompt, model="google/gemma-4-31b-it:free", context=""):
    """
    Open Router Gateway with Multi-Model Fallback Swarm.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logging.error("[OPENROUTER] API Key missing.")
        return None

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://kingdrippingswag.io", 
        "X-Title": "Gravity Claw Swarm",
        "Content-Type": "application/json"
    }

    # Swarm of free fallbacks (Updated)
    models_to_try = [
        model if model and "free" in model else "google/gemma-4-31b-it:free", 
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "openrouter/free"
    ]

    for model_id in models_to_try:
        try:
            logging.info(f"[OPENROUTER] Attempting model: {model_id}...")
            payload = {
                "model": model_id,
                "messages": [
                    {"role": "system", "content": f"The King's Global Swarm. Context: {context}"},
                    {"role": "user", "content": prompt}
                ]
            }
            response = requests.post(url, headers=headers, json=payload, timeout=20)
            if response.status_code == 200:
                data = response.json()
                if 'choices' in data and len(data['choices']) > 0:
                    return data['choices'][0]['message']['content']
            
            logging.warning(f"[OPENROUTER] Model {model_id} failed with {response.status_code}.")
            if response.status_code == 404:
                continue # Try next model
            else:
                # If it's 429 or other, maybe try one more then stop
                continue

        except Exception as e:
            logging.error(f"[OPENROUTER FAIL] {model_id} Exception: {str(e)}")
            continue

    return None

if __name__ == "__main__":
    res = query_openrouter("Test global fallback.")
    print(f"OpenRouter Result: {res}")
