# Sankey Block Explorer

A visualization tool for exploring blockchain data using Sankey diagrams. This application helps users analyze the flow of transactions, data, and value between blocks in a blockchain network using interactive Sankey diagrams built with React and D3.js.

## Features

- Visualize blockchain block data with interactive Sankey diagrams
- Component demo page showcasing the UI component library
- Responsive design with mobile and desktop support
- Gradient-based styling with Tailwind CSS
- Animated UI components with Framer Motion
- Comprehensive test coverage

## Technologies

- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- D3.js for data visualization
- Vitest for testing
- Vite for build tooling
- API proxy for CORS-free backend communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v7 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
# Standard HTTP development server
pnpm dev

# HTTPS development server (for secure contexts)
pnpm dev-https
```

The application will be available at:
- HTTP mode: http://localhost:5173
- HTTPS mode: https://localhost:5173 (you may need to accept the self-signed certificate)

### Building for Production

```bash
pnpm build
```

To preview the production build:

```bash
pnpm preview
```

## Project Structure

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
├── App.tsx               # Main application component
├── App.css               # Application styles
├── index.css             # Global styles with Tailwind
└── main.tsx              # Entry point
```

The project follows a structured approach with:

- **Component Organization**: UI components are organized by domain and purpose
- **Tailwind Integration**: Uses Tailwind CSS for styling with custom gradients
- **Animation Support**: Framer Motion for smooth animations
- **Responsive Design**: Responsive layouts and components
- **Design System**: Reusable UI components with consistent styling
- **Testing**: Component tests with Vitest and React Testing Library
- **TypeScript**: Type-safe development throughout the codebase

## API Proxy Configuration

The application includes a built-in API proxy to communicate with the backend blockchain data service. The proxy:

- Forwards all `/api/*` requests to the backend service
- Handles CORS (Cross-Origin Resource Sharing) issues automatically
- Works in both HTTP and HTTPS development modes
- Configured in `vite.config.ts`

This enables seamless communication with the backend without CORS errors, regardless of whether you're running in HTTP or HTTPS mode.

## License

[Sovereign Source License](https://gitlab.com/smart-assets.io/SovereignLicense/-/raw/main/SovereignLicense.md)
