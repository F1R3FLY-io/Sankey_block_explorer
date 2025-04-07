import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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

describe('MainLayout', () => {
  it('renders the header with logo and title', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    // Check for the logo
    const logo = screen.getByAltText('MeTTaCycle Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('logo');
    
    // Check for the title
    expect(screen.getByText('MeTTaCycle Block Explorer')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('search-input');
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    expect(screen.getByText('Blocks')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });

  it('highlights the active link based on location', () => {
    // The home path '/' should be active in our mocked location
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    const explorerLink = screen.getByText('Explorer');
    expect(explorerLink).toHaveStyle({
      backgroundColor: 'rgb(0, 102, 215)'
    });
    
    // Other links should not be highlighted
    const blocksLink = screen.getByText('Blocks');
    expect(blocksLink).not.toHaveStyle({
      backgroundColor: 'rgb(0, 102, 215)'
    });
  });

  it('renders children content', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="test-content">Child Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders the footer with copyright information', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} MeTTaCycle Block Explorer. All rights reserved.`))).toBeInTheDocument();
  });
});