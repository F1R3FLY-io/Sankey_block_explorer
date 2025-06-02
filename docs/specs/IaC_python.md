# OCI Deployment Implementation Plan - Sankey Block Explorer

## Overview

This document outlines the implementation plan for deploying the **Sankey Block Explorer** React application to Oracle Cloud Infrastructure (OCI) using Python with `uv` and `uvx` for fast package management and execution.

The Sankey Block Explorer is a React 18 + TypeScript SPA built with Vite that visualizes blockchain transaction flows using interactive Sankey diagrams. It connects to blockchain APIs to analyze block data and presents complex transaction relationships through D3.js visualizations.

## Current Project Structure

```
sankey_block_explorer/
├── src/                          # React frontend application
│   ├── components/               # React components (UI, visualizations, blocks)
│   ├── pages/                    # Page components (Explorer, BlocksList, Demo)
│   ├── services/                 # API services (blockService.ts)
│   ├── utils/                    # Utility functions
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/                  # Layout components
│   └── styles/                   # CSS and styling
├── deployment/                   # OCI deployment automation (to be created)
│   ├── pyproject.toml           # Python project configuration
│   ├── src/
│   │   ├── oci_deploy/
│   │   │   ├── __init__.py
│   │   │   ├── cli.py           # Main CLI interface
│   │   │   ├── config.py        # Configuration management
│   │   │   ├── containers.py    # Container deployment logic
│   │   │   ├── storage.py       # Object storage operations for static assets
│   │   │   └── networking.py    # Load balancer & CDN configuration
│   │   └── scripts/
│   │       ├── deploy.py        # Main deployment script
│   │       └── cleanup.py       # Resource cleanup script
│   ├── configs/
│   │   ├── dev.env              # Development environment config
│   │   ├── staging.env          # Staging environment config
│   │   └── prod.env             # Production environment config
│   ├── terraform/               # Optional: Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── README.md               # Deployment documentation
├── deployment/
│   ├── oci-deployment/          # OCI deployment automation
│   └── docker/
│       └── Dockerfile.frontend # Nginx container for React SPA
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── dist/                         # Build output directory (generated)
├── package.json                  # pnpm configuration
├── vite.config.ts                # Vite build configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md
```

## Phase 1: Setup and Configuration

### 1.1 Initialize Python Environment

```bash
# Navigate to project root
cd sankey_block_explorer

# Create deployment directory
mkdir deployment
cd deployment

# Initialize Python project with uv
uv init oci-deployment --name oci-deploy
cd oci-deployment

# Add dependencies
uv add oci python-dotenv click rich typer pydantic requests
uv add --dev pytest black mypy pre-commit

# Install development tools
uv add --dev pytest-cov pytest-mock
```

### 1.2 Create Configuration Files

**pyproject.toml**
```toml
[project]
name = "oci-deploy"
version = "0.1.0"
description = "OCI deployment automation for Sankey Block Explorer React application"
authors = [{name = "Your Name", email = "your.email@example.com"}]
dependencies = [
    "oci>=2.119.1",
    "python-dotenv>=1.0.0", 
    "click>=8.1.0",
    "rich>=13.5.0",
    "typer>=0.9.0",
    "pydantic>=2.0.0",
    "pydantic-settings>=2.0.0"
]

[project.scripts]
oci-deploy = "oci_deploy.cli:app"

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    "mypy>=1.5.0",
    "pre-commit>=3.4.0",
    "pytest-cov>=4.1.0",
    "pytest-mock>=3.11.0"
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.black]
line-length = 88
target-version = ['py311']

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
```

### 1.3 Environment Configuration

Create environment-specific configuration files:

**configs/dev.env**
```env
# Development Environment Configuration
OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
OCI_AVAILABILITY_DOMAIN=AD-1
OCI_REGION=us-ashburn-1
CONTAINER_REGISTRY_URL=iad.ocir.io/your-tenancy/your-app
ENVIRONMENT=dev
NODE_ENV=development
FRONTEND_BUCKET_NAME=sankey-explorer-frontend-dev
CDN_ENABLED=true
LOAD_BALANCER_SHAPE=100Mbps
BLOCKCHAIN_API_ENDPOINT=http://159.54.181.185:30003
VITE_BUILD_CAPS=true
```

