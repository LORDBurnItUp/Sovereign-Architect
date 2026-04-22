import os
from dotenv import load_dotenv
from tools.ollama_client import query_ollama
from tools.vertex_gemma4 import generate_strategic_reasoning

load_dotenv()

def verify_brain_setup():
    print("=== King's Cerebral Backbone Verification ===")
    
    # 1. Ollama Check
    print("\n[1] Checking Local Sovereignty (Ollama)...")
    ollama_res = query_ollama("Verify local brain presence.")
    if ollama_res:
        print(f"OK: Ollama Online. Response: {ollama_res[:100]}...")
    else:
        print("FAIL: Ollama Offline or model failure.")

    # 2. Vertex AI Check
    print("\n[2] Checking Cloud Intelligence (Vertex AI)...")
    project = os.getenv("GCP_PROJECT_ID")
    endpoint = os.getenv("VERTEX_ENDPOINT_ID")
    print(f"GCP Project: {project}")
    print(f"Endpoint: {endpoint}")
    
    if not project or not endpoint:
        print("FAIL: GCP Configuration Missing in .env")
    else:
        # We attempt a call. If SDK is missing, it will use fallback.
        cloud_res = generate_strategic_reasoning("Test strategic query.")
        print(f"Cloud/Fallback Response: {cloud_res[:100]}...")

if __name__ == "__main__":
    verify_brain_setup()
