"""
SOVEREIGN OS — LEAD ARCHIVER
================================================================================
Structured Lead Extraction Pipeline.

Responsibilities:
  1. Persist every acquired lead to `data/leads/leads_master.csv`
  2. Deduplicate against the 6-Tier Memory (Tier 1 SQLite) before broadcast
  3. Broadcast a Rich Discord Embed ("Lead-Card") to the #🎯-hunter-division
     channel configured via .env

Invoked from:
  - brain_router_sovereign.General.execute_division_logic  (Hunter / Sentinel)
================================================================================
"""

from __future__ import annotations

import csv
import hashlib
import logging
import os
import sqlite3
import threading
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CONSTANTS
# ---------------------------------------------------------------------------

LEAD_DIR = Path(os.getenv("LEAD_ARCHIVE_DIR", "data/leads"))
CSV_PATH = LEAD_DIR / "leads_master.csv"

CSV_COLUMNS = [
    "Timestamp",
    "Agent_Name",
    "Company",
    "Contact_Name",
    "Email",
    "Phone",
    "Source",
    "Priority_Score",
    "Status",
]

# Discord Embed Color Codes (per spec)
COLOR_HIGH_PRIORITY = 0xFFD700   # Gold
COLOR_STANDARD      = 0x0000FF   # Blue

# Threshold above which a lead is treated as high priority (0-100 scale)
HIGH_PRIORITY_THRESHOLD = int(os.getenv("LEAD_HIGH_PRIORITY_THRESHOLD", "70"))

# SQLite dedup store — reuse the Tier 1 Gravity-Claw DB
DB_PATH = os.getenv("GRAVITY_CLAW_DB_PATH", "gravity-claw.db")

# Env key chain — first match wins
HUNTER_CHANNEL_ENV_KEYS = (
    "DISCORD_CHAN_HUNTER_DIVISION",
    "DISCORD_HUNTER_DIVISION_CHANNEL_ID",
    "CHAN_HUNTING",
)


# ---------------------------------------------------------------------------
# LEAD MODEL
# ---------------------------------------------------------------------------

@dataclass
class Lead:
    agent_name: str
    company: str
    contact_name: str = ""
    email: str = ""
    phone: str = ""
    source: str = "unspecified"
    priority_score: int = 0
    status: str = "NEW"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def fingerprint(self) -> str:
        """Stable hash used for dedup — company + email + phone (case-insensitive)."""
        raw = "|".join([
            (self.company or "").strip().lower(),
            (self.email or "").strip().lower(),
            (self.phone or "").strip().lower(),
        ])
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def is_high_priority(self) -> bool:
        return self.priority_score >= HIGH_PRIORITY_THRESHOLD

    def to_row(self) -> Dict[str, Any]:
        return {
            "Timestamp":       self.timestamp,
            "Agent_Name":      self.agent_name,
            "Company":         self.company,
            "Contact_Name":    self.contact_name,
            "Email":           self.email,
            "Phone":           self.phone,
            "Source":          self.source,
            "Priority_Score":  self.priority_score,
            "Status":          self.status,
        }


# ---------------------------------------------------------------------------
# LEAD ARCHIVER
# ---------------------------------------------------------------------------

