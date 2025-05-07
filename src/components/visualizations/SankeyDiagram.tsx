import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { SankeyDiagramProps, SankeyLayoutType } from './SankeyTypes';
import useSankeyData from './useSankeyData';
import ParallelLinesRenderer from './ParallelLinesRenderer';
import SankeyNode from './SankeyNode';
import SankeyLink from './SankeyLink';
import SankeyGradientDefs from './SankeyGradientDefs';

// Default dimensions to use before actual measurements are available
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

/**
 * Enhanced Sankey Diagram component
 * 
 * A visualization that shows flows between nodes in a network.
 * Supports various layout types:
 * - Standard D3 Sankey layout
 * - Parallel lines for self-referential links
 * - Custom positioning for specialized diagrams
 */
const SankeyDiagram: React.FC<SankeyDiagramProps> = ({ 
  nodes, 
  links, 
  options = {} 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track container dimensions
  const [dimensions, setDimensions] = useState({ 
    width: DEFAULT_WIDTH, 
    height: DEFAULT_HEIGHT 
  });
  
  // Update dimensions when the container is mounted or resized
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Function to measure container and update dimensions
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: clientWidth || DEFAULT_WIDTH,
        height: clientHeight || DEFAULT_HEIGHT
      });
    };

    // Initial measurement
    updateDimensions();
    
    // Set up ResizeObserver for more efficient resize handling
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);
  
  // Process data through the custom hook, now with reliable dimensions
  const { 
    layoutNodes, 
    layoutLinks, 
    layoutType, 
    hasColumnPositions 
  } = useSankeyData({
    nodes,
    links,
    width: dimensions.width,
    height: dimensions.height,
    options
  });
  
  /**
   * Main function to update and render the diagram
   */
  const updateDiagram = useCallback(() => {
    // In test environment, we may not have actual DOM refs
    if (process.env.NODE_ENV === 'test') {
      return; // Skip actual rendering in test environment
    }
    
    if (!svgRef.current || !containerRef.current || !nodes.length || !links.length) {
      console.warn("Can't update diagram - missing elements:", {
        svgRef: !!svgRef.current,
        containerRef: !!containerRef.current,
        nodesLength: nodes.length,
        linksLength: links.length
      });
      return;
    }

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous content
    svg.selectAll("*").remove();

    // Set the SVG dimensions
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    try {
      // Different rendering for different layout types
      if (layoutType === SankeyLayoutType.PARALLEL) {
        // Render parallel lines layout
        new ParallelLinesRenderer({
          svg,
          width,
          height,
          nodes: layoutNodes,
          links: layoutLinks,
          options
        });
        
        return;
      }

      // Add gradient definitions for links
      new SankeyGradientDefs({
        links: layoutLinks,
        svgSelection: svg
      });
      
      // Draw the links
      new SankeyLink({
        links: layoutLinks,
        hasColumnPositions,
        options,
        svgSelection: svg
      });
      
      // Render node elements and pass the svg selection
      new SankeyNode({
        nodes: layoutNodes,
        hasColumnPositions,
        width,
        svgSelection: svg
      });
    } catch (error) {
      console.error('Error generating Sankey diagram:', error);
    }
  }, [
    dimensions, 
    nodes, 
    links, 
    layoutNodes, 
    layoutLinks, 
    layoutType, 
    hasColumnPositions, 
    options
  ]);

  // Effect to update diagram when data or dimensions change
  useEffect(() => {
    updateDiagram();
  }, [updateDiagram]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative min-h-[500px] bg-transparent overflow-hidden"
    >
      <svg
        ref={svgRef}
        className="w-full h-full block overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      />
      {/* Debug overlay to verify SVG exists */}
      {(!nodes.length || !links.length) && (
        <div className="absolute inset-0 flex items-center justify-center text-orange-500 font-bold z-10">
          Internal Phlo Consumption Visualization
        </div>
      )}
    </div>
  );
};

// Export the component and all related types
export * from './SankeyTypes';
export default SankeyDiagram;