import React, { useState, useEffect } from 'react';
import SankeyDiagram, { SankeyNode, SankeyLink } from './SankeyDiagram';
import { blockchainFlowData, sankeyConfig } from '../data/mockData';

const BlockchainFlowExample: React.FC = () => {
  const [data, setData] = useState<{nodes: SankeyNode[], links: SankeyLink[]}>({ nodes: [], links: [] });
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real application, you might fetch this data from an API
    // Now using the mock data from the data file
    setData({ 
      nodes: blockchainFlowData.nodes, 
      links: blockchainFlowData.links 
    });
  }, []);
  
  // Function to filter links by selected wallet
  const filterLinksByWallet = (address: string | null) => {
    if (!address) {
      return blockchainFlowData.links;
    }
    
    return blockchainFlowData.links.filter(link => 
      link.source === address || 
      (typeof link.source === 'object' && link.source.id === address) ||
      link.target === address || 
      (typeof link.target === 'object' && link.target.id === address)
    );
  };
  
  // Handle wallet selection
  const handleWalletSelect = (address: string | null) => {
    setSelectedWalletAddress(address);
    
    // Update the diagram data
    const filteredLinks = filterLinksByWallet(address);
    setData({
      nodes: blockchainFlowData.nodes,
      links: filteredLinks
    });
  };
  
  // Find wallet info by address
  const findWalletInfo = (address: string): { type: string; mnemonic?: string } => {
    const wallet = blockchainFlowData.nodes.find(node => node.id === address);
    const type = wallet?.name.split('\n')[0] || 'Unknown';
    return { type };
  };
  
  // Calculate total value for a wallet (incoming and outgoing)
  const calculateWalletValue = (address: string): { incoming: number; outgoing: number } => {
    let incoming = 0;
    let outgoing = 0;
    
    blockchainFlowData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === address) {
        outgoing += link.value;
      }
      if (targetId === address) {
        incoming += link.value;
      }
    });
    
    return { incoming, outgoing };
  };
  
  return (
    <div className="blockchain-flow-container">
      <h2>Blockchain Value Flow Explorer</h2>
      <p>Visualizing ETH value flows between wallets and contracts</p>
      
      <div className="wallet-selector">
        <label htmlFor="wallet-select">Filter by wallet: </label>
        <select 
          id="wallet-select"
          value={selectedWalletAddress || ''}
          onChange={(e) => handleWalletSelect(e.target.value || null)}
        >
          <option value="">All wallets</option>
          {blockchainFlowData.nodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.name.split('\n')[0]}
            </option>
          ))}
        </select>
        <button onClick={() => handleWalletSelect(null)}>Reset</button>
      </div>
      
      {selectedWalletAddress && (
        <div className="wallet-details">
          <h3>Wallet Details</h3>
          <p><strong>Address:</strong> {selectedWalletAddress}</p>
          <p><strong>Type:</strong> {findWalletInfo(selectedWalletAddress).type}</p>
          <p><strong>Total Incoming:</strong> {calculateWalletValue(selectedWalletAddress).incoming} ETH</p>
          <p><strong>Total Outgoing:</strong> {calculateWalletValue(selectedWalletAddress).outgoing} ETH</p>
          <p><strong>Net:</strong> {calculateWalletValue(selectedWalletAddress).incoming - calculateWalletValue(selectedWalletAddress).outgoing} ETH</p>
        </div>
      )}
      
      {data.nodes.length > 0 && (
        <SankeyDiagram 
          nodes={data.nodes} 
          links={data.links} 
          width={sankeyConfig.width} 
          height={sankeyConfig.height}
          nodeWidth={sankeyConfig.nodeWidth}
          nodePadding={sankeyConfig.nodePadding}
          margin={sankeyConfig.margin}
        />
      )}
      
      <div className="legend">
        <h3>Wallet Type Legend</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          <div style={{display: 'flex', alignItems: 'center', margin: '5px'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#f6e58d', marginRight: '5px'}} />
            <span>User Wallet</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', margin: '5px'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#eb4d4b', marginRight: '5px'}} />
            <span>Exchange</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', margin: '5px'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#6ab04c', marginRight: '5px'}} />
            <span>Contract</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', margin: '5px'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#686de0', marginRight: '5px'}} />
            <span>DeFi Protocol</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', margin: '5px'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#535c68', marginRight: '5px'}} />
            <span>Mixer/Tumbler</span>
          </div>
        </div>
      </div>
      
      <div className="transactions-info">
        <h3>Transaction Information</h3>
        <p>The diagram shows value flows between different addresses on the blockchain.</p>
        <p>Width of the flow lines represents the amount of ETH transferred.</p>
        <p>Use the wallet filter above to focus on transactions involving a specific address.</p>
      </div>
    </div>
  );
};

export default BlockchainFlowExample;