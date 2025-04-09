import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SankeyDiagram from '../SankeyDiagram';
import { mockSankeyNodes, mockSankeyLinks, mockSankeyOptions } from '../../test/mocks';

// Mock React useEffect to avoid D3 rendering
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: vi.fn()
  };
});

// Mock D3 to avoid actual rendering
vi.mock('d3', () => ({}));
vi.mock('d3-sankey', () => ({}));

describe('SankeyDiagram', () => {
  it('renders container elements', () => {
    const { container } = render(
      <SankeyDiagram
        nodes={mockSankeyNodes}
        links={mockSankeyLinks}
        options={mockSankeyOptions}
      />
    );
    
    // Check that div and svg container elements exist
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});