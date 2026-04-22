# Architecture SOP: Automated GCS Synchronicity (Non-Stop Backup)

## 1. Objective
Ensure zero data loss and 24/7 operational continuity by automatically syncing the "King Dripping Swag" state to Google Cloud Storage (GCS). This enables a stateless deployment model where the agent can self-recover from any GCP compute instance.

## 2. Infrastructure
- **Provider**: Google Cloud Storage.
- **Bucket**: Defined in `.env` as `GCS_BACKUP_BUCKET`.
- **Sync Logic**: Differential upload of memory tiers and core configuration.

## 3. Automation Trigger (Layer 2)
The `cloud_sync` tool is invoked asynchronously by the `agent_loop.py` every **5 iteration cycles**.
- **Phase A**: Check for modified files in Tier 5 (Cold Archive).
- **Phase B**: Snapshot Tier 1 (SQLite DB) to `.tmp/backups/`.
- **Phase C**: Stream snapshots to GCS.

## 4. Elite Agent Assignment Logic
The Command & Control (C2) layer assigns specific personalities/logics to operational bots:
- **SENTINEL (Monitor)** -> Powered by **OpenClaw** logic (Security & Oversight).
- **HERMES (Sales)** -> Powered by **Douglas** logic (Outreach & Communication).
- **AGENTZERO (Core)** -> Powered by **Sentenal** logic (Meta-Strategy & Self-Monetization).

## 5. Deployment Lifecycle
1. **Containerize**: Use Docker to wrap the `agent_loop.py` and tools.
2. **GCP Console**: Deploy via **Google Cloud Run** or **GKE Autopilot** for non-stop execution.
3. **Environment**: Inject `.env` secrets via Secret Manager.
4. **Resurrection**: On boot, the agent pulls the latest `gravity-claw.db` from GCS to resume the 6-Tier Brain state.
