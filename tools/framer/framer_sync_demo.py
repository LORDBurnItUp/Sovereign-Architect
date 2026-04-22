from framer_api import FramerAPI
import json

def run_demo():
    print("--- Framer Automation Demo ---")
    
    # 1. Initialize with your Project URL
    # Replace this with a real project URL to run
    project_url = "https://framer.com/projects/TEST--PROJECT" 
    client = FramerAPI(project_url)
    
    print(f"Connecting to: {project_url}...")
    
    try:
        # 2. Get Info
        # info = client.get_info()
        # print(f"Project Name: {info.get('name')}")
        
        # 3. Add a Demo CMS Item (e.g., a new testimonial)
        # collection_id = "YOUR_COLLECTION_ID"
        # data = {
        #     "name": "Satisfied Client",
        #     "feedback": "This $100,000 site was worth every penny!",
        #     "rating": 5
        # }
        # result = client.add_cms_item(collection_id, data)
        # print("CMS Item Added:", result)
        
        # 4. Finalize by publishing
        # client.publish()
        # print("Changes published live!")
        
        print("\nDemo script configured. To execute:")
        print("1. Update 'project_url' with your Framer project URL.")
        print("2. Uncomment the function calls you want to test.")
        print("3. Ensure your FRAMER_TOKEN is correctly set in the .env file.")
        
    except Exception as e:
        print(f"Error during demo: {e}")

if __name__ == "__main__":
    run_demo()
