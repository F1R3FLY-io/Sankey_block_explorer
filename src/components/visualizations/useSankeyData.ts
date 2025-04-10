import { useCallback, useMemo } from 'react';
import { 
  SankeyData, 
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
}

interface UseSankeyDataResult {
  layoutNodes: SankeyNode[];
  layoutLinks: SankeyLink[];
  layoutType: SankeyLayoutType;
  hasColumnPositions: boolean;
}

/**
 * Hook for processing Sankey diagram data and applying the appropriate layout
 */
const useSankeyData = (
  { nodes, links, width, height }: UseSankeyDataProps
): UseSankeyDataResult => {
  // Determine the layout type based on the data
  const layoutType = useMemo(
    () => determineLayoutType(links),
    [links]
  );
  
  // Create a node map for faster lookups
  const nodeMap = useMemo(
    () => createNodeMap(nodes),
    [nodes]
  );
  
  // Check if nodes have explicit column positions
  const hasColumnPositions = useMemo(
    () => layoutType === SankeyLayoutType.CUSTOM,
    [layoutType]
  );
  
  // Process the data and apply layout
  const processData = useCallback(() => {
    // For parallel layouts, return the original data
    if (layoutType === SankeyLayoutType.PARALLEL) {
      return { 
        layoutNodes: nodes, 
        layoutLinks: links 
      };
    }
    
    // For custom layouts with explicit column positions
    if (layoutType === SankeyLayoutType.CUSTOM) {
      return applyCustomLayout(nodes, links, width, height);
    }
    
    // For standard Sankey layout
    const sankeyData = prepareSankeyData(nodes, links, nodeMap, hasColumnPositions);
    return applyStandardLayout(sankeyData, width, height);
  }, [nodes, links, nodeMap, layoutType, hasColumnPositions, width, height]);
  
  // Apply the layout and return processed data
  const { layoutNodes, layoutLinks } = useMemo(
    () => processData(),
    [processData]
  );
  
  return {
    layoutNodes,
    layoutLinks,
    layoutType,
    hasColumnPositions
  };
};

export default useSankeyData;