import { sankey } from 'd3-sankey';
import { SankeyData, SankeyLayoutType, SankeyLink, SankeyNode } from './SankeyTypes';

/**
 * Constants for diagram configuration
 */
export const CONSTANTS = {
  NODE_WIDTH: 15,
  NODE_PADDING: 20,
  DEFAULT_LINK_OPACITY: 0.6,
  INTERNAL_CONSUMPTION_OPACITY: 0.9,
  DEFAULT_NODE_OPACITY: 0.8,
  MIN_WIDTH_STANDARD: 1,
  MAX_WIDTH_STANDARD: 60,
  MIN_WIDTH_TERMINATING: 10,
  MAX_WIDTH_TERMINATING: 40,
  FLOW_DIVISORS: {
    BASE: 500,
    LARGE_BLUE: 500,   // 0x197MTCADDR
    MEDIUM_TEAL: 600,  // 0x198MTCADDR
    LOW_ACTIVITY: 700, // Low activity nodes
    // Center node outputs
    CENTER_TO_GREEN: 600,    // 0x257MTCADDR
    CENTER_TO_LIGHT_BLUE: 900, // 0x258MTCADDR
    CENTER_TO_MEDIUM_BLUE: 700, // 0x259MTCADDR
    CENTER_TO_ORANGE: 650,   // 0x260MTCADDR
    CENTER_TO_PURPLE: 800,   // 0x261MTCADDR
    CENTER_TO_GREEN_SMALL: 900 // 0x262MTCADDR
  }
};

/**
 * Determines the layout type for the Sankey diagram based on data
 */
export function determineLayoutType(links: SankeyLink[]): SankeyLayoutType {
  // Check if all links are self-referencing (parallel)
  const isAllParallel = links.every(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
    const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
    return sourceId === targetId;
  });
  
  if (isAllParallel) {
    return SankeyLayoutType.PARALLEL;
  }
  
  // Check if this is a custom layout (with columnPosition)
  const hasColumnPositions = links.some(link => {
    const sourceNode = typeof link.source === 'object' ? link.source : null;
    const targetNode = typeof link.target === 'object' ? link.target : null;
    return (sourceNode && 'columnPosition' in sourceNode) || 
           (targetNode && 'columnPosition' in targetNode);
  });
  
  if (hasColumnPositions) {
    return SankeyLayoutType.CUSTOM;
  }
  
  return SankeyLayoutType.STANDARD;
}

/**
 * Prepares node map for Sankey layout
 */
export function createNodeMap(nodes: SankeyNode[]): Map<string, number> {
  return new Map(nodes.map((node, i) => [node.id, i]));
}

/**
 * Formats Sankey data for layout
 */
export function prepareSankeyData(
  nodes: SankeyNode[],
  links: SankeyLink[],
  nodeMap: Map<string, number>,
  hasColumnPositions: boolean
): SankeyData {
  return {
    nodes: nodes.map(node => {
      // For nodes with explicit column positions, set their positions directly
      if (hasColumnPositions && node.columnPosition) {
        return {
          ...node,
          index: nodeMap.get(node.id)
        };
      }
      
      return {
        ...node,
        index: nodeMap.get(node.id)
      };
    }),
    links: links.map(link => ({
      source: nodeMap.get(typeof link.source === 'object' ? link.source.id : String(link.source))!,
      target: nodeMap.get(typeof link.target === 'object' ? link.target.id : String(link.target))!,
      value: link.value,
      color: link.color,
      dashArray: link.dashArray,
      opacity: link.opacity,
      details: link.details
    }))
  };
}

/**
 * Applies standard D3 Sankey layout to data
 */
export function applyStandardLayout(
  sankeyData: SankeyData,
  width: number,
  height: number
): { layoutNodes: SankeyNode[], layoutLinks: SankeyLink[] } {
  const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
    .nodeWidth(CONSTANTS.NODE_WIDTH)
    .nodePadding(CONSTANTS.NODE_PADDING)
    .extent([[1, 1], [width - 1, height - 1]]);
  
  const result = sankeyGenerator(sankeyData);
  
  // Return in the expected format
  return { 
    layoutNodes: result.nodes, 
    layoutLinks: result.links 
  };
}

