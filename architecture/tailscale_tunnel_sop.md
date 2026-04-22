# Architecture SOP: Tailscale Mesh Networking (Gravity Tunnel)

## 1. Objective
Establish a secure, encrypted, and seamless "mesh" network between the local hardware (mobile), the Hostinger VPS, and the GCP-managed "Cerebral Backbone" (Vertex AI). This ensures that management and command execution happen over a private 100.x.x.x IP space, bypassing public internet risks.

## 2. Infrastructure
- **Network Discovery**: Tailscale (WireGuard-based).
- **Control Plane**: Tailscale Admin Console.
- **Nodes**:
  - `gcp-backbone`: The GCP Cloud Run/CE instance running the Agent Loop.
  - `hostinger-edge`: The Hostinger VPS serving the landing page.
  - `antigravity-mobile`: The user's mobile environment.

## 3. Tunnel Configuration
- **MagicDNS**: Enabled for friendly hostnames (e.g., `http://gcp-backbone:8080/api/logs`).
- **ACLs**: Strict "Gravity Mesh" policies ensuring only authenticated nodes can ping the agent loop.
- **Exit Nodes**: (Optional) Route all traffic through the GCP backbone for anonymity.

## 4. Installation & Setup
1. **GCP Node**: 
   - Add Tailscale to the Dockerfile (for Cloud Run) or install on Compute Engine via binary.
   - Use an **Auth Key** (`TS_AUTHKEY`) injected via GCP Secret Manager for auto-authentication.
2. **Hostinger Node**: 
   - Install via `curl -fsSL https://tailscale.com/install.sh | sh`.
   - Run `sudo tailscale up`.
3. **Connectivity Test**:
   - `ping hostinger-edge` from the local terminal.
   - Access the Master Control Dashboard via its Tailscale IP.

## 5. Strategic Advantage
- **Zero-Trust**: No ports (80/443/22) need to be open on the public internet.
- **Seamless Sync**: The `cloud_sync` tool can move data over the tunnel to the GCS gateway.
- **Stealth**: Revenue alerts and billionaire hunter logs are dispatched over a private, encrypted lattice.
