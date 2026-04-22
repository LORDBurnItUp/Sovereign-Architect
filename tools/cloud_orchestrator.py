import os
import logging
from google.cloud import compute_v1
from dotenv import load_dotenv

load_dotenv()

class CloudOrchestrator:
    """
    GCP Resource Manager: Deploys and monitors the high-compute agent backbone.
    """
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID", "KINGS-DRIPPING-SWAG")
        self.zone = os.getenv("GCP_ZONE", "us-central1-a")
        
    def create_instance(self, instance_name="kds-agent-node-01"):
        """Deploys a pre-configured debian-12 VM for Antigravity operations."""
        try:
            instance_client = compute_v1.InstancesClient()

            # Configure high-compute machine for LLM inference (n1-standard-4)
            config = {
                "name": instance_name,
                "machine_type": f"zones/{self.zone}/machineTypes/n1-standard-4",
                "disks": [{
                    "boot": True,
                    "auto_delete": True,
                    "initialize_params": {
                        "source_image": "projects/debian-cloud/global/images/family/debian-12",
                        "disk_size_gb": 50,
                    },
                }],
                "network_interfaces": [{
                    "network": "global/networks/default",
                    "access_configs": [{"name": "External NAT", "type": "ONE_TO_ONE_NAT"}],
                }],
            }

            logging.info(f"[GCP] Provisioning VM: {instance_name} in {self.zone}...")
            operation = instance_client.insert(
                project=self.project_id, zone=self.zone, instance_resource=config
            )
            
            # Note: In a real environment, we'd wait for operation completion.
            return {"status": "provisioning", "id": instance_name, "op": operation.name}

        except Exception as e:
            logging.error(f"[GCP ERROR] VM Deployment failed: {str(e)}")
            return {"status": "error", "message": str(e)}

    def list_instances(self):
        """Returns the status of all swarm nodes."""
        try:
            instance_client = compute_v1.InstancesClient()
            instances = instance_client.list(project=self.project_id, zone=self.zone)
            return [{"name": i.name, "status": i.status} for i in instances]
        except Exception as e:
            logging.warning(f"[GCP] Could not list instances: {str(e)}")
            return []

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    orch = CloudOrchestrator()
    # print(orch.create_instance())
    print(f"Active Swarm Nodes: {orch.list_instances()}")
