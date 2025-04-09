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
  internalConsumers: string[]; // blocks with internal Phlo consumption but no outgoing transaction
  totalBlocks: number;
}

export interface SankeyData {
  nodes: {
    id: string;
    name: string;
    color?: string;
    phloConsumed?: number;
  }[];
  links: {
    source: string;
    target: string;
    value: number;
    isInternalConsumption?: boolean;
    details?: string;
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
  const blocksWithDeploys = new Map<string, BlockWithDeploys>();
  const processedHashes = new Set<string>();
  
  // Function to recursively fetch all blocks
  const fetchAllBlocks = async (hash: string) => {
    if (processedHashes.has(hash)) return;
    processedHashes.add(hash);
    
    try {
      const block = await getBlockByHash(hash);
      allBlocks.set(hash, block.blockInfo);
      blocksWithDeploys.set(hash, block);
      
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
    
  // Find blocks with internal Phlo consumption
  // These are blocks that have deploys with Phlo cost but don't create outgoing transactions
  const internalConsumers = Array.from(blocksWithDeploys.entries())
    .filter(([hash, block]) => {
      // Check if it has any deploys with Phlo consumption
      const hasPhloConsumption = block.deploys.some(deploy => deploy.cost > 0);
      
      // Check if it's not already a source or sink
      const isNotSource = !sources.includes(hash);
      const isNotSink = !sinks.includes(hash);
      
      // A block with internal consumption has Phlo usage but isn't a sink
      return hasPhloConsumption && isNotSource && isNotSink;
    })
    .map(([hash]) => hash);

  return {
    sources,
    sinks,
    sourceSinks,
    internalConsumers,
    totalBlocks: allBlocks.size
  };
};

export const getBlockchainSankeyData = async (): Promise<SankeyData> => {
  const analysis = await analyzeBlockChain();
  const allBlocks = new Map<string, Block>();
  const blocksWithDeploys = new Map<string, BlockWithDeploys>();
  
  // Collect all block hashes
  const allHashes = [
    ...analysis.sources,
    ...analysis.sinks, 
    ...analysis.sourceSinks,
    ...analysis.internalConsumers
  ];
  
  // Get details for each block
  for (const hash of allHashes) {
    try {
      const block = await getBlockByHash(hash);
      allBlocks.set(hash, block.blockInfo);
      blocksWithDeploys.set(hash, block);
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
    } else if (analysis.internalConsumers.includes(block.blockHash)) {
      color = siteConfig.branding.warningColor || '#FFA500'; // Internal consumer - orange if not defined
    }
    
    // Calculate total Phlo consumed in this block
    const blockWithDeploys = blocksWithDeploys.get(block.blockHash);
    const phloConsumed = blockWithDeploys ? 
      blockWithDeploys.deploys.reduce((total, deploy) => total + deploy.cost, 0) : 
      0;
    
    return {
      id: block.blockHash,
      name: `Block#${block.blockNumber}`,
      color,
      phloConsumed
    };
  });
  
  // Create links for Sankey diagram
  const links = [];
  
  // First, add normal parent-child relationships
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
  
  // Then, add internal consumption links for blocks that consume Phlo
  for (const hash of analysis.internalConsumers) {
    const blockWithDeploys = blocksWithDeploys.get(hash);
    if (!blockWithDeploys) continue;
    
    // Calculate total Phlo consumed
    const totalPhlo = blockWithDeploys.deploys.reduce((sum, deploy) => sum + deploy.cost, 0);
    
    if (totalPhlo > 0) {
      // Create a self-referential link to show internal consumption
      links.push({
        source: hash,
        target: hash,
        value: totalPhlo, // Use actual Phlo consumption as the value
        isInternalConsumption: true,
        details: `${totalPhlo} Phlo consumed by ${blockWithDeploys.deploys.length} deploys`
      });
    }
  }
  
  return { nodes, links };
}; 
