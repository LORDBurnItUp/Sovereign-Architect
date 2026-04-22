"""
SOVEREIGN NETWORK — 4-NODE DISTRIBUTED GATEWAY
================================================================================
Topology:

  Hostinger (FACE)       — public frontend + MySQL Sovereign Registry
       │
       ▼
  Oracle (SENTINEL)      — 24/7 Discord hub + API gateway  (all external
       │                    traffic is supposed to cross this border)
       ▼
  ┌────┴────┐
  │         │
  Keyloq    Local Vault
  (CLAWS)   (BRAIN)
  exec      LLM + 6-tier memory, Tailscale-reachable

Everything here degrades gracefully: if an env var isn't set, the node is
marked "unconfigured" but the registry still works and the dashboard still
renders. No module in the stack can crash because a remote host is down.
================================================================================
"""

from __future__ import annotations

import logging
import os
import threading
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# NODE DEFINITION
# ---------------------------------------------------------------------------

@dataclass
class SovereignNode:
    key:       str               # "hostinger" | "oracle" | "keyloq" | "local"
    name:      str               # human label
    role:      str               # "FACE" | "SENTINEL" | "CLAWS" | "BRAIN"
    url:       Optional[str] = None        # base URL (scheme://host[:port])
    health_path: str = "/health"           # appended to url for ping
    status:    str = "unconfigured"        # unconfigured|online|offline|degraded
    latency_ms: Optional[float] = None
    last_checked: Optional[str] = None
    meta:      Dict[str, Any] = field(default_factory=dict)

    def configured(self) -> bool:
        return bool(self.url)


# ---------------------------------------------------------------------------
# HOSTINGER MYSQL "SOVEREIGN REGISTRY"
# ---------------------------------------------------------------------------
# Soft import — dashboard_api must still boot if MySQL driver is absent.

try:
    import pymysql
    _PYMYSQL = True
except Exception:
    pymysql = None
    _PYMYSQL = False


