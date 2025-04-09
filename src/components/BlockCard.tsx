import React, { useMemo } from 'react';
import { Block, Deploy } from '../services/blockService.ts';
import SankeyDiagram from './SankeyDiagram.tsx';
import type { SankeyNode, SankeyLink } from './SankeyDiagram.tsx';
import HelpButton from './HelpButton.tsx';
// import { siteConfig } from '../siteMetadata'; // Using hardcoded colors from PDF spec

const GENESIS_CEREMONY_BLOCK_INDEX = 0;

interface BlockCardProps {
  block: Block;
  deploys: Deploy[];
  currentBlock: number;
  totalBlocks: number;
  onNavigate: (direction: string) => void;
  hasInternalConsumption?: boolean;
}

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const BlockCard: React.FC<BlockCardProps> = ({ 
  block, 
  deploys, 
  currentBlock, 
  totalBlocks, 
  onNavigate,
  hasInternalConsumption 
}) => {
  // Auto-detect internal consumption if not explicitly set
  const hasInternalConsumptionDetected = useMemo(() => {
    if (hasInternalConsumption !== undefined) return hasInternalConsumption;
    
    // Skip auto-detection for standard views to avoid false positives
    if (currentBlock < 100) return false;
    
    // Check for deploys that don't have match patterns and do have cost
    const internalConsumptionDeploys = deploys.filter(deploy => {
      const termMatch = deploy.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
      return !termMatch && deploy.cost > 0;
    });
    
    return internalConsumptionDeploys.length > 0;
  }, [deploys, hasInternalConsumption, currentBlock]);

  const addressColors = useMemo(() => {
    const colors = new Map();
    deploys.forEach(deploy => {
      if (!colors.has(deploy.deployer)) {
        colors.set(deploy.deployer, generateRandomColor());
      }

      if (currentBlock !== GENESIS_CEREMONY_BLOCK_INDEX) {
        const termMatch = deploy.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
        if (termMatch) {
          const [, from, to] = termMatch;
          if (!colors.has(from)) colors.set(from, generateRandomColor());
          if (!colors.has(to)) colors.set(to, generateRandomColor());
        }
      }
    });
    return colors;
  }, [deploys, currentBlock]);

  // Group deploys by deployer
  const deployerGroups = deploys.reduce((acc, deploy) => {
    if (!acc[deploy.deployer]) {
      acc[deploy.deployer] = {
        deploys: [],
        totalCost: 0,
        totalPhlo: 0,
        internalConsumption: 0
      };
    }
    acc[deploy.deployer].deploys.push(deploy);
    acc[deploy.deployer].totalCost += deploy.cost;
    acc[deploy.deployer].totalPhlo += deploy.phloLimit;
    
    // Calculate internal consumption for deploys that don't have match patterns
    const termMatch = deploy.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
    if (!termMatch && deploy.cost > 0) {
      acc[deploy.deployer].internalConsumption += deploy.cost;
    }
    
    return acc;
  }, {} as Record<string, { 
    deploys: Deploy[], 
    totalCost: number, 
    totalPhlo: number, 
    internalConsumption: number 
  }>);

  let nodes: SankeyNode[];
  let links: SankeyLink[];

  if (currentBlock === GENESIS_CEREMONY_BLOCK_INDEX) {
    // Special case - genesis ceremony with parallel lines
    const deployerEntries = Object.entries(deployerGroups);
    
    nodes = deployerEntries.flatMap(([deployer, data]) => [
      {
        id: `${deployer}_start`,
        name: `0x${deployer.substring(0, 6)}`,
        value: data.totalCost,
        color: addressColors.get(deployer) || generateRandomColor()
      },
      {
        id: `${deployer}_end`,
        name: '',
        value: data.totalCost,
        color: addressColors.get(deployer) || generateRandomColor()
      }
    ]);

    links = deployerEntries.map(([deployer, data]) => ({
      source: `${deployer}_start`,
      target: `${deployer}_end`,
      value: data.totalCost,
      color: addressColors.get(deployer) || generateRandomColor(),
      details: `Deployer: 0x${deployer.substring(0, 6)} | Deploys: ${data.deploys.length}\n\nTotal Cost: ${data.totalCost}\nTotal Phlo: ${data.totalPhlo}`
    }));
  } else if (hasInternalConsumptionDetected) {
    // Handle internal Phlo consumption - Rholang code execution
    // Create block node
    const blockNode: SankeyNode = {
      id: block.blockHash,
      name: `Block #${block.blockNumber}`,
      value: deploys.reduce((sum, d) => sum + d.cost, 0),
      color: '#ffa500', // Exact color from PDF spec
      phloConsumed: deploys.reduce((sum, d) => {
        // Only count as internal consumption if no match pattern
        const termMatch = d.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
        return termMatch ? sum : sum + d.cost;
      }, 0)
    };
    
    // Process external transfers if any exist
    const processedDeploys = deploys
      .map(deploy => {
        const termMatch = deploy.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
        if (!termMatch) return null;
        return {
          from: termMatch[1],
          to: termMatch[2],
          amount: parseInt(termMatch[3]),
          phlo: deploy.phloLimit
        };
      })
      .filter(deploy => deploy !== null);
    
    if (processedDeploys.length === 0) {
      // Only internal Phlo consumption - no external transfers
      nodes = [
        blockNode,
        // Add deployer nodes
        ...Object.entries(deployerGroups).map(([deployer, data]) => ({
          id: deployer,
          name: `0x${deployer.substring(0, 6)}`,
          value: data.totalCost,
          color: addressColors.get(deployer) || generateRandomColor()
        }))
      ];

      // Create links from deployers to block
      const regularLinks = Object.entries(deployerGroups).map(([deployer, data]) => ({
        source: deployer,
        target: block.blockHash,
        value: data.totalCost,
        color: addressColors.get(deployer) || generateRandomColor(),
        details: `Deployer: 0x${deployer.substring(0, 6)} | Deploys: ${data.deploys.length}\n\nTotal Cost: ${data.totalCost}\nTotal Phlo: ${data.totalPhlo}`
      }));
      
      // Add self-referential link for internal consumption
      links = [
        ...regularLinks,
        {
          source: block.blockHash,
          target: block.blockHash,
          value: blockNode.phloConsumed || 0, // Default to 0 if undefined
          isInternalConsumption: true,
          color: '#ffa500', // Exact color from PDF spec
          details: `${blockNode.phloConsumed || 0} Phlo consumed internally by Rholang code execution`
        }
      ];
    } else {
      // Mixed - both internal consumption and external transfers
      const uniqueAddresses = new Set([
        ...processedDeploys.map(d => d.from),
        ...processedDeploys.map(d => d.to)
      ]);

      // Create nodes for external transfers plus the block node
      nodes = [
        blockNode,
        ...Array.from(uniqueAddresses).map(address => ({
          id: address,
          name: `0x${address.substring(0, 6)}`,
          value: processedDeploys
            .filter(d => d.from === address || d.to === address)
            .reduce((sum, d) => sum + d.amount, 0),
          color: addressColors.get(address) || generateRandomColor()
        }))
      ];

      // Create links for external transfers
      const transferLinks = processedDeploys.map(deploy => ({
        source: deploy.from,
        target: deploy.to,
        value: deploy.amount,
        color: addressColors.get(deploy.from) || generateRandomColor(),
        details: `From: 0x${deploy.from.substring(0, 6)} | To: 0x${deploy.to.substring(0, 6)}\n\nAmount: ${deploy.amount}\nPhlo: ${deploy.phlo}`
      }));
      
      // Add self-referential link for internal consumption
      links = [
        ...transferLinks,
        {
          source: block.blockHash,
          target: block.blockHash,
          value: blockNode.phloConsumed || 0, // Default to 0 if undefined
          isInternalConsumption: true,
          color: '#ffa500', // Exact color from PDF spec
          details: `${blockNode.phloConsumed || 0} Phlo consumed internally by Rholang code execution`
        }
      ];
    }
  } else {
    // Standard blocks - process based on deploy patterns
    const processedDeploys = deploys
      .map(deploy => {
        const termMatch = deploy.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
        if (!termMatch) return null;
        return {
          from: termMatch[1],
          to: termMatch[2],
          amount: parseInt(termMatch[3]),
          phlo: deploy.phloLimit
        };
      })
      .filter(deploy => deploy !== null);

    if (processedDeploys.length === 0) {
      // No match patterns found - show simple block-centered view
      nodes = [
        // Add block node
        {
          id: block.blockHash,
          name: `Block #${block.blockNumber}`,
          value: deploys.reduce((sum, d) => sum + d.cost, 0),
          color: generateRandomColor()
        },
        // Add deployer nodes
        ...Object.entries(deployerGroups).map(([deployer, data]) => ({
          id: deployer,
          name: `0x${deployer.substring(0, 6)}`,
          value: data.totalCost,
          color: addressColors.get(deployer) || generateRandomColor()
        }))
      ];

      links = Object.entries(deployerGroups).map(([deployer, data]) => ({
        source: deployer,
        target: block.blockHash,
        value: data.totalCost,
        color: addressColors.get(deployer) || generateRandomColor(),
        details: `Deployer: 0x${deployer.substring(0, 6)} | Deploys: ${data.deploys.length}\n\nTotal Cost: ${data.totalCost}\nTotal Phlo: ${data.totalPhlo}`
      }));
    } else {
      // Has match patterns - show transfers between addresses
      const uniqueAddresses = new Set([
        ...processedDeploys.map(d => d.from),
        ...processedDeploys.map(d => d.to)
      ]);

      nodes = Array.from(uniqueAddresses).map(address => ({
        id: address,
        name: `0x${address.substring(0, 6)}`,
        value: processedDeploys
          .filter(d => d.from === address || d.to === address)
          .reduce((sum, d) => sum + d.amount, 0),
        color: addressColors.get(address) || generateRandomColor()
      }));

      links = processedDeploys.map(deploy => ({
        source: deploy.from,
        target: deploy.to,
        value: deploy.amount,
        color: addressColors.get(deploy.from) || generateRandomColor(),
        details: `From: 0x${deploy.from.substring(0, 6)} | To: 0x${deploy.to.substring(0, 6)}\n\nAmount: ${deploy.amount}\nPhlo: ${deploy.phlo}`
      }));
    }
  }

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
                opacity: 1
              },
              link: {
                opacity: 0.2
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
            <span>
              {
                // For transactions, count the match patterns (external transfers)
                deploys.filter(d => d.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/)).length
              }
            </span>
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
          {hasInternalConsumptionDetected && (
            <div>
              <span>
                {deploys.reduce((sum, d) => {
                  // Count only deploys that don't have match patterns
                  const termMatch = d.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
                  return termMatch ? sum : sum + d.cost;
                }, 0)}
              </span>
              <label>Internal Phlo</label>
            </div>
          )}
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
          <span className="block-info">Block {currentBlock} of {totalBlocks - 1}</span>
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