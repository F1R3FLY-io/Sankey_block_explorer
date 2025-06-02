"""CLI interface for OCI deployment automation."""

import typer
from rich.console import Console
from rich.table import Table
from typing import Optional
import asyncio
from .config import load_config
from .containers import ContainerDeployer
from .storage import StorageManager
from .networking import NetworkingManager

app = typer.Typer(help="OCI Deployment CLI for Sankey Block Explorer React Application")
console = Console()


@app.command()
def deploy(
    environment: str = typer.Option("dev", help="Deployment environment"),
    image_tag: str = typer.Option(..., help="Container image tag"),
    static_only: bool = typer.Option(False, help="Deploy only static assets"),
    container_only: bool = typer.Option(False, help="Deploy only container instance"),
):
    """Deploy Sankey Block Explorer React application to OCI."""
    config = load_config(environment)
    
    console.print(f"[blue]🚀 Deploying Sankey Block Explorer to {environment} environment[/blue]")
    
    if not container_only:
        # Deploy static assets to Object Storage
        storage_manager = StorageManager(config)
        storage_manager.create_frontend_bucket()
        storage_manager.upload_frontend_build()
    
    if not static_only:
        # Deploy frontend container
        container_deployer = ContainerDeployer(config)
        instance_id = asyncio.run(
            container_deployer.deploy_frontend_container(image_tag)
        )
        console.print(f"[green]✅ Deployment completed![/green]")
        console.print(f"Container Instance ID: {instance_id}")


@app.command()
def status(
    environment: str = typer.Option("dev", help="Environment to check"),
    instance_id: Optional[str] = typer.Option(None, help="Specific container instance ID"),
    load_balancer_id: Optional[str] = typer.Option(None, help="Specific load balancer ID")
):
    """Check deployment status."""
    config = load_config(environment)
    
    if instance_id:
        container_deployer = ContainerDeployer(config)
        status_info = container_deployer.get_container_status(instance_id)
        
        table = Table(title=f"Container Instance Status - {environment}")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("ID", status_info["id"])
        table.add_row("Display Name", status_info["display_name"])
        table.add_row("Lifecycle State", status_info["lifecycle_state"])
        table.add_row("Created", str(status_info["time_created"]))
        
        console.print(table)
        
        # Show container details
        if status_info["containers"]:
            container_table = Table(title="Containers")
            container_table.add_column("Name", style="cyan")
            container_table.add_column("State", style="green")
            
            for container in status_info["containers"]:
                container_table.add_row(
                    container["display_name"], 
                    container["lifecycle_state"]
                )
            
            console.print(container_table)
    
    if load_balancer_id:
        networking_manager = NetworkingManager(config)
        lb_status = networking_manager.get_load_balancer_status(load_balancer_id)
        
        lb_table = Table(title=f"Load Balancer Status - {environment}")
        lb_table.add_column("Property", style="cyan")
        lb_table.add_column("Value", style="green")
        
        lb_table.add_row("ID", lb_status["id"])
        lb_table.add_row("Display Name", lb_status["display_name"])
        lb_table.add_row("Lifecycle State", lb_status["lifecycle_state"])
        lb_table.add_row("Shape", lb_status["shape_name"])
        lb_table.add_row("IP Addresses", ", ".join(lb_status["ip_addresses"]))
        
        console.print(lb_table)
    
    if not instance_id and not load_balancer_id:
        console.print("[yellow]![/yellow] Please specify --instance-id or --load-balancer-id to check status")


@app.command()
def cleanup(
    environment: str = typer.Option("dev", help="Environment to cleanup"),
    instance_id: Optional[str] = typer.Option(None, help="Container instance ID to delete"),
    load_balancer_id: Optional[str] = typer.Option(None, help="Load balancer ID to delete"),
    delete_bucket: bool = typer.Option(False, help="Delete the storage bucket"),
    confirm: bool = typer.Option(False, "--yes", help="Skip confirmation prompt")
):
    """Clean up deployment resources."""
    if not confirm:
        console.print(f"[yellow]⚠️  This will delete resources in {environment} environment[/yellow]")
        if instance_id:
            console.print(f"  - Container instance: {instance_id}")
        if load_balancer_id:
            console.print(f"  - Load balancer: {load_balancer_id}")
        if delete_bucket:
            console.print(f"  - Storage bucket and all contents")
        
        confirm = typer.confirm("Are you sure you want to proceed?")
        if not confirm:
            console.print("Cleanup cancelled.")
            return
    
    config = load_config(environment)
    console.print(f"[yellow]🧹 Cleaning up {environment} resources...[/yellow]")
    
    if instance_id:
        container_deployer = ContainerDeployer(config)
        container_deployer.delete_container_instance(instance_id)
    
    if load_balancer_id:
        networking_manager = NetworkingManager(config)
        networking_manager.delete_load_balancer(load_balancer_id)
    
    if delete_bucket:
        storage_manager = StorageManager(config)
        storage_manager.delete_bucket()
    
    console.print("[green]✅ Cleanup completed![/green]")


@app.command()
def networking(
    environment: str = typer.Option("dev", help="Environment for networking setup"),
    action: str = typer.Option(..., help="Action: create-lb, setup-cdn"),
    subnet_ids: Optional[str] = typer.Option(None, help="Comma-separated subnet IDs for load balancer"),
    origin_hostname: Optional[str] = typer.Option(None, help="Origin hostname for CDN")
):
    """Manage networking components (load balancer, CDN)."""
    config = load_config(environment)
    networking_manager = NetworkingManager(config)
    
    if action == "create-lb":
        if not subnet_ids:
            console.print("[red]✗[/red] Subnet IDs are required for load balancer creation")
            return
        
        subnet_list = [sid.strip() for sid in subnet_ids.split(",")]
        lb_id = networking_manager.create_load_balancer(subnet_list)
        console.print(f"[green]✅ Load balancer created: {lb_id}[/green]")
    
    elif action == "setup-cdn":
        if not origin_hostname:
            console.print("[red]✗[/red] Origin hostname is required for CDN setup")
            return
        
        cdn_result = networking_manager.setup_cdn_distribution(origin_hostname)
        console.print(f"[blue]ℹ[/blue] CDN setup result: {cdn_result}")
    
    else:
        console.print(f"[red]✗[/red] Unknown action: {action}")
        console.print("Available actions: create-lb, setup-cdn")


@app.command()
def config_check(
    environment: str = typer.Option("dev", help="Environment to check")
):
    """Check configuration for specified environment."""
    try:
        config = load_config(environment)
        
        table = Table(title=f"Configuration - {environment}")
        table.add_column("Setting", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Environment", config.environment)
        table.add_row("Region", config.region)
        table.add_row("Compartment ID", config.compartment_id[:20] + "..." if len(config.compartment_id) > 20 else config.compartment_id)
        table.add_row("Availability Domain", config.availability_domain)
        table.add_row("Container Registry", config.container_registry_url)
        table.add_row("Frontend Bucket", config.frontend_bucket_name)
        table.add_row("Blockchain API", config.blockchain_api_endpoint)
        table.add_row("CDN Enabled", str(config.cdn_enabled))
        table.add_row("Load Balancer Shape", config.load_balancer_shape)
        
        console.print(table)
        console.print("[green]✅ Configuration loaded successfully[/green]")
        
    except Exception as e:
        console.print(f"[red]✗[/red] Configuration error: {e}")
        console.print(f"[yellow]![/yellow] Make sure {environment}.env exists in configs/ directory")


if __name__ == "__main__":
    app()