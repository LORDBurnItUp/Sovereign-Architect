import subprocess
import json
import os
from pathlib import Path

class FramerAPI:
    def __init__(self, project_url):
        self.project_url = project_url
        self.bridge_path = Path(__file__).parent / "framer_bridge.js"
        
    def _run_command(self, command, *args):
        cmd = ["node", str(self.bridge_path), command, self.project_url] + list(args)
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            try:
                error_data = json.loads(result.stderr)
                raise Exception(f"Framer API Error: {error_data.get('message', result.stderr)}")
            except:
                raise Exception(f"Framer Bridge Error: {result.stderr or result.stdout}")
        
        try:
            return json.loads(result.stdout)
        except:
            return result.stdout.strip()

    def get_info(self):
        """Get project information."""
        return self._run_command("info")

    def get_collections(self):
        """List all CMS collections."""
        return self._run_command("collections")

    def publish(self):
        """Publish the project."""
        return self._run_command("publish")

    def add_cms_item(self, collection_id, data):
        """Add an item to a CMS collection."""
        return self._run_command("sync-cms", collection_id, json.dumps(data))

# Example usage:
if __name__ == "__main__":
    # This is a placeholder URL. Replace with your actual Framer project URL.
    TEST_URL = "https://framer.com/projects/YOUR_PROJECT_ID"
    
    # client = FramerAPI(TEST_URL)
    # print(client.get_info())
