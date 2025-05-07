import { useMemo } from 'react';
import { 
  SankeyLayoutType, 
  SankeyLink, 
  SankeyNode 
} from './SankeyTypes';
import { 
  applyCustomLayout, 
  applyStandardLayout, 
  createNodeMap, 
  determineLayoutType, 
  prepareSankeyData 
} from './SankeyUtils';

interface UseSankeyDataProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width: number;
  height: number;
  options?: any;
}

interface UseSankeyDataResult {
  layoutNodes: SankeyNode[];
  layoutLinks: SankeyLink[];
  layoutType: SankeyLayoutType;
  hasColumnPositions: boolean;
}

/**
 * Hook for processing Sankey diagram data and applying the appropriate layout
 * 
 * Manages the flow of data processing and layout application for Sankey diagrams
 * with intelligent detection of layout type and node positioning.
 */
const useSankeyData = (
  { nodes, links, width, height, options }: UseSankeyDataProps
): UseSankeyDataResult => {
  // Determine the layout type based on the data
  // This is memoized to prevent recalculation unless links change
  const layoutType = useMemo(
    () => determineLayoutType(links),
    // Only recompute when links structure changes
    [links]
  );
  
  // Create a node map for faster lookups
  // This is memoized to prevent recreation unless nodes change
  const nodeMap = useMemo(
    () => createNodeMap(nodes),
    // Only recompute when nodes structure changes
    [nodes]
  );
  
  // Check if nodes have explicit column positions
  // Simple derivation from layout type that doesn't need additional dependencies
  const hasColumnPositions = useMemo(
    () => layoutType === SankeyLayoutType.CUSTOM,
    [layoutType]
  );
  
  // Process the data and apply layout based on the determined type
  // This callback handles all logic for choosing and applying the appropriate layout
  const processedData = useMemo(() => {
    // For parallel layouts (self-referential links), return original data
    if (layoutType === SankeyLayoutType.PARALLEL) {
      return { 
        layoutNodes: nodes, 
        layoutLinks: links 
      };
    }
    
    // For custom layouts with explicit column positions
    if (layoutType === SankeyLayoutType.CUSTOM) {
      return applyCustomLayout(nodes, links, width, height, options);
    }
    
    // For standard Sankey layout using d3-sankey
    const sankeyData = prepareSankeyData(nodes, links, nodeMap, hasColumnPositions);
    return applyStandardLayout(sankeyData, width, height, options);
  }, [
    // All dependencies that could affect the layout calculation
    nodes, 
    links, 
    nodeMap, 
    layoutType, 
    hasColumnPositions, 
    width, 
    height,
    options
  ]);
  
  // Return the processed data and metadata
  return {
    layoutNodes: processedData.layoutNodes,
    layoutLinks: processedData.layoutLinks,
    layoutType,
    hasColumnPositions
  };
};

export default useSankeyData;