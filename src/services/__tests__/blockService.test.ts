import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { 
  getBlocks, 
  getBlockByHash, 
  analyzeBlockChain, 
  getBlockchainSankeyData, 
  Block, 
  BlockWithDeploys 
} from '../blockService';
import { mockBlock, mockDeploys } from '../../test/mocks';
import { siteConfig } from '../../siteMetadata';

// Create a spied version of axios instead of mocking the whole module
vi.spyOn(axios, 'get');

describe('blockService', () => {
  const API_URL = siteConfig.apiUrl;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getBlocks', () => {
    it('should fetch blocks successfully', async () => {
      const mockBlocks: Block[] = [mockBlock, { ...mockBlock, blockHash: 'efgh5678' }];
      
      // Instead of using mockResolvedValueOnce, use the vi.mocked pattern with returnValue
      vi.spyOn(axios, 'get').mockImplementation(() => 
        Promise.resolve({ data: mockBlocks } as { data: Block[] })
      );
      
      const result = await getBlocks();
      
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/blocks`);
      expect(result).toEqual(mockBlocks);
      expect(result.length).toBe(2);
    });

    it('should throw error when fetch fails', async () => {
      const errorMessage = 'Network Error';
      
      vi.spyOn(axios, 'get').mockImplementation(() => 
        Promise.reject(new Error(errorMessage))
      );
      
      await expect(getBlocks()).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/blocks`);
    });
  });

  describe('getBlockByHash', () => {
    it('should fetch block by hash successfully', async () => {
      const blockHash = 'abcd1234';
      const mockBlockWithDeploys: BlockWithDeploys = {
        blockInfo: mockBlock,
        deploys: mockDeploys
      };
      
      vi.spyOn(axios, 'get').mockImplementation(() => 
        Promise.resolve({ data: mockBlockWithDeploys } as { data: BlockWithDeploys })
      );
      
      const result = await getBlockByHash(blockHash);
      
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/block/${blockHash}`);
      expect(result).toEqual(mockBlockWithDeploys);
      expect(result.blockInfo.blockHash).toBe(blockHash);
    });

    it('should throw error when fetch by hash fails', async () => {
      const blockHash = 'abcd1234';
      const errorMessage = 'Block not found';
      
      vi.spyOn(axios, 'get').mockImplementation(() => 
        Promise.reject(new Error(errorMessage))
      );
      
      await expect(getBlockByHash(blockHash)).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/block/${blockHash}`);
    });
  });

  describe('analyzeBlockChain', () => {
    it('should analyze blockchain correctly', async () => {
      // Create a network of blocks for testing
      const block1: Block = { 
        ...mockBlock, 
        blockHash: 'hash1', 
        parentsHashList: [] // Source
      };
      
      const block2: Block = { 
        ...mockBlock, 
        blockHash: 'hash2', 
        parentsHashList: ['hash1'] // Middle
      };
      
      const block3: Block = { 
        ...mockBlock, 
        blockHash: 'hash3', 
        parentsHashList: ['hash2'] // Sink
      };
      
      // Setup mock responses
      vi.spyOn(axios, 'get').mockImplementation((url: string) => {
        if (url === `${API_URL}/blocks`) {
          return Promise.resolve({ data: [block1, block2, block3] } as { data: Block[] });
        } else if (url === `${API_URL}/block/hash1`) {
          return Promise.resolve({ 
            data: { blockInfo: block1, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash2`) {
          return Promise.resolve({ 
            data: { blockInfo: block2, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash3`) {
          return Promise.resolve({ 
            data: { blockInfo: block3, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        }
        return Promise.reject(new Error('Block not found'));
      });
      
      const result = await analyzeBlockChain();
      
      expect(result.totalBlocks).toBe(3);
      expect(result.sources).toContain('hash1');
      expect(result.sinks).toContain('hash3');
      expect(result.sourceSinks).toContain('hash2');
    });

    it('should handle errors during block fetching', async () => {
      // Setup the initial blocks
      const block1: Block = { 
        ...mockBlock, 
        blockHash: 'hash1', 
        parentsHashList: ['hash-error'] // Parent that will cause error
      };
      
      // Mock axios for different URLs
      vi.spyOn(axios, 'get').mockImplementation((url: string) => {
        if (url === `${API_URL}/blocks`) {
          return Promise.resolve({ data: [block1] } as { data: Block[] });
        } else if (url === `${API_URL}/block/hash1`) {
          return Promise.resolve({ 
            data: { blockInfo: block1, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash-error`) {
          return Promise.reject(new Error('Block not found'));
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
      
      // Spy on console.error to verify it's called
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* empty function */ });
      
      const result = await analyzeBlockChain();
      
      // Should complete successfully despite the error
      expect(result.totalBlocks).toBe(1);
      
      // Should have logged the error
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error fetching block hash-error');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getBlockchainSankeyData', () => {
    it('should generate Sankey data correctly', async () => {
      // Setup a simple block network for testing
      const block1: Block = { 
        ...mockBlock, 
        blockHash: 'hash1',
        blockNumber: 1, 
        parentsHashList: [] // Source
      };
      
      const block2: Block = { 
        ...mockBlock, 
        blockHash: 'hash2',
        blockNumber: 2, 
        parentsHashList: ['hash1'] // Middle
      };
      
      const block3: Block = { 
        ...mockBlock, 
        blockHash: 'hash3',
        blockNumber: 3, 
        parentsHashList: ['hash2'] // Sink
      };
      
      // Setup mock responses
      vi.spyOn(axios, 'get').mockImplementation((url: string) => {
        if (url === `${API_URL}/blocks`) {
          return Promise.resolve({ data: [block1, block2, block3] } as { data: Block[] });
        } else if (url === `${API_URL}/block/hash1`) {
          return Promise.resolve({ 
            data: { blockInfo: block1, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash2`) {
          return Promise.resolve({ 
            data: { blockInfo: block2, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash3`) {
          return Promise.resolve({ 
            data: { blockInfo: block3, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        }
        return Promise.reject(new Error('Block not found'));
      });
      
      const result = await getBlockchainSankeyData();
      
      // Verify nodes - order might not be guaranteed, so we'll check for existence instead
      expect(result.nodes.length).toBe(3);
      
      // Check that all expected nodes exist
      const hash1Node = result.nodes.find(node => node.id === 'hash1');
      const hash2Node = result.nodes.find(node => node.id === 'hash2');
      const hash3Node = result.nodes.find(node => node.id === 'hash3');
      
      expect(hash1Node).toBeDefined();
      expect(hash1Node?.name).toBe('Block#1');
      expect(hash1Node?.color).toBe(siteConfig.branding.accentColor); // Source color
      
      expect(hash2Node).toBeDefined();
      expect(hash2Node?.color).toBe(siteConfig.branding.primaryColor); // Source-Sink color
      
      expect(hash3Node).toBeDefined();
      expect(hash3Node?.color).toBe(siteConfig.branding.errorColor); // Sink color
      
      // Verify links - check for existence rather than specific order
      expect(result.links.length).toBe(2);
      
      const link1 = result.links.find(link => link.source === 'hash1' && link.target === 'hash2');
      const link2 = result.links.find(link => link.source === 'hash2' && link.target === 'hash3');
      
      expect(link1).toBeDefined();
      expect(link2).toBeDefined();
    });

    it('should handle errors during block fetching for Sankey data', async () => {
      // Setup the network
      const block1: Block = { 
        ...mockBlock, 
        blockHash: 'hash1', 
        parentsHashList: [] 
      };
      
      const block2: Block = { 
        ...mockBlock, 
        blockHash: 'hash2', 
        parentsHashList: ['hash1', 'hash-error'] // One valid, one error
      };
      
      // Mock responses
      vi.spyOn(axios, 'get').mockImplementation((url: string) => {
        if (url === `${API_URL}/blocks`) {
          return Promise.resolve({ data: [block1, block2] } as { data: Block[] });
        } else if (url === `${API_URL}/block/hash1`) {
          return Promise.resolve({ 
            data: { blockInfo: block1, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash2`) {
          return Promise.resolve({ 
            data: { blockInfo: block2, deploys: mockDeploys } 
          } as { data: BlockWithDeploys });
        } else if (url === `${API_URL}/block/hash-error`) {
          return Promise.reject(new Error('Block not found'));
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
      
      // Spy on console.error to verify it's called
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* empty function */ });
      
      const result = await getBlockchainSankeyData();
      
      // Should still return data despite errors
      expect(result.nodes.length).toBe(2);
      expect(result.links.length).toBe(1);
      
      // Should have logged the error
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});