/**
 * Applies custom positioning for nodes based on column position
 */
export function applyCustomLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  width: number,
  height: number
): { nodes: SankeyNode[], links: SankeyLink[] } {
  const layoutNodes = [...nodes] as SankeyNode[];
  
  // Set initial y positions for explicitly positioned nodes
  const leftNodes = layoutNodes.filter(n => n.columnPosition === 'left');
  const rightNodes = layoutNodes.filter(n => n.columnPosition === 'right');
  const centerNodes = layoutNodes.filter(n => n.columnPosition === 'center');
  
  // Configure total height to use most of the available space
  const diagramHeight = height - 100; // Leave margin for labels
  
  // Left column with blue/teal inputs - match spec exactly
  // Starting position from top - fixed positioning based on spec
  let leftY = 60;
  
  leftNodes.forEach(node => {
    // Size based on proportion and leave appropriate gaps
    let nodeHeight;
    
    // Specific sizing based on node ID
    if (node.id === 'input_0x197MTCADDR') {
      // Blue node - largest
      nodeHeight = Math.max(50, diagramHeight * 0.3);
      node.y0 = leftY;
      node.y1 = leftY + nodeHeight;
      leftY += nodeHeight + 20;  
    } else if (node.id === 'input_0x198MTCADDR') {
      // Teal node - medium
      nodeHeight = Math.max(40, diagramHeight * 0.22);
      node.y0 = leftY;
      node.y1 = leftY + nodeHeight;
      leftY += nodeHeight + 20;
    } else if (node.id === 'input_lowactivity') {
      // Low activity node - smallest
      nodeHeight = Math.max(30, diagramHeight * 0.15);
      node.y0 = leftY;
      node.y1 = leftY + nodeHeight;
    }
  });
  
  // Right column with output nodes - match spacing from the spec
  let rightY = 60; // Start at the same position as left column
  
  // Sort by size to match the layout in the spec
  const sortedRightNodes = [...rightNodes].sort((a, b) => (b.value || 0) - (a.value || 0));
  
  sortedRightNodes.forEach(node => {
    // Specific sizing and gaps for different output nodes
    let nodeHeight;
    
    if (node.value && node.value > 8000) {
      // Larger nodes (green and orange)
      nodeHeight = Math.max(35, diagramHeight * 0.15);
    } else if (node.value && node.value > 3000) {
      // Medium nodes (blue)
      nodeHeight = Math.max(25, diagramHeight * 0.1);
    } else {
      // Small nodes
      nodeHeight = Math.max(20, diagramHeight * 0.08);
    }
    
    node.y0 = rightY;
    node.y1 = rightY + nodeHeight;
    rightY += nodeHeight + 15; // Small gap between nodes
  });
  
  // Position center nodes exactly as in spec
  if (centerNodes.length > 0) {
    const centerNode = centerNodes[0];
    // Position in the vertical center, aligned with flows
    const centerY = (height / 2) - 80;
    const centerHeight = 160; // Fixed height matches the spec
    
    centerNode.y0 = centerY;
    centerNode.y1 = centerY + centerHeight;
  }
  
  // Set x positions for all nodes based on column position
  layoutNodes.forEach(node => {
    const nodeWidth = CONSTANTS.NODE_WIDTH;
    
    if (node.columnPosition === 'left') {
      node.x0 = 1;
      node.x1 = 1 + nodeWidth;
    } else if (node.columnPosition === 'right') {
      node.x0 = width - nodeWidth - 1;
      node.x1 = width - 1;
    } else if (node.columnPosition === 'center') {
      node.x0 = (width - nodeWidth) / 2;
      node.x1 = node.x0 + nodeWidth;
    }
  });
  
  // Process links to match between the predefined nodes
  const layoutLinks = links.map(link => {
    const sourceNode = layoutNodes.find((n: SankeyNode) => 
      n.id === (typeof link.source === 'object' ? link.source.id : String(link.source))
    );
    const targetNode = layoutNodes.find((n: SankeyNode) => 
      n.id === (typeof link.target === 'object' ? link.target.id : String(link.target))
    );
    
    if (!sourceNode || !targetNode) {
      console.warn('Source or target node not found', { link, sourceNode, targetNode });
      // Return a placeholder to avoid errors
      return {
        source: layoutNodes[0],
        target: layoutNodes[0],
        value: 0,
        width: 0
      } as SankeyLink;
    }
    
    return {
      ...link,
      source: sourceNode,
      target: targetNode,
      width: Math.max(1, 2 * Math.sqrt(link.value || 1))
    } as SankeyLink;
  });
  
  return { nodes: layoutNodes, links: layoutLinks };
}