class SovereignRegistry:
    """
    Thin wrapper over the Hostinger MySQL instance used as the global agent-state
    registry. All methods are idempotent and no-op when creds aren't configured.
    """

    def __init__(self):
        self.host     = os.getenv("HOSTINGER_MYSQL_HOST")
        self.port     = int(os.getenv("HOSTINGER_MYSQL_PORT", "3306"))
        self.user     = os.getenv("HOSTINGER_MYSQL_USER")
        self.password = os.getenv("HOSTINGER_MYSQL_PASSWORD")
        self.database = os.getenv("HOSTINGER_MYSQL_DATABASE")
        self._schema_checked = False

    def configured(self) -> bool:
        return bool(_PYMYSQL and self.host and self.user and self.database)

    def _connect(self):
        if not self.configured():
            return None
        return pymysql.connect(
            host=self.host, port=self.port,
            user=self.user, password=self.password,
            database=self.database,
            connect_timeout=5, autocommit=True,
            cursorclass=pymysql.cursors.DictCursor,
        )

    def _ensure_schema(self, conn) -> None:
        if self._schema_checked:
            return
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS agent_state (
                    agent_name     VARCHAR(64) PRIMARY KEY,
                    division       VARCHAR(64),
                    active         TINYINT(1) DEFAULT 1,
                    last_heartbeat DOUBLE,
                    crash_count    INT DEFAULT 0,
                    payload        JSON,
                    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
        self._schema_checked = True

    def mirror_hierarchy(self, status_snapshot: Dict[str, Any]) -> Dict[str, Any]:
        """Write current overlord status_snapshot to Hostinger MySQL."""
        if not self.configured():
            return {"status": "unconfigured"}
        try:
            conn = self._connect()
            self._ensure_schema(conn)
            rows = 0
            with conn.cursor() as cur:
                for hc in status_snapshot.get("high_command", []):
                    for g in hc.get("generals", []):
                        cur.execute(
                            """
                            INSERT INTO agent_state
                                (agent_name, division, active, last_heartbeat, crash_count, payload)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE
                                division=VALUES(division),
                                active=VALUES(active),
                                last_heartbeat=VALUES(last_heartbeat),
                                crash_count=VALUES(crash_count),
                                payload=VALUES(payload)
                            """,
                            (
                                g.get("name"),
                                g.get("division"),
                                1 if g.get("status") == "ACTIVE" else 0,
                                g.get("last_heartbeat"),
                                g.get("crash_count", 0),
                                _safe_json(g),
                            ),
                        )
                        rows += 1
            conn.close()
            return {"status": "ok", "rows": rows}
        except Exception as e:
            logger.exception("[SovereignRegistry] mirror failed: %s", e)
            return {"status": "error", "message": str(e)}

    def read_state(self, agent_name: str) -> Optional[Dict[str, Any]]:
        if not self.configured():
            return None
        try:
            conn = self._connect()
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM agent_state WHERE agent_name=%s", (agent_name,))
                row = cur.fetchone()
            conn.close()
            return row
        except Exception as e:
            logger.exception("[SovereignRegistry] read failed: %s", e)
            return None


def _safe_json(obj: Any) -> str:
    import json
    try:
        return json.dumps(obj, default=str)
    except Exception:
        return "{}"


# ---------------------------------------------------------------------------
# NETWORK
# ---------------------------------------------------------------------------

class SovereignNetwork:
    """Registry for the 4 nodes. Thread-safe health snapshots."""

    ROLES = {
        "hostinger": ("FACE",     "Public frontend · Sovereign Registry (MySQL)"),
        "oracle":    ("SENTINEL", "24/7 Discord hub · API gateway"),
        "keyloq":    ("CLAWS",    "High-performance execution (Keyloq / Kilo Code)"),
        "local":     ("BRAIN",    "Heavy LLM (Gemma) · 6-Tier Memory"),
    }

    def __init__(self):
        self._lock = threading.Lock()
        self.registry = SovereignRegistry()
        self.nodes: Dict[str, SovereignNode] = {
            "hostinger": SovereignNode(
                key="hostinger", name="Hostinger", role="FACE",
                url=os.getenv("NODE_HOSTINGER_URL"),
                health_path=os.getenv("NODE_HOSTINGER_HEALTH", "/"),
                meta={
                    "mysql_registry_configured": self.registry.configured(),
                    "public_frontend_url":       os.getenv("NODE_HOSTINGER_PUBLIC_URL"),
                },
            ),
            "oracle":    SovereignNode(
                key="oracle", name="Oracle Cloud Sentinel", role="SENTINEL",
                url=os.getenv("NODE_ORACLE_URL"),
                health_path=os.getenv("NODE_ORACLE_HEALTH", "/health"),
            ),
            "keyloq":    SovereignNode(
                key="keyloq", name="Keyloq / Kilo Code Claws", role="CLAWS",
                url=os.getenv("NODE_KEYLOQ_URL"),
                health_path=os.getenv("NODE_KEYLOQ_HEALTH", "/"),
                meta={"dashboard_url": os.getenv("NODE_KEYLOQ_DASHBOARD_URL")},
            ),
            "local":     SovereignNode(
                key="local", name="Local Brain Vault", role="BRAIN",
                url=os.getenv("NODE_LOCAL_URL", "http://localhost:5050"),
                health_path=os.getenv("NODE_LOCAL_HEALTH", "/api/health"),
                meta={"tailscale_ip": os.getenv("TAILSCALE_LOCAL_IP")},
            ),
        }

    # -- health -------------------------------------------------------------

    def _ping(self, node: SovereignNode, timeout: float = 4.0) -> SovereignNode:
        if not node.configured():
            node.status = "unconfigured"
            node.latency_ms = None
            return node
        url = node.url.rstrip("/") + node.health_path
        t0 = time.monotonic()
        try:
            r = requests.get(url, timeout=timeout)
            node.latency_ms = round((time.monotonic() - t0) * 1000.0, 1)
            node.status = "online" if r.ok else "degraded"
        except Exception as e:
            node.latency_ms = None
            node.status = "offline"
            node.meta["last_error"] = str(e)[:160]
        node.last_checked = datetime.now(timezone.utc).isoformat()
        return node

    def refresh(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            snapshot = {k: asdict(self._ping(n)) for k, n in self.nodes.items()}
        return snapshot

    def snapshot(self) -> Dict[str, Dict[str, Any]]:
        """Last known state — does not hit the network."""
        with self._lock:
            return {k: asdict(n) for k, n in self.nodes.items()}

    # -- gateway routing ----------------------------------------------------
    #
    # Concern → node mapping. External callers use route(concern) to get the
    # right base URL without hard-coding topology.
    #
    CONCERNS = {
        "public":           "hostinger",  # public site, marketing surface
        "registry":         "hostinger",  # global agent state (MySQL)
        "api_gateway":      "oracle",     # any external request crosses here
        "discord_hub":      "oracle",
        "claws":            "keyloq",     # high-throughput execution
        "execution":        "keyloq",
        "llm":              "local",
        "memory":           "local",
        "brain":            "local",
    }

    def route(self, concern: str) -> Optional[str]:
        node_key = self.CONCERNS.get(concern)
        if not node_key:
            return None
        node = self.nodes.get(node_key)
        return node.url if node and node.configured() else None

    def gateway_request(
        self,
        concern: str,
        method: str = "GET",
        path: str = "/",
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Uniform outbound call. If the target node isn't configured, returns
        a structured 'unconfigured' result instead of raising.
        """
        base = self.route(concern)
        if not base:
            return {"status": "unconfigured", "concern": concern}

        # External calls first cross Oracle (api_gateway) when present, unless
        # we're already talking to oracle/local.
        gateway_base = None
        if concern not in ("api_gateway", "discord_hub", "llm", "memory", "brain"):
            gw = self.route("api_gateway")
            if gw and gw != base:
                gateway_base = gw

        target = (gateway_base or base).rstrip("/") + path
        try:
            r = requests.request(method, target, timeout=kwargs.pop("timeout", 10), **kwargs)
            return {
                "status":  "ok" if r.ok else "error",
                "code":    r.status_code,
                "via_gateway": bool(gateway_base),
                "body":    r.text[:2000],
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}


# ---------------------------------------------------------------------------
# SINGLETON
# ---------------------------------------------------------------------------

_network: Optional[SovereignNetwork] = None


def get_network() -> SovereignNetwork:
    global _network
    if _network is None:
        _network = SovereignNetwork()
    return _network


if __name__ == "__main__":
    import json
    logging.basicConfig(level=logging.INFO)
    net = get_network()
    print(json.dumps(net.refresh(), indent=2, default=str))
