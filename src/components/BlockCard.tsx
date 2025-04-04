import React from 'react';
import { Block, Deploy } from '../services/blockService.ts';
import SankeyDiagram from './SankeyDiagram.tsx';
import HelpButton from './HelpButton.tsx';

interface BlockCardProps {
  block: Block;
  deploys: Deploy[];
  currentBlock: number;
  totalBlocks: number;
  onNavigate: (direction: string) => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, deploys, currentBlock, totalBlocks, onNavigate }) => {
  // Group deploys by deployer
  const deployerGroups = deploys.reduce((acc, deploy) => {
    if (!acc[deploy.deployer]) {
      acc[deploy.deployer] = {
        deploys: [],
        totalCost: 0,
        totalPhlo: 0
      };
    }
    acc[deploy.deployer].deploys.push(deploy);
    acc[deploy.deployer].totalCost += deploy.cost;
    acc[deploy.deployer].totalPhlo += deploy.phloLimit;
    return acc;
  }, {} as Record<string, { deploys: Deploy[], totalCost: number, totalPhlo: number }>);

  // Prepare nodes and links for Sankey diagram
  const nodes = [
    // Create nodes for deployers
    ...Object.entries(deployerGroups).map(([deployer, data]) => ({
      id: deployer,
      name: `0x${deployer.substring(0, 6)}`,
      value: data.totalCost
    })),
    // Add block node
    {
      id: block.blockHash,
      name: `Block #${block.blockNumber}`,
      value: deploys.reduce((sum, d) => sum + d.cost, 0)
    }
  ];

  const links = Object.entries(deployerGroups).map(([deployer, data]) => ({
    source: deployer,
    target: block.blockHash,
    value: data.totalCost,
    details: `Deploys: ${data.deploys.length}\nTotal Cost: ${data.totalCost}\nTotal Phlo: ${data.totalPhlo}`
  }));

  return (
    <div className="block-container">
      <div className="block-content">
        <h2>Block #{currentBlock}</h2>
        <div className="block-hash">
          {block.blockHash}
        </div>
        <div className="sankey-diagram">
          <SankeyDiagram 
            nodes={nodes} 
            links={links}
            options={{
              node: {
                fill: '#1890ff',
                stroke: '#1890ff',
                opacity: 0.8
              },
              link: {
                fill: '#1890ff',
                stroke: '#1890ff',
                opacity: 0.3
              }
            }}
          />
        </div>
        <div className="block-stats">
          <div>
            <span>{deploys.length}</span>
            <label>Deploys</label>
          </div>
          <div>
            <span>{deploys.length}</span>
            <label>Transactions</label>
          </div>
          <div>
            <span>{Object.keys(deployerGroups).length}</span>
            <label>Agents involved</label>
          </div>
          <div>
            <span>{deploys.reduce((sum, d) => sum + d.cost, 0)}</span>
            <label>Total cost</label>
          </div>
          <div>
            <span>{deploys.reduce((sum, d) => sum + d.phloLimit, 0)}</span>
            <label>Total Phlo</label>
          </div>
        </div>
      </div>
      <div className="navigation-wrapper">
        <div className="navigation-controls">
          <button 
            className="nav-button" 
            onClick={() => onNavigate('first')}
            title="First block"
          >
            ««
          </button>
          <button 
            className="nav-button" 
            onClick={() => onNavigate('prev')}
            title="Previous block"
          >
            «
          </button>
          <span className="block-info">Block {currentBlock} of {totalBlocks}</span>
          <button 
            className="nav-button" 
            onClick={() => onNavigate('next')}
            title="Next block"
          >
            »
          </button>
          <button 
            className="nav-button" 
            onClick={() => onNavigate('last')}
            title="Last block"
          >
            »»
          </button>
        </div>
        <div className="help-controls">
          <HelpButton />
        </div>
      </div>
    </div>
  );
};

export default BlockCard; 