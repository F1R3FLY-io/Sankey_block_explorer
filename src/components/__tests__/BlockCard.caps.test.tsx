import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlockCard from '../BlockCard';
import { SankeyNode, SankeyLink } from '../visualizations/SankeyTypes';
import { 
  mockBlock, 
  mockDeploys,
  mockDeploysWithPattern
} from '../../test/mocks';

// Mock the capsUtils module
vi.mock('../../utils/capsUtils', () => ({
  isCapsMode: vi.fn().mockReturnValue(true),
  getTokenName: vi.fn().mockReturnValue('CAPS'),
  formatTooltipDetails: vi.fn((details) => 
    details.replace(/Phlo/g, 'CAPS').replace(/phlo/g, 'CAPS')
  )
}));

// Mock the SankeyDiagram component
vi.mock('../visualizations/SankeyDiagram', () => {
  return {
    __esModule: true,
    default: ({ nodes, links, options }: { nodes: SankeyNode[]; links: SankeyLink[]; options?: Record<string, unknown> }) => (
      <div data-testid="sankey-diagram">
        <div data-testid="sankey-nodes">{JSON.stringify(nodes)}</div>
        <div data-testid="sankey-links">{JSON.stringify(links)}</div>
        <div data-testid="sankey-options">{JSON.stringify(options)}</div>
      </div>
    )
  };
});

// Mock the HelpButton component
vi.mock('../HelpButton', () => ({
  default: () => <div data-testid="help-button">Help Button</div>
}));

describe('BlockCard in CAPS mode', () => {
  const defaultProps = {
    block: mockBlock,
    deploys: mockDeploys,
    currentBlock: 2,
    totalBlocks: 5,
    onNavigate: vi.fn()
  };

  // Store original global variable if it exists
  let originalCapsMode: any;

  beforeEach(() => {
    // Store the original value if it exists
    if (typeof (global as any).__CAPS_MODE__ !== 'undefined') {
      originalCapsMode = (global as any).__CAPS_MODE__;
    }
    // Set the global variable to true to simulate CAPS mode
    (global as any).__CAPS_MODE__ = true;
  });

  afterEach(() => {
    // Reset the global variable after each test
    if (typeof originalCapsMode !== 'undefined') {
      (global as any).__CAPS_MODE__ = originalCapsMode;
    } else {
      delete (global as any).__CAPS_MODE__;
    }
  });

  it('should render labels with CAPS instead of Phlo', () => {
    render(<BlockCard {...defaultProps} />);
    
    // Check that the label shows CAPS instead of Phlo
    expect(screen.getByText('Total CAPS')).toBeInTheDocument();
    
    // Should not show "Total Phlo"
    const phloLabel = screen.queryByText('Total Phlo');
    expect(phloLabel).not.toBeInTheDocument();
  });

  it('should include CAPS in tooltip details instead of Phlo', () => {
    render(<BlockCard {...defaultProps} />);
    
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse links data
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Links should exist
    expect(links.length).toBeGreaterThan(0);
    
    // At least one link should have CAPS in its details
    const linksWithCaps = links.filter((l: SankeyLink) => 
      l.details && l.details.includes('CAPS'));
    
    expect(linksWithCaps.length).toBeGreaterThan(0);
    
    // No links should have Phlo in their details
    const linksWithPhlo = links.filter((l: SankeyLink) => 
      l.details && l.details.includes('Phlo'));
    
    expect(linksWithPhlo.length).toBe(0);
  });

  it('should render standard blocks in CAPS mode correctly', () => {
    render(<BlockCard {...defaultProps} />);
    
    // Verify standard UI elements with CAPS instead of Phlo
    expect(screen.getByText(`Block #${defaultProps.currentBlock}`)).toBeInTheDocument();
    expect(screen.getByText(mockBlock.blockHash)).toBeInTheDocument();
    
    // Check for CAPS token name label 
    expect(screen.getByText('Total CAPS')).toBeInTheDocument();
    
    // Verify transaction labels  
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Deploys')).toBeInTheDocument();
    expect(screen.getByText('Agents involved')).toBeInTheDocument();
  });

  it('should handle token transfers correctly in CAPS mode', () => {
    // Use deploys with transfer patterns
    render(<BlockCard {...{
      ...defaultProps,
      deploys: mockDeploysWithPattern
    }} />);
    
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse links data
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Verify that transfer links use CAPS in details
    const transferLinks = links.filter((l: SankeyLink) => 
      l.details && l.details.includes('From:') && l.details.includes('To:'));
    
    expect(transferLinks.length).toBeGreaterThan(0);
    
    // All transfer links should have CAPS instead of Phlo
    for (const link of transferLinks) {
      expect(link.details).toContain('CAPS');
      expect(link.details).not.toContain('Phlo');
    }
  });
});