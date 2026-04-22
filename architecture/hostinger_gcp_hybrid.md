# Architecture SOP: Hostinger-GCP Hybrid Sovereign Stack

## 1. Overview
This architecture establishes a "Frontage and Engine" model. The **Hostinger** environment serves as the high-ticket global frontage (`kingdrippingswag.io`), while the **GCP Vortex** infrastructure acts as the high-reasoning, 24/7 autonomous profit engine.

## 2. Structural Layering

### Layer A: Hostinger (The Frontage)
- **Role**: Branding, SEO, Landing Page, and Client Intake.
- **Service**: WordPress or Static HTML/JS.
- **Domain**: `kingdrippingswag.io`.
- **Logic**: Forwards intake data (leads) to the GCP Backend via secured Tailscale tunnel or API Gateway.

### Layer B: GCP Vortex (The Engine)
- **Role**: 6-Tier Brain Execution, Billionaire Hunting, Meta-Strategy.
- **Service**: Cloud Run / Compute Engine + Vertex AI (Gemma 4 backbone).
- **Backend URL**: `vortex.gcp.internal` (via Tailscale) or a secured subdomain.
- **GCS Sync**: Persistent state storage in `gs://gravity-claw-brain-sync`.

## 3. Communication Bridge
1. **Dynamic DNS**: Use Hostinger's DNS management to point `backbone.kingdrippingswag.io` to the GCP Load Balancer IP.
2. **Reverse Proxy**: Use Nginx on the Hostinger VPS to proxy requests to the internal Tailscale IP of the GCP process.
   ```nginx
   location /api/mission-control {
       proxy_pass http://gcp-backbone:8080;
   }
   ```

## 4. Operational Flow
1. **User/Lead** visits `kingdrippingswag.io`.
2. **Hermes (Douglas)** monitors the inbox via Hostinger email API.
3. **AgentZero (Sentenal)** processes the data on GCP using Gemma 4 26B.
4. **Sentinel (OpenClaw)** monitors system health over the Tailscale tunnel.
5. **Success**: Revenue is tracked in Supabase (Tier 3) and backed up to GCS.

## 5. Security Protocol
- **SSH Hardening**: Disable public SSH on Hostinger; use Tailscale SSH exclusively.
- **API Security**: All cross-provider communication must include the `ANTIGRAVITY_SHARED_SECRET`.
