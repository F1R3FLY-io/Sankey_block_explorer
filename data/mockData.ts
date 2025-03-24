import { SankeyNode, SankeyLink } from '../components/SankeyDiagram';

// Wallet addresses with human-readable labels
export interface Wallet {
  address: string;
  name: string;
  mnemonic?: string;
  type: 'user' | 'exchange' | 'contract' | 'defi' | 'mixer';
}

// Transaction data for blockchain explorer
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number; // in ETH
  timestamp: number;
}

// Wallet data with human-readable names and types
export const wallets: Wallet[] = [
  { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', name: 'Whale Wallet', mnemonic: 'whale ocean depth mountain forest garden river lake sunset horizon dawn breeze', type: 'user' },
  { address: '0x23d233933c86f93B74705CF0d236D8585163faBD', name: 'Exchange A', type: 'exchange' },
  { address: '0x9eC6cAF6Eb3B3Fb5dE6F455DC0A0d9A65aB22888', name: 'DEX Router', type: 'contract' },
  { address: '0x8c2a90D36Ec9F745c9B28B588Cba5e946D851DA8', name: 'Lending Protocol', type: 'defi' },
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'DAI Contract', type: 'contract' },
  { address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', name: 'Uniswap Router', type: 'defi' },
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USDC Contract', type: 'contract' },
  { address: '0x3d20d457116Da3ED2aC43bF9af4F5e30FBc4346F', name: 'Trader A', mnemonic: 'trade market crypto token asset value price chart graph trend analysis', type: 'user' },
  { address: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326', name: 'Mixer Service', type: 'mixer' },
  { address: '0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3', name: 'Smart Contract Wallet', type: 'user' },
  { address: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b', name: 'OpenSea', type: 'exchange' },
  { address: '0xdef1cafe0000000000000000000000000000000000', name: 'Private Wallet', mnemonic: 'shield private secret hidden secure guard mask protect conceal covert veil', type: 'user' }
];

// Transaction history
export const transactions: Transaction[] = [
  { hash: '0x123...abc1', from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', to: '0x23d233933c86f93B74705CF0d236D8585163faBD', value: 50, timestamp: 1704067200 },
  { hash: '0x123...abc2', from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', to: '0x9eC6cAF6Eb3B3Fb5dE6F455DC0A0d9A65aB22888', value: 30, timestamp: 1704153600 },
  { hash: '0x123...abc3', from: '0x23d233933c86f93B74705CF0d236D8585163faBD', to: '0x8c2a90D36Ec9F745c9B28B588Cba5e946D851DA8', value: 40, timestamp: 1704240000 },
  { hash: '0x123...abc4', from: '0x9eC6cAF6Eb3B3Fb5dE6F455DC0A0d9A65aB22888', to: '0x6B175474E89094C44Da98b954EedeAC495271d0F', value: 20, timestamp: 1704326400 },
  { hash: '0x123...abc5', from: '0x9eC6cAF6Eb3B3Fb5dE6F455DC0A0d9A65aB22888', to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', value: 10, timestamp: 1704412800 },
  { hash: '0x123...abc6', from: '0x3d20d457116Da3ED2aC43bF9af4F5e30FBc4346F', to: '0x23d233933c86f93B74705CF0d236D8585163faBD', value: 25, timestamp: 1704499200 },
  { hash: '0x123...abc7', from: '0x3d20d457116Da3ED2aC43bF9af4F5e30FBc4346F', to: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326', value: 15, timestamp: 1704585600 },
  { hash: '0x123...abc8', from: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326', to: '0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3', value: 15, timestamp: 1704672000 },
  { hash: '0x123...abc9', from: '0x8c2a90D36Ec9F745c9B28B588Cba5e946D851DA8', to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', value: 35, timestamp: 1704758400 },
  { hash: '0x123...abc0', from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', to: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b', value: 20, timestamp: 1704844800 }
];

// Helper function to generate Sankey diagram data from wallets and transactions
export function generateBlockchainSankeyData() {
  // Create nodes from wallets
  const nodes: SankeyNode[] = wallets.map(wallet => {
    let color = '#7ed6df'; // Default color
    
    // Color based on wallet type
    switch (wallet.type) {
      case 'user':
        color = '#f6e58d'; // Light yellow
        break;
      case 'exchange':
        color = '#eb4d4b'; // Reddish
        break;
      case 'contract':
        color = '#6ab04c'; // Green
        break;
      case 'defi':
        color = '#686de0'; // Purple
        break;
      case 'mixer':
        color = '#535c68'; // Gray
        break;
    }
    
    return {
      id: wallet.address,
      name: wallet.name + '\n' + wallet.address.substring(0, 8) + '...',
      color
    };
  });
  
  // Create links from transactions
  const links: SankeyLink[] = transactions.map(tx => ({
    source: tx.from,
    target: tx.to,
    value: tx.value
  }));
  
  return { nodes, links };
}

// Generate the Sankey data
export const blockchainFlowData = generateBlockchainSankeyData();

// Configuration for the Sankey diagram
export const sankeyConfig = {
  width: 900,
  height: 600,
  nodeWidth: 20,
  nodePadding: 10,
  margin: { top: 30, right: 150, bottom: 30, left: 150 }
};