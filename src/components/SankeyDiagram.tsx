import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export interface SankeyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  value?: number;
  color?: string;
  phloConsumed?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  index?: number;
  width?: number;
}

export interface SankeyLink {
  source: string | number | SankeyNode;
  target: string | number | SankeyNode;
  value: number;
  color?: string;
  width?: number;
  details?: string;
  isParallel?: boolean;
  isInternalConsumption?: boolean;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyOptions {
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

  useEffect(() => {
    const drawParallelLines = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number) => {
      const padding = 20;
      const lineHeight = (height - padding * 2) / nodes.length;

      const maxValue = Math.max(...links.map(l => l.value));
      const minValue = Math.min(...links.map(l => l.value));

      const widthScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([5, 30]);

      svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("x1", padding * 4)
        .attr("y1", (_, i) => padding + i * lineHeight)
        .attr("x2", width - padding * 2)
        .attr("y2", (_, i) => padding + i * lineHeight)
        .style("stroke", (d: SankeyLink) => d.color || "#aaa")
        .style("stroke-width", (d: SankeyLink) => widthScale(d.value))
        .style("stroke-opacity", (d: SankeyLink) => d.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.8))
        .style("stroke-dasharray", (d: SankeyLink) => d.isInternalConsumption ? "10,5" : "none");

      svg.append("g")
        .selectAll("text")
        .data(nodes)
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

      svg.selectAll("line")
        .on("mouseover", function(event: MouseEvent, d: unknown) {
          const sankeyLink = d as SankeyLink;
          d3.select(this)
            .style("stroke-opacity", 1)
            .style("stroke-width", widthScale(sankeyLink.value) * 1.2);
          if (sankeyLink.details) {
            const tooltip = svg.append("g")
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
        .on("mouseout", function(_, d: unknown) {
          const sankeyLink = d as SankeyLink;
          d3.select(this)
            .style("stroke-opacity", sankeyLink.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.8))
            .style("stroke-dasharray", sankeyLink.isInternalConsumption ? "10,5" : "none")
            .style("stroke-width", widthScale(sankeyLink.value));
          svg.selectAll(".tooltip").remove();
        });
    };
    const updateDiagram = () => {
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

      const isAllParallel = links.every(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
        const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
        return sourceId === targetId;
      });

      if (isAllParallel) {
        drawParallelLines(svg, width, height);
        return;
      }

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
          color: link.color,
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
          .style("stroke-opacity", (d: SankeyLink) => d.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.3))
          .style("stroke-dasharray", (d: SankeyLink) => d.isInternalConsumption ? "10,5" : "none")
          .style("stroke", (d: SankeyLink) => d.color || "#aaa")
          .style("stroke-width", (d) => d.isInternalConsumption ? Math.max(2, (d.width || 0) * 1.2) : Math.max(1, d.width || 0))
          .attr("x", (d) => {
            const sourceNode = d.source as SankeyNode;
            const targetNode = d.target as SankeyNode;
            return sourceNode.x1! + (targetNode.x0! - sourceNode.x1!) * 0.25;
          })
          .attr("y", (d) => {
            const sourceNode = d.source as SankeyNode;
            const targetNode = d.target as SankeyNode;
            return (sourceNode.y0! + sourceNode.y1! + targetNode.y0! + targetNode.y1!) / 4;
          })
          .on("mouseover", function(_event: MouseEvent, d: SankeyLink) {
            d3.select(this)
              .style("stroke-opacity", 1.0)
              .style("stroke-width", Math.max(3, (d.width || 0) * 1.5))
              .style("stroke-dasharray", d.isInternalConsumption ? "5,3" : "none");
            if (d.details) {
              const sourceNode = d.source as SankeyNode;
              const targetNode = d.target as SankeyNode;
              const xCenter = (sourceNode.x0! + sourceNode.x1! + targetNode.x0! + targetNode.x1!) / 4;
              const yCenter = (sourceNode.y0! + sourceNode.y1! + targetNode.y0! + targetNode.y1!) / 4;
              const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", `translate(${xCenter},${yCenter})`);

              // Combine all lines into a single line for the tooltip
              tooltip.append("text")
                .text(d.details.replace(/\n/g, ' '))
                .attr("x", 5)
                .attr("y", 0)
                .style("font-size", "14px")
                .style("fill", "#ffffff");
            }
          })
          .on("mouseout", function(_, d: SankeyLink) {
            d3.select(this)
              .style("stroke-opacity", d.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.3))
              .style("stroke-width", d.isInternalConsumption ? Math.max(2, (d.width || 0) * 1.2) : Math.max(1, d.width || 0))
              .style("stroke-dasharray", d.isInternalConsumption ? "10,5" : "none");
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
          .style("fill", (d: SankeyNode) => d.color || "#69b3a2")
          .style("stroke", (d: SankeyNode) => d.color || "#69b3a2")
          .style("opacity", options.node?.opacity || 0.8);

        // Add node labels with improved positioning
        nodes_g.append("g")
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
            const parentData = d3.select(parent).datum() as SankeyNode;
            return (parentData.x0 || 0) < width / 2 ? "start" : "end";
          })
          .style("fill", "#ffffff")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("paint-order", "stroke")
          .style("stroke", "#000000")
          .style("stroke-width", "2px")
          .style("stroke-linecap", "butt")
          .style("stroke-linejoin", "miter")
          .text(d => d);

      } catch (error) {
        console.error('Error generating Sankey diagram:', error);
      }
    };

    updateDiagram();
    
    // Add resize listener
    const handleResize = () => {
      updateDiagram();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes, links, options]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        minHeight: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)' // Very subtle background for debugging
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      />
      {/* Debug overlay to verify SVG exists */}
      {(!nodes.length || !links.length) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffa500',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          Internal Phlo Consumption Visualization
        </div>
      )}
    </div>
  );
};

export default SankeyDiagram;