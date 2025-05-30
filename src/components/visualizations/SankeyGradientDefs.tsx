import { Selection } from 'd3';
import { SankeyLink, SankeyNode } from './SankeyTypes';

interface SankeyGradientDefsProps {
  links: SankeyLink[];
  svgSelection: Selection<SVGSVGElement, unknown, null, undefined>;
}

/**
 * Utility class that generates gradient definitions for Sankey links
 */
class SankeyGradientDefs {
  private links: SankeyLink[];
  private svgSelection: Selection<SVGSVGElement, unknown, null, undefined>;
  
  constructor({ links, svgSelection }: SankeyGradientDefsProps) {
    this.links = links;
    this.svgSelection = svgSelection;
    this.createGradientDefs();
  }
  
  /**
   * Creates gradient definitions for links
   */
  private createGradientDefs(): void {
    // Clear any existing defs
    this.svgSelection.select("defs").remove();
    
    // Create new defs element
    const defs = this.svgSelection.append("defs");
    
    // Add gradient definitions for each link
    this.links.forEach((link: SankeyLink, i: number) => {
      if (link.gradientStart && link.gradientEnd) {
        const gradientId = `link-gradient-${i}`;
        const gradient = defs.append("linearGradient")
          .attr("id", gradientId)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", () => {
            const sourceNode = link.source as SankeyNode;
            return sourceNode.x1 || 0;
          })
          .attr("y1", () => {
            const sourceNode = link.source as SankeyNode;
            return (sourceNode.y0 || 0) + ((sourceNode.y1 || 0) - (sourceNode.y0 || 0)) / 2;
          })
          .attr("x2", () => {
            const targetNode = link.target as SankeyNode;
            return targetNode.x0 || 0;
          })
          .attr("y2", () => {
            const targetNode = link.target as SankeyNode;
            return (targetNode.y0 || 0) + ((targetNode.y1 || 0) - (targetNode.y0 || 0)) / 2;
          });
          
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", link.gradientStart);
          
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", link.gradientEnd);
        
        // Assign the gradient ID to the link for later use
        link.gradientId = gradientId;
      }
    });
  }
}

export default SankeyGradientDefs;