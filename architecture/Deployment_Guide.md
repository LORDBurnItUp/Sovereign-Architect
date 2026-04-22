# Deployment Guide: Non-Stop GCP Execution

## 1. Overview
This guide provides the tactical steps to deploy the **King Dripping Swag** Profit Machine on Google Cloud Platform (GCP) for 24/7 autonomous execution.

## 2. Prerequisites
- **GCP Project**: `KINGS-DRIPPING-SWAG` (as defined in `.env`).
- **Bucket**: `gravity-claw-brain-sync` for state persistence.
- **Service Account**: Create a service account with `Storage Object Admin` and `Vertex AI User` roles.
- **Docker/GCR**: Use `gcr.io/kings-dripping-swag/gravity-claw` (note: repository names must be lowercase).

## 3. Step-by-Step Deployment (Console)

### Option A: Google Cloud Run (Recommended for Agility)
1. **Containerize**:
   ```bash
   # In your local terminal
   gcloud builds submit --tag gcr.io/kings-dripping-swag/gravity-claw
   ```
2. **Deploy**:
   - Go to **Cloud Run** in the GCP Console.
   - Click **Create Service**.
   - Select the image `gcr.io/kings-dripping-swag/gravity-claw`.
   - Set **Concurrency** to 1 (since it's a singleton agent loop).
   - Variables: Inject all `.env` keys into the **Variables & Secrets** tab.
   - **Persistence**: Ensure the service account has access to the GCS bucket for the `cloud_sync` tool.

### Option B: Compute Engine (For Persistent Shell Access)
1. **Create Instance**: Use an `e2-medium` or `g2-standard-4` (if running local inference).
2. **OS**: Debian or Ubuntu.
3. **Setup**:
   ```bash
   git clone [YOUR_REPO]
   pip install -r requirements.txt
   python agent_loop.py
   ```
4. **Non-Stop**: Use `tmux` or a `systemd` service to ensure the process restarts on failure.

## 4. Automatic Resynchronization
On boot, the agent is configured to:
1. Pull the latest `gravity-claw.db` from `gs://gravity-claw-brain-sync/sync/`.
2. Re-establish the 6-Tier Brain state.
3. Resume the billionaire hunting cycle from the last known iteration.

## 5. Monitoring
- View logs in **Cloud Logging** (filtered by `Gemma 4` or `Gravity Claw`).
- Monitor Telegram/Discord for "Revenue Alerts" dispatched by **Hermes (Douglas)**.
