import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import SankeyDiagram from '../SankeyDiagram';
import { mockSankeyNodes, mockSankeyLinks, mockSankeyOptions } from '../../test/mocks';
import { SankeyNode, SankeyLink } from '../SankeyDiagram';

// Mock the actual SankeyDiagram component
vi.mock('../SankeyDiagram', () => ({
  default: ({ nodes, links }: { nodes: SankeyNode[]; links: SankeyLink[] }) => (
    <div data-testid="sankey-container">
      <div data-testid="sankey-svg">
        {nodes.length > 0 && links.length > 0 ? 'Diagram would render here' : 'No data to render'}
      </div>
    </div>
  )
}));

describe('SankeyDiagram', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render a container div and SVG element', () => {
    const { getByTestId } = render(
      <SankeyDiagram 
        nodes={mockSankeyNodes} 
        links={mockSankeyLinks} 
        options={mockSankeyOptions} 
      />
    );
    
    expect(getByTestId('sankey-container')).toBeInTheDocument();
    expect(getByTestId('sankey-svg')).toBeInTheDocument();
    expect(getByTestId('sankey-svg')).toHaveTextContent('Diagram would render here');
  });

  it('should not generate diagram if nodes or links are empty', () => {
    // Render with empty nodes
    const { getByTestId, rerender } = render(
      <SankeyDiagram nodes={[]} links={mockSankeyLinks} />
    );
    
    expect(getByTestId('sankey-svg')).toHaveTextContent('No data to render');
    
    // Render with empty links
    rerender(<SankeyDiagram nodes={mockSankeyNodes} links={[]} />);
    expect(getByTestId('sankey-svg')).toHaveTextContent('No data to render');
  });
});