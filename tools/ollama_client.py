import requests
import json
import logging
import os

def query_ollama(prompt, model="gemma31b", context=""):
    """
    Local Inference Tool: Communicates with Ollama for 100% local, free execution.
    Primary Model: Gemma 31B (Sovereign Cloud).
    """
    url = os.getenv("OLLAMA_HOST", "http://localhost:11434/api/generate")
    
    payload = {
        "model": model,
        "prompt": f"Context: {context}\n\nTask: {prompt}",
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            return response.json().get("response", "Ollama returned empty response.")
        else:
            return f"[OLLAMA ERROR] Status {response.status_code}"
    except Exception as e:
        logging.warning(f"[OLLAMA OFFLINE] Ensure 'ollama serve' is running: {str(e)}")
        return None

if __name__ == "__main__":
    test_res = query_ollama("Hello local brain.")
    if test_res:
        print(f"Ollama Response: {test_res}")
    else:
        print("Ollama is offline.")