/**
 * Gets the appropriate flow divisor based on node names
 */
export function getFlowDivisor(sourceNode: SankeyNode, targetNode: SankeyNode): number {
  // Base divisor
  let divisor = CONSTANTS.FLOW_DIVISORS.BASE;
  
  // Adjust based on source node
  if (sourceNode.name === '0x197MTCADDR') {
    divisor = CONSTANTS.FLOW_DIVISORS.LARGE_BLUE;
  } else if (sourceNode.name === '0x198MTCADDR') {
    divisor = CONSTANTS.FLOW_DIVISORS.MEDIUM_TEAL;
  } else if (sourceNode.name === '+56 Low activity\nnodes') {
    divisor = CONSTANTS.FLOW_DIVISORS.LOW_ACTIVITY;
  }
  
  // For output flows from center, using even more specific divisions
  if (sourceNode.id === 'center_0x257MTCADDR') {
    if (targetNode.name === '0x257MTCADDR') {
      divisor = CONSTANTS.FLOW_DIVISORS.CENTER_TO_GREEN;
    } else if (targetNode.name === '0x258MTCADDR') {
      divisor = CONSTANTS.FLOW_DIVISORS.CENTER_TO_LIGHT_BLUE;
    } else if (targetNode.name === '0x259MTCADDR') {
      divisor = CONSTANTS.FLOW_DIVISORS.CENTER_TO_MEDIUM_BLUE;
    } else if (targetNode.name === '0x260MTCADDR') {
      divisor = CONSTANTS.FLOW_DIVISORS.CENTER_TO_ORANGE;
    } else if (targetNode.name === '0x261MTCADDR') {
      divisor = CONSTANTS.FLOW_DIVISORS.CENTER_TO_PURPLE;
    } else if (targetNode.name === '0x262MTCADDR') {
      divisor = CONSTANTS.FLOW_DIVISORS.CENTER_TO_GREEN_SMALL;
    }
  }
  
  return divisor;
}

/**
 * Calculates appropriate widths for flows based on value
 */
export function calculateFlowWidths(
  value: number,
  divisor: number,
  isTerminating: boolean = false
): { sourceWidth: number, targetWidth: number, midWidth?: number } {
  if (isTerminating) {
    const sourceWidth = Math.min(
      CONSTANTS.MAX_WIDTH_STANDARD,
      Math.max(CONSTANTS.MIN_WIDTH_STANDARD, value / divisor)
    );
    const midWidth = Math.min(
      CONSTANTS.MAX_WIDTH_TERMINATING,
      Math.max(CONSTANTS.MIN_WIDTH_TERMINATING, value / (divisor * 1.3))
    );
    return { sourceWidth, targetWidth: 0, midWidth };
  } else {
    const sourceWidth = Math.min(
      CONSTANTS.MAX_WIDTH_STANDARD,
      Math.max(CONSTANTS.MIN_WIDTH_STANDARD, value / divisor)
    );
    const targetWidth = Math.min(
      CONSTANTS.MAX_WIDTH_STANDARD,
      Math.max(CONSTANTS.MIN_WIDTH_STANDARD, value / divisor)
    );
    return { sourceWidth, targetWidth };
  }
}