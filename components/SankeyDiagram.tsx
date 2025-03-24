import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export interface SankeyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  color?: string;
  x?: number;
  y?: number;
  value?: number;
  sourceLinks?: any[];
  targetLinks?: any[];
}

export interface SankeyLink {
  source: string | SankeyNode;
  target: string | SankeyNode;
  value: number;
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width: number;
  height: number;
  nodeWidth?: number;
  nodePadding?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  width,
  height,
  nodeWidth = 15,
  nodePadding = 10,
  margin = { top: 20, right: 100, bottom: 20, left: 100 }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || links.length === 0) return;

    // Clear any existing svg content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create a copy of the data to avoid mutating props
    const nodesCopy = nodes.map(node => ({ ...node }));
    const linksCopy = links.map(link => ({ ...link }));

    // Create the sankey generator
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d: SankeyNode) => d.id)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom]
      ]);

    // Generate the sankey data
    const sankeyData = sankeyGenerator({
      nodes: nodesCopy,
      links: linksCopy.map(d => ({
        ...d,
        source: nodesCopy.find(node => node.id === (typeof d.source === 'string' ? d.source : d.source.id))!,
        target: nodesCopy.find(node => node.id === (typeof d.target === 'string' ? d.target : d.target.id))!
      }))
    });

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add links
    svg.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(sankeyData.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', '#aaa')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d: any) => Math.max(1, d.width))
      .style('mix-blend-mode', 'multiply');

    // Add nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(sankeyData.nodes)
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles for nodes
    node.append('rect')
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => d.color || '#69b3a2')
      .attr('opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    // Add text labels
    node.append('text')
      .attr('x', (d: any) => d.x1 < width / 2 ? (d.x1 - d.x0) + 6 : -6)
      .attr('y', (d: any) => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x1 < width / 2 ? 'start' : 'end')
      .text((d: any) => d.name)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif');

  }, [nodes, links, width, height, nodeWidth, nodePadding, margin]);

  return <svg ref={svgRef}></svg>;
};

export default SankeyDiagram;