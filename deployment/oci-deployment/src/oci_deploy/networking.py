"""Load balancer and CDN configuration for OCI deployment."""

import oci
from rich.console import Console
from typing import Dict, Any, List
from .config import OCIConfig

console = Console()


class NetworkingManager:
    """Manages OCI networking components for the deployment."""
    
    def __init__(self, config: OCIConfig):
        """Initialize networking manager.
        
        Args:
            config: OCI configuration instance
        """
        self.config = config
        self.oci_config = oci.config.from_file()
        self.load_balancer_client = oci.load_balancer.LoadBalancerClient(
            self.oci_config
        )
        self.network_client = oci.core.VirtualNetworkClient(
            self.oci_config
        )
    
    def create_load_balancer(
        self, 
        subnet_ids: List[str],
        backend_set_name: str = "frontend-backend-set"
    ) -> str:
        """Create a load balancer for the frontend application.
        
        Args:
            subnet_ids: List of subnet IDs for the load balancer
            backend_set_name: Name for the backend set
            
        Returns:
            Load balancer ID
        """
        try:
            lb_details = oci.load_balancer.models.CreateLoadBalancerDetails(
                compartment_id=self.config.compartment_id,
                display_name=f"sankey-explorer-lb-{self.config.environment}",
                shape_name=self.config.load_balancer_shape,
                subnet_ids=subnet_ids,
                is_private=False,
                backend_sets={
                    backend_set_name: oci.load_balancer.models.BackendSetDetails(
                        policy="ROUND_ROBIN",
                        health_checker=oci.load_balancer.models.HealthCheckerDetails(
                            protocol="HTTP",
                            port=80,
                            url_path="/",
                            interval_in_millis=30000,
                            timeout_in_millis=3000,
                            retries=3
                        )
                    )
                },
                listeners={
                    "http": oci.load_balancer.models.ListenerDetails(
                        default_backend_set_name=backend_set_name,
                        port=80,
                        protocol="HTTP"
                    )
                }
            )
            
            response = self.load_balancer_client.create_load_balancer(
                create_load_balancer_details=lb_details
            )
            
            console.print(f"[green]✓[/green] Load balancer creation initiated: {response.data.id}")
            return response.data.id
            
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to create load balancer: {e}")
            raise
    
    def add_backend_to_set(
        self, 
        load_balancer_id: str,
        backend_set_name: str,
        ip_address: str,
        port: int = 80
    ) -> None:
        """Add a backend server to the load balancer backend set.
        
        Args:
            load_balancer_id: Load balancer ID
            backend_set_name: Backend set name
            ip_address: IP address of the backend server
            port: Port number of the backend server
        """
        try:
            backend_details = oci.load_balancer.models.BackendDetails(
                ip_address=ip_address,
                port=port,
                weight=1,
                backup=False,
                drain=False,
                offline=False
            )
            
            self.load_balancer_client.create_backend(
                load_balancer_id=load_balancer_id,
                backend_set_name=backend_set_name,
                create_backend_details=backend_details
            )
            
            console.print(f"[green]✓[/green] Backend {ip_address}:{port} added to {backend_set_name}")
            
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to add backend: {e}")
            raise
    
    def get_load_balancer_status(self, load_balancer_id: str) -> Dict[str, Any]:
        """Get load balancer status and details.
        
        Args:
            load_balancer_id: Load balancer ID
            
        Returns:
            Dictionary with load balancer status information
        """
        try:
            response = self.load_balancer_client.get_load_balancer(load_balancer_id)
            lb = response.data
            
            return {
                "id": lb.id,
                "display_name": lb.display_name,
                "lifecycle_state": lb.lifecycle_state,
                "shape_name": lb.shape_name,
                "ip_addresses": [ip.ip_address for ip in lb.ip_addresses],
                "backend_sets": {
                    name: {
                        "policy": backend_set.policy,
                        "backends": [
                            {
                                "ip_address": backend.ip_address,
                                "port": backend.port,
                                "weight": backend.weight,
                                "health_status": "unknown"  # Would need health check API
                            }
                            for backend in backend_set.backends
                        ]
                    }
                    for name, backend_set in lb.backend_sets.items()
                },
                "listeners": {
                    name: {
                        "port": listener.port,
                        "protocol": listener.protocol,
                        "default_backend_set": listener.default_backend_set_name
                    }
                    for name, listener in lb.listeners.items()
                }
            }
            
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to get load balancer status: {e}")
            raise
    
    def delete_load_balancer(self, load_balancer_id: str) -> None:
        """Delete a load balancer.
        
        Args:
            load_balancer_id: Load balancer ID to delete
        """
        try:
            self.load_balancer_client.delete_load_balancer(load_balancer_id)
            console.print(f"[green]✓[/green] Load balancer {load_balancer_id} deletion initiated")
            
        except Exception as e:
            console.print(f"[red]✗[/red] Failed to delete load balancer: {e}")
            raise
    
    def setup_cdn_distribution(self, origin_hostname: str) -> Dict[str, Any]:
        """Set up CDN distribution for the frontend application.
        
        Note: This is a placeholder for CDN setup. OCI CDN configuration
        would require additional API calls and configuration.
        
        Args:
            origin_hostname: Hostname of the origin server
            
        Returns:
            CDN distribution details
        """
        if not self.config.cdn_enabled:
            console.print("[yellow]![/yellow] CDN is disabled in configuration")
            return {}
        
        # Placeholder for CDN setup
        console.print(f"[blue]ℹ[/blue] CDN setup would be configured for origin: {origin_hostname}")
        console.print("[yellow]![/yellow] CDN setup is not yet implemented")
        
        return {
            "status": "placeholder",
            "origin": origin_hostname,
            "message": "CDN setup not yet implemented"
        }