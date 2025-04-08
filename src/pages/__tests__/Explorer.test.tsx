import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Explorer from '../Explorer';
import { mockBlock, mockDeploys, mockDeploysWithPattern } from '../../test/mocks';
import { BlockWithDeploys } from '../../services/blockService';

// Mock the BlockCard component
import { Block, Deploy } from '../../services/blockService';

vi.mock('../../components/BlockCard.tsx', () => ({
  default: ({ 
    block, 
    deploys, 
    currentBlock, 
    totalBlocks
  }: { 
    block: Block; 
    deploys: Deploy[]; 
    currentBlock: number; 
    totalBlocks: number;
    onNavigate?: (direction: string) => void;  
  }) => (
    <div data-testid="block-card">
      <div data-testid="block-info">
        {JSON.stringify({ 
          blockHash: block.blockHash, 
          blockNumber: block.blockNumber,
          currentBlock,
          totalBlocks
        })}
      </div>
      <div data-testid="deploys-info">
        {JSON.stringify(deploys.map((d: Deploy) => ({ 
          deployer: d.deployer, 
          cost: d.cost 
        })))}
      </div>
    </div>
  )
}));

describe('Explorer', () => {
  const mockCategories = {
    sources: [{ blockInfo: { ...mockBlock, blockHash: 'source1' }, deploys: mockDeploys }],
    sinks: [{ blockInfo: { ...mockBlock, blockHash: 'sink1' }, deploys: mockDeploys }],
    sourceSinks: [{ blockInfo: { ...mockBlock, blockHash: 'sourcesink1' }, deploys: mockDeploys }]
  };

  const mockBlocks: BlockWithDeploys[] = [
    { blockInfo: mockBlock, deploys: mockDeploys },
    { 
      blockInfo: { ...mockBlock, blockHash: 'hash2', blockNumber: 20 }, 
      deploys: mockDeploysWithPattern 
    }
  ];

  it('should render loading state correctly', () => {
    render(
      <MemoryRouter>
        <Explorer 
          blocks={[]} 
          categories={mockCategories} 
          loading={true} 
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render empty state correctly', () => {
    render(
      <MemoryRouter>
        <Explorer 
          blocks={[]} 
          categories={mockCategories} 
          loading={false} 
        />
      </MemoryRouter>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should correctly pass data to BlockCard when blocks are available', () => {
    render(
      <MemoryRouter>
        <Explorer 
          blocks={mockBlocks} 
          categories={mockCategories} 
          loading={false} 
        />
      </MemoryRouter>
    );

    // Check that BlockCard is rendered
    expect(screen.getByTestId('block-card')).toBeInTheDocument();
    
    // Verify that the correct block data is being passed
    const blockInfo = JSON.parse(screen.getByTestId('block-info').textContent || '{}');
    expect(blockInfo.blockHash).toBe(mockBlock.blockHash);
    expect(blockInfo.blockNumber).toBe(mockBlock.blockNumber);
    expect(blockInfo.currentBlock).toBe(0); // 0-indexed
    expect(blockInfo.totalBlocks).toBe(mockBlocks.length);
    
    // Verify that the correct deploy data is being passed
    const deploysInfo = JSON.parse(screen.getByTestId('deploys-info').textContent || '[]');
    expect(deploysInfo.length).toBe(mockDeploys.length);
    expect(deploysInfo[0].deployer).toBe(mockDeploys[0].deployer);
  });

  it('should display the correct count of blocks and active agents', () => {
    render(
      <MemoryRouter>
        <Explorer 
          blocks={mockBlocks} 
          categories={mockCategories} 
          loading={false} 
        />
      </MemoryRouter>
    );

    // Check blocks count
    expect(screen.getByText(mockBlocks.length.toString())).toBeInTheDocument();
    expect(screen.getByText('Blocks')).toBeInTheDocument();
    
    // Check active agents count (sum of all categories)
    const totalAgents = 
      mockCategories.sources.length + 
      mockCategories.sinks.length + 
      mockCategories.sourceSinks.length - 1;
    expect(screen.getByText(totalAgents.toString())).toBeInTheDocument();
    expect(screen.getByText('Active agents')).toBeInTheDocument();
  });
});