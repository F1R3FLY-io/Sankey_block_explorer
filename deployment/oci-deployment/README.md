# OCI Deployment Automation

This directory contains Python-based automation tools for deploying the Sankey Block Explorer React application to Oracle Cloud Infrastructure.

## Quick Start

1. Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Build the React application: `cd ../../ && pnpm build`
3. Navigate to deployment directory: `cd deployment/oci-deployment` (if not already here)
4. Install dependencies: `uv sync`
5. Configure OCI credentials (see Configuration section)
6. Deploy: `uv run sankey-deploy deploy --environment dev --image-tag latest`

**Important**: All `uv` commands should be run from the `deployment/oci-deployment/` directory where the `pyproject.toml` file is located.

## Configuration

### OCI Credentials

Create OCI config file at `~/.oci/config` or set environment variables:

```bash
# Install OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configure credentials
oci setup config
```

### Environment Configuration

Update the environment files in `configs/` directory:

- `configs/dev.env` - Development environment
- `configs/staging.env` - Staging environment  
- `configs/prod.env` - Production environment

**Important**: Update the following values in your environment files:
- `OCI_COMPARTMENT_ID` - Your OCI compartment OCID
- `CONTAINER_REGISTRY_URL` - Your OCI container registry URL
- Replace "changeme" and "your-tenancy" with actual values

## Commands

- `uv run sankey-deploy deploy` - Deploy application
- `uv run sankey-deploy status` - Check deployment status  
- `uv run sankey-deploy cleanup` - Clean up resources
- `uv run sankey-deploy config-check` - Verify configuration
- `uv run sankey-deploy networking` - Manage networking components

## Development

- Run tests: `uv run pytest`
- Format code: `uv run black .`
- Type check: `uv run mypy .`
- Lint: `uv run ruff check .`

## Usage Examples

### Local Development
```bash
# Install and set up (from project root)
cd deployment/oci-deployment
uv sync

# Deploy to development
uv run sankey-deploy deploy --environment dev --image-tag v1.0.0

# Check status
uv run sankey-deploy status --environment dev

# Deploy only static assets to Object Storage
uv run sankey-deploy deploy --environment dev --image-tag v1.0.0 --static-only

# Deploy only container instance
uv run sankey-deploy deploy --environment dev --image-tag v1.0.0 --container-only
```

### Configuration Management
```bash
# From deployment/oci-deployment directory:

# Check configuration
uv run sankey-deploy config-check --environment dev

# Create load balancer
uv run sankey-deploy networking --environment dev --action create-lb --subnet-ids "subnet1,subnet2"

# Setup CDN
uv run sankey-deploy networking --environment dev --action setup-cdn --origin-hostname "example.com"
```

### Cleanup
```bash
# From deployment/oci-deployment directory:

# Clean up specific resources
uv run sankey-deploy cleanup --environment dev --instance-id "ocid1.containerinstance..."

# Clean up everything (with confirmation)
uv run sankey-deploy cleanup --environment dev --delete-bucket

# Force cleanup without confirmation
uv run sankey-deploy cleanup --environment dev --delete-bucket --yes
```

## Project Structure

```
deployment/
├── oci-deployment/
│   ├── src/
│   │   └── oci_deploy/
│   │       ├── __init__.py
│   │       ├── cli.py           # Main CLI interface
│   │       ├── config.py        # Configuration management
│   │       ├── containers.py    # Container deployment logic
│   │       ├── storage.py       # Object storage operations
│   │       └── networking.py    # Load balancer & CDN config
│   ├── scripts/
│   │   ├── deploy.py        # Main deployment script
│   │   └── cleanup.py       # Resource cleanup script
│   ├── configs/
│   │   ├── dev.env          # Development environment config
│   │   ├── staging.env      # Staging environment config
│   │   └── prod.env         # Production environment config
│   ├── tests/               # Test files
│   ├── pyproject.toml      # Python project configuration
│   └── README.md           # This file
└── docker/
    ├── Dockerfile.frontend # Multi-stage Docker build
    ├── nginx.conf          # Production Nginx configuration
    └── docker-entrypoint.sh # Environment variable injection
```

## Deployment Workflow

1. **Build Frontend**: Run `pnpm build` in the main project directory (`../../`)
2. **Navigate to Deployment**: `cd deployment/oci-deployment`
3. **Configure OCI**: Set up OCI CLI and update environment configs
4. **Install Dependencies**: `uv sync` (creates `.venv` in this directory)
5. **Build Docker Image** (optional): From project root, run:
   ```bash
   docker build -f deployment/docker/Dockerfile.frontend -t sankey-explorer:latest .
   ```
6. **Deploy Static Assets**: `uv run sankey-deploy deploy --static-only`
7. **Deploy Container**: `uv run sankey-deploy deploy --container-only` 
8. **Setup Networking**: Configure load balancer and CDN (optional)
9. **Verify Deployment**: Check status and test the application

### Docker Build Context

**Important**: The Dockerfile is located at `deployment/docker/Dockerfile.frontend`, but it should be built from the **project root** to access all necessary files:

```bash
# From project root (Sankey_block_explorer/)
docker build -f deployment/docker/Dockerfile.frontend -t sankey-explorer:latest .
```

## Troubleshooting

### Common Issues

- **OCI Authentication Failed**: Run `oci setup config` and verify credentials
- **Build Directory Not Found**: Run `pnpm build` first to generate dist directory
- **Permission Denied**: Ensure your OCI user has required permissions
- **Container Registry Access**: Verify container registry URL and authentication

### Getting Help

```bash
# Show available commands
uv run sankey-deploy --help

# Show command-specific help
uv run sankey-deploy deploy --help
uv run sankey-deploy status --help
```

## Security Notes

- Never commit actual OCI credentials or OCIDs to version control
- Use IAM policies with least privilege principles
- Regularly rotate access keys and tokens
- Enable audit logging for all deployment activities