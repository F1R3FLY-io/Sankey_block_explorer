import axios from 'axios';
import { siteConfig } from '../siteMetadata';

const API_URL = siteConfig.apiUrl;

export interface Deploy {
  deployer: string;
  term: string;
  timestamp: number;
  sig: string;
  sigAlgorithm: string;
  phloPrice: number;
  phloLimit: number;
  validAfterBlockNumber: number;
  cost: number;
  errored: boolean;
  systemDeployError: string;
}

export interface BlockWithDeploys {
  blockInfo: Block;
  deploys: Deploy[];
}

export interface Block {
  blockHash: string;
  sender: string;
  seqNum: number;
  sig: string;
  sigAlgorithm: string;
  shardId: string;
  extraBytes: string;
  version: number;
  timestamp: number;
  headerExtraBytes: string;
  parentsHashList: string[];
  blockNumber: number;
  preStateHash: string;
  postStateHash: string;
  bodyExtraBytes: string;
  bonds: {
    validator: string;
    stake: number;
  }[];
  blockSize: string;
  deployCount: number;
  faultTolerance: number;
  justifications: {
    validator: string;
    latestBlockHash: string;
  }[];
  rejectedDeploys: Deploy[];
  totalCost: number;
  totalPhlo: number;
}

export interface BlockAnalysis {
  sources: string[]; // blocks without parents
  sinks: string[]; // blocks without children
  sourceSinks: string[]; // blocks with both parents and children
  totalBlocks: number;
}

export interface SankeyData {
  nodes: {
    id: string;
    name: string;
    color?: string;
  }[];
  links: {
    source: string;
    target: string;
    value: number;
  }[];
}

export const getBlocks = async (): Promise<Block[]> => {
  try {
    const response = await axios.get<Block[]>(`${API_URL}/blocks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
};

export const getBlockByHash = async (hash: string): Promise<BlockWithDeploys> => {
  try {
    const response = await axios.get<BlockWithDeploys>(`${API_URL}/block/${hash}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching block ${hash}:`, error);
    throw error;
  }
};

export const analyzeBlockChain = async (): Promise<BlockAnalysis> => {
  const initialBlocks = await getBlocks();
  const allBlocks = new Map<string, Block>();
  const processedHashes = new Set<string>();
  
  // Function to recursively fetch all blocks
  const fetchAllBlocks = async (hash: string) => {
    if (processedHashes.has(hash)) return;
    processedHashes.add(hash);
    
    try {
      const block = await getBlockByHash(hash);
      allBlocks.set(hash, block.blockInfo);
      
      // Recursively fetch all parent blocks
      for (const parentHash of block.blockInfo.parentsHashList) {
        await fetchAllBlocks(parentHash);
      }
    } catch (error) {
      console.error(`Error fetching block ${hash}:`, error);
    }
  };

  // Start with the last block
  for (const block of initialBlocks) {
    await fetchAllBlocks(block.blockHash);
  }

  // Collect all parent block hashes
  const parentHashes = new Set<string>();
  allBlocks.forEach(block => {
    block.parentsHashList.forEach(parentHash => {
      parentHashes.add(parentHash);
    });
  });

  // Analyze blocks
  const sources = Array.from(allBlocks.values())
    .filter(block => block.parentsHashList.length === 0)
    .map(block => block.blockHash);

  const sinks = Array.from(allBlocks.values())
    .filter(block => !Array.from(parentHashes).includes(block.blockHash))
    .map(block => block.blockHash);

  const sourceSinks = Array.from(allBlocks.values())
    .filter(block => 
      block.parentsHashList.length > 0 && 
      Array.from(parentHashes).includes(block.blockHash)
    )
    .map(block => block.blockHash);

  return {
    sources,
    sinks,
    sourceSinks,
    totalBlocks: allBlocks.size
  };
};

export const getBlockchainSankeyData = async (): Promise<SankeyData> => {
  const analysis = await analyzeBlockChain();
  const allBlocks = new Map<string, Block>();
  
  // Collect all block hashes
  const allHashes = [
    ...analysis.sources,
    ...analysis.sinks, 
    ...analysis.sourceSinks
  ];
  
  // Get details for each block
  for (const hash of allHashes) {
    try {
      const block = await getBlockByHash(hash);
      allBlocks.set(hash, block.blockInfo);
    } catch (error) {
      console.error(`Error fetching block ${hash}:`, error);
    }
  }
  
  // Create nodes for Sankey diagram
  const nodes = Array.from(allBlocks.values()).map(block => {
    let color = siteConfig.branding.secondaryColor; // Default color
    
    // Determine node color based on its type
    if (analysis.sources.includes(block.blockHash)) {
      color = siteConfig.branding.accentColor; // Source
    } else if (analysis.sinks.includes(block.blockHash)) {
      color = siteConfig.branding.errorColor; // Sink
    } else if (analysis.sourceSinks.includes(block.blockHash)) {
      color = siteConfig.branding.primaryColor; // Source-Sink
    }
    
    return {
      id: block.blockHash,
      name: `Block#${block.blockNumber}`,
      color
    };
  });
  
  // Create links for Sankey diagram
  const links = [];
  for (const block of allBlocks.values()) {
    for (const parentHash of block.parentsHashList) {
      // Check if parent block exists in our data
      if (allBlocks.has(parentHash)) {
        links.push({
          source: parentHash,
          target: block.blockHash,
          value: 1 // Standard weight for all links
        });
      }
    }
  }
  
  return { nodes, links };
}; 
