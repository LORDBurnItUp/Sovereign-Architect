import os
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

class WorkspaceConnector:
    """
    Intelligence Hub: Synchronizes KDS assets with Google Workspace (Drive/Calendar).
    """
    
    def __init__(self, service_account_path="secret_service_account.json"):
        self.creds_path = service_account_path
        self.creds = None
        if os.path.exists(self.creds_path):
            self.creds = service_account.Credentials.from_service_account_file(
                self.creds_path,
                scopes=['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar']
            )

    def list_drive_files(self):
        """Retrieves mission-critical project files from the KDS Google Drive."""
        if not self.creds:
            return "[WORKSPACE] Service Account missing. Connection deferred."
            
        try:
            service = build('drive', 'v3', credentials=self.creds)
            results = service.files().list(pageSize=10, fields="nextPageToken, files(id, name)").execute()
            items = results.get('files', [])
            return items
        except Exception as e:
            logging.error(f"[DRIVE ERROR] {str(e)}")
            return []

    def schedule_strategy_briefing(self, lead_name: str, lead_email: str):
        """Creates an elite briefing appointment in the executive calendar."""
        if not self.creds:
            return "[WORKSPACE] No calendar credentials."
            
        try:
            service = build('calendar', 'v3', credentials=self.creds)
            event = {
                'summary': f'KDS Strategy: {lead_name}',
                'description': 'High-ticket briefing for sovereign AI systems deployment.',
                'start': {'dateTime': '2026-05-01T10:00:00Z'},
                'end': {'dateTime': '2026-05-01T11:00:00Z'},
                'attendees': [{'email': lead_email}],
            }
            event = service.events().insert(calendarId='primary', body=event).execute()
            return event.get('htmlLink')
        except Exception as e:
            logging.error(f"[CALENDAR ERROR] {str(e)}")
            return None

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ws = WorkspaceConnector()
    print(f"Drive Connectivity: {ws.list_drive_files()}")
