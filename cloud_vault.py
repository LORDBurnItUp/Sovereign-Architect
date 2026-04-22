"""
SOVEREIGN VAULT — GOOGLE DRIVE CLOUD SYNC
================================================================================
Mirrors the local lead archive + activity logs to Google Drive on a 6-hour
cadence. Uses a service account (non-interactive) for authentication.

Pipeline (run every SYNC_INTERVAL_HOURS):
  1. Zip data/leads/  +  latest activity_log(*).log  →  backups/<timestamp>.zip
  2. Upload the zip to Drive folder GOOGLE_DRIVE_VAULT_FOLDER_ID
  3. Post a confirmation embed to #📦-cloud-backups with the web link

Required env:
  GOOGLE_SERVICE_ACCOUNT_JSON     path to the service_account.json key file
  GOOGLE_DRIVE_VAULT_FOLDER_ID    Drive folder ID to upload into

Optional env:
  SYNC_INTERVAL_HOURS             default: 6
  CLOUD_VAULT_BACKUP_DIR          default: backups/
  CLOUD_VAULT_SOURCES             comma-separated paths, default: data/leads
================================================================================
"""

from __future__ import annotations

import asyncio
import glob
import logging
import os
import shutil
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

SERVICE_ACCOUNT_PATH = os.getenv(
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    str(Path(__file__).parent / "service_account.json"),
)
DRIVE_FOLDER_ID     = os.getenv("GOOGLE_DRIVE_VAULT_FOLDER_ID")
SYNC_INTERVAL_HOURS = float(os.getenv("SYNC_INTERVAL_HOURS", "6"))
BACKUP_DIR          = Path(os.getenv("CLOUD_VAULT_BACKUP_DIR", "backups"))
DEFAULT_SOURCES     = [p.strip() for p in os.getenv(
    "CLOUD_VAULT_SOURCES", "data/leads"
).split(",") if p.strip()]
ACTIVITY_LOG_GLOBS  = ["agent_progress.log", "activity_log*.log", "booster.log", "output.log"]

DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file"]


# ---------------------------------------------------------------------------
# GOOGLE SDK (soft import — CloudVault still loads if not installed)
# ---------------------------------------------------------------------------

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    _GOOGLE_AVAILABLE = True
except Exception as _e:
    service_account = None
    build = None
    MediaFileUpload = None
    _GOOGLE_AVAILABLE = False
    logger.warning("[CloudVault] google-api-python-client not installed: %s", _e)


# ---------------------------------------------------------------------------
# VAULT
# ---------------------------------------------------------------------------