## Phase 2: Core Implementation

### 2.1 Configuration Management

**src/oci_deploy/config.py**
```python
from pydantic import BaseSettings, Field
from typing import Optional
import os

class OCIConfig(BaseSettings):
    compartment_id: str = Field(..., env="OCI_COMPARTMENT_ID")
    availability_domain: str = Field(..., env="OCI_AVAILABILITY_DOMAIN") 
    region: str = Field(..., env="OCI_REGION")
    container_registry_url: str = Field(..., env="CONTAINER_REGISTRY_URL")
    environment: str = Field(..., env="ENVIRONMENT")
    
    # Blockchain API Configuration
    blockchain_api_endpoint: str = Field(..., env="BLOCKCHAIN_API_ENDPOINT")
    
    # CDN and Load Balancer Configuration
    cdn_enabled: bool = Field(True, env="CDN_ENABLED")
    load_balancer_shape: str = Field("100Mbps", env="LOAD_BALANCER_SHAPE")
    
    # Frontend Configuration
    frontend_bucket_name: str = Field(..., env="FRONTEND_BUCKET_NAME")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

def load_config(env: str = "dev") -> OCIConfig:
    env_file = f"configs/{env}.env"
    if os.path.exists(env_file):
        return OCIConfig(_env_file=env_file)
    return OCIConfig()
```

### 2.2 Container Deployment Module

**src/oci_deploy/containers.py**
```python
import oci
from rich.console import Console
from rich.progress import Progress
from typing import Dict, Any
from .config import OCIConfig

console = Console()

class ContainerDeployer:
    def __init__(self, config: OCIConfig):
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
        """Deploy React frontend container with Nginx to OCI Container Instances"""
        
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
        """Get container instance status"""
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
```

### 2.3 Object Storage Module

**src/oci_deploy/storage.py**
```python
import oci
import os
from pathlib import Path
from rich.console import Console
from rich.progress import Progress
from .config import OCIConfig

console = Console()

class StorageManager:
    def __init__(self, config: OCIConfig):
        self.config = config
        self.oci_config = oci.config.from_file()
        self.object_storage_client = oci.object_storage.ObjectStorageClient(
            self.oci_config
        )
        self.namespace = self.object_storage_client.get_namespace().data
    
    def create_frontend_bucket(self) -> str:
        """Create bucket for React frontend static files"""
        try:
            bucket_details = oci.object_storage.models.CreateBucketDetails(
                name=self.config.frontend_bucket_name,
                compartment_id=self.config.compartment_id,
                public_access_type="ObjectRead",
                storage_tier="Standard"
            )
            
            response = self.object_storage_client.create_bucket(
                namespace_name=self.namespace,
                create_bucket_details=bucket_details
            )
            
            console.print(f"[green]✓[/green] Frontend bucket created: {self.config.frontend_bucket_name}")
            return response.data.name
            
        except oci.exceptions.ServiceError as e:
            if e.status == 409:  # Bucket already exists
                console.print(f"[yellow]![/yellow] Bucket already exists: {self.config.frontend_bucket_name}")
                return self.config.frontend_bucket_name
            raise
    
    def upload_frontend_build(self, build_path: str = "../../dist") -> None:
        """Upload React Vite build files to Object Storage"""
        build_dir = Path(build_path)
        
        if not build_dir.exists():
            console.print(f"[red]✗[/red] Build directory not found: {build_path}")
            console.print(f"[yellow]![/yellow] Run 'pnpm build' first to generate the dist directory")
            return
        
        # Get all files to upload
        files_to_upload = list(build_dir.rglob("*"))
        files_to_upload = [f for f in files_to_upload if f.is_file()]
        
        with Progress() as progress:
            task = progress.add_task("Uploading frontend files...", total=len(files_to_upload))
            
            for file_path in files_to_upload:
                relative_path = file_path.relative_to(build_dir)
                object_name = str(relative_path).replace("\\", "/")
                
                # Determine content type
                content_type = self._get_content_type(file_path.suffix)
                
                with open(file_path, "rb") as file_data:
                    self.object_storage_client.put_object(
                        namespace_name=self.namespace,
                        bucket_name=self.config.frontend_bucket_name,
                        object_name=object_name,
                        put_object_body=file_data,
                        content_type=content_type
                    )
                
                progress.update(task, advance=1)
        
        console.print(f"[green]✓[/green] Uploaded {len(files_to_upload)} files to bucket")
    
    def _get_content_type(self, extension: str) -> str:
        """Get content type based on file extension"""
        content_types = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".txt": "text/plain"
        }
        return content_types.get(extension.lower(), "application/octet-stream")
```

### 2.4 CLI Interface

**src/oci_deploy/cli.py**
```python
import typer
from rich.console import Console
from rich.table import Table
from typing import Optional
import asyncio
from .config import load_config
from .containers import ContainerDeployer
from .storage import StorageManager

app = typer.Typer(help="OCI Deployment CLI for Sankey Block Explorer React Application")
console = Console()

@app.command()
def deploy(
    environment: str = typer.Option("dev", help="Deployment environment"),
    image_tag: str = typer.Option(..., help="Container image tag"),
    static_only: bool = typer.Option(False, help="Deploy only static assets"),
    container_only: bool = typer.Option(False, help="Deploy only container instance"),
):
    """Deploy Sankey Block Explorer React application to OCI"""
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
    instance_id: Optional[str] = typer.Option(None, help="Specific container instance ID")
):
    """Check deployment status"""
    config = load_config(environment)
    container_deployer = ContainerDeployer(config)
    
    if instance_id:
        status_info = container_deployer.get_container_status(instance_id)
        
        table = Table(title=f"Container Instance Status - {environment}")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("ID", status_info["id"])
        table.add_row("Display Name", status_info["display_name"])
        table.add_row("Lifecycle State", status_info["lifecycle_state"])
        table.add_row("Created", str(status_info["time_created"]))
        
        console.print(table)

@app.command()
def cleanup(
    environment: str = typer.Option("dev", help="Environment to cleanup"),
    confirm: bool = typer.Option(False, "--yes", help="Skip confirmation prompt")
):
    """Clean up deployment resources"""
    if not confirm:
        confirm = typer.confirm(f"Are you sure you want to cleanup {environment} resources?")
        if not confirm:
            console.print("Cleanup cancelled.")
            return
    
    console.print(f"[yellow]🧹 Cleaning up {environment} resources...[/yellow]")
    # Implement cleanup logic
    console.print("[green]✅ Cleanup completed![/green]")

if __name__ == "__main__":
    app()
```

## Phase 3: CI/CD Integration

### 3.1 GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy to OCI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: iad.ocir.io
  IMAGE_NAME: your-tenancy/sankey-explorer

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Install uv
      uses: astral-sh/setup-uv@v2
      with:
        version: "latest"
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build React frontend
      run: pnpm build
    
    - name: Build Docker image
      run: |
        docker build -f deployment/docker/Dockerfile.frontend -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }} .
    
    - name: Login to OCI Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.OCI_USERNAME }}
        password: ${{ secrets.OCI_PASSWORD }}
    
    - name: Push Docker image
      run: |
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}
    
    - name: Set up Python with uv
      run: |
        cd deployment/oci-deployment
        uv python install 3.11
        uv sync
    
    - name: Configure OCI CLI
      run: |
        mkdir -p ~/.oci
        echo "${{ secrets.OCI_CONFIG }}" > ~/.oci/config
        echo "${{ secrets.OCI_PRIVATE_KEY }}" > ~/.oci/private_key.pem
        chmod 600 ~/.oci/private_key.pem
    
    - name: Deploy to Development
      if: github.ref == 'refs/heads/develop'
      run: |
        cd deployment/oci-deployment
        uv run oci-deploy deploy --environment dev --image-tag ${{ github.sha }}
    
    - name: Deploy to Production
      if: github.ref == 'refs/heads/main'
      run: |
        cd deployment/oci-deployment
        uv run oci-deploy deploy --environment prod --image-tag ${{ github.sha }}
```

## Phase 4: Documentation and Testing

### 4.1 Deployment README

**deployment/README.md**
```markdown
# OCI Deployment Automation

This directory contains Python-based automation tools for deploying the Sankey Block Explorer React application to Oracle Cloud Infrastructure.

## Quick Start

1. Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Build the React application: `pnpm build`
3. Navigate to deployment directory: `cd deployment/oci-deployment`
4. Install dependencies: `uv sync`
5. Configure OCI credentials (see Configuration section)
6. Deploy: `uv run oci-deploy deploy --environment dev --image-tag latest`

## Configuration

Create OCI config file at `~/.oci/config` or set environment variables.

## Commands

- `uv run oci-deploy deploy` - Deploy application
- `uv run oci-deploy status` - Check deployment status  
- `uv run oci-deploy cleanup` - Clean up resources

## Development

- Run tests: `uv run pytest`
- Format code: `uv run black .`
- Type check: `uv run mypy .`
```

### 4.2 Testing Setup

**tests/test_containers.py**
```python
import pytest
from unittest.mock import Mock, patch
from oci_deploy.containers import ContainerDeployer
from oci_deploy.config import OCIConfig

@pytest.fixture
def mock_config():
    return OCIConfig(
        compartment_id="test-compartment",
        availability_domain="AD-1",
        region="us-ashburn-1",
        container_registry_url="test.ocir.io/test",
        environment="test",
        frontend_bucket_name="test-bucket"
    )

@pytest.fixture  
def container_deployer(mock_config):
    with patch('oci.config.from_file'), \
         patch('oci.container_instances.ContainerInstanceClient'):
        return ContainerDeployer(mock_config)

def test_deploy_api_container(container_deployer):
    # Test container deployment logic
    pass
```

## Phase 5: Execution Timeline

### Week 1: Foundation
- [ ] Set up project structure
- [ ] Initialize Python environment with uv
- [ ] Create configuration management
- [ ] Implement basic CLI structure

### Week 2: Core Features
- [ ] Implement container deployment module
- [ ] Implement object storage module
- [ ] Create comprehensive CLI interface
- [ ] Add error handling and logging

### Week 3: Integration
- [ ] Set up CI/CD pipeline
- [ ] Create Docker configurations
- [ ] Test deployment workflows
- [ ] Add monitoring and status checks

### Week 4: Testing & Documentation
- [ ] Write comprehensive tests
- [ ] Create deployment documentation
- [ ] Performance optimization
- [ ] Security review

## Usage Examples

### Local Development
```bash
# Install and set up
cd deployment/oci-deployment
uv sync

# Deploy to development
uv run oci-deploy deploy --environment dev --image-tag v1.0.0

# Check status
uv run oci-deploy status --environment dev

# Deploy only static assets to Object Storage
uv run oci-deploy deploy --environment dev --image-tag v1.0.0 --static-only

# Deploy only container instance
uv run oci-deploy deploy --environment dev --image-tag v1.0.0 --container-only
```

### Using uvx (One-time execution)
```bash
# Deploy without permanent installation
uvx --from ./deployment/oci-deployment oci-deploy deploy --environment prod --image-tag v1.2.3

# Check status from anywhere
uvx --from git+https://github.com/F1R3FLY-io/Sankey_block_explorer.git@main:deployment/oci-deployment oci-deploy status
```

## Security Considerations

- Store OCI credentials securely using environment variables or OCI config files
- Use IAM policies with least privilege principles
- Implement resource tagging for cost tracking and security
- Regular security reviews of deployment configurations
- Audit logs for all deployment activities

## Cost Optimization

- Use appropriate instance shapes for workloads
- Implement auto-scaling policies
- Regular cleanup of unused resources
- Monitor and optimize container resource allocation
- Use spot instances where appropriate

## Troubleshooting

Common issues and solutions will be documented as they arise during implementation.

## Contributing

1. Follow Python coding standards (Black, MyPy)
2. Add tests for new features
3. Update documentation
4. Follow semantic versioning for releases
