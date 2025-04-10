import * as d3 from 'd3';
import { SankeyNode as SankeyNodeType } from './SankeyTypes';
import { CONSTANTS } from './SankeyUtils';

interface SankeyNodeProps {
  nodes: SankeyNodeType[];
  hasColumnPositions: boolean;
  width: number;
  svgSelection?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
}

/**
 * Utility class for rendering Sankey diagram nodes
 */
class SankeyNode {
  private nodes: SankeyNodeType[];
  private hasColumnPositions: boolean;
  private width: number;
  private svg: d3.Selection<SVGElement | SVGSVGElement, unknown, null, undefined>;
  private selection: d3.Selection<any, any, SVGElement | null, unknown>;

  constructor({ nodes, hasColumnPositions, width, svgSelection }: SankeyNodeProps) {
    this.nodes = nodes;
    this.hasColumnPositions = hasColumnPositions;
    this.width = width;
    
    // Get or find the SVG element
    this.svg = svgSelection || d3.select('svg');
    
    // Create selection for nodes
    this.selection = this.svg.append("g")
      .selectAll("g")
      .data(this.nodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x0 || 0},${d.y0 || 0})`);
    
    this.renderNodes();
    this.renderNodeLabels();
  }
  
  /**
   * Renders the nodes in the D3 selection
   */
  private renderNodes(): void {
    // Node rendering approach depending on the visualization type
    if (this.hasColumnPositions) {
      // For spec-matching visualization, render wider, more distinctive nodes
      this.selection.append("rect")
        .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
        .attr("width", (d) => {
          // Make nodes wider according to column position
          if (d.columnPosition === 'left') return CONSTANTS.NODE_WIDTH;
          if (d.columnPosition === 'center') return CONSTANTS.NODE_WIDTH;
          if (d.columnPosition === 'right') return CONSTANTS.NODE_WIDTH;
          return (d.x1 || 0) - (d.x0 || 0);
        })
        .style("fill", (d: SankeyNodeType) => d.color || "#69b3a2")
        .style("stroke", "none") // No stroke for the spec visualization
        .style("opacity", 1); // Full opacity for the spec visualization
    } else {
      // Standard node rendering for other visualizations
      this.selection.append("rect")
        .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
        .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
        .style("fill", (d: SankeyNodeType) => d.color || "#69b3a2")
        .style("stroke", (d: SankeyNodeType) => d.color || "#69b3a2")
        .style("opacity", CONSTANTS.DEFAULT_NODE_OPACITY);
    }
  }

  /**
   * Renders the node labels
   */
  private renderNodeLabels(): void {
    const width = this.width;
    
    // Add node labels with improved positioning
    this.selection.append("g")
      .attr("transform", (d) => {
        const x = ((d.x0 || 0) < width / 2) ? (d.x1 || 0) - (d.x0 || 0) + 6 : -6;
        const y = ((d.y1 || 0) - (d.y0 || 0)) / 2;
        return `translate(${x},${y})`;
      })
      .selectAll("text")
      .data((d) => [d.name])
      .join("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .attr("text-anchor", (_, i, nodes) => {
        const element = nodes[i] as SVGTextElement;
        const parent = element.parentElement;
        if (!parent) return "start";
        const parentData = d3.select(parent).datum() as SankeyNodeType;
        return (parentData.x0 || 0) < width / 2 ? "start" : "end";
      })
      .style("fill", "#ffffff")
      .style("font-size", function(d) {
        // Customized font size for the Phlo visualization
        const textLength = d.length;
        
        try {
          // Safely get the parent node's data with proper type casting
          const element = this as SVGTextElement;
          const parentNode = element.parentNode as Element;
          if (!parentNode) return "12px"; 
          
          const node = d3.select(parentNode).datum() as SankeyNodeType;
          
          // For spec visualization, use slightly different font sizes
          if (node?.columnPosition) {
            // Larger font for addresses, smaller for values
            if (d.startsWith('0x') || d.includes('Low activity')) {
              return "12px";
            } else {
              return "11px";
            }
          }
        } catch (e) {
          // Fallback if there's any error
          console.warn('Error setting font size:', e);
        }
        
        return textLength > 15 ? "10px" : "12px";
      })
      .style("font-weight", "bold")
      .style("paint-order", "stroke")
      .style("stroke", "#000000")
      .style("stroke-width", "2px")
      .style("stroke-linecap", "butt")
      .style("stroke-linejoin", "miter")
      .text(d => d)
      // Add a second label for the values when following the spec's appearance
      .each(function() {
        try {
          // Safely get the parent node with proper type casting
          const element = this as SVGTextElement;
          const parentNode = element.parentNode as Element;
          if (!parentNode) return;
          
          const nodeElement = d3.select(parentNode);
          const node = nodeElement.datum() as SankeyNodeType;
          
          // Only add value labels for nodes with columnPosition (spec visualization)
          if (node?.columnPosition && node.value) {
            // Position differently based on column
            let xOffset = 0;
            let yOffset = 20; // Default below the name
            
            if (node.columnPosition === 'left') {
              xOffset = 0;
            } else if (node.columnPosition === 'right') {
              xOffset = 0;
            } else if (node.columnPosition === 'center') {
              xOffset = 0;
              yOffset = 25;
            }
            
            // Format the value with commas
            const formattedValue = node.value.toLocaleString();
            
            nodeElement.append("text")
              .attr("x", xOffset)
              .attr("y", yOffset)
              .attr("dy", "0.35em")
              .attr("text-anchor", node.columnPosition === 'left' ? "end" : 
                                  node.columnPosition === 'right' ? "start" : "middle")
              .style("fill", "#ffffff")
              .style("font-size", "11px")
              .style("font-weight", "normal")
              .style("paint-order", "stroke")
              .style("stroke", "#000000")
              .style("stroke-width", "1px")
              .style("stroke-linecap", "butt")
              .style("stroke-linejoin", "miter")
              .text(formattedValue);
          }
        } catch (e) {
          // Fallback if there's any error
          console.warn('Error setting value label:', e);
        }
      });
  }
}

export default SankeyNode;