import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Typography from '../Typography';

describe('Typography', () => {
  it('renders children correctly', () => {
    render(<Typography>Text content</Typography>);
    expect(screen.getByText('Text content')).toBeInTheDocument();
  });

  it('renders with default body variant', () => {
    render(<Typography>Default Text</Typography>);
    const typographyElement = screen.getByText('Default Text');
    expect(typographyElement.tagName).toBe('P'); // Default variant is 'body', so it should be a <p> tag
    expect(typographyElement).toHaveClass('text-base');
  });

  it('renders correct heading elements based on variant', () => {
    const { rerender } = render(<Typography variant="h1">Heading 1</Typography>);
    expect(screen.getByText('Heading 1').tagName).toBe('H1');
    
    rerender(<Typography variant="h2">Heading 2</Typography>);
    expect(screen.getByText('Heading 2').tagName).toBe('H2');
    
    rerender(<Typography variant="h3">Heading 3</Typography>);
    expect(screen.getByText('Heading 3').tagName).toBe('H3');
    
    rerender(<Typography variant="h4">Heading 4</Typography>);
    expect(screen.getByText('Heading 4').tagName).toBe('H4');
  });

  it('renders paragraph element for body and body-sm variants', () => {
    const { rerender } = render(<Typography variant="body">Body text</Typography>);
    expect(screen.getByText('Body text').tagName).toBe('P');
    
    rerender(<Typography variant="body-sm">Small body text</Typography>);
    expect(screen.getByText('Small body text').tagName).toBe('P');
  });

  it('renders span element for caption variant', () => {
    render(<Typography variant="caption">Caption text</Typography>);
    expect(screen.getByText('Caption text').tagName).toBe('SPAN');
  });

  it('applies appropriate classes based on variant', () => {
    const { rerender } = render(<Typography variant="h1">Heading 1</Typography>);
    expect(screen.getByText('Heading 1')).toHaveClass('text-4xl');
    expect(screen.getByText('Heading 1')).toHaveClass('font-bold');
    
    rerender(<Typography variant="body-sm">Small body</Typography>);
    expect(screen.getByText('Small body')).toHaveClass('text-sm');
    
    rerender(<Typography variant="caption">Caption</Typography>);
    expect(screen.getByText('Caption')).toHaveClass('text-xs');
    expect(screen.getByText('Caption')).toHaveClass('text-gray-500');
  });

  it('applies additional className correctly', () => {
    render(<Typography className="extra-class">Text with extra class</Typography>);
    expect(screen.getByText('Text with extra class')).toHaveClass('extra-class');
  });

  it('applies gradient text styling when isGradient is true', () => {
    render(<Typography isGradient>Gradient text</Typography>);
    expect(screen.getByText('Gradient text')).toHaveClass('gradient-text');
    expect(screen.getByText('Gradient text')).toHaveClass('gradient-primary');
  });

  it('applies custom style prop correctly', () => {
    const customStyle = { color: 'blue', marginTop: '10px' };
    render(<Typography style={customStyle}>Styled text</Typography>);
    
    // Get the element and check that it has a style attribute
    const element = screen.getByText('Styled text');
    expect(element).toHaveAttribute('style');
    
    // Check for presence of style without being too strict on format
    const styleAttr = element.getAttribute('style') || '';
    expect(styleAttr).toContain('color');
    expect(styleAttr).toContain('margin');
  });
});