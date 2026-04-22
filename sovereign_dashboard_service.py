"""
SOVEREIGN OS — DASHBOARD SERVICE
Real-time monitoring, agent metrics, Google Cloud integration (mocked)
All data streams feed the interactive dashboard
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import threading
import time

# Mock Google Cloud / Vertex AI credentials
MOCK_GOOGLE_CLOUD = {
    "project_id": "sovereign-os-demo-123456",
    "maps_api_key": "AIzaSy_MOCK_MAPS_API_KEY_FOR_STREETVIEW",
    "vertex_ai_endpoint": "us-central1-aiplatform.googleapis.com",
    "vertex_ai_model": "text-bison@002"
}

class DashboardMetrics:
    """Real-time metrics for each general"""

    def __init__(self):
        self.data = {
            "douglas": {
                "name": "Douglas",
                "rank": "General",
                "division": "Strategic Ops",
                "status": "ACTIVE",
                "campaigns_active": 3,
                "deals_brokered": 12,
                "revenue": 45000,
                "success_rate": 89.5,
                "current_task": "Preparing $2.5k offer for Palm Jumeirah client",
                "last_action": datetime.now().isoformat(),
                "monitoring": {
                    "cpu": 45,
                    "memory": 62,
                    "network": "847 Mb/s",
                    "latency": "12ms",
                    "errors": 0,
                    "uptime": "99.98%"
                },
                "recent_actions": [
                    {"time": "14:42:33", "action": "Prepared high-ticket offer deck"},
                    {"time": "14:38:12", "action": "Qualified lead: $5M AUM prospect"},
                    {"time": "14:32:45", "action": "Closed arbitrage deal: $2,500 commission"}
                ],
                "location": {
                    "latitude": 25.276987,
                    "longitude": 55.263106,
                    "address": "Palm Jumeirah, Dubai"
                }
            },
            "hermes": {
                "name": "Hermes",
                "rank": "General",
                "division": "Comms",
                "status": "ACTIVE",
                "emails_sent": 547,
                "emails_opened": 234,
                "click_rate": 42.7,
                "conversions": 18,
                "revenue": 31500,
                "current_task": "Running email sequence: Day 3 follow-up",
                "last_action": datetime.now().isoformat(),
                "monitoring": {
                    "cpu": 28,
                    "memory": 41,
                    "network": "215 Mb/s",
                    "latency": "8ms",
                    "errors": 0,
                    "uptime": "99.99%"
                },
                "recent_actions": [
                    {"time": "14:45:22", "action": "Sent 150 personalized emails"},
                    {"time": "14:40:10", "action": "Email open rate: 47%"},
                    {"time": "14:35:55", "action": "Deployment complete: Loom video sequence"}
                ],
                "location": {
                    "latitude": 25.182410,
                    "longitude": 55.274922,
                    "address": "Downtown Dubai"
                }
            },
            "sentinel": {
                "name": "Sentinel",
                "rank": "General",
                "division": "Intel",
                "status": "ACTIVE",
                "leads_scraped": 423,
                "leads_qualified": 89,
                "data_quality": 94.2,
                "revenue": 22750,
                "current_task": "Mining LinkedIn for $2M+ AUM prospects",
                "last_action": datetime.now().isoformat(),
                "monitoring": {
                    "cpu": 72,
                    "memory": 85,
                    "network": "450 Mb/s",
                    "latency": "24ms",
                    "errors": 0,
                    "uptime": "99.97%"
                },
                "recent_actions": [
                    {"time": "14:43:10", "action": "Scraped 127 new prospects"},
                    {"time": "14:38:45", "action": "Data validation: 94.2% quality"},
                    {"time": "14:32:20", "action": "Identified 12 high-value targets"}
                ],
                "location": {
                    "latitude": 25.211193,
                    "longitude": 55.276390,
                    "address": "Dubai Marina"
                }
            },
            "travis": {
                "name": "Travis",
                "rank": "Colonel",
                "division": "Lead Generation",
                "status": "INACTIVE",
                "leads_acquired": 156,
                "pipeline_value": 312000,
                "conversion_rate": 45.0,
                "revenue": 0,
                "current_task": "Awaiting activation",
                "last_action": "2 hours ago",
                "monitoring": {
                    "cpu": 0,
                    "memory": 0,
                    "network": "0 Mb/s",
                    "latency": "∞",
                    "errors": 0,
                    "uptime": "STANDBY"
                },
                "recent_actions": [
                    {"time": "12:30:00", "action": "Acquired 15 qualified leads"},
                    {"time": "11:45:30", "action": "Lead quality score: 8.7/10"},
                    {"time": "11:20:15", "action": "Pipeline value updated: $312k"}
                ],
                "location": {
                    "latitude": 25.195868,
                    "longitude": 55.274475,
                    "address": "Business Bay, Dubai"
                }
            },
            "aureus": {
                "name": "Aureus",
                "rank": "Colonel",
                "division": "Email Campaigns",
                "status": "INACTIVE",
                "sequences_active": 0,
                "templates": 24,
                "avg_open_rate": 38.5,
                "revenue": 0,
                "current_task": "Awaiting activation",
                "last_action": "3 hours ago",
                "monitoring": {
                    "cpu": 0,
                    "memory": 0,
                    "network": "0 Mb/s",
                    "latency": "∞",
                    "errors": 0,
                    "uptime": "STANDBY"
                },
                "recent_actions": [
                    {"time": "11:30:00", "action": "Created high-conversion template"},
                    {"time": "10:45:30", "action": "Template A/B test complete"},
                    {"time": "10:20:15", "action": "Personalization engine tuned"}
                ],
                "location": {
                    "latitude": 25.200700,
                    "longitude": 55.275100,
                    "address": "JBR, Dubai"
                }
            },
            "khan": {
                "name": "Khan",
                "rank": "Colonel",
                "division": "Social Media",
                "status": "INACTIVE",
                "posts_created": 48,
                "reach": 125000,
                "engagement_rate": 7.2,
                "revenue": 0,
                "current_task": "Awaiting activation",
                "last_action": "4 hours ago",
                "monitoring": {
                    "cpu": 0,
                    "memory": 0,
                    "network": "0 Mb/s",
                    "latency": "∞",
                    "errors": 0,
                    "uptime": "STANDBY"
                },
                "recent_actions": [
                    {"time": "10:30:00", "action": "Viral post: 25k likes"},
                    {"time": "09:45:30", "action": "Influencer collab deployed"},
                    {"time": "09:20:15", "action": "Content calendar updated"}
                ],
                "location": {
                    "latitude": 25.185400,
                    "longitude": 55.276500,
                    "address": "The Walk, JBR"
                }
            }
        }
        self.activity_log = []
        self.total_revenue = 0
        self.update_totals()

    def update_totals(self):
        """Calculate total revenue and metrics"""
        self.total_revenue = sum(agent["revenue"] for agent in self.data.values())
        self.active_agents = sum(1 for agent in self.data.values() if agent["status"] == "ACTIVE")
        self.total_leads = sum(agent.get("leads_qualified", agent.get("leads_acquired", 0)) for agent in self.data.values())

    def get_agent_details(self, agent_name: str) -> Optional[Dict]:
        """Get full details for a specific agent"""
        return self.data.get(agent_name.lower())

    def get_monitoring_details(self, agent_name: str) -> Optional[Dict]:
        """Get detailed monitoring metrics"""
        agent = self.data.get(agent_name.lower())
        if agent:
            return agent.get("monitoring", {})
        return None

    def get_location_info(self, agent_name: str) -> Optional[Dict]:
        """Get location for Street View"""
        agent = self.data.get(agent_name.lower())
        if agent:
            return agent.get("location", {})
        return None

    def get_recent_actions(self, agent_name: str) -> Optional[List]:
        """Get recent actions for an agent"""
        agent = self.data.get(agent_name.lower())
        if agent:
            return agent.get("recent_actions", [])
        return None

    def log_action(self, agent: str, action: str):
        """Log an action"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "action": action
        }
        self.activity_log.insert(0, entry)
        if len(self.activity_log) > 100:
            self.activity_log.pop()

    def activate_agent(self, agent_name: str) -> bool:
        """Activate an agent"""
        if agent_name.lower() in self.data:
            self.data[agent_name.lower()]["status"] = "ACTIVE"
            self.log_action(agent_name, f"Agent activated")
            self.update_totals()
            return True
        return False

    def deactivate_agent(self, agent_name: str) -> bool:
        """Deactivate an agent"""
        if agent_name.lower() in self.data:
            self.data[agent_name.lower()]["status"] = "INACTIVE"
            self.log_action(agent_name, f"Agent deactivated")
            self.update_totals()
            return True
        return False

    def get_all_metrics(self) -> Dict:
        """Get all metrics for dashboard"""
        return {
            "agents": self.data,
            "total_revenue": self.total_revenue,
            "active_agents": self.active_agents,
            "total_leads": self.total_leads,
            "activity_log": self.activity_log[:20]
        }

    def simulate_activity(self):
        """Simulate agent activity (for demo)"""
        actions = [
            "Qualified new lead",
            "Sent outreach email",
            "Scraped prospect data",
            "Updated pipeline",
            "Closed deal",
            "Analyzed metrics"
        ]
        agents = list(self.data.keys())
        while True:
            agent = random.choice(agents)
            if self.data[agent]["status"] == "ACTIVE":
                action = random.choice(actions)
                self.log_action(agent, action)
                # Update recent actions
                self.data[agent]["recent_actions"].insert(0, {
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "action": action
                })
                if len(self.data[agent]["recent_actions"]) > 5:
                    self.data[agent]["recent_actions"].pop()
            time.sleep(random.randint(5, 15))


# Global singleton
_metrics = DashboardMetrics()

def get_metrics() -> DashboardMetrics:
    """Get metrics instance"""
    return _metrics

def start_simulation():
    """Start background activity simulation"""
    thread = threading.Thread(target=_metrics.simulate_activity, daemon=True)
    thread.start()

if __name__ == "__main__":
    metrics = get_metrics()
    print(json.dumps(metrics.get_all_metrics(), indent=2, default=str))
