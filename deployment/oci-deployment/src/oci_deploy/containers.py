"""Container deployment logic for OCI Container Instances."""

import oci
from rich.console import Console
from rich.progress import Progress
from typing import Dict, Any
from .config import OCIConfig

console = Console()


class ContainerDeployer:
    """Handles deployment of containers to OCI Container Instances."""
    
    def __init__(self, config: OCIConfig):
        """Initialize container deployer.
        
        Args:
            config: OCI configuration instance
        """
        self.config = config
        self.oci_config = oci.config.from_file()
        self.container_client = oci.container_instances.ContainerInstanceClient(
            self.oci_config
        )
    
    async def deploy_frontend_container(
        self, 
        image_tag: str, 
        environment_vars: Dict[str, str] = None
    ) -> str:
        """Deploy React frontend container with Nginx to OCI Container Instances.
        
        Args:
            image_tag: Container image tag to deploy
            environment_vars: Environment variables for the container
            
        Returns:
            Container instance ID
        """
        
        if environment_vars is None:
            environment_vars = {
                "VITE_BLOCK_EXPLORER_ENDPOINT": self.config.blockchain_api_endpoint,
                "VITE_BUILD_CAPS": "true" if self.config.environment == "prod" else "false"
            }
        
        with Progress() as progress:
            task = progress.add_task("Deploying frontend container...", total=100)
            
            container_details = oci.container_instances.models.CreateContainerInstanceDetails(
                compartment_id=self.config.compartment_id,
                availability_domain=self.config.availability_domain,
                shape="CI.Standard.E4.Flex",
                shape_config=oci.container_instances.models.CreateContainerInstanceShapeConfigDetails(
                    ocpus=0.5,
                    memory_in_gbs=1.0
                ),
                containers=[
                    oci.container_instances.models.CreateContainerDetails(
                        display_name=f"sankey-explorer-frontend-{self.config.environment}",
                        image_url=f"{self.config.container_registry_url}/frontend:{image_tag}",
                        environment_variables=environment_vars,
                        resource_config=oci.container_instances.models.CreateContainerResourceConfigDetails(
                            vcpus_limit=0.5,
                            memory_limit_in_gbs=1.0
                        )
                    )
                ],
                display_name=f"sankey-block-explorer-{self.config.environment}"
            )
            
            progress.update(task, advance=50)
            
            response = self.container_client.create_container_instance(
                create_container_instance_details=container_details
            )
            
            progress.update(task, advance=100)
            
        console.print(f"[green]✓[/green] Frontend container deployed: {response.data.id}")
        return response.data.id
    
    def get_container_status(self, instance_id: str) -> Dict[str, Any]:
        """Get container instance status.
        
        Args:
            instance_id: Container instance ID
            
        Returns:
            Dictionary with container status information
        """
        response = self.container_client.get_container_instance(instance_id)
        return {
            "id": response.data.id,
            "display_name": response.data.display_name,
            "lifecycle_state": response.data.lifecycle_state,
            "time_created": response.data.time_created,
            "containers": [
                {
                    "display_name": container.display_name,
                    "lifecycle_state": container.lifecycle_state
                }
                for container in response.data.containers
            ]
        }
    
    def delete_container_instance(self, instance_id: str) -> None:
        """Delete a container instance.
        
        Args:
            instance_id: Container instance ID to delete
        """
        try:
            self.container_client.delete_container_instance(instance_id)
            console.print(f"[green]✓[/green] Container instance {instance_id} deletion initiated")
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to delete container instance: {e}")
            raise