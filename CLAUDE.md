# Claude System Instructions
 
## Project Context
- This is the DUNA website project, a React/TypeScript application built with Vite
- The project implements a website for Smart Assets and decentralized funding
- Uses React Router for navigation and Framer Motion for animations
- Styled with Tailwind CSS
 
## Build Commands
- `pnpm dev` - Start development server
- `pnpm build` - Production build (runs TypeScript check first)
- `pnpm lint` - Run ESLint to check for code issues
- `pnpm preview` - Preview production build locally
- Do not run bash or zsh commands. Instead tell user what to run on their own.
 
## Code Style Preferences
- Use TypeScript for all components with proper type annotations
- Organize imports: React first, third-party libraries next, local imports last
- Use functional components with hooks (React.FC type or implicit return)
- Follow existing component patterns with clear props interfaces
- Maintain consistent naming: PascalCase for components, camelCase for functions
- Use organized file structure: components/, pages/, hooks/, providers/, utils/
- Follow existing error handling patterns with optional chaining and fallbacks
 
## Common Tasks
- Use the existing component hierarchy and structure
- Run `pnpm lint` before committing changes
- Keep component hierarchy consistent with the existing architecture
- Use framer-motion for animations following existing patterns
- Test UI on mobile and desktop viewports

## Best Practices
- Maintain responsive design across all components
- Keep console logging to minimum, prefer `console.warn` or `console.error`
- Follow React 19 and Next.js 15 best practices
- Use Next.js App Router patterns
- Implement proper types for all components and functions
