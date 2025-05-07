import * as d3 from 'd3';
import { SankeyNode as SankeyNodeType } from './SankeyTypes';
import { DEFAULT_CONFIG } from './SankeyUtils';

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
  private svg: d3.Selection<any, unknown, null, undefined>;
  private selection: d3.Selection<any, any, any, unknown>;

  constructor({ nodes, hasColumnPositions, width, svgSelection }: SankeyNodeProps) {
    this.nodes = nodes;
    this.hasColumnPositions = hasColumnPositions;
    this.width = width;
    
    // Get or find the SVG element
    this.svg = svgSelection || d3.select('svg') as any;
    
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
    try {
      // Check if selection has append method before proceeding
      if (!this.selection || typeof this.selection.append !== 'function') {
        console.warn('Invalid selection or missing append method');
        return;
      }
      
      // Node rendering approach depending on the visualization type
      if (this.hasColumnPositions) {
        // For spec-matching visualization, render wider, more distinctive nodes
        const rect = this.selection.append("rect");
        
        if (!rect || typeof rect.attr !== 'function') {
          console.warn('Could not create rect element');
          return;
        }
        
        rect.attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
            .attr("width", (d) => {
              // Make nodes wider according to column position
              if (d.columnPosition === 'left') return DEFAULT_CONFIG.NODE.WIDTH;
              if (d.columnPosition === 'center') return DEFAULT_CONFIG.NODE.WIDTH;
              if (d.columnPosition === 'right') return DEFAULT_CONFIG.NODE.WIDTH;
              return (d.x1 || 0) - (d.x0 || 0);
            });
            
        // Check if style method exists before using
        if (rect && typeof rect.style === 'function') {
          rect.style("fill", (d: SankeyNodeType) => d.color || "#69b3a2")
              .style("stroke", "none") // No stroke for the spec visualization
              .style("opacity", 1); // Full opacity for the spec visualization
        }
      } else {
        // Standard node rendering for other visualizations
        const rect = this.selection.append("rect");
        
        if (!rect || typeof rect.attr !== 'function') {
          console.warn('Could not create rect element');
          return;
        }
        
        rect.attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
            .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0));
            
        // Check if style method exists before using
        if (rect && typeof rect.style === 'function') {
          rect.style("fill", (d: SankeyNodeType) => d.color || "#69b3a2")
              .style("stroke", (d: SankeyNodeType) => d.color || "#69b3a2")
              .style("opacity", DEFAULT_CONFIG.NODE.OPACITY);
        }
      }
    } catch (error) {
      console.warn('Error rendering nodes:', error);
    }
  }

  /**
   * Renders the node labels
   */
  private renderNodeLabels(): void {
    try {
      if (!this.selection || typeof this.selection.append !== 'function') {
        console.warn('Invalid selection or missing append method');
        return;
      }
      
      const width = this.width;
      
      // Add node labels with improved positioning
      const labelGroup = this.selection.append("g");
      
      if (!labelGroup || typeof labelGroup.attr !== 'function') {
        console.warn('Could not create label group');
        return;
      }
      
      labelGroup.attr("transform", (d) => {
        const x = ((d.x0 || 0) < width / 2) ? (d.x1 || 0) - (d.x0 || 0) + 6 : -6;
        const y = ((d.y1 || 0) - (d.y0 || 0)) / 2;
        return `translate(${x},${y})`;
      });
      
      // Check if selectAll and other methods are available
      if (!labelGroup || typeof labelGroup.selectAll !== 'function') {
        console.warn('Missing selectAll method');
        return;
      }
      
      const textSelection = labelGroup.selectAll("text")
        .data((d) => [d.name]);
        
      if (!textSelection || typeof textSelection.join !== 'function') {
        console.warn('Invalid text selection or missing join method');
        return; 
      }
      
      const textElements = textSelection.join("text");
      
      if (!textElements || typeof textElements.attr !== 'function') {
        console.warn('Invalid text elements or missing attr method');
        return;
      }
      
      textElements
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .attr("text-anchor", (_, i, nodes) => {
          try {
            if (!nodes || !nodes[i]) return "start";
            const element = nodes[i] as SVGTextElement;
            const parent = element.parentElement;
            if (!parent) return "start";
            
            const parentData = d3.select(parent).datum() as SankeyNodeType;
            if (!parentData) return "start";
            
            return (parentData.x0 || 0) < width / 2 ? "start" : "end";
          } catch (e) {
            console.warn('Error setting text anchor:', e);
            return "start";
          }
        });
      
      // Check if style method is available
      if (textElements && typeof textElements.style === 'function') {
        textElements
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
          .style("stroke-linejoin", "miter");
      }
      
      // Check if text method is available
      if (textElements && typeof textElements.text === 'function') {
        textElements.text(d => d);
      }
      
      // Check if each method is available
      if (textElements && typeof textElements.each === 'function') {
        // Add a second label for the values when following the spec's appearance
        textElements.each(function() {
          try {
            // Safely get the parent node with proper type casting
            const element = this as SVGTextElement;
            const parentNode = element.parentNode as Element;
            if (!parentNode) return;
            
            const nodeElement = d3.select(parentNode);
            if (!nodeElement || typeof nodeElement.datum !== 'function') return;
            
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
              
              // Check if nodeElement has append method
              if (!nodeElement || typeof nodeElement.append !== 'function') return;
              
              const valueText = nodeElement.append("text");
              
              // Check if valueText has attr method
              if (!valueText || typeof valueText.attr !== 'function') return;
              
              valueText
                .attr("x", xOffset)
                .attr("y", yOffset)
                .attr("dy", "0.35em")
                .attr("text-anchor", node.columnPosition === 'left' ? "end" : 
                                    node.columnPosition === 'right' ? "start" : "middle");
                
              // Check if valueText has style method                 
              if (valueText && typeof valueText.style === 'function') {
                valueText
                  .style("fill", "#ffffff")
                  .style("font-size", "11px")
                  .style("font-weight", "normal")
                  .style("paint-order", "stroke")
                  .style("stroke", "#000000")
                  .style("stroke-width", "1px")
                  .style("stroke-linecap", "butt")
                  .style("stroke-linejoin", "miter");
              }
              
              // Check if valueText has text method
              if (valueText && typeof valueText.text === 'function') {
                valueText.text(formattedValue);
              }
            }
          } catch (e) {
            // Fallback if there's any error
            console.warn('Error setting value label:', e);
          }
        });
      }
    } catch (error) {
      console.warn('Error rendering node labels:', error);
    }
  }
}

export default SankeyNode;