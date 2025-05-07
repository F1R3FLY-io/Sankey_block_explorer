import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Demo from '../Demo';

// Mock DemoLayout
vi.mock('../../layouts/DemoLayout', () => ({
  default: ({ sections }: { sections: Array<{ id: string, title: string, component: React.ReactNode }> }) => (
    <div data-testid="demo-layout">
      {sections.map(section => (
        <div key={section.id} data-testid={`section-${section.id}`}>
          <h2>{section.title}</h2>
          {section.component}
        </div>
      ))}
    </div>
  )
}));

// Mock UI components
vi.mock('../../components/ui/Button', () => ({
  default: ({ children }: { children: React.ReactNode }) => <button data-testid="ui-button">{children}</button>
}));

vi.mock('../../components/ui/Card', () => ({
  default: ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div data-testid="ui-card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}));

vi.mock('../../components/ui/Typography', () => ({
  default: ({ children, variant }: { children: React.ReactNode, variant?: string }) => (
    <div data-testid="ui-typography" data-variant={variant || 'body'}>{children}</div>
  )
}));

// Mock BlockCard component
import { Block, Deploy } from '../../services/blockService';

vi.mock('../../components/BlockCard', () => ({
  default: ({ 
    block, 
    deploys, 
    currentBlock, 
    totalBlocks,
    hasInternalConsumption
  }: { 
    block: Block; 
    deploys: Deploy[]; 
    currentBlock: number; 
    totalBlocks: number;
    onNavigate: (direction: string) => void;
    hasInternalConsumption?: boolean;
  }) => (
    <div data-testid="block-card">
      <div>Block Hash: {block.blockHash}</div>
      <div>Current Block: {currentBlock}</div>
      <div>Total Blocks: {totalBlocks}</div>
      <div>Deploys: {deploys.length}</div>
      {hasInternalConsumption && <div>Has Internal Consumption: {String(hasInternalConsumption)}</div>}
    </div>
  )
}));

// Mock SankeyDiagram component
type SankeyNode = { id: string; name: string; value?: number; color?: string };
type SankeyLink = { 
  source: string | number | SankeyNode; 
  target: string | number | SankeyNode;
  value: number;
  color?: string;
  details?: string;
};

vi.mock('../../components/SankeyDiagram', () => ({
  default: ({ nodes, links }: { nodes: SankeyNode[]; links: SankeyLink[] }) => (
    <div data-testid="sankey-diagram">
      <div>Nodes: {nodes.length}</div>
      <div>Links: {links.length}</div>
    </div>
  )
}));

describe('Demo', () => {
  it('renders DemoLayout with all required sections', () => {
    render(<Demo />);
    
    // Check if DemoLayout is rendered
    expect(screen.getByTestId('demo-layout')).toBeInTheDocument();
    
    // Check if all required sections are rendered
    expect(screen.getByTestId('section-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('section-typography')).toBeInTheDocument();
    expect(screen.getByTestId('section-blockcard')).toBeInTheDocument();
    expect(screen.getByTestId('section-sankeydiagram')).toBeInTheDocument();
    
    // Check section titles
    expect(screen.getByText('Buttons')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Block Card')).toBeInTheDocument();
    expect(screen.getByText('Sankey Diagram')).toBeInTheDocument();
  });

  it('renders Button examples in the Buttons section', () => {
    render(<Demo />);
    
    // Find all buttons in the Buttons section
    const buttonsSection = screen.getByTestId('section-buttons');
    const buttons = buttonsSection.querySelectorAll('[data-testid="ui-button"]');
    
    // Check if there are multiple button examples
    expect(buttons.length).toBeGreaterThan(5);
    
    // Check for specific button texts
    expect(screen.getByText('Primary Button')).toBeInTheDocument();
    expect(screen.getByText('Secondary Button')).toBeInTheDocument();
    expect(screen.getByText('Outline Button')).toBeInTheDocument();
    expect(screen.getByText('Ghost Button')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('renders Typography examples in the Typography section', () => {
    render(<Demo />);
    
    // Find all typography elements in the Typography section
    const typographySection = screen.getByTestId('section-typography');
    const typographyElements = typographySection.querySelectorAll('[data-testid="ui-typography"]');
    
    // Check if there are multiple typography examples
    expect(typographyElements.length).toBeGreaterThan(5);
    
    // Check for specific typography variants
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Heading 3')).toBeInTheDocument();
    expect(screen.getByText('Heading 4')).toBeInTheDocument();
    expect(screen.getByText(/Body text - This is regular paragraph text/)).toBeInTheDocument();
    expect(screen.getByText(/Small body text/)).toBeInTheDocument();
    expect(screen.getByText(/Caption text/)).toBeInTheDocument();
    expect(screen.getByText('Gradient Heading')).toBeInTheDocument();
  });
  
  it('renders BlockCard examples in the Block Card section', () => {
    render(<Demo />);
    
    // Find all BlockCard elements in the Block Card section
    const blockCardSection = screen.getByTestId('section-blockcard');
    const blockCardElements = blockCardSection.querySelectorAll('[data-testid="block-card"]');
    
    // Check if there are multiple BlockCard examples - now we have 5 with the two new internal consumption ones
    expect(blockCardElements.length).toBe(5);
    
    // Verify Block Card section content
    expect(screen.getByText('BlockCard - Standard View')).toBeInTheDocument();
    expect(screen.getByText('BlockCard - With Transfer Patterns')).toBeInTheDocument();
    // Check for the Block #650 internal consumption title with the new format
    expect(screen.getByText('Block #650 - Internal Phlo Consumption')).toBeInTheDocument();
    expect(screen.getByText('Block #651 - Sink Split Phlo')).toBeInTheDocument();
    expect(screen.getByText('BlockCard - First Block')).toBeInTheDocument();
  });

  it('renders SankeyDiagram examples in the Sankey Diagram section', () => {
    render(<Demo />);
    
    // Find all SankeyDiagram elements in the Sankey Diagram section
    const sankeySection = screen.getByTestId('section-sankeydiagram');
    const sankeyElements = sankeySection.querySelectorAll('[data-testid="sankey-diagram"]');
    
    // Check if there are multiple SankeyDiagram examples
    expect(sankeyElements.length).toBe(2);
    
    // Check for section header typography
    expect(screen.getByText('SankeyDiagram - Basic Example')).toBeInTheDocument();
    expect(screen.getByText('SankeyDiagram - Parallel Links')).toBeInTheDocument();
    
    // Check for nodes and links counts
    expect(screen.getAllByText('Nodes: 4').length).toBe(2);
    expect(screen.getAllByText('Links: 3').length).toBe(2);
  });
});