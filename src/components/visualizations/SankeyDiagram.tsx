import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { SankeyDiagramProps, SankeyLayoutType } from './SankeyTypes';
import useSankeyData from './useSankeyData';
import ParallelLinesRenderer from './ParallelLinesRenderer';
import SankeyNode from './SankeyNode';
import SankeyLink from './SankeyLink';
import SankeyGradientDefs from './SankeyGradientDefs';

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
  
  // Process data through the custom hook
  const { 
    layoutNodes, 
    layoutLinks, 
    layoutType, 
    hasColumnPositions 
  } = useSankeyData({
    nodes,
    links,
    width: containerRef.current?.clientWidth || 800,
    height: containerRef.current?.clientHeight || 600
  });
  
  /**
   * Main function to update and render the diagram
   * Wrapped in useCallback to avoid re-creation on each render
   */
  const updateDiagram = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !nodes.length || !links.length) {
      console.warn("Can't update diagram - missing elements:", {
        svgRef: !!svgRef.current,
        containerRef: !!containerRef.current,
        nodesLength: nodes.length,
        linksLength: links.length
      });
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);

    // Get the container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

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
  }, [nodes, links, options, layoutNodes, layoutLinks, layoutType, hasColumnPositions]);

  // Effect to update diagram when data or container changes
  useEffect(() => {
    updateDiagram();
    
    // Add resize listener
    const handleResize = () => {
      updateDiagram();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
export type { SankeyDiagramProps, SankeyLayoutType };
export default SankeyDiagram;
