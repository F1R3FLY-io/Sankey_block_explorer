import { sankeyLinkHorizontal } from 'd3-sankey';
import { PathParams, SankeyLink, SankeyNode } from './SankeyTypes';
import { CONSTANTS, calculateFlowWidths, getFlowDivisor } from './SankeyUtils';

/**
 * Generates SVG path for a terminating flow
 * Used for flows that stop midway and don't connect to target
 */
export function generateTerminatingPath(params: PathParams): string {
  const { sourceX, sourceY, targetY, sourceWidth, midWidth = sourceWidth / 2 } = params;
  
  // For terminating flows, we'll stop halfway
  const midpointX = sourceX + 100; // Fixed distance for termination
  
  // Control points for the bezier curve
  const sourceControlX = sourceX + (midpointX - sourceX) * 0.5;
  
  // Create the terminating curve - tapers to a point
  return `
    M ${sourceX},${sourceY - sourceWidth}
    C ${sourceControlX},${sourceY - sourceWidth} ${midpointX},${targetY - midWidth} ${midpointX},${targetY}
    C ${midpointX},${targetY + midWidth} ${sourceControlX},${sourceY + sourceWidth} ${sourceX},${sourceY + sourceWidth}
    Z
  `;
}

/**
 * Generates SVG path for direct flow (low activity to output)
 * Used for flows that bypass the center node
 */
export function generateDirectPath(params: PathParams): string {
  const { sourceX, sourceY, targetX, targetY, sourceWidth, targetWidth } = params;
  
  // Calculate the middle position
  const centerX = (sourceX + targetX) / 2;
  
  // Control points for a smoother curve
  const sourceControlX = sourceX + (centerX - sourceX) * 0.5;
  
  // Create a curve that goes along a different path
  return `
    M ${sourceX},${sourceY - sourceWidth}
    C ${sourceControlX},${sourceY - sourceWidth} ${centerX},${targetY - targetWidth * 1.5} ${targetX},${targetY - targetWidth}
    L ${targetX},${targetY + targetWidth}
    C ${centerX},${targetY + targetWidth * 1.5} ${sourceControlX},${sourceY + sourceWidth} ${sourceX},${sourceY + sourceWidth}
    Z
  `;
}

/**
 * Generates SVG path for standard flow between nodes
 */
export function generateStandardPath(params: PathParams): string {
  const { sourceX, sourceY, targetX, targetY, sourceWidth, targetWidth } = params;
  
  // Control points for the bezier curve
  const sourceControlX = sourceX + (targetX - sourceX) * 0.4;
  const targetControlX = sourceX + (targetX - sourceX) * 0.6;
  
  // Create the standard flow curve
  return `
    M ${sourceX},${sourceY - sourceWidth}
    C ${sourceControlX},${sourceY - sourceWidth} ${targetControlX},${targetY - targetWidth} ${targetX},${targetY - targetWidth}
    L ${targetX},${targetY + targetWidth}
    C ${targetControlX},${targetY + targetWidth} ${sourceControlX},${sourceY + sourceWidth} ${sourceX},${sourceY + sourceWidth}
    Z
  `;
}

/**
 * Main path generator function that selects the appropriate path type
 */
export function generateSankeyPath(d: SankeyLink, hasColumnPositions: boolean): string {
  const sourceNode = d.source as SankeyNode;
  const targetNode = d.target as SankeyNode;
  
  // Early return if we don't have proper coordinates
  if (!sourceNode || !targetNode || 
      sourceNode.x0 === undefined || sourceNode.y0 === undefined || 
      targetNode.x0 === undefined || targetNode.y0 === undefined) {
    return "";
  }
  
  // For specially positioned nodes (custom layout)
  if (hasColumnPositions) {
    const sourceX = sourceNode.x1 || 0;
    const sourceY = (sourceNode.y0 || 0) + ((sourceNode.y1 || 0) - (sourceNode.y0 || 0)) / 2;
    const targetX = targetNode.x0 || 0;
    const targetY = (targetNode.y0 || 0) + ((targetNode.y1 || 0) - (targetNode.y0 || 0)) / 2;
    
    // Get the appropriate divisor for this flow
    const divisor = getFlowDivisor(sourceNode, targetNode);
    
    // Handle terminating flows (those that stop in the middle)
    if (d.isTerminating) {
      const { sourceWidth, midWidth } = calculateFlowWidths(d.value || 0, divisor, true);
      
      return generateTerminatingPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceWidth,
        targetWidth: 0,
        value: d.value,
        midWidth
      });
    }
    
    // For direct flows from low activity nodes to output
    if (sourceNode.name === '+56 Low activity\nnodes' && targetNode.name === '0x258MTCADDR') {
      const { sourceWidth, targetWidth } = calculateFlowWidths(d.value || 0, CONSTANTS.FLOW_DIVISORS.LOW_ACTIVITY);
      
      return generateDirectPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceWidth,
        targetWidth,
        value: d.value
      });
    }
    
    // Standard flow handling for other cases
    const { sourceWidth, targetWidth } = calculateFlowWidths(d.value || 0, divisor);
    
    return generateStandardPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceWidth,
      targetWidth,
      value: d.value
    });
  }
  
  // Default to standard D3 Sankey path for other cases
  const result = sankeyLinkHorizontal()(d);
  return result || "";
}