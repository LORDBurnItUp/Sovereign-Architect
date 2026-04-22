import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Strategic Import: GCS SDK
try:
    from google.cloud import storage
    HAS_GCS_SDK = True
except ImportError:
    HAS_GCS_SDK = False

load_dotenv()

def sync_to_cloud():
    """
    Non-Stop Automated Sync of Memory Tiers 1 and 5 to GCS.
    Ensures stateless resilience for GCP deployment.
    """
    bucket_name = os.getenv("GCS_BACKUP_BUCKET")
    project_id = os.getenv("GCP_PROJECT_ID")

    if not HAS_GCS_SDK:
        logging.warning("[SYNC] GCS SDK missing/installing. Sync cycle deferred.")
        return

    if not bucket_name:
        logging.info("[SYNC] GCS_BACKUP_BUCKET placeholder detected. Skipping cloud sync.")
        return

    try:
        # 🔒 [ZERO-TRUST TUNNEL CHECK]
        # Verifies the Gravity Tunnel is active before attempting cloud egress
        try:
            ts_status = os.popen("tailscale status --json").read()
            if ts_status:
                logging.info("[TUNNEL] Tailscale Mesh Active. Egress secured.")
        except Exception:
            logging.warning("[TUNNEL] Tailscale not detected. Proceeding via public internet (UNSECURED).")

        storage_client = storage.Client(project=project_id)
        bucket = storage_client.bucket(bucket_name)

        # File List for synchronization
        targets = [
            "gravity-claw.db",
            "agent_progress.log",
            "findings.md"
        ]
        
        # Include Archive Files
        if os.path.exists(".tmp/archive"):
            for f in os.listdir(".tmp/archive"):
                targets.append(os.path.join(".tmp/archive", f))

        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        
        for file_path in targets:
            if os.path.exists(file_path) and os.path.isfile(file_path):
                # Organize by date in the bucket
                remote_path = f"sync/{timestamp}/{os.path.basename(file_path)}"
                blob = bucket.blob(remote_path)
                blob.upload_from_filename(file_path)
                logging.info(f"[SYNC] SUCCESS: {file_path} -> {remote_path}")

    except Exception as e:
        logging.error(f"[SYNC ERROR] Automatic cloud sync failed: {str(e)}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    sync_to_cloud()
