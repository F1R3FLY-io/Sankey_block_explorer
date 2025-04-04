import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  value?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  index?: number;
  width?: number;
}

interface SankeyLink {
  source: string | number | SankeyNode;
  target: string | number | SankeyNode;
  value: number;
  width?: number;
  details?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyOptions {
  node?: {
    fill?: string;
    stroke?: string;
    opacity?: number;
  };
  link?: {
    fill?: string;
    stroke?: string;
    opacity?: number;
  };
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  options?: SankeyOptions;
}

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({ nodes, links, options = {} }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateDiagram = () => {
    if (!svgRef.current || !containerRef.current || !nodes.length || !links.length) return;

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

    // Create node index map
    const nodeMap = new Map(nodes.map((node, i) => [node.id, i]));

    // Create the sankey generator with adjusted parameters
    const sankeyLayout = sankey<SankeyNode, SankeyLink>()
      .nodeWidth(15)
      .nodePadding(20)
      .extent([[1, 1], [width - 1, height - 1]]);

    // Prepare the data
    const sankeyData: SankeyData = {
      nodes: nodes.map(node => ({
        ...node,
        index: nodeMap.get(node.id)
      })),
      links: links.map(link => ({
        source: nodeMap.get(typeof link.source === 'object' ? link.source.id : String(link.source))!,
        target: nodeMap.get(typeof link.target === 'object' ? link.target.id : String(link.target))!,
        value: link.value,
        details: link.details
      }))
    };

    try {
      // Generate the layout
      const { nodes: layoutNodes, links: layoutLinks } = sankeyLayout(sankeyData);

      // Draw the links
      svg.append("g")
        .selectAll("path")
        .data(layoutLinks)
        .join("path")
        .attr("d", sankeyLinkHorizontal())
        .style("fill", "none")
        .style("stroke-opacity", options.link?.opacity || 0.3)
        .style("stroke", options.link?.stroke || "#aaa")
        .style("stroke-width", (d) => Math.max(1, d.width || 0))
        .on("mouseover", function(event: MouseEvent, d: SankeyLink) {
          d3.select(this)
            .style("stroke-opacity", 0.5);
          if (d.details) {
            const tooltip = svg.append("g")
              .attr("class", "tooltip")
              .attr("transform", `translate(${event.offsetX},${event.offsetY - 10})`);

            tooltip.append("text")
              .text(d.details)
              .style("font-size", "12px")
              .style("fill", "#666");
          }
        })
        .on("mouseout", function() {
          d3.select(this)
            .style("stroke-opacity", options.link?.opacity || 0.3);
          svg.selectAll(".tooltip").remove();
        });

      // Draw the nodes
      const nodes_g = svg.append("g")
        .selectAll("g")
        .data(layoutNodes)
        .join("g")
        .attr("transform", (d) => `translate(${d.x0 || 0},${d.y0 || 0})`);

      nodes_g.append("rect")
        .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
        .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
        .style("fill", options.node?.fill || "#69b3a2")
        .style("stroke", options.node?.stroke || "#69b3a2")
        .style("opacity", options.node?.opacity || 0.8);

      // Add node labels with improved positioning
      nodes_g.append("g")
        .attr("transform", (d) => {
          const x = ((d.x0 || 0) < width / 2) ? (d.x1 || 0) - (d.x0 || 0) + 6 : -6;
          const y = ((d.y1 || 0) - (d.y0 || 0)) / 2;
          return `translate(${x},${y})`;
        })
        .selectAll("text")
        .data((d) => d.name.split('\n'))
        .join("text")
        .attr("x", 0)
        .attr("y", (_, i) => i * 14)
        .attr("dy", "0.35em")
        .attr("text-anchor", (_, i, nodes) => {
          const element = nodes[i] as SVGTextElement;
          const parent = element.parentElement;
          if (!parent) return "start";
          const parentData = d3.select(parent).datum() as SankeyNode;
          return (parentData.x0 || 0) < width / 2 ? "start" : "end";
        })
        .text((d) => d)
        .style("fill", "#666")
        .style("font-size", "10px");

    } catch (error) {
      console.error('Error generating Sankey diagram:', error);
    }
  };

  useEffect(() => {
    updateDiagram();
    
    // Add resize listener
    const handleResize = () => {
      updateDiagram();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes, links, options]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      />
    </div>
  );
};

export default SankeyDiagram;