import os
import requests
import json
import time
from typing import Dict, List, Optional

class ApifyClient:
    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or os.getenv("APIFY_API_TOKEN")
        self.base_url = "https://api.apify.com/v2"

    def get_actor_id(self, platform: str, content_type: str) -> str:
        """Actor Selection Logic based on Platform and Content Type."""
        logic = {
            "instagram": {
                "reels": "apify/instagram-reel-scraper",
                "posts": "apify/instagram-post-scraper",
                "profiles": "apify/instagram-profile-scraper",
                "comments": "apify/instagram-comment-scraper",
                "hashtags": "apify/instagram-hashtag-scraper",
                "all": "apify/instagram-scraper"
            },
            "tiktok": "apify/tiktok-scraper",
            "youtube": "apify/youtube-scraper",
            "twitter": "apify/twitter-scraper",
            "linkedin": "apify/linkedin-scraper"
        }
        
        if platform.lower() == "instagram":
            return logic["instagram"].get(content_type.lower(), "apify/instagram-scraper")
        return logic.get(platform.lower(), "apify/instagram-scraper")

    def run_scrape(self, config: Dict):
        """Prepares and executes the Apify scrape."""
        actor_id = self.get_actor_id(config['platform'], config.get('content_type', 'all'))
        
        print(f"[APIFY] Triggering Actor: {actor_id}")
        
        # In a real scenario, this would POST to Apify's run endpoint
        # Example Request:
        # endpoint = f"{self.base_url}/acts/{actor_id}/runs?token={self.api_token}"
        # response = requests.post(endpoint, json=config['input'])
        
        # For simulation/demonstration:
        print(f"[APIFY] Configuration: {json.dumps(config, indent=2)}")
        return {
            "status": "triggered",
            "actor": actor_id,
            "estimated_cost": config.get('volume', 5) * 0.0026 # Average cost estimate
        }

def process_apify_request(answers: Dict):
    """Processes the 10 Qualifying Questions into an Apify config."""
    client = ApifyClient()
    
    config = {
        "platform": answers['platform'],
        "content_type": answers.get('content_type', 'all'),
        "volume": int(answers.get('volume', 5)),
        "input": {
            "directUrls": answers['targets'] if isinstance(answers['targets'], list) else [answers['targets']],
            "resultsLimit": int(answers.get('volume', 5)),
            "includeSharesCount":  "shares" in answers.get('add_ons', []),
            "onlyPostsNewerThan": answers.get('date_range', '30 days')
        }
    }
    
    result = client.run_scrape(config)
    return result
