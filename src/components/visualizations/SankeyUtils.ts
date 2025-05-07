import { sankey } from 'd3-sankey';
import { SankeyData, SankeyLayoutType, SankeyLink, SankeyNode } from './SankeyTypes';

/**
 * Default constants for diagram configuration
 * These can be overridden through options
 */
export const DEFAULT_CONFIG = {
  NODE: {
    WIDTH: 15,
    PADDING: 20,
    OPACITY: 0.8
  },
  LINK: {
    OPACITY: 0.6,
    INTERNAL_CONSUMPTION_OPACITY: 0.9,
    MIN_WIDTH_STANDARD: 1,
    MAX_WIDTH_STANDARD: 60,
    MIN_WIDTH_TERMINATING: 10,
    MAX_WIDTH_TERMINATING: 40
  },
  FLOW_DIVISORS: {
    BASE: 500,
    // Specific node mapping values with descriptive comments
    CUSTOM_VALUES: {
      // Input nodes
      '0x197MTCADDR': 500,   // Large blue input
      '0x198MTCADDR': 600,   // Medium teal input
      '+56 Low activity\nnodes': 700, // Low activity nodes
      
      // Center to outputs mappings for different target nodes
      'center_0x257MTCADDR_to_0x257MTCADDR': 600,     // Center to green
      'center_0x257MTCADDR_to_0x258MTCADDR': 900,     // Center to light blue
      'center_0x257MTCADDR_to_0x259MTCADDR': 700,     // Center to medium blue
      'center_0x257MTCADDR_to_0x260MTCADDR': 650,     // Center to orange
      'center_0x257MTCADDR_to_0x261MTCADDR': 800,     // Center to purple
      'center_0x257MTCADDR_to_0x262MTCADDR': 900      // Center to small green
    }
  }
};

/**
 * Custom error class for Sankey diagram errors
 */
export class SankeyError extends Error {
  constructor(message: string, public data?: unknown) {
    super(message);
    this.name = 'SankeyError';
  }
}

/**
 * Safely extracts node ID regardless of source/target format
 */
export function getNodeId(node: string | number | SankeyNode): string {
  try {
    return typeof node === 'object' ? node.id : String(node);
  } catch (err) {
    throw new SankeyError('Failed to extract node ID', { node, error: err });
  }
}

/**
 * Determines the layout type for the Sankey diagram based on data
 */
