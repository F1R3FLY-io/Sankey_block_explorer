import * as d3 from 'd3';
import { SankeyLink, SankeyNode } from './SankeyTypes';

interface ParallelLinesRendererProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  nodes: SankeyNode[];
  links: SankeyLink[];
  options: {
    link?: {
      opacity?: number;
    };
  };
}

/**
 * Utility class for rendering parallel lines when all links are self-referential
 */
class ParallelLinesRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private width: number;
  private height: number;
  private nodes: SankeyNode[];
  private links: SankeyLink[];
  private options: { link?: { opacity?: number } };

  constructor({
    svg,
    width,
    height,
    nodes,
    links,
    options
  }: ParallelLinesRendererProps) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.nodes = nodes;
    this.links = links;
    this.options = options;
    
    this.drawParallelLines();
  }

  /**
   * Renders parallel lines visualization
   */
  private drawParallelLines(): void {
    const padding = 20;
    const lineHeight = (this.height - padding * 2) / this.nodes.length;

    const maxValue = Math.max(...this.links.map(l => l.value));
    const minValue = Math.min(...this.links.map(l => l.value));

    const widthScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([5, 30]);

    this.svg.append("g")
      .selectAll("line")
      .data(this.links)
      .join("line")
      .attr("x1", padding * 4)
      .attr("y1", (_, i) => padding + i * lineHeight)
      .attr("x2", this.width - padding * 2)
      .attr("y2", (_, i) => padding + i * lineHeight)
      .style("stroke", (d: SankeyLink) => d.color || "#aaa")
      .style("stroke-width", (d: SankeyLink) => 
        d.isInternalConsumption 
          ? widthScale(d.value) * 1.5 
          : widthScale(d.value)
      )
      .style("stroke-opacity", (d: SankeyLink) => 
        d.opacity || (
          d.isInternalConsumption 
            ? 0.9 
            : (this.options.link?.opacity || 0.8)
        )
      )
      .style("stroke-dasharray", (d: SankeyLink) => 
        d.dashArray || (
          d.isInternalConsumption 
            ? "10,5" 
            : "none"
        )
      );

    this.svg.append("g")
      .selectAll("text")
      .data(this.nodes)
      .join("text")
      .attr("x", padding * 3)
      .attr("y", (_, i) => padding + i * lineHeight)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(d => d.name)
      .style("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("paint-order", "stroke")
      .style("stroke", "#000000")
      .style("stroke-width", "2px")
      .style("stroke-linecap", "butt")
      .style("stroke-linejoin", "miter");

    // Add interaction to the lines - using arrow functions to preserve 'this' context
    this.svg.selectAll("line")
      .on("mouseover", (event: MouseEvent, d: unknown) => {
        const sankeyLink = d as SankeyLink;
        // Use d3.select(event.currentTarget) instead of this
        d3.select(event.currentTarget as Element)
          .style("stroke-opacity", 1)
          .style("stroke-width", widthScale(sankeyLink.value) * 1.2);
        
        if (sankeyLink.details) {
          const tooltip = this.svg.append("g")
            .attr("class", "tooltip")
            .attr("transform", `translate(${event.offsetX * 0.75},${event.offsetY - 10})`);

          // Combine all lines into a single line for the tooltip
          tooltip.append("text")
            .text(sankeyLink.details.replace(/\n/g, ' '))
            .attr("x", 5)
            .attr("y", 0)
            .style("font-size", "14px")
            .style("fill", "#ffffff");
        }
      })
      .on("mouseout", (_, d: unknown) => {
        const sankeyLink = d as SankeyLink;
        d3.select(_.currentTarget as Element)
          .style("stroke-opacity", sankeyLink.opacity || (
            sankeyLink.isInternalConsumption 
              ? 0.9 
              : (this.options.link?.opacity || 0.8)
          ))
          .style("stroke-dasharray", sankeyLink.dashArray || (
            sankeyLink.isInternalConsumption 
              ? "10,5" 
              : "none"
          ))
          .style("stroke-width", sankeyLink.isInternalConsumption 
            ? widthScale(sankeyLink.value) * 1.5 
            : widthScale(sankeyLink.value)
          );
        
        this.svg.selectAll(".tooltip").remove();
      });
  }
}

export default ParallelLinesRenderer;