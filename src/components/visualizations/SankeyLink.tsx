import * as d3 from 'd3';
import { SankeyLink as SankeyLinkType, SankeyNode } from './SankeyTypes';
import { CONSTANTS } from './SankeyUtils';
import { generateSankeyPath } from './SankeyPathGenerators';
import { formatTooltipDetails } from '../../utils/capsUtils';

interface SankeyLinkProps {
  links: SankeyLinkType[];
  hasColumnPositions: boolean;
  options: {
    link?: {
      opacity?: number;
    };
  };
  svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined>;
}

/**
 * Utility class for rendering Sankey diagram links (flows)
 */
class SankeyLink {
  private links: SankeyLinkType[];
  private hasColumnPositions: boolean;
  private options: { link?: { opacity?: number } };
  private svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  
  constructor({ links, hasColumnPositions, options, svgSelection }: SankeyLinkProps) {
    this.links = links;
    this.hasColumnPositions = hasColumnPositions;
    this.options = options;
    this.svgSelection = svgSelection;
    
    this.renderLinks();
  }
  
  /**
   * Creates a tooltip for the given link
   */
  private createTooltip(
    link: SankeyLinkType, 
    x: number, 
    y: number
  ): void {
    if (!link.details) return;
    
    const tooltip = this.svgSelection.append("g")
      .attr("class", "tooltip")
      .attr("transform", `translate(${x},${y})`);

    // Always format tooltip details to use the correct token name (Phlo or CAPS)
    const formattedDetails = formatTooltipDetails(link.details);
    
    // For custom positioned nodes, add a background
    if (this.hasColumnPositions) {
      tooltip.append("rect")
        .attr("x", -10)
        .attr("y", -20)
        .attr("width", formattedDetails.length * 7) // Approximate width
        .attr("height", 30)
        .attr("fill", "#000")
        .attr("opacity", 0.7)
        .attr("rx", 5);
    }
    
    // Add the text - apply CAPS formatting if in CAPS mode
    tooltip.append("text")
      .text(formattedDetails.replace(/\n/g, ' '))
      .attr("x", 5)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("fill", "#ffffff");
  }
  
  /**
   * Handles mouseover event for links
   */
  private handleMouseOver(
    _event: MouseEvent, 
    link: SankeyLinkType, 
    element: SVGPathElement
  ): void {
    if (this.hasColumnPositions) {
      // For the spec visualization
      d3.select(element).style("fill-opacity", 1.0);

      // Get source and target nodes for tooltip positioning
      const sourceNode = link.source as SankeyNode;
      const targetNode = link.target as SankeyNode;
      
      if (link.details) {
        // Find the middle point of the path for tooltip placement
        const sourceX = (sourceNode.x1 || 0);
        const sourceY = ((sourceNode.y0 || 0) + (sourceNode.y1 || 0)) / 2;
        const targetX = (targetNode.x0 || 0);
        const targetY = ((targetNode.y0 || 0) + (targetNode.y1 || 0)) / 2;
        
        const xCenter = (sourceX + targetX) / 2;
        const yCenter = (sourceY + targetY) / 2;
        
        this.createTooltip(link, xCenter, yCenter);
      }
    } else {
      // Standard behavior for other visualizations
      d3.select(element)
        .style("stroke-opacity", 1.0)
        .style("stroke-width", Math.max(3, (link.width || 0) * 1.5))
        .style("stroke-dasharray", link.isInternalConsumption ? "5,3" : "none");
        
      if (link.details) {
        const sourceNode = link.source as SankeyNode;
        const targetNode = link.target as SankeyNode;
        const xCenter = (sourceNode.x0! + sourceNode.x1! + targetNode.x0! + targetNode.x1!) / 4;
        const yCenter = (sourceNode.y0! + sourceNode.y1! + targetNode.y0! + targetNode.y1!) / 4;
        
        this.createTooltip(link, xCenter, yCenter);
      }
    }
  }
  
  /**
   * Handles mouseout event for links
   */
  private handleMouseOut(
    _event: MouseEvent, 
    link: SankeyLinkType, 
    element: SVGPathElement
  ): void {
    if (this.hasColumnPositions) {
      // For the spec visualization
      d3.select(element).style("fill-opacity", 0.85); // Reset opacity
    } else {
      // Standard behavior
      d3.select(element)
        .style("stroke-opacity", link.opacity || (
          link.isInternalConsumption 
            ? CONSTANTS.INTERNAL_CONSUMPTION_OPACITY 
            : (this.options.link?.opacity || CONSTANTS.DEFAULT_LINK_OPACITY))
        )
        .style("stroke-width", link.isInternalConsumption 
          ? Math.max(3, (link.width || 0) * 1.5) 
          : Math.max(1, link.width || 0)
        )
        .style("stroke-dasharray", link.dashArray || (
          link.isInternalConsumption ? "10,5" : "none"
        ));
    }
    
    this.svgSelection.selectAll(".tooltip").remove();
  }
  
  /**
   * Renders the links using D3
   */
  private renderLinks(): void {
    // Use event listeners with arrow functions to preserve 'this' context
    
    const linkElements = this.svgSelection.append("g")
      .selectAll("path")
      .data(this.links)
      .join("path")
      .attr("d", link => generateSankeyPath(link, this.hasColumnPositions))
      .style("fill", (link: SankeyLinkType) => {
        // For the special visualization with gradients
        if (this.hasColumnPositions) {
          if (link.gradientId) {
            return `url(#${link.gradientId})`;
          }
          return link.color || "#aaa";
        }
        return "none";
      })
      .style("stroke", (link: SankeyLinkType) => {
        // For standard visualization, use stroke
        if (this.hasColumnPositions) {
          return "none"; // No stroke for the spec visualization
        }
        return link.color || "#aaa";
      })
      .style("stroke-opacity", (link: SankeyLinkType) => {
        if (this.hasColumnPositions) return 0; // No stroke for the spec visualization
        return link.opacity || (
          link.isInternalConsumption 
            ? CONSTANTS.INTERNAL_CONSUMPTION_OPACITY 
            : (this.options.link?.opacity || CONSTANTS.DEFAULT_LINK_OPACITY)
        );
      })
      .style("fill-opacity", () => {
        if (this.hasColumnPositions) return 0.95; // Higher fill opacity for the spec visualization
        return 0; // No fill for standard visualization
      })
      .style("stroke-dasharray", (link: SankeyLinkType) => 
        link.dashArray || (link.isInternalConsumption ? "10,5" : "none")
      )
      .style("stroke-width", (link) => {
        // For the standard visualization
        if (!this.hasColumnPositions) {
          return link.isInternalConsumption 
            ? Math.max(3, (link.width || 0) * 1.5) 
            : Math.max(1, link.width || 0);
        }
        return 0; // No stroke width for the spec visualization
      });

    // Add event listeners directly to the selection elements
    linkElements
      .on("mouseover", (event, link) => { 
        this.handleMouseOver(event, link, event.currentTarget as SVGPathElement);
      })
      .on("mouseout", (event, link) => {
        this.handleMouseOut(event, link, event.currentTarget as SVGPathElement);
      });
  }
}

export default SankeyLink;