class LeadArchiver:
    """Handles creation + updating of leads_master.csv and dedup-gated Discord broadcasts."""

    def __init__(
        self,
        csv_path: Path = CSV_PATH,
        db_path: str = DB_PATH,
    ):
        self.csv_path = Path(csv_path)
        self.db_path = db_path
        self._csv_lock = threading.Lock()
        self._ensure_csv()
        self._ensure_dedup_table()

    # -- filesystem / schema ------------------------------------------------

    def _ensure_csv(self) -> None:
        self.csv_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.csv_path.exists():
            with self.csv_path.open("w", newline="", encoding="utf-8") as f:
                csv.DictWriter(f, fieldnames=CSV_COLUMNS).writeheader()
            logger.info("[LeadArchiver] initialized %s", self.csv_path)

    def _ensure_dedup_table(self) -> None:
        try:
            conn = sqlite3.connect(self.db_path, timeout=10)
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS leads (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    fingerprint     TEXT UNIQUE,
                    agent_name      TEXT,
                    company         TEXT,
                    contact_name    TEXT,
                    email           TEXT,
                    phone           TEXT,
                    source          TEXT,
                    priority_score  INTEGER,
                    status          TEXT,
                    timestamp       TEXT
                )
                """
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.exception("[LeadArchiver] dedup table init failed: %s", e)

    # -- dedup --------------------------------------------------------------

    def is_duplicate(self, lead: Lead) -> bool:
        try:
            conn = sqlite3.connect(self.db_path, timeout=10)
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM leads WHERE fingerprint = ? LIMIT 1", (lead.fingerprint(),))
            hit = cur.fetchone() is not None
            conn.close()
            return hit
        except Exception as e:
            logger.exception("[LeadArchiver] dedup lookup failed: %s", e)
            return False

    def _record_fingerprint(self, lead: Lead) -> None:
        try:
            conn = sqlite3.connect(self.db_path, timeout=10)
            conn.execute(
                """
                INSERT OR IGNORE INTO leads
                    (fingerprint, agent_name, company, contact_name, email, phone,
                     source, priority_score, status, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    lead.fingerprint(), lead.agent_name, lead.company, lead.contact_name,
                    lead.email, lead.phone, lead.source, lead.priority_score,
                    lead.status, lead.timestamp,
                ),
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.exception("[LeadArchiver] dedup write failed: %s", e)

    # -- CSV append ---------------------------------------------------------

    def append_csv(self, lead: Lead) -> None:
        with self._csv_lock:
            with self.csv_path.open("a", newline="", encoding="utf-8") as f:
                csv.DictWriter(f, fieldnames=CSV_COLUMNS).writerow(lead.to_row())

    # -- Discord broadcast --------------------------------------------------

    @staticmethod
    def _resolve_channel_id() -> Optional[str]:
        for key in HUNTER_CHANNEL_ENV_KEYS:
            val = os.getenv(key)
            if val:
                return val
        return None

    @staticmethod
    def _resolve_bot_token(agent_name: str) -> Optional[str]:
        """Prefer the acquiring General's own bot; fall back to any available token."""
        candidates = [
            f"DISCORD_BOT_TOKEN_{agent_name.upper()}",
            "DISCORD_BOT_TOKEN_SENTINEL",
            "DISCORD_BOT_TOKEN_TRAVIS",
            "DISCORD_BOT_TOKEN_OVERLORD",
            "DISCORD_BOT_TOKEN",
        ]
        for k in candidates:
            tok = os.getenv(k)
            if tok:
                return tok
        return None

    def _build_embed(self, lead: Lead) -> Dict[str, Any]:
        color = COLOR_HIGH_PRIORITY if lead.is_high_priority() else COLOR_STANDARD
        priority_tag = "HIGH" if lead.is_high_priority() else "STANDARD"
        return {
            "title": "🎯 NEW SOVEREIGN LEAD ACQUIRED",
            "color": color,
            "timestamp": lead.timestamp,
            "fields": [
                {"name": "Company",  "value": lead.company or "—",
                 "inline": True},
                {"name": "Contact",  "value": lead.contact_name or "—",
                 "inline": True},
                {"name": "Source",   "value": lead.source or "—",
                 "inline": True},
                {"name": "Priority", "value": f"{lead.priority_score} ({priority_tag})",
                 "inline": True},
            ],
            "footer": {
                "text": f"Extracted by General {lead.agent_name} // B.L.A.S.T. Intelligence"
            },
        }

    def broadcast(self, lead: Lead) -> Dict[str, Any]:
        """POST a rich embed to the #🎯-hunter-division channel via Discord Bot API."""
        channel_id = self._resolve_channel_id()
        token = self._resolve_bot_token(lead.agent_name)
        embed = self._build_embed(lead)

        if not channel_id or not token:
            logger.warning(
                "[LeadArchiver] Discord broadcast skipped — channel_id=%s token=%s",
                bool(channel_id), bool(token),
            )
            return {"status": "simulated", "embed": embed}

        url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
        headers = {
            "Authorization": f"Bot {token}",
            "Content-Type":  "application/json",
        }
        try:
            resp = requests.post(url, headers=headers, json={"embeds": [embed]}, timeout=10)
            if resp.status_code in (200, 204):
                return {"status": "success", "channel_id": channel_id}
            logger.error("[LeadArchiver] Discord %s: %s", resp.status_code, resp.text)
            return {"status": "error", "code": resp.status_code, "body": resp.text}
        except Exception as e:
            logger.exception("[LeadArchiver] Discord broadcast failed: %s", e)
            return {"status": "error", "message": str(e)}

    # -- orchestration ------------------------------------------------------

    def archive_lead(self, lead: Lead) -> Dict[str, Any]:
        """
        Single entrypoint: dedup → CSV append → SQLite record → Discord broadcast.

        Returns a structured result for brain_router logging.
        """
        if self.is_duplicate(lead):
            logger.info("[LeadArchiver] duplicate suppressed: %s / %s",
                        lead.company, lead.email or lead.phone)
            return {
                "status":    "duplicate",
                "lead":      asdict(lead),
                "broadcast": None,
                "csv":       None,
            }

        self.append_csv(lead)
        self._record_fingerprint(lead)
        broadcast_result = self.broadcast(lead)

        return {
            "status":    "archived",
            "lead":      asdict(lead),
            "csv":       str(self.csv_path),
            "broadcast": broadcast_result,
        }


# ---------------------------------------------------------------------------
# SINGLETON ACCESSOR
# ---------------------------------------------------------------------------

_archiver: Optional[LeadArchiver] = None


def get_archiver() -> LeadArchiver:
    global _archiver
    if _archiver is None:
        _archiver = LeadArchiver()
    return _archiver


# ---------------------------------------------------------------------------
# SMOKE TEST
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    archiver = get_archiver()
    sample = Lead(
        agent_name="Sentinel",
        company="Palm Jumeirah Holdings",
        contact_name="Aisha Al Maktoum",
        email="aisha@palmjumeirah.example",
        phone="+971-50-555-0199",
        source="LinkedIn Sales Navigator",
        priority_score=88,
        status="VALIDATED",
    )
    result = archiver.archive_lead(sample)
    print(result)
