import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Card Title">Card Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('applies hoverable styles when isHoverable is true', () => {
    const { container } = render(<Card isHoverable>Hoverable Card</Card>);
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('transition-all');
    expect(cardElement).toHaveClass('duration-300');
    expect(cardElement).toHaveClass('hover:shadow-lg');
    expect(cardElement).toHaveClass('hover:-translate-y-1');
  });

  it('applies gradient border styles when isGradientBorder is true', () => {
    const { container } = render(<Card isGradientBorder>Gradient Border Card</Card>);
    // When isGradientBorder is true, it should not have the regular border style class
    const cardElement = container.firstChild;
    expect(cardElement).not.toHaveClass('border-gray-200');
    expect(cardElement).not.toHaveClass('dark:border-gray-700');
  });

  it('applies the default styling when no special props are provided', () => {
    const { container } = render(<Card>Basic Card</Card>);
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('rounded-lg');
    expect(cardElement).toHaveClass('shadow-md');
    expect(cardElement).toHaveClass('overflow-hidden');
  });

  it('applies custom style prop correctly', () => {
    // Use a property that won't conflict with animation properties
    const customStyle = { margin: '15px', padding: '10px' };
    
    render(
      <Card style={customStyle} data-testid="styled-card">Styled Card</Card>
    );
    
    // Find the card by test ID
    const card = screen.getByTestId('styled-card');
    
    // Check the style string directly since toHaveStyle is problematic with React props
    const styleAttr = card.getAttribute('style');
    expect(styleAttr).toContain('margin: 15px');
    expect(styleAttr).toContain('padding: 10px');
  });

  it('renders nested components properly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card Description</p>
        <button>Card Button</button>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Button')).toBeInTheDocument();
  });
});