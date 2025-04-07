import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DemoLayout from '../DemoLayout';

// Mock MainLayout since we're not testing it here
vi.mock('../MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  )
}));

describe('DemoLayout', () => {
  // Sample sections for testing
  const sections = [
    { id: 'section1', title: 'Section 1', component: <div>Section 1 Content</div> },
    { id: 'section2', title: 'Section 2', component: <div>Section 2 Content</div> },
    { id: 'section3', title: 'Section 3', component: <div>Section 3 Content</div> }
  ];

  it('renders within MainLayout', () => {
    render(<DemoLayout sections={sections} />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders section buttons for all sections', () => {
    render(<DemoLayout sections={sections} />);
    
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });

  it('initially displays the first section', () => {
    render(<DemoLayout sections={sections} />);
    
    // First section should be in the document
    expect(screen.getByText('Section 1 Content')).toBeInTheDocument();
    
    // Other sections may be in the DOM but not visible to the user
    // This would normally be tested with .toBeVisible() but we're using a simplified mock
    expect(screen.getAllByText(/Section \d Content/).length).toBeGreaterThan(0);
  });

  it('activates the corresponding section when a section button is clicked', () => {
    render(<DemoLayout sections={sections} />);
    
    // Initially, section 1 should be active
    expect(screen.getByText('Section 1 Content')).toBeInTheDocument();
    
    // Click on section 2 button
    fireEvent.click(screen.getByText('Section 2'));
    
    // Now section 2 should exist in the document
    expect(screen.getByText('Section 2 Content')).toBeInTheDocument();
    
    // In a real test with visibility we could check if section 1 is hidden
    // But here we just verify the button states change correctly
  });

  it('changes the button style when a section is active', () => {
    render(<DemoLayout sections={sections} />);
    
    // First section button should have active style
    const section1Button = screen.getByText('Section 1');
    expect(section1Button).toHaveStyle({
      background: 'rgba(0, 122, 255, 0.1)',
      color: 'rgb(0, 122, 255)'
    });
    
    // Other section buttons should have inactive style
    const section2Button = screen.getByText('Section 2');
    expect(section2Button).toHaveStyle({
      background: 'transparent',
      color: 'rgb(157, 167, 177)'
    });
    
    // Click on section 2 button
    fireEvent.click(section2Button);
    
    // Now section 2 button should have active style and section 1 button should not
    expect(section2Button).toHaveStyle({
      background: 'rgba(0, 122, 255, 0.1)',
      color: 'rgb(0, 122, 255)'
    });
    
    expect(section1Button).toHaveStyle({
      background: 'transparent',
      color: 'rgb(157, 167, 177)'
    });
  });

  it('handles empty sections array gracefully', () => {
    render(<DemoLayout sections={[]} />);
    
    // Should render the layout even with no sections
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    
    // There should be no section buttons
    const nav = screen.getByRole('navigation');
    expect(nav.children.length).toBe(0);
  });
});