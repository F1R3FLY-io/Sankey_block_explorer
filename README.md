# Sankey Block Explorer

A visualization tool for exploring blockchain data using Sankey diagrams. This application helps users analyze the flow of transactions, data, and value between blocks in a blockchain network using interactive Sankey diagrams built with React and D3.js.

## Features

- Visualize blockchain block data with interactive Sankey diagrams
- Component demo page showcasing the UI component library
- Responsive design with mobile and desktop support
- Gradient-based styling with Tailwind CSS
- Animated UI components with Framer Motion
- Comprehensive test coverage
- App Router-based navigation
- HTTPS development mode for secure contexts

## Technologies

- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- D3.js for data visualization
- Vitest for testing
- Vite for build tooling
- React Router for navigation
- API proxy for CORS-free backend communication

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - for frontend development
- **pnpm** (v8 or higher) - for JavaScript package management
- **Python** (v3.11 or higher) - for deployment automation (optional)
- **uv** - for fast Python package management (optional, [install guide](https://github.com/astral-sh/uv))
- **OCI CLI** - for Oracle Cloud deployment (optional, see deployment section)

### Quick Start

#### 1. Frontend Development Setup

```bash
# Clone the repository
git clone https://github.com/F1R3FLY-io/Sankey_block_explorer.git
cd Sankey_block_explorer

# Install frontend dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your blockchain API endpoint

# Start development server
pnpm dev
```

#### 2. Python Deployment Tools Setup (Optional)

```bash
# Install uv (fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Navigate to deployment directory and install dependencies
cd deployment/oci-deployment
uv sync

# Verify installation
uv run sankey-deploy --help

# Return to project root
cd ../..
```

#### 3. One-Command Development Start

```bash
# Complete setup and start development
git clone https://github.com/F1R3FLY-io/Sankey_block_explorer.git
cd Sankey_block_explorer
pnpm install && cp .env.example .env && pnpm dev
```

### Development

#### Frontend Development

```bash
# Standard HTTP development server
pnpm dev

# HTTPS development server (for secure contexts)
pnpm dev-https

# Run tests
pnpm test

# Run linting
pnpm lint
```

The application will be available at:
- HTTP mode: http://localhost:5173
- HTTPS mode: https://localhost:5173 (you may need to accept the self-signed certificate)

#### Python Deployment Tools Development

```bash
# Navigate to deployment directory
cd deployment/oci-deployment

# Install development dependencies
uv sync --extra dev

# Run tests
uv run pytest

# Format code
uv run black .

# Type checking
uv run mypy .

# Linting
uv run ruff check .

# Return to project root
cd ../..
```

### Building for Production

#### Frontend Build

```bash
# Build the React application
pnpm build

# Preview the production build locally
pnpm preview

# Run tests before building
pnpm test && pnpm build
```

#### Deployment Build

```bash
# Build frontend and prepare for deployment
pnpm build

# Navigate to deployment directory
cd deployment/oci-deployment

# Deploy to OCI (requires OCI configuration)
uv run sankey-deploy deploy --environment dev --image-tag latest

# Check deployment status
uv run sankey-deploy status --environment dev

# Return to project root
cd ../..
```

### Testing

#### Frontend Testing

```bash
# Run the test suite
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

#### Deployment Tools Testing

```bash
# Navigate to deployment directory
cd deployment/oci-deployment

# Run Python tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src/oci_deploy

# Run specific test files
uv run pytest tests/test_containers.py

# Return to project root
cd ../..
```

## Deployment

For production deployment to Oracle Cloud Infrastructure (OCI), see the [OCI Deployment Guide](docs/specs/IaC_python.md). The deployment automation uses Python with `uv` for fast package management and includes:

- Automated container deployment to OCI Container Instances
- Static asset deployment to OCI Object Storage
- CI/CD pipeline integration with GitHub Actions
- Environment-specific configuration management

### Quick Deployment

#### Prerequisites

```bash
# Install OCI CLI (if not already installed)
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configure OCI credentials
oci setup config
```

#### Deploy to OCI

```bash
# 1. Build the frontend application
pnpm build

# 2. Navigate to deployment directory and install tools
cd deployment/oci-deployment
uv sync

# 3. Deploy to development environment
uv run sankey-deploy deploy --environment dev --image-tag latest

# 4. Check deployment status
uv run sankey-deploy status --environment dev

# 5. Deploy only static assets (faster for frontend-only changes)
uv run sankey-deploy deploy --environment dev --static-only
```

#### Environment-Specific Deployment

```bash
# From deployment/oci-deployment directory:

# Development
uv run sankey-deploy deploy --environment dev --image-tag v1.0.0

# Staging
uv run sankey-deploy deploy --environment staging --image-tag v1.0.0

# Production
uv run sankey-deploy deploy --environment prod --image-tag v1.0.0
```

## Project Structure

### Frontend Application
```
/src
├── assets/               # Static assets like images and icons
├── components/           # React components
│   ├── ui/               # Basic UI components (design system)
│   │   ├── Button.tsx    # Reusable button component with variants
│   │   ├── Card.tsx      # Card component with gradient and hover effects
│   │   └── Typography.tsx # Text components with consistent styling
│   ├── blocks/           # Block-specific components
│   ├── transactions/     # Transaction-specific components
│   ├── visualizations/   # Data visualization components
│   ├── BlockCard.tsx     # Block card component
│   ├── HelpButton.tsx    # Help button component
│   ├── HelpModal.tsx     # Help modal component
│   └── SankeyDiagram.tsx # Sankey diagram visualization
├── hooks/                # Custom React hooks
│   └── useViewport.ts    # Hook for responsive design
├── layouts/              # Page layout components
│   ├── MainLayout.tsx    # Main application layout
│   └── DemoLayout.tsx    # Layout for demo page
├── pages/                # Page components
│   ├── BlocksList.tsx    # Blocks list page
│   ├── Explorer.tsx      # Main explorer page
│   └── Demo.tsx          # Component demo page
├── services/             # API and service functions
│   └── blockService.ts   # Service for block data
├── styles/               # CSS and style utilities
│   └── gradients.css     # Custom gradient definitions
├── utils/                # Utility functions
│   ├── colorUtils.ts     # Color manipulation utilities
│   └── dataFormatters.ts # Data formatting utilities
├── test/                 # Test utilities and mocks
├── siteMetadata.ts       # Site configuration and navigation
├── App.tsx               # Main application component
├── App.css               # Application styles
├── index.css             # Global styles with Tailwind
└── main.tsx              # Entry point
```

### Deployment Automation

```
/deployment/
├── oci-deployment/
│   ├── src/oci_deploy/      # Python deployment automation
│   ├── configs/             # Environment-specific configs
│   ├── tests/               # Python tests
│   ├── pyproject.toml      # Python project config
│   └── README.md           # Deployment documentation
└── docker/
    ├── Dockerfile.frontend # Multi-stage Docker build
    ├── nginx.conf          # Production Nginx config
    └── docker-entrypoint.sh # Environment injection script
```

### Dual Project Structure

**Important**: This project uses separate package managers for different components:

- **Frontend**: Managed by `pnpm` using `package.json` (React/TypeScript application)
- **Deployment Tools**: Managed by `uv` using `deployment/oci-deployment/pyproject.toml` (Python automation)

The Python `.venv` is created in `deployment/oci-deployment/` when you run `uv sync` from that directory.

### Complete Project Structure

```
Sankey_block_explorer/
├── src/                          # React frontend application
├── deployment/
│   ├── oci-deployment/           # Python deployment automation
│   │   ├── src/oci_deploy/       # Python modules
│   │   ├── configs/              # Environment configs
│   │   ├── tests/                # Python tests
│   │   ├── pyproject.toml       # Python deployment tools config
│   │   └── .venv/               # Python virtual environment
│   └── docker/
│       ├── Dockerfile.frontend  # Multi-stage Docker build
│       ├── nginx.conf           # Production Nginx config
│       └── docker-entrypoint.sh # Environment injection
├── dist/                        # Build output (generated)
├── package.json                 # Frontend dependencies (pnpm)
└── README.md                   # This file
```

### Package Management

This project uses **two separate package managers**:

1. **Frontend (pnpm)**: Manages React/TypeScript dependencies via `package.json`
2. **Deployment (uv)**: Manages Python deployment tools via `deployment/oci-deployment/pyproject.toml`

### Project Features

The project follows a structured approach with:

- **Component Organization**: UI components are organized by domain and purpose
- **Tailwind Integration**: Uses Tailwind CSS for styling with custom gradients
- **Animation Support**: Framer Motion for smooth animations
- **Responsive Design**: Responsive layouts and components with viewport hooks
- **Design System**: Reusable UI components with consistent styling
- **Testing**: Component tests with Vitest and React Testing Library
- **TypeScript**: Type-safe development throughout the codebase
- **React Router**: App Router-based navigation with clean route structure
- **Site Configuration**: Centralized configuration in siteMetadata.ts
- **OCI Deployment**: Optional Python-based automation for Oracle Cloud Infrastructure

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# Controls whether to build with specific capabilities
VITE_BUILD_CAPS=true

# API endpoint for the block explorer backend
# Default development endpoint (f1r3fly-dev)
VITE_BLOCK_EXPLORER_ENDPOINT=http://159.54.181.185:30003
```

Additional available endpoints:
- ASI Development: `http://146.235.215.215:30003`
- ASI Production: `http://167.234.221.56:30003`

For convenience, you can copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

## API Proxy Configuration

The application includes a built-in API proxy to communicate with the backend blockchain data service. The proxy:

- Forwards all `/api/*` requests to the backend service specified in the `VITE_BLOCK_EXPLORER_ENDPOINT` environment variable
- Handles CORS (Cross-Origin Resource Sharing) issues automatically
- Works in both HTTP and HTTPS development modes
- Configured in `vite.config.ts`

This enables seamless communication with the backend without CORS errors, regardless of whether you're running in HTTP or HTTPS mode.

## Current Development Status

The project is currently in active development with the following recent updates:

- Integrated UI component library with Tailwind CSS
- Implemented responsive layouts for both mobile and desktop
- Added HTTPS development mode for secure contexts
- Fixed site metadata and navigation structure
- Updated block explorer visualization components
- Added comprehensive test coverage with Vitest
- Improved environment variable configuration for different endpoints
- Fixed type safety issues throughout the codebase
- Enhanced event handling in visualization components
- **Added OCI deployment automation** with Python-based infrastructure as code

### OCI Deployment Branch

The current `oci_cli_IaC` branch includes infrastructure automation for Oracle Cloud Infrastructure deployment. See [docs/specs/IaC_python.md](docs/specs/IaC_python.md) for complete deployment documentation.

## Troubleshooting

### Common Issues

#### Frontend Development

```bash
# Node.js version issues
nvm use 18  # or nvm install 18

# pnpm not found
npm install -g pnpm

# Port already in use
lsof -ti:5173 | xargs kill -9
pnpm dev

# Environment variables not loading
cp .env.example .env
# Edit .env with correct values
```

#### Python Deployment Tools

```bash
# uv not found
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc  # or restart terminal

# Navigate to deployment directory first
cd deployment/oci-deployment

# Python version issues
uv python install 3.11
uv python use 3.11

# Dependencies not syncing
uv sync --reinstall

# OCI authentication issues
oci setup config
# Follow prompts to configure credentials
```

#### Build Issues

```bash
# Clear build cache
rm -rf dist/ node_modules/.vite/
pnpm install
pnpm build

# TypeScript errors
pnpm lint
pnpm typecheck

# Test failures
pnpm test -- --reporter=verbose
```

## Command Reference

### Frontend Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server (HTTP) |
| `pnpm dev-https` | Start development server (HTTPS) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript checks |

### Deployment Commands

**Note**: Run these commands from the `deployment/oci-deployment/` directory

| Command | Description |
|---------|-------------|
| `uv sync` | Install Python dependencies |
| `uv run sankey-deploy --help` | Show deployment help |
| `uv run sankey-deploy deploy` | Deploy application |
| `uv run sankey-deploy status` | Check deployment status |
| `uv run sankey-deploy cleanup` | Clean up resources |
| `uv run pytest` | Run Python tests |
| `uv run black .` | Format Python code |
| `uv run mypy .` | Type check Python code |

### Quick Commands

```bash
# Complete development setup
git clone https://github.com/F1R3FLY-io/Sankey_block_explorer.git
cd Sankey_block_explorer
pnpm install && cp .env.example .env && pnpm dev

# Build and deploy in one go
pnpm build && cd deployment/oci-deployment && uv run sankey-deploy deploy --environment dev --image-tag latest

# Build Docker image (from project root)
docker build -f deployment/docker/Dockerfile.frontend -t sankey-explorer:latest .

# Run all tests (frontend + deployment tools)
pnpm test && cd deployment/oci-deployment && uv run pytest
```

## License

[Sovereign Source License](https://gitlab.com/smart-assets.io/SovereignLicense/-/raw/main/SovereignLicense.md)
