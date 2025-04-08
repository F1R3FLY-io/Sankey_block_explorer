# Claude System Instructions
 
## Project Context
- This is the a Block and DAG Explorer application project, using React/TypeScript and built with Vite.
- The project implements an explorer for a blockchain transactions and value flow.
- Uses App Router for navigation and Framer Motion for animations
- Style with Tailwind CSS.
 
## Commands
- Development: `pnpm dev` for standard HTTP development server
- HTTPS Development: `pnpm dev-https` for HTTPS development server (useful for testing with secure contexts)
- Build: `pnpm build`
- Lint: `pnpm lint` (ESLint with Next.js and TypeScript rules)
- Start production: `pnpm start`
- DO NOT ever `git add` or `git commit` code. Allow the Claude user to always manually review changes.
- DO NOT ever remove tests from eslint or type checks.
- Run `pnpm test && pnpm build` to test code changes before proceeding to a prompt for more instructions or the next task.
- DO NOT start the development servers with `pnpm dev` or `pnpm dev-https`. Inform the user to start their development environments themselves.
 
## Code Style Preferences
- **TypeScript**: Use TypeScript for all files. Enable `strictNullChecks`.
- Organize imports: React first, third-party libraries next, local imports last.
- **Imports**: Use path aliases (`@components/`, `@lib/`, `@data/`, `@hooks/`).
- **Component Structure**: Functional components with React hooks.
- **Naming**: PascalCase for components, camelCase for functions/variables.
- **Error Handling**: Log errors with proper context, avoid console.log in production.
- **CSS**: Use Tailwind CSS for styling with proper responsive classes.
- Follow existing component patterns with clear props interfaces.
- Follow existing error handling patterns with optional chaining and fallbacks.
- When adding source code or new files, enhance, update, and provide new unit tests using the existing Vitest patterns.
- Use organized file structure: components/, pages/, hooks/, providers/, utils/
 
## Common Tasks
- Use the existing component hierarchy and structure
- Follow React 19 and Next.js 15 best practices
- Run `pnpm lint` before moving to next step in task or running dev server
- Keep component hierarchy consistent with the existing architecture
- Use framer-motion for animations following existing patterns
- Test UI on mobile and desktop viewports
- If connected to a `mcp-shell-server` also known as just a "shell", run all shell commands through that mcp server. This approach will automatically restrict which commands can be run and properly configure the shell environment. 

## Best Practices
- Maintain responsive design across all components
- Keep console logging to minimum, prefer `console.warn` or `console.error`
- Follow React 19 and Next.js 15 best practices
- Use Next.js App Router patterns
- Implement proper types for all components and functions