export function determineLayoutType(links: SankeyLink[]): SankeyLayoutType {
  if (!links || links.length === 0) {
    return SankeyLayoutType.STANDARD;
  }
  
  try {
    // Check if all links are self-referencing (parallel)
    const isAllParallel = links.every(link => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
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
  } catch (err) {
    console.error('Error determining layout type:', err);
    return SankeyLayoutType.STANDARD; // Fallback to standard layout
  }
}

/**
 * Prepares node map for Sankey layout
 */
export function createNodeMap(nodes: SankeyNode[]): Map<string, number> {
  if (!nodes || !Array.isArray(nodes)) {
    throw new SankeyError('Invalid nodes array provided to createNodeMap', { nodes });
  }
  
  try {
    return new Map(nodes.map((node, i) => {
      if (!node || !node.id) {
        throw new SankeyError('Node is missing required id property', { node, index: i });
      }
      return [node.id, i];
    }));
  } catch (err) {
    if (err instanceof SankeyError) throw err;
    throw new SankeyError('Failed to create node map', { nodes, error: err });
  }
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
  if (!nodes || !links || !nodeMap) {
    throw new SankeyError('Missing required parameters for prepareSankeyData', { 
      hasNodes: !!nodes, 
      hasLinks: !!links, 
      hasNodeMap: !!nodeMap 
    });
  }
  
  try {
    // Process nodes with safety checks
    const processedNodes = nodes.map(node => {
      if (!node.id || !nodeMap.has(node.id)) {
        throw new SankeyError(`Node ID not found in node map: ${node.id}`, { node, availableIds: [...nodeMap.keys()] });
      }
      
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
    });
    
    // Process links with safety checks
    const processedLinks = links.map((link, index) => {
      try {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        
        if (!nodeMap.has(sourceId)) {
          throw new SankeyError(`Source node ID not found: ${sourceId}`, { link, index });
        }
        
        if (!nodeMap.has(targetId)) {
          throw new SankeyError(`Target node ID not found: ${targetId}`, { link, index });
        }
        
        return {
          source: nodeMap.get(sourceId)!,
          target: nodeMap.get(targetId)!,
          value: link.value,
          color: link.color,
          dashArray: link.dashArray,
          opacity: link.opacity,
          details: link.details
        };
      } catch (err) {
        console.error(`Error processing link at index ${index}:`, err);
        // Return a minimal valid link to prevent diagram failure
        return {
          source: 0,
          target: 0,
          value: 0,
          color: 'rgba(0,0,0,0.1)',
          opacity: 0.3,
          details: 'Error: Invalid link data'
        };
      }
    });
    
    return {
      nodes: processedNodes,
      links: processedLinks
    };
  } catch (err) {
    if (err instanceof SankeyError) throw err;
    throw new SankeyError('Failed to prepare Sankey data', { error: err });
  }
}

/**
 * Applies standard D3 Sankey layout to data
 */
export function applyStandardLayout(
  sankeyData: SankeyData,
  width: number,
  height: number,
  options?: any
): { layoutNodes: SankeyNode[], layoutLinks: SankeyLink[] } {
  if (!sankeyData || !sankeyData.nodes || !sankeyData.links) {
    throw new SankeyError('Invalid Sankey data provided for layout', { sankeyData });
  }
  
  try {
    // Get node width and padding from options or defaults
    const nodeWidth = options?.node?.width || DEFAULT_CONFIG.NODE.WIDTH;
    const nodePadding = options?.node?.padding || DEFAULT_CONFIG.NODE.PADDING;
    
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([[1, 1], [width - 1, height - 1]]);
    
    const result = sankeyGenerator(sankeyData);
    
    if (!result || !result.nodes || !result.links) {
      throw new SankeyError('Sankey generator returned invalid result', { result });
    }
    
    // Return in the expected format
    return { 
      layoutNodes: result.nodes, 
      layoutLinks: result.links 
    };
  } catch (err) {
    console.error('Error applying standard Sankey layout:', err);
    // Return empty structures to avoid breaking the UI
    return { 
      layoutNodes: [], 
      layoutLinks: [] 
    };
  }
}

/**
 * Applies custom positioning for nodes based on column position
 * Configurable through options parameter
 */
export function applyCustomLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  width: number,
  height: number,
  options?: any
): { layoutNodes: SankeyNode[], layoutLinks: SankeyLink[] } {
  if (!nodes || !links) {
    throw new SankeyError('Invalid nodes or links provided for custom layout', { 
      hasNodes: !!nodes, 
      hasLinks: !!links 
    });
  }
  
  try {
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
      } else {
        // Default sizing for other left nodes
        nodeHeight = Math.max(30, diagramHeight * 0.15);
        node.y0 = leftY;
        node.y1 = leftY + nodeHeight;
        leftY += nodeHeight + 15;
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
      const nodeWidth = options?.node?.width || DEFAULT_CONFIG.NODE.WIDTH;
      
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
    
    // Create a node ID to node object map for faster lookups
    const nodeById = new Map(layoutNodes.map(node => [node.id, node]));
    
    // Process links to match between the predefined nodes
    const layoutLinks = links.map((link, index) => {
      try {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        
        const sourceNode = nodeById.get(sourceId);
        const targetNode = nodeById.get(targetId);
        
        if (!sourceNode || !targetNode) {
          throw new SankeyError('Source or target node not found', { 
            sourceId, 
            targetId, 
            sourceFound: !!sourceNode, 
            targetFound: !!targetNode, 
            link 
          });
        }
        
        return {
          ...link,
          source: sourceNode,
          target: targetNode,
          width: Math.max(1, 2 * Math.sqrt(link.value || 1))
        } as SankeyLink;
      } catch (err) {
        console.error(`Error processing link at index ${index}:`, err);
        
        // If we don't have any valid nodes, we can't create a fallback link
        if (layoutNodes.length === 0) {
          throw new SankeyError('No valid nodes available for fallback link', { error: err });
        }
        
        // Return a placeholder to avoid breaking the UI
        return {
          source: layoutNodes[0],
          target: layoutNodes[0],
          value: 0,
          width: 0,
          opacity: 0,
          color: 'transparent',
          details: 'Error: Invalid link data'
        } as SankeyLink;
      }
    });
    
    return { layoutNodes, layoutLinks };
  } catch (err) {
    console.error('Error applying custom layout:', err);
    // Return empty structures to avoid breaking the UI
    return { layoutNodes: [], layoutLinks: [] };
  }
}

/**
 * Gets the appropriate flow divisor based on node names
 * Can be customized through options
 */
export function getFlowDivisor(
  sourceNode: SankeyNode, 
  targetNode: SankeyNode, 
  options?: any
): number {
  if (!sourceNode || !targetNode) {
    return DEFAULT_CONFIG.FLOW_DIVISORS.BASE; // Default divisor
  }
  
  try {
    // Get custom divisors from options or use defaults
    const baseDivisor = options?.flowDivisors?.base || DEFAULT_CONFIG.FLOW_DIVISORS.BASE;
    const customValues = options?.flowDivisors?.customValues || DEFAULT_CONFIG.FLOW_DIVISORS.CUSTOM_VALUES;
    
    // Start with base divisor
    let divisor = baseDivisor;
    
    // Check for source node specific divisor
    if (customValues[sourceNode.name]) {
      divisor = customValues[sourceNode.name];
    }
    
    // For center node to specific target, check for more specific mapping
    if (sourceNode.id === 'center_0x257MTCADDR') {
      const combinedKey = `center_0x257MTCADDR_to_${targetNode.name}`;
      if (customValues[combinedKey]) {
        divisor = customValues[combinedKey];
      }
    }
    
    return divisor;
  } catch (err) {
    console.error('Error getting flow divisor:', err);
    return DEFAULT_CONFIG.FLOW_DIVISORS.BASE; // Default divisor as fallback
  }
}

/**
 * Calculates appropriate widths for flows based on value
 * Can be customized through options
 */
export function calculateFlowWidths(
  value: number,
  divisor: number = DEFAULT_CONFIG.FLOW_DIVISORS.BASE,
  isTerminating: boolean = false,
  options?: any
): { sourceWidth: number, targetWidth: number, midWidth?: number } {
  try {
    // Get configuration values from options or use defaults
    const minWidthStandard = options?.link?.minWidth || DEFAULT_CONFIG.LINK.MIN_WIDTH_STANDARD;
    const maxWidthStandard = options?.link?.maxWidth || DEFAULT_CONFIG.LINK.MAX_WIDTH_STANDARD;
    const minWidthTerminating = options?.link?.minWidthTerminating || DEFAULT_CONFIG.LINK.MIN_WIDTH_TERMINATING;
    const maxWidthTerminating = options?.link?.maxWidthTerminating || DEFAULT_CONFIG.LINK.MAX_WIDTH_TERMINATING;
    
    // Ensure value and divisor are valid numbers
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    const safeDivisor = typeof divisor === 'number' && !isNaN(divisor) && divisor > 0 ? 
      divisor : DEFAULT_CONFIG.FLOW_DIVISORS.BASE;
    
    if (isTerminating) {
      const sourceWidth = Math.min(
        maxWidthStandard,
        Math.max(minWidthStandard, safeValue / safeDivisor)
      );
      const midWidth = Math.min(
        maxWidthTerminating,
        Math.max(minWidthTerminating, safeValue / (safeDivisor * 1.3))
      );
      return { sourceWidth, targetWidth: 0, midWidth };
    } else {
      const sourceWidth = Math.min(
        maxWidthStandard,
        Math.max(minWidthStandard, safeValue / safeDivisor)
      );
      const targetWidth = Math.min(
        maxWidthStandard,
        Math.max(minWidthStandard, safeValue / safeDivisor)
      );
      return { sourceWidth, targetWidth };
    }
  } catch (err) {
    console.error('Error calculating flow widths:', err);
    // Return safe default widths
    return { 
      sourceWidth: DEFAULT_CONFIG.LINK.MIN_WIDTH_STANDARD, 
      targetWidth: isTerminating ? 0 : DEFAULT_CONFIG.LINK.MIN_WIDTH_STANDARD
    };
  }
}