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
    try {
      // Safely check if svgSelection methods exist (for test environments)
      const hasSelectMethod = this.svgSelection && 
                              typeof this.svgSelection.select === 'function';
      const hasAppendMethod = this.svgSelection && 
                              typeof this.svgSelection.append === 'function';
      
      if (!hasSelectMethod || !hasAppendMethod) {
        console.warn('D3 selection methods not available - skipping gradient creation');
        return;
      }
      
      // Clear any existing defs
      const existingDefs = this.svgSelection.select("defs");
      if (existingDefs && typeof existingDefs.remove === 'function') {
        existingDefs.remove();
      }
      
      // Create new defs element
      const defs = this.svgSelection.append("defs");
      if (!defs || typeof defs.append !== 'function') {
        console.warn('Could not create defs element - skipping gradient creation');
        return;
      }
      
      // Add gradient definitions for each link
      this.links.forEach((link: SankeyLink, i: number) => {
        if (link.gradientStart && link.gradientEnd) {
          const gradientId = `link-gradient-${i}`;
          
          const gradient = defs.append("linearGradient");
          if (!gradient || typeof gradient.attr !== 'function') {
            console.warn('Could not create gradient - skipping');
            return;
          }
          
          gradient
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
            
          if (gradient && typeof gradient.append === 'function') {
            const startStop = gradient.append("stop");
            if (startStop && typeof startStop.attr === 'function') {
              startStop
                .attr("offset", "0%")
                .attr("stop-color", link.gradientStart);
            }
              
            const endStop = gradient.append("stop");
            if (endStop && typeof endStop.attr === 'function') {
              endStop
                .attr("offset", "100%")
                .attr("stop-color", link.gradientEnd);
            }
          }
          
          // Assign the gradient ID to the link for later use
          (link as any).gradientId = gradientId;
        }
      });
    } catch (error) {
      console.error('Error creating gradient definitions:', error);
    }
  }
}

export default SankeyGradientDefs;