# Claude System Instructions

AI assistant guidance for Claude System Instructions. This file follows the Agentic AI Foundation (Linux Foundation) standard for AI coding assistants.

**Full documentation:** See [CLAUDE.md](CLAUDE.md) for comprehensive project guidelines.

## Project Context
- This is the a Block and DAG Explorer application project, using React/TypeScript and built with Vite.
- The project implements an explorer for a blockchain transactions and value flow.
- Uses App Router for navigation and Framer Motion for animations
- Style with Tailwind CSS.
 

## Code Style Preferences
- **TypeScript**: Use TypeScript for all files. Enable `strictNullChecks`.
- Organize imports: React first, third-party libraries next, local imports last.
- **Imports**: Use path aliases (`@components/`, `@lib/`, `@data/`, `@hooks/`).
- **Component Structure**: Functional components with React hooks.
- **Naming**: PascalCase for components, camelCase for functions/variables.
- **Error Handling**: Log errors with proper context, avoid console.log in production.
- **CSS**: Use Tailwind CSS for styling with proper responsive classes. DO NOT user inline JavaScript styling if possible.
- Follow existing component patterns with clear props interfaces.
- Follow existing error handling patterns with optional chaining and fallbacks.
- When adding source code or new files, enhance, update, and provide new unit tests using the existing Vitest patterns.
- Use organized file structure: components/, pages/, hooks/, providers/, utils/
 


---

**Detailed guidelines:** [CLAUDE.md](CLAUDE.md)