class CloudVault:
    """Zip-and-mirror local data directories to Google Drive."""

    def __init__(
        self,
        service_account_path: str = SERVICE_ACCOUNT_PATH,
        drive_folder_id: Optional[str] = DRIVE_FOLDER_ID,
        sources: Optional[List[str]] = None,
        backup_dir: Path = BACKUP_DIR,
    ):
        self.service_account_path = service_account_path
        self.drive_folder_id = drive_folder_id
        self.sources = sources or DEFAULT_SOURCES
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self._service = None

    # -- auth ---------------------------------------------------------------

    def _drive(self):
        if self._service is not None:
            return self._service
        if not _GOOGLE_AVAILABLE:
            raise RuntimeError("google-api-python-client not installed")
        if not os.path.exists(self.service_account_path):
            raise FileNotFoundError(f"service account key not found: {self.service_account_path}")
        creds = service_account.Credentials.from_service_account_file(
            self.service_account_path, scopes=DRIVE_SCOPES
        )
        self._service = build("drive", "v3", credentials=creds, cache_discovery=False)
        return self._service

    # -- packaging ----------------------------------------------------------

    def _find_activity_logs(self) -> List[Path]:
        found: List[Path] = []
        for pattern in ACTIVITY_LOG_GLOBS:
            for path in glob.glob(pattern):
                p = Path(path)
                if p.is_file():
                    found.append(p)
        return found

    def create_zip(self) -> Path:
        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        zip_path = self.backup_dir / f"sovereign_vault_{ts}.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for src in self.sources:
                sp = Path(src)
                if not sp.exists():
                    logger.info("[CloudVault] source missing (skipped): %s", sp)
                    continue
                if sp.is_file():
                    zf.write(sp, arcname=sp.name)
                else:
                    for root, _, files in os.walk(sp):
                        for name in files:
                            fp = Path(root) / name
                            zf.write(fp, arcname=fp.relative_to(sp.parent))
            for log_path in self._find_activity_logs():
                zf.write(log_path, arcname=f"logs/{log_path.name}")
        logger.info("[CloudVault] packaged %s (%.1f KB)",
                    zip_path, zip_path.stat().st_size / 1024)
        return zip_path

    # -- upload -------------------------------------------------------------

    def upload(self, zip_path: Path) -> Dict[str, Any]:
        if not _GOOGLE_AVAILABLE:
            return {"status": "unavailable", "reason": "google sdk not installed"}
        if not self.drive_folder_id:
            return {"status": "unavailable", "reason": "GOOGLE_DRIVE_VAULT_FOLDER_ID not set"}

        metadata = {"name": zip_path.name, "parents": [self.drive_folder_id]}
        media = MediaFileUpload(str(zip_path), mimetype="application/zip", resumable=True)
        file = self._drive().files().create(
            body=metadata,
            media_body=media,
            fields="id, name, webViewLink, webContentLink, size",
            supportsAllDrives=True,
        ).execute()
        logger.info("[CloudVault] uploaded %s → %s", file.get("name"), file.get("id"))
        return {
            "status":   "success",
            "id":       file.get("id"),
            "name":     file.get("name"),
            "size":     file.get("size"),
            "link":     file.get("webViewLink") or file.get("webContentLink"),
        }

    # -- orchestrate --------------------------------------------------------

    def run_once(self, announce: bool = True) -> Dict[str, Any]:
        """Single sync: package → upload → announce on Discord."""
        zip_path = self.create_zip()
        upload_result = self.upload(zip_path)

        summary = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "zip":       str(zip_path),
            "size_kb":   round(zip_path.stat().st_size / 1024, 1),
            "upload":    upload_result,
        }

        if announce:
            try:
                from tools.communication_payload import post_cloud_backup
                msg = (
                    f"Vault sync complete.\n"
                    f"**File:** `{zip_path.name}`  \n"
                    f"**Size:** {summary['size_kb']} KB  \n"
                    f"**Status:** {upload_result.get('status')}"
                )
                summary["discord"] = post_cloud_backup(
                    msg, drive_link=upload_result.get("link", "")
                )
            except Exception as e:
                summary["discord"] = {"status": "error", "message": str(e)}
        return summary

    async def run_schedule(self, interval_hours: float = SYNC_INTERVAL_HOURS) -> None:
        """Long-running loop — fires run_once() every `interval_hours`."""
        interval_seconds = max(60.0, interval_hours * 3600.0)
        logger.info("[CloudVault] schedule started — every %.2fh", interval_hours)
        while True:
            try:
                self.run_once()
            except Exception as e:
                logger.exception("[CloudVault] sync failed: %s", e)
            await asyncio.sleep(interval_seconds)


# ---------------------------------------------------------------------------
# SINGLETON + STARTER
# ---------------------------------------------------------------------------

_vault: Optional[CloudVault] = None


def get_vault() -> CloudVault:
    global _vault
    if _vault is None:
        _vault = CloudVault()
    return _vault


def start_cloud_sync(loop: Optional[asyncio.AbstractEventLoop] = None) -> Optional[asyncio.Task]:
    loop = loop or asyncio.get_event_loop()
    return loop.create_task(get_vault().run_schedule())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    import json
    result = get_vault().run_once(announce=False)
    print(json.dumps(result, indent=2, default=str))
