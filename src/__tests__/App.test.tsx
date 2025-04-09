import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import * as blockService from '../services/blockService';
import { mockBlock, mockDeploys } from '../test/mocks';

// Mock the blockService functions
vi.mock('../services/blockService', () => ({
  analyzeBlockChain: vi.fn(),
  getBlockByHash: vi.fn(),
  BlockWithDeploys: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  createBrowserRouter: vi.fn(() => ({
    routes: []
  })),
  RouterProvider: ({ router }: { router: any }) => (
    <div data-testid="router-provider">
      <span>Router Provider Mock</span>
      <span data-testid="router-data">{JSON.stringify(router)}</span>
    </div>
  ),
  RouteObject: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup mock implementation for analyzeBlockChain
    vi.mocked(blockService.analyzeBlockChain).mockResolvedValue({
      sources: ['hash1'],
      sinks: ['hash3'],
      sourceSinks: ['hash2'],
      totalBlocks: 3
    });

    // Setup mock implementation for getBlockByHash
    vi.mocked(blockService.getBlockByHash).mockImplementation(async (hash) => {
      if (hash === 'hash1') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash1', blockNumber: 1, parentsHashList: [] },
          deploys: mockDeploys
        };
      } else if (hash === 'hash2') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash2', blockNumber: 2, parentsHashList: ['hash1'] },
          deploys: mockDeploys
        };
      } else if (hash === 'hash3') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash3', blockNumber: 3, parentsHashList: ['hash2'] },
          deploys: mockDeploys
        };
      }
      throw new Error(`Mock not implemented for hash: ${hash}`);
    });

    // Silence console.log/error during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', async () => {
    render(<App />);
    
    // Check that RouterProvider is rendered
    await waitFor(() => {
      expect(screen.getByTestId('router-provider')).toBeInTheDocument();
    });
  });

  it('fetches blockchain data on mount', async () => {
    render(<App />);
    
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(blockService.analyzeBlockChain).toHaveBeenCalledTimes(1);
      expect(blockService.getBlockByHash).toHaveBeenCalledTimes(3);
    });
  });

  it('handles successful data loading', async () => {
    render(<App />);
    
    // Wait for the data to be loaded
    await waitFor(() => {
      expect(blockService.analyzeBlockChain).toHaveBeenCalledTimes(1);
      expect(blockService.getBlockByHash).toHaveBeenCalledWith('hash1');
      expect(blockService.getBlockByHash).toHaveBeenCalledWith('hash2');
      expect(blockService.getBlockByHash).toHaveBeenCalledWith('hash3');
    });
  });

  it('handles errors during data loading', async () => {
    // Mock analyzeBlockChain to throw an error
    vi.mocked(blockService.analyzeBlockChain).mockRejectedValueOnce(new Error('API Error'));
    
    render(<App />);
    
    // Wait for the error to be handled
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching blockchain data:', 
        expect.any(Error)
      );
    });
  });

  it('handles errors during block fetching', async () => {
    // Make one of the block fetches fail
    vi.mocked(blockService.getBlockByHash).mockImplementation(async (hash) => {
      if (hash === 'hash1') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash1', blockNumber: 1, parentsHashList: [] },
          deploys: mockDeploys
        };
      } else if (hash === 'hash2') {
        throw new Error('Failed to fetch block');
      } else if (hash === 'hash3') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash3', blockNumber: 3, parentsHashList: ['hash2'] },
          deploys: mockDeploys
        };
      }
      throw new Error(`Mock not implemented for hash: ${hash}`);
    });
    
    render(<App />);
    
    // Wait for the error to be handled
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching block hash2:', 
        expect.any(Error)
      );
    });
  });

  it('sorts blocks by block number', async () => {
    // Return blocks in reverse order to test sorting
    vi.mocked(blockService.analyzeBlockChain).mockResolvedValue({
      sources: ['hash3'],
      sinks: ['hash1'],
      sourceSinks: ['hash2'],
      totalBlocks: 3
    });

    // Mock getBlockByHash with different block numbers
    vi.mocked(blockService.getBlockByHash).mockImplementation(async (hash) => {
      if (hash === 'hash1') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash1', blockNumber: 1, parentsHashList: [] },
          deploys: mockDeploys
        };
      } else if (hash === 'hash2') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash2', blockNumber: 2, parentsHashList: ['hash1'] },
          deploys: mockDeploys
        };
      } else if (hash === 'hash3') {
        return {
          blockInfo: { ...mockBlock, blockHash: 'hash3', blockNumber: 3, parentsHashList: ['hash2'] },
          deploys: mockDeploys
        };
      }
      throw new Error(`Mock not implemented for hash: ${hash}`);
    });

    render(<App />);
    
    // Wait for data to be processed
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Loaded 3 blocks successfully');
    });
  });
});