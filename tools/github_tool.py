import os
import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_OWNER = "LORDBurnItUp"
REPO_NAME = "FRPaiUnlocks"

def get_repo_activity():
    """Fetches recent activity from the repository."""
    if not GITHUB_TOKEN:
        return {"error": "GITHUB_TOKEN not found"}
    
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    
    # Get recent commits
    commits_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    try:
        r = requests.get(commits_url, headers=headers, params={"per_page": 5})
        commits = r.json()
    except Exception as e:
        commits = []

    # Get recent issues
    issues_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    try:
        r = requests.get(issues_url, headers=headers, params={"state": "all", "per_page": 5})
        issues = r.json()
    except Exception as e:
        issues = []

    return {
        "repo": f"{REPO_OWNER}/{REPO_NAME}",
        "commits": commits[:5] if isinstance(commits, list) else [],
        "issues": issues[:5] if isinstance(issues, list) else [],
        "status": "online" if GITHUB_TOKEN else "offline"
    }

if __name__ == "__main__":
    print(get_repo_activity())
