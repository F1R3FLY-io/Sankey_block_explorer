import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, RouteObject } from 'react-router-dom';
import MainLayout from '../MainLayout';

// Mock useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    // Type the imported actual to avoid explicit any
    ...(actual as Record<string, unknown>),
    useLocation: () => ({
      pathname: '/'
    })
  };
});

// Helper function to create router with future flags
const createTestRouter = (routes: RouteObject[]) => {
  return createMemoryRouter(routes, {
    initialEntries: ['/'],
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any // Type assertion to bypass TypeScript errors
  });
};

describe('MainLayout', () => {
  it('renders the header with logo and title', () => {
    const routes: RouteObject[] = [
      {
        path: '/',
        element: (
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        ),
      },
    ];

    const router = createTestRouter(routes);
    render(<RouterProvider router={router} />);
    
    // Check for the logo
    const logo = screen.getByAltText('MeTTaCycle Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('logo');
    
    // Check for the title
    expect(screen.getByText('MeTTaCycle Block Explorer')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    const routes: RouteObject[] = [
      {
        path: '/',
        element: (
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        ),
      },
    ];

    const router = createTestRouter(routes);
    render(<RouterProvider router={router} />);
    
    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('search-input');
  });

  it('renders navigation links', () => {
    const routes: RouteObject[] = [
      {
        path: '/',
        element: (
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        ),
      },
    ];

    const router = createTestRouter(routes);
    render(<RouterProvider router={router} />);
    
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    expect(screen.getByText('Blocks')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });

  it('highlights the active link based on location', () => {
    // The home path '/' should be active in our mocked location
    const routes: RouteObject[] = [
      {
        path: '/',
        element: (
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        ),
      },
    ];

    const router = createTestRouter(routes);
    render(<RouterProvider router={router} />);
    
    const explorerLink = screen.getByText('Explorer');
    expect(explorerLink).toHaveClass('bg-blue-600');
    
    // Other links should not be highlighted
    const blocksLink = screen.getByText('Blocks');
    expect(blocksLink).not.toHaveClass('bg-blue-600');
  });

  it('renders children content', () => {
    const routes: RouteObject[] = [
      {
        path: '/',
        element: (
          <MainLayout>
            <div data-testid="test-content">Child Content</div>
          </MainLayout>
        ),
      },
    ];

    const router = createTestRouter(routes);
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders the footer with copyright information', () => {
    const routes: RouteObject[] = [
      {
        path: '/',
        element: (
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        ),
      },
    ];

    const router = createTestRouter(routes);
    render(<RouterProvider router={router} />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} MeTTaCycle Block Explorer. All rights reserved.`))).toBeInTheDocument();
  });
});