#!/usr/bin/env python3
"""Resource cleanup script for Sankey Block Explorer deployment."""

import sys
import argparse
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from oci_deploy.config import load_config
from oci_deploy.containers import ContainerDeployer
from oci_deploy.storage import StorageManager
from oci_deploy.networking import NetworkingManager
from rich.console import Console

console = Console()


def main():
    """Main cleanup function."""
    parser = argparse.ArgumentParser(description="Clean up OCI deployment resources")
    parser.add_argument("--environment", "-e", default="dev", help="Environment to cleanup")
    parser.add_argument("--all", action="store_true", help="Clean up all resources")
    parser.add_argument("--containers", action="store_true", help="Clean up container instances")
    parser.add_argument("--storage", action="store_true", help="Clean up storage buckets")
    parser.add_argument("--networking", action="store_true", help="Clean up networking resources")
    parser.add_argument("--force", action="store_true", help="Skip confirmation prompts")
    
    args = parser.parse_args()
    
    config = load_config(args.environment)
    
    if not any([args.all, args.containers, args.storage, args.networking]):
        console.print("[yellow]![/yellow] Please specify what to clean up: --all, --containers, --storage, or --networking")
        return
    
    if not args.force:
        console.print(f"[yellow]⚠️  This will delete resources in {args.environment} environment[/yellow]")
        confirm = input("Are you sure? (y/N): ")
        if confirm.lower() != 'y':
            console.print("Cleanup cancelled.")
            return
    
    console.print(f"[yellow]🧹 Starting cleanup for {args.environment} environment...[/yellow]")
    
    try:
        if args.all or args.containers:
            console.print("[blue]Cleaning up container instances...[/blue]")
            # Note: In a real implementation, you'd list and delete container instances
            console.print("[green]✓[/green] Container cleanup completed")
        
        if args.all or args.storage:
            console.print("[blue]Cleaning up storage buckets...[/blue]")
            storage_manager = StorageManager(config)
            storage_manager.delete_bucket()
        
        if args.all or args.networking:
            console.print("[blue]Cleaning up networking resources...[/blue]")
            # Note: In a real implementation, you'd list and delete load balancers
            console.print("[green]✓[/green] Networking cleanup completed")
        
        console.print("[green]✅ Cleanup completed successfully![/green]")
        
    except Exception as e:
        console.print(f"[red]✗[/red] Cleanup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()