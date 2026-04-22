import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY not found in .env")
        return

    # Using the Generative Language API (easier to test with just key)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [{
            "parts": [{"text": "Hello! Confirming Vertex AI connectivity for the King Dripping Swag Profit Machine."}]
        }]
    }
    
    print(f"Testing Gemini API via Google API Key...")
    try:
        response = requests.post(url, headers=headers, json=data, timeout=15)
        if response.status_code == 200:
            result = response.json()
            answer = result['candidates'][0]['content']['parts'][0]['text']
            print(f"\n[SUCCESS] Vertex/Gemini Response: {answer}")
        else:
            print(f"\n[FAILED] Status Code: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")

if __name__ == "__main__":
    test_gemini()
