import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlocksList from '../BlocksList';
import { mockBlock, mockDeploys } from '../../test/mocks';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ 
    state: null,
    pathname: '/blocks',
    search: '',
    hash: '',
    key: 'default'
  })
}));

describe('BlocksList', () => {
  const mockBlockWithDeploys = {
    blockInfo: mockBlock,
    deploys: mockDeploys
  };
  
  const mockBlockWithDeploys2 = {
    blockInfo: { ...mockBlock, blockHash: 'hash2', blockNumber: 2 },
    deploys: mockDeploys
  };
  
  const mockCategories = {
    sources: [mockBlockWithDeploys],
    sinks: [mockBlockWithDeploys2],
    sourceSinks: []
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state correctly', () => {
    render(
      <BlocksList 
        blocks={[]} 
        categories={mockCategories}
        loading={true} 
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('renders empty state when no blocks available', () => {
    render(
      <BlocksList 
        blocks={[]} 
        categories={mockCategories}
        loading={false} 
      />
    );
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
  
  it('renders blocks list correctly', () => {
    const blocks = [mockBlockWithDeploys, mockBlockWithDeploys2];
    
    render(
      <BlocksList 
        blocks={blocks} 
        categories={mockCategories}
        loading={false} 
      />
    );
    
    // Check that table headers are displayed
    expect(screen.getByText('Block #')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Deploys')).toBeInTheDocument();
    expect(screen.getByText('Total cost')).toBeInTheDocument();
    expect(screen.getByText('Total Phlo')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    
    // Check that block information is displayed
    expect(screen.getByText('#0')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Sink')).toBeInTheDocument();
    
    // Check pagination
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });
  
  it('handles navigation back to explorer', () => {
    const blocks = [mockBlockWithDeploys, mockBlockWithDeploys2];
    
    render(
      <BlocksList 
        blocks={blocks} 
        categories={mockCategories}
        loading={false} 
      />
    );
    
    fireEvent.click(screen.getByText('← Back to Explorer'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/', {
      state: {
        currentBlockIndex: 0,
        blocks,
        categories: mockCategories
      }
    });
  });
  
  it('calculates total cost and phlo correctly', () => {
    // Create custom deploys with known cost and phlo values
    const customDeploys = [
      { ...mockDeploys[0], cost: 100, phloLimit: 200 },
      { ...mockDeploys[1], cost: 150, phloLimit: 300 },
    ];
    
    const customBlock = {
      blockInfo: mockBlock,
      deploys: customDeploys
    };
    
    const blocks = [customBlock];
    
    render(
      <BlocksList 
        blocks={blocks} 
        categories={{
          sources: [customBlock],
          sinks: [],
          sourceSinks: []
        }}
        loading={false} 
      />
    );
    
    // Total cost should be 250 (100 + 150)
    expect(screen.getByText('250')).toBeInTheDocument();
    
    // Total phlo should be 500 (200 + 300)
    expect(screen.getByText('500')).toBeInTheDocument();
  });
  
  it('handles pagination correctly', () => {
    // Create 15 blocks (to span multiple pages with itemsPerPage=10)
    const blocks = Array.from({ length: 15 }, (_, i) => ({
      blockInfo: { ...mockBlock, blockHash: `hash${i}`, blockNumber: i },
      deploys: mockDeploys
    }));
    
    const categories = {
      sources: blocks.slice(0, 5),
      sinks: blocks.slice(5, 10),
      sourceSinks: blocks.slice(10)
    };
    
    render(
      <BlocksList 
        blocks={blocks} 
        categories={categories}
        loading={false} 
      />
    );
    
    // Should start at page 1
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    
    // Go to next page
    fireEvent.click(screen.getByText('›'));
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    
    // Go back to first page
    fireEvent.click(screen.getByText('«'));
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    
    // Go to last page
    fireEvent.click(screen.getByText('»'));
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    
    // Go to previous page
    fireEvent.click(screen.getByText('‹'));
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });
});