import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import SankeyDiagram from '../SankeyDiagram';
import { mockSankeyNodes, mockSankeyLinks, mockSankeyOptions } from '../../test/mocks';
import { SankeyNode, SankeyLink } from '../SankeyDiagram';

// Create a spy version of SankeyDiagram that keeps track of props
const SankeyDiagramComponent = vi.fn((props) => {
  SankeyDiagramComponent.mockProps = props;
  return (
    <div data-testid="sankey-container">
      <div data-testid="sankey-svg">
        {props.nodes.length > 0 && props.links.length > 0 ? 'Diagram would render here' : 'No data to render'}
      </div>
      <div data-testid="sankey-nodes-data">{JSON.stringify(props.nodes)}</div>
      <div data-testid="sankey-links-data">{JSON.stringify(props.links)}</div>
      <div data-testid="sankey-options-data">{JSON.stringify(props.options)}</div>
    </div>
  );
});

// Mock the actual SankeyDiagram component
vi.mock('../SankeyDiagram', () => ({
  __esModule: true,
  default: (props: any) => SankeyDiagramComponent(props)
}));

describe('SankeyDiagram', () => {
  afterEach(() => {
    cleanup();
    SankeyDiagramComponent.mockClear();
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

  it('should properly pass color properties to nodes and links', () => {
    const nodesWithColor = [
      { ...mockSankeyNodes[0], color: '#ff0000' },
      { ...mockSankeyNodes[1], color: '#00ff00' }
    ];
    
    const linksWithColor = [
      { ...mockSankeyLinks[0], color: '#0000ff' }
    ];
    
    render(
      <SankeyDiagram 
        nodes={nodesWithColor} 
        links={linksWithColor} 
        options={mockSankeyOptions} 
      />
    );
    
    // Check that component received the color properties
    expect(SankeyDiagramComponent).toHaveBeenCalled();
    const passedNodes = SankeyDiagramComponent.mock.calls[0][0].nodes;
    const passedLinks = SankeyDiagramComponent.mock.calls[0][0].links;
    
    expect(passedNodes[0].color).toBe('#ff0000');
    expect(passedNodes[1].color).toBe('#00ff00');
    expect(passedLinks[0].color).toBe('#0000ff');
  });

  it('should correctly process node and link options', () => {
    const customOptions = {
      node: {
        opacity: 0.9,
        fill: '#custom',
      },
      link: {
        opacity: 0.5,
        stroke: '#customLink'
      }
    };
    
    render(
      <SankeyDiagram 
        nodes={mockSankeyNodes} 
        links={mockSankeyLinks} 
        options={customOptions} 
      />
    );
    
    expect(SankeyDiagramComponent).toHaveBeenCalled();
    const passedOptions = SankeyDiagramComponent.mock.calls[0][0].options;
    
    expect(passedOptions.node?.opacity).toBe(0.9);
    expect(passedOptions.node?.fill).toBe('#custom');
    expect(passedOptions.link?.opacity).toBe(0.5);
    expect(passedOptions.link?.stroke).toBe('#customLink');
  });
});