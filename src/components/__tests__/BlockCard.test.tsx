import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlockCard from '../BlockCard';
import { SankeyNode, SankeyLink } from '../SankeyDiagram';
import { mockBlock, mockDeploys } from '../../test/mocks';

// Mock the SankeyDiagram component
vi.mock('../SankeyDiagram', () => ({
  default: ({ nodes, links }: { nodes: SankeyNode[]; links: SankeyLink[] }) => (
    <div data-testid="sankey-diagram">
      <div data-testid="sankey-nodes">{JSON.stringify(nodes)}</div>
      <div data-testid="sankey-links">{JSON.stringify(links)}</div>
    </div>
  )
}));

// Mock the HelpButton component
vi.mock('../HelpButton', () => ({
  default: () => <div data-testid="help-button">Help Button</div>
}));

describe('BlockCard', () => {
  const defaultProps = {
    block: mockBlock,
    deploys: mockDeploys,
    currentBlock: 2,
    totalBlocks: 5,
    onNavigate: vi.fn()
  };

  it('should render the block information correctly', () => {
    render(<BlockCard {...defaultProps} />);
    
    expect(screen.getByText(`Block #${defaultProps.currentBlock}`)).toBeInTheDocument();
    expect(screen.getByText(mockBlock.blockHash)).toBeInTheDocument();
    expect(screen.getByText(`Block ${defaultProps.currentBlock} of ${defaultProps.totalBlocks}`)).toBeInTheDocument();
  });

  it('should calculate and display statistics correctly', () => {
    render(<BlockCard {...defaultProps} />);
    
    // Check agents count
    const uniqueDeployers = new Set(mockDeploys.map(d => d.deployer)).size;
    expect(screen.getByText(String(uniqueDeployers))).toBeInTheDocument();
    
    // Check total cost
    const totalCost = mockDeploys.reduce((sum, d) => sum + d.cost, 0);
    expect(screen.getByText(String(totalCost))).toBeInTheDocument();
    
    // Check total phlo
    const totalPhlo = mockDeploys.reduce((sum, d) => sum + d.phloLimit, 0);
    expect(screen.getByText(String(totalPhlo))).toBeInTheDocument();
    
    // Check deploy count (using the closest label to disambiguate)
    const deployCount = screen.getAllByText(String(mockDeploys.length))[0];
    expect(deployCount.nextElementSibling).toHaveTextContent('Deploys');
  });

  it('should call onNavigate with correct params when navigation buttons are clicked', () => {
    render(<BlockCard {...defaultProps} />);
    
    // Test first button
    fireEvent.click(screen.getByTitle('First block'));
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('first');
    
    // Test previous button
    fireEvent.click(screen.getByTitle('Previous block'));
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('prev');
    
    // Test next button
    fireEvent.click(screen.getByTitle('Next block'));
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('next');
    
    // Test last button
    fireEvent.click(screen.getByTitle('Last block'));
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('last');
  });

  it('should prepare correct data for Sankey diagram', () => {
    render(<BlockCard {...defaultProps} />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Verify nodes structure
    expect(nodes).toHaveLength(3); // 2 deployers + 1 block
    expect(nodes.find((n: SankeyNode) => n.id === mockBlock.blockHash)).toBeDefined();
    expect(nodes.find((n: SankeyNode) => n.id === 'deployer1')).toBeDefined();
    expect(nodes.find((n: SankeyNode) => n.id === 'deployer2')).toBeDefined();
    
    // Verify links structure
    expect(links).toHaveLength(2); // One link for each unique deployer
    
    // Check links from deployer1
    const deployer1Link = links.find((l: SankeyLink) => 
      typeof l.source === 'string' ? l.source === 'deployer1' : 
      typeof l.source === 'number' ? false : 
      l.source.id === 'deployer1'
    );
    expect(deployer1Link).toBeDefined();
    expect(deployer1Link?.target).toBe(mockBlock.blockHash);
    
    // Calculate expected value for deployer1 (sum of costs)
    const deployer1Costs = mockDeploys
      .filter(d => d.deployer === 'deployer1')
      .reduce((sum, d) => sum + d.cost, 0);
    expect(deployer1Link?.value).toBe(deployer1Costs);
    
    // Check links from deployer2
    const deployer2Link = links.find((l: SankeyLink) => 
      typeof l.source === 'string' ? l.source === 'deployer2' : 
      typeof l.source === 'number' ? false : 
      l.source.id === 'deployer2'
    );
    expect(deployer2Link).toBeDefined();
    expect(deployer2Link?.target).toBe(mockBlock.blockHash);
    
    // Calculate expected value for deployer2 (sum of costs)
    const deployer2Costs = mockDeploys
      .filter(d => d.deployer === 'deployer2')
      .reduce((sum, d) => sum + d.cost, 0);
    expect(deployer2Link?.value).toBe(deployer2Costs);
  });
});