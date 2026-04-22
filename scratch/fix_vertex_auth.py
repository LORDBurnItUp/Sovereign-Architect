import os
import logging
from google.cloud import aiplatform

def diagnostic_check():
    """
    Diagnoses Vertex AI permission issues on the current project.
    """
    project_id = os.getenv("GCP_PROJECT_ID", "KINGS-DRIPPING-SWAG")
    location = os.getenv("GCP_LOCATION", "us-central1")
    
    print(f"--- VERTEX AI DIAGNOSTIC ---")
    print(f"Project: {project_id}")
    print(f"Location: {location}")
    
    try:
        aiplatform.init(project=project_id, location=location)
        print("[AUTH] Initialization successful.")
        
        # Test listing endpoints to verify 'Vertex AI User' role
        endpoints = aiplatform.Endpoint.list()
        print(f"[AUTH] Permission Verified. Found {len(endpoints)} endpoints.")
        for ep in endpoints:
            print(f" - {ep.display_name} ({ep.resource_name})")
            
    except Exception as e:
        print(f"[AUTH ERROR] Permission Denied or API Disabled.")
        print(f"Error Details: {str(e)}")
        print("\nACTION REQUIRED:")
        print(f"1. Visit https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project={project_id}")
        print(f"2. Ensure the API is ENABLED.")
        print(f"3. Ensure the Service Account/Identity has 'Vertex AI User' role.")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    diagnostic_check()
