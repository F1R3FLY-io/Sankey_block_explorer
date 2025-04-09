import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlockCard from '../BlockCard';
import { SankeyNode, SankeyLink } from '../SankeyDiagram';
import { 
  mockBlock, 
  mockDeploys, 
  mockDeploysWithPattern,
  mockDeploysWithInternalConsumption,
  mockDeploysWithMixedPatterns,
  mockBlock650,
  mockBlock651
} from '../../test/mocks';
// import { siteConfig } from '../../siteMetadata'; // Using hardcoded colors from PDF spec

// Mock the SankeyDiagram component
vi.mock('../SankeyDiagram', () => ({
  default: ({ nodes, links, options }: { nodes: SankeyNode[]; links: SankeyLink[]; options?: Record<string, unknown> }) => (
    <div data-testid="sankey-diagram">
      <div data-testid="sankey-nodes">{JSON.stringify(nodes)}</div>
      <div data-testid="sankey-links">{JSON.stringify(links)}</div>
      <div data-testid="sankey-options">{JSON.stringify(options)}</div>
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
    expect(screen.getByText(`Block ${defaultProps.currentBlock} of ${defaultProps.totalBlocks - 1}`)).toBeInTheDocument();
  });

  it('should calculate and display statistics correctly', () => {
    render(<BlockCard {...defaultProps} hasInternalConsumption={false} />);
    
    // Check agents count
    const uniqueDeployers = new Set(mockDeploys.map(d => d.deployer)).size;
    expect(screen.getByText(String(uniqueDeployers))).toBeInTheDocument();
    
    // Check total cost
    const totalCost = mockDeploys.reduce((sum, d) => sum + d.cost, 0);
    const totalCostElement = screen.getByText(String(totalCost));
    expect(totalCostElement).toBeInTheDocument();
    expect(totalCostElement.nextElementSibling?.textContent).toBe('Total cost');
    
    // Check total phlo
    const totalPhlo = mockDeploys.reduce((sum, d) => sum + d.phloLimit, 0);
    expect(screen.getByText(String(totalPhlo))).toBeInTheDocument();
    
    // Check deploy count (using the closest label to disambiguate)
    const deployCount = screen.getAllByText(String(mockDeploys.length))[0];
    expect(deployCount.nextElementSibling).toHaveTextContent('Deploys');
    
    // Check that Internal Phlo label is not present when hasInternalConsumption is false
    const internalPhloLabels = screen.queryAllByText('Internal Phlo');
    expect(internalPhloLabels.length).toBe(0);
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

  it('should prepare correct data for Sankey diagram with regular deploys', () => {
    // Explicitly set hasInternalConsumption to false for the test
    render(<BlockCard {...defaultProps} hasInternalConsumption={false} />);
    
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
    
    // Verify links structure - no internal consumption links
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
    
    // Make sure there are no internal consumption links
    const internalLinks = links.filter((l: SankeyLink) => l.isInternalConsumption);
    expect(internalLinks.length).toBe(0);
    
    // Verify that color properties are present
    nodes.forEach((node: SankeyNode) => {
      expect(node.color).toBeDefined();
    });
    
    links.forEach((link: SankeyLink) => {
      expect(link.color).toBeDefined();
    });
  });
  
  it('should handle block #0 correctly', () => {
    render(<BlockCard {...defaultProps} currentBlock={0} hasInternalConsumption={false} />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Even for block #0, with the fixed implementation, we expect the same structure
    expect(nodes.length).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);
    
    // Verify that nodes have color properties
    nodes.forEach((node: SankeyNode) => {
      expect(node.color).toBeDefined();
    });
  });
  
  it('should correctly handle deploys with transfer patterns', () => {
    render(<BlockCard {...{
      ...defaultProps,
      deploys: mockDeploysWithPattern,
      hasInternalConsumption: false
    }} />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // With pattern matching deploys, we expect to see the addresses extracted
    // Test for address nodes
    const addr1Node = nodes.find((n: SankeyNode) => n.id === 'addr1');
    const addr2Node = nodes.find((n: SankeyNode) => n.id === 'addr2');
    const addr3Node = nodes.find((n: SankeyNode) => n.id === 'addr3');
    const addr4Node = nodes.find((n: SankeyNode) => n.id === 'addr4');
    
    expect(addr1Node).toBeDefined();
    expect(addr2Node).toBeDefined();
    expect(addr3Node).toBeDefined();
    expect(addr4Node).toBeDefined();
    
    // Check for expected pattern of links
    const addr1ToAddr2Link = links.find((l: SankeyLink) => 
      (typeof l.source === 'string' && l.source === 'addr1' && 
       typeof l.target === 'string' && l.target === 'addr2')
    );
    expect(addr1ToAddr2Link).toBeDefined();
    expect(addr1ToAddr2Link?.value).toBe(1000);
    
    const addr1ToAddr3Link = links.find((l: SankeyLink) => 
      (typeof l.source === 'string' && l.source === 'addr1' && 
       typeof l.target === 'string' && l.target === 'addr3')
    );
    expect(addr1ToAddr3Link).toBeDefined();
    expect(addr1ToAddr3Link?.value).toBe(1500);
    
    const addr4ToAddr2Link = links.find((l: SankeyLink) => 
      (typeof l.source === 'string' && l.source === 'addr4' && 
       typeof l.target === 'string' && l.target === 'addr2')
    );
    expect(addr4ToAddr2Link).toBeDefined();
    expect(addr4ToAddr2Link?.value).toBe(800);
    
    // Verify that color properties are present
    nodes.forEach((node: SankeyNode) => {
      expect(node.color).toBeDefined();
    });
    
    links.forEach((link: SankeyLink) => {
      expect(link.color).toBeDefined();
    });
  });
  
  it('should pass appropriate options to SankeyDiagram', () => {
    render(<BlockCard {...defaultProps} hasInternalConsumption={false} />);
    
    const sankeyOptions = screen.getByTestId('sankey-options');
    const options = JSON.parse(sankeyOptions.textContent || '{}');
    
    // Check that node opacity is set to 1
    expect(options.node?.opacity).toBe(1);
    
    // Check that link opacity is set to 0.2
    expect(options.link?.opacity).toBe(0.2);
  });
  
  it('should handle internal Phlo consumption correctly', () => {
    // Use the internal consumption specific mocks
    render(<BlockCard 
      block={mockBlock650} 
      deploys={mockDeploysWithInternalConsumption}
      currentBlock={650}
      totalBlocks={700}
      onNavigate={vi.fn()}
      hasInternalConsumption={true}
    />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Verify block node has phloConsumed property
    const blockNode = nodes.find((n: SankeyNode) => n.id === mockBlock650.blockHash);
    expect(blockNode).toBeDefined();
    expect(blockNode.phloConsumed).toBeDefined();
    
    // Verify presence of internal consumption link
    const internalLinks = links.filter((l: SankeyLink) => l.isInternalConsumption === true);
    expect(internalLinks.length).toBe(1);
    
    const internalLink = internalLinks[0];
    expect(internalLink.source).toBe(mockBlock650.blockHash);
    expect(internalLink.target).toBe(mockBlock650.blockHash);
    expect(internalLink.value).toBe(2400); // Total internal consumption from both deploys
    
    // Verify Internal Phlo stat is shown
    const internalPhloLabel = screen.getByText('Internal Phlo');
    expect(internalPhloLabel).toBeInTheDocument();
    
    // Verify internal Phlo consumption value
    const totalInternalPhlo = mockDeploysWithInternalConsumption.reduce((sum, d) => sum + d.cost, 0);
    
    // Use getAllByText to handle multiple instances and then find the one next to "Internal Phlo"
    const internalPhloValues = screen.getAllByText(String(totalInternalPhlo));
    const internalPhloValue = Array.from(internalPhloValues)
      .find(element => element.nextElementSibling?.textContent === 'Internal Phlo');
      
    expect(internalPhloValue).toBeDefined();
    expect(internalPhloValue?.nextElementSibling?.textContent).toBe('Internal Phlo');
  });
  
  it('should always render standard blocks correctly regardless of internal consumption data', () => {
    // This test validates that standard blocks with currentBlock < 100
    // always render correctly even if they have deployments that would
    // otherwise be detected as internal consumption
    render(<BlockCard
      block={mockBlock}
      // Use deploys that would normally trigger internal consumption detection
      deploys={mockDeploysWithInternalConsumption} 
      currentBlock={2} // Standard block < 100
      totalBlocks={5}
      onNavigate={vi.fn()}
      // Explicitly not setting hasInternalConsumption to test auto-detection
    />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Standard blocks should never have internal consumption links
    const internalLinks = links.filter((l: SankeyLink) => l.isInternalConsumption === true);
    expect(internalLinks.length).toBe(0);
    
    // Verify block node exists and doesn't have phloConsumed property
    const blockNode = nodes.find((n: SankeyNode) => n.id === mockBlock.blockHash);
    expect(blockNode).toBeDefined();
    
    // Verify standard block structure with deployers
    const deployerNodes = nodes.filter((n: SankeyNode) => 
      n.id === 'deployer1' || n.id === 'deployer2'
    );
    expect(deployerNodes.length).toBe(2);
    
    // Verify that links connect deployers to the block
    const deployerLinks = links.filter((l: SankeyLink) => 
      (typeof l.source === 'string' && 
       (l.source === 'deployer1' || l.source === 'deployer2'))
    );
    expect(deployerLinks.length).toBe(2);
    
    // Verify Internal Phlo label is NOT shown for standard blocks
    const internalPhloLabels = screen.queryAllByText('Internal Phlo');
    expect(internalPhloLabels.length).toBe(0);
  });
  
  it('should verify Block #650 internal Phlo consumption implementation', () => {
    // This test verifies the specific implementation of Block #650
    // with the examples shown in the specs from ExplorerDesign5pg.pdf
    render(<BlockCard 
      block={mockBlock650} 
      deploys={mockDeploysWithInternalConsumption}
      currentBlock={650}
      totalBlocks={700}
      onNavigate={vi.fn()}
      // Not setting hasInternalConsumption explicitly, relying on auto-detection
    />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Verify the exact PDF spec requirements:
    
    // 1. Block node should have a special orange/warning color from spec
    const blockNode = nodes.find((n: SankeyNode) => n.id === mockBlock650.blockHash);
    expect(blockNode?.color).toBe('#ffa500'); // Exact PDF spec requirement
    
    // 2. The internal consumption link should be dashed (this is tested in SankeyDiagram)
    const internalLinks = links.filter((l: SankeyLink) => l.isInternalConsumption === true);
    expect(internalLinks.length).toBe(1);
    
    // 3. The internal link should have the warning color
    const internalLink = internalLinks[0];
    expect(internalLink.color).toBe('#ffa500'); // Exact PDF spec requirement
    
    // 4. The internal link should have detailed information as per PDF spec example
    expect(internalLink.details).toBe('2400 Phlo consumed internally by Rholang code execution'); // Exact format from the PDF spec
    
    // 5. The BlockCard should show the Internal Phlo stat with custom styling
    const internalPhloLabel = screen.getByText('Internal Phlo');
    expect(internalPhloLabel).toBeInTheDocument();
    
    // 6. The value should match the exact wording from the PDF spec example
    const totalInternalPhlo = mockDeploysWithInternalConsumption.reduce((sum, d) => sum + d.cost, 0);
    expect(totalInternalPhlo).toBe(2400); // Must match example in PDF
    
    // 7. Block should show "Internal Phlo" statistics with the correct value
    const internalPhloValues = screen.getAllByText('2400');
    const internalPhloValue = Array.from(internalPhloValues)
      .find(element => element.nextElementSibling?.textContent === 'Internal Phlo');
    expect(internalPhloValue).toBeDefined();
  });
  
  it('should verify Block #651 mixed consumption implementation', () => {
    // This test verifies the specific implementation of Block #651 
    // with both internal consumption and external transfers as per ExplorerDesign5pg.pdf
    render(<BlockCard 
      block={mockBlock651} 
      deploys={mockDeploysWithMixedPatterns}
      currentBlock={651}
      totalBlocks={700}
      onNavigate={vi.fn()}
      // Not setting hasInternalConsumption explicitly, relying on auto-detection
    />);
    
    const sankeyNodes = screen.getByTestId('sankey-nodes');
    const sankeyLinks = screen.getByTestId('sankey-links');
    
    // Parse nodes and links data
    const nodes = JSON.parse(sankeyNodes.textContent || '[]');
    const links = JSON.parse(sankeyLinks.textContent || '[]');
    
    // Verify exact PDF spec requirements for mixed consumption:
    
    // 1. Should have exactly 3 nodes as shown in PDF example: Block, addr1, addr3
    expect(nodes.length).toBe(3);
    
    // 2. Should have exactly the addresses shown in PDF example
    const addr1Node = nodes.find((n: SankeyNode) => n.id === 'addr1');
    const addr3Node = nodes.find((n: SankeyNode) => n.id === 'addr3');
    expect(addr1Node).toBeDefined();
    expect(addr3Node).toBeDefined();
    
    // 3. Should have exactly 2 links as shown in the PDF example: 1 external transfer, 1 internal consumption
    expect(links.length).toBe(2);
    
    // 4. Should have the external transfer link with exact value from PDF example
    const externalLinks = links.filter((l: SankeyLink) => 
      !l.isInternalConsumption && 
      (typeof l.source === 'string' && l.source === 'addr1' && 
       typeof l.target === 'string' && l.target === 'addr3')
    );
    expect(externalLinks.length).toBe(1);
    expect(externalLinks[0].value).toBe(1200); // PDF example value
    
    // 5. External link should have specific styling as per PDF
    expect(externalLinks[0].color).not.toBe('#ffa500'); // Not orange
    
    // 6. Should have one internal consumption self-reference link to the Block with exact PDF spec
    const internalLinks = links.filter((l: SankeyLink) => l.isInternalConsumption === true);
    expect(internalLinks.length).toBe(1);
    
    // 7. The internal link should be a self-reference on the block with exact value from PDF
    const internalLink = internalLinks[0];
    expect(internalLink.source).toBe(mockBlock651.blockHash);
    expect(internalLink.target).toBe(mockBlock651.blockHash);
    expect(internalLink.value).toBe(800); // Exact value from PDF example
    
    // 8. The BlockCard should show exact transaction count as in the PDF example
    const transactionLabel = screen.getByText('Transactions');
    expect(transactionLabel).toBeInTheDocument();
    
    // 9. Check exact Phlo values as per PDF example
    const internalPhloValue = screen.getByText('800');
    expect(internalPhloValue).toBeInTheDocument();
    
    // 10. Should have "1" transactions label for the single external transaction in the PDF example
    const transactionCount = Array.from(screen.getAllByText('1'))
      .find(element => element.nextElementSibling?.textContent === 'Transactions');
    expect(transactionCount).toBeDefined();
  });
});