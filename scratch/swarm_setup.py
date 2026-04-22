import os
import subprocess
import requests
import sys

def check_gcloud():
    print("[1/4] Checking Google Cloud Setup...")
    try:
        # Use shell=True for Windows to find commands more reliably, but subprocess.run needs careful handling
        subprocess.run("gcloud --version", shell=True, check=True, capture_output=True)
        print("[OK] gcloud CLI detected.")
    except Exception:
        print("[FAIL] gcloud CLI NOT found in PATH.")
        print("   Action required: Install Google Cloud SDK and run 'gcloud auth login'.")

def check_ollama():
    print("\n[2/4] Checking Local Ollama Setup...")
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
        if res.status_code == 200:
            print("[OK] Ollama is running.")
            models = [m['name'] for m in res.json().get('models', [])]
            print(f"   Available models: {models}")
            if not any("gemma" in m.lower() for m in models):
                print("   [WARN] Gemma 4 models missing. Run: 'ollama pull gemma4:2b'")
        else:
            print(f"[FAIL] Ollama returned error: {res.status_code}")
    except Exception:
        print("[FAIL] Ollama is NOT running. Run 'ollama serve' first.")

def check_openrouter():
    print("\n[3/4] Checking Open Router Swarm...")
    from dotenv import load_dotenv
    load_dotenv()
    key = os.getenv("OPENROUTER_API_KEY")
    if key and not key.startswith("YOUR_") and len(key) > 20:
        print("[OK] Open Router API Key configured.")
    else:
        print("[FAIL] Open Router API Key missing or default in .env.")

def check_vertex():
    print("\n[4/4] Checking Vertex AI Integration...")
    project = os.getenv("GCP_PROJECT_ID")
    endpoint = os.getenv("VERTEX_ENDPOINT_ID")
    if project and endpoint and not project.startswith("YOUR_"):
        print(f"[OK] GCP Project: {project}")
        print(f"[OK] Vertex Endpoint: {endpoint}")
    else:
        print("[FAIL] GCP / Vertex config incomplete in .env.")

if __name__ == "__main__":
    print("=== SWARM CONNECTIVITY DIAGNOSTIC ===\n")
    check_gcloud()
    check_ollama()
    check_openrouter()
    check_vertex()
    print("\n--- Diagnostic Complete ---")
