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
  internalConsumption?: boolean;
  columnPosition?: 'left' | 'right' | 'center';
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
  dashArray?: string;
  opacity?: number;
  gradientStart?: string;
  gradientEnd?: string;
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
        .style("stroke-width", (d: SankeyLink) => d.isInternalConsumption ? widthScale(d.value) * 1.5 : widthScale(d.value))
        .style("stroke-opacity", (d: SankeyLink) => d.opacity || (d.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.8)))
        .style("stroke-dasharray", (d: SankeyLink) => d.dashArray || (d.isInternalConsumption ? "10,5" : "none"));

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
            .style("stroke-opacity", sankeyLink.opacity || (sankeyLink.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.8)))
            .style("stroke-dasharray", sankeyLink.dashArray || (sankeyLink.isInternalConsumption ? "10,5" : "none"))
            .style("stroke-width", sankeyLink.isInternalConsumption ? widthScale(sankeyLink.value) * 1.5 : widthScale(sankeyLink.value));
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

      // Check if this is a special internal phlo consumption diagram (with left/right/center positions)
      const hasColumnPositions = nodes.some(node => node.columnPosition);
      
      // Prepare the data
      const sankeyData: SankeyData = {
        nodes: nodes.map(node => {
          // For nodes with explicit column positions, set their positions directly
          if (hasColumnPositions && node.columnPosition) {
            const nodeWidth = 15;
            // Set up x positions based on column position
            let x0, x1;
            if (node.columnPosition === 'left') {
              x0 = 1;
              x1 = x0 + nodeWidth;
            } else if (node.columnPosition === 'right') {
              x0 = width - nodeWidth - 1;
              x1 = width - 1;
            } else { // center
              x0 = (width - nodeWidth) / 2;
              x1 = x0 + nodeWidth;
            }
            
            return {
              ...node,
              index: nodeMap.get(node.id),
              x0,
              x1
            };
          }
          
          return {
            ...node,
            index: nodeMap.get(node.id)
          };
        }),
        links: links.map(link => ({
          source: nodeMap.get(typeof link.source === 'object' ? link.source.id : String(link.source))!,
          target: nodeMap.get(typeof link.target === 'object' ? link.target.id : String(link.target))!,
          value: link.value,
          color: link.color,
          dashArray: link.dashArray,
          opacity: link.opacity,
          details: link.details
        }))
      };

      try {
        // For internal phlo consumption visualization with preset positions,
        // we need to customize the layout process
        let layoutNodes: SankeyNode[], layoutLinks: SankeyLink[];
        
        if (hasColumnPositions) {
          // For nodes with explicit column positions, we'll calculate y positions manually
          layoutNodes = [...sankeyData.nodes] as SankeyNode[];
          
          // Set initial y positions for explicitly positioned nodes (left column)
          const leftNodes = layoutNodes.filter(n => n.columnPosition === 'left');
          const rightNodes = layoutNodes.filter(n => n.columnPosition === 'right');
          const centerNodes = layoutNodes.filter(n => n.columnPosition === 'center');
          
          // Calculate positions to match the spec image exactly
          
          // Left column (input nodes) using precise proportions based on values 
          // Follow the exact proportions and positions from the specification
          // Account for values directly from the spec for perfect positioning
          
          // Configure total height to use most of the available space
          const diagramHeight = height - 100; // Leave margin for labels
          
          // Left column with blue/teal inputs - match spec exactly
          // Starting position from top - fixed positioning based on spec
          let leftY = 60;
          
          leftNodes.forEach(node => {
            // Size based on proportion and leave appropriate gaps
            let nodeHeight;
            
            // Specific sizing based on node ID
            if (node.id === 'input_0x197MTCADDR') {
              // Blue node - largest
              nodeHeight = Math.max(50, diagramHeight * 0.3);
              node.y0 = leftY;
              node.y1 = leftY + nodeHeight;
              leftY += nodeHeight + 20;  
            } else if (node.id === 'input_0x198MTCADDR') {
              // Teal node - medium
              nodeHeight = Math.max(40, diagramHeight * 0.22);
              node.y0 = leftY;
              node.y1 = leftY + nodeHeight;
              leftY += nodeHeight + 20;
            } else if (node.id === 'input_lowactivity') {
              // Low activity node - smallest
              nodeHeight = Math.max(30, diagramHeight * 0.15);
              node.y0 = leftY;
              node.y1 = leftY + nodeHeight;
            }
          });
          
          // Right column with output nodes - match spacing from the spec
          let rightY = 60; // Start at the same position as left column
          
          // Sort by size to match the layout in the spec
          const sortedRightNodes = [...rightNodes].sort((a, b) => (b.value || 0) - (a.value || 0));
          
          sortedRightNodes.forEach(node => {
            // Specific sizing and gaps for different output nodes
            let nodeHeight;
            
            if (node.value && node.value > 8000) {
              // Larger nodes (green and orange)
              nodeHeight = Math.max(35, diagramHeight * 0.15);
            } else if (node.value && node.value > 3000) {
              // Medium nodes (blue)
              nodeHeight = Math.max(25, diagramHeight * 0.1);
            } else {
              // Small nodes
              nodeHeight = Math.max(20, diagramHeight * 0.08);
            }
            
            node.y0 = rightY;
            node.y1 = rightY + nodeHeight;
            rightY += nodeHeight + 15; // Small gap between nodes
          });
          
          // Position center nodes exactly as in spec
          if (centerNodes.length > 0) {
            const centerNode = centerNodes[0];
            // Position in the vertical center, aligned with flows
            const centerY = (height / 2) - 80;
            const centerHeight = 160; // Fixed height matches the spec
            
            centerNode.y0 = centerY;
            centerNode.y1 = centerY + centerHeight;
          }
          
          // Process links to match between the predefined nodes
          layoutLinks = links.map(link => {
            const sourceNode = layoutNodes.find((n: SankeyNode) => 
              n.id === (typeof link.source === 'object' ? link.source.id : String(link.source))
            );
            const targetNode = layoutNodes.find((n: SankeyNode) => 
              n.id === (typeof link.target === 'object' ? link.target.id : String(link.target))
            );
            
            if (!sourceNode || !targetNode) {
              console.warn('Source or target node not found', { link, sourceNode, targetNode });
              // Return a placeholder to avoid errors
              return {
                source: layoutNodes[0],
                target: layoutNodes[0],
                value: 0,
                width: 0
              } as SankeyLink;
            }
            
            return {
              ...link,
              source: sourceNode,
              target: targetNode,
              width: Math.max(1, 2 * Math.sqrt(link.value || 1))
            } as SankeyLink;
          });
        } else {
          // Use standard sankey layout for everything else
          const result = sankeyLayout(sankeyData);
          layoutNodes = result.nodes;
          // Type cast with a more specific type instead of any
          layoutLinks = result.links as SankeyLink[];
        }

        // Create a custom path generator for Sankey links that creates the flowing shape as seen in the spec
        const customSankeyLinkPath = (d: SankeyLink) => {
          const sourceNode = d.source as SankeyNode;
          const targetNode = d.target as SankeyNode;
          
          // Early return if we don't have proper coordinates
          if (!sourceNode || !targetNode || 
              sourceNode.x0 === undefined || sourceNode.y0 === undefined || 
              targetNode.x0 === undefined || targetNode.y0 === undefined) {
            return "";
          }
          
          // For specially positioned nodes (to match spec exactly)
          if (hasColumnPositions) {
            const sourceX = sourceNode.x1 || 0;
            const sourceY = (sourceNode.y0 || 0) + ((sourceNode.y1 || 0) - (sourceNode.y0 || 0)) / 2;
            const targetX = targetNode.x0 || 0;
            const targetY = (targetNode.y0 || 0) + ((targetNode.y1 || 0) - (targetNode.y0 || 0)) / 2;
            
            // Control points for the bezier curve
            const sourceControlX = sourceX + (targetX - sourceX) * 0.4;
            const targetControlX = sourceX + (targetX - sourceX) * 0.6;
            
            // Calculate widths based on value for visual representation
            // Using fixed divisors for more precise control
            let divisor = 500; // Base divisor - will be adjusted below
            
            // Adjust based on source and target nodes with more precise values
            // Using more aggressive (smaller) divisors to make flows more visible
            if (sourceNode.name === '0x197MTCADDR') divisor = 500; // Largest blue flow
            if (sourceNode.name === '0x198MTCADDR') divisor = 600; // Medium teal flow
            if (sourceNode.name === '+56 Low activity\nnodes') divisor = 700; // Smaller flow
            
            // For output flows from center, using even more specific divisions to match diagram
            if (sourceNode.id === 'center_0x257MTCADDR') {
              if (targetNode.name === '0x257MTCADDR') divisor = 600; // Green flow
              if (targetNode.name === '0x258MTCADDR') divisor = 900; // Light blue (smaller)
              if (targetNode.name === '0x259MTCADDR') divisor = 700; // Medium blue
              if (targetNode.name === '0x260MTCADDR') divisor = 650; // Orange flow
              if (targetNode.name === '0x261MTCADDR') divisor = 800; // Purple (smaller)
              if (targetNode.name === '0x262MTCADDR') divisor = 900; // Green (smallest)
            }
            
            // Calculate widths with responsive min/max limits
            // Larger min width ensures flows are always visible
            const sourceWidth = Math.min(60, Math.max(15, (d.value || 1) / divisor));
            const targetWidth = Math.min(60, Math.max(12, (d.value || 1) / divisor));
            
            // Create the curves as seen in the spec image - smooth flowing shapes
            return `
              M ${sourceX},${sourceY - sourceWidth}
              C ${sourceControlX},${sourceY - sourceWidth} ${targetControlX},${targetY - targetWidth} ${targetX},${targetY - targetWidth}
              L ${targetX},${targetY + targetWidth}
              C ${targetControlX},${targetY + targetWidth} ${sourceControlX},${sourceY + sourceWidth} ${sourceX},${sourceY + sourceWidth}
              Z
            `;
          }
          
          // Default to standard Sankey path for other cases
          return sankeyLinkHorizontal()(d);
        };

        // Create gradient definitions for the links
        const defs = svg.append("defs");
        
        // Add gradient definitions for each link
        layoutLinks.forEach((link: SankeyLink, i: number) => {
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
            (link as any).gradientId = gradientId;
          }
        });
        
        // Draw the links
        svg.append("g")
          .selectAll("path")
          .data(layoutLinks)
          .join("path")
          .attr("d", customSankeyLinkPath)
          .style("fill", (link: SankeyLink) => {
            // For the special visualization with gradients
            if (hasColumnPositions) {
              if ((link as any).gradientId) {
                return `url(#${(link as any).gradientId})`;
              }
              return link.color || "#aaa";
            }
            return "none";
          })
          .style("stroke", (link: SankeyLink) => {
            // For standard visualization, use stroke
            if (hasColumnPositions) {
              return "none"; // No stroke for the spec visualization
            }
            return link.color || "#aaa";
          })
          .style("stroke-opacity", (link: SankeyLink) => {
            if (hasColumnPositions) return 0; // No stroke for the spec visualization
            return link.opacity || (link.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.6));
          })
          .style("fill-opacity", () => {
            if (hasColumnPositions) return 0.95; // Higher fill opacity for the spec visualization
            return 0; // No fill for standard visualization
          })
          .style("stroke-dasharray", (link: SankeyLink) => link.dashArray || (link.isInternalConsumption ? "10,5" : "none"))
          .style("stroke-width", (link) => {
            // For the standard visualization
            if (!hasColumnPositions) {
              return link.isInternalConsumption ? Math.max(3, (link.width || 0) * 1.5) : Math.max(1, link.width || 0);
            }
            return 0; // No stroke width for the spec visualization
          })
          .on("mouseover", function(_event: MouseEvent, d: SankeyLink) {
            if (hasColumnPositions) {
              // For the spec visualization
              d3.select(this)
                .style("fill-opacity", 1.0); // Increase opacity on hover

              // Get source and target nodes for tooltip positioning
              const sourceNode = d.source as SankeyNode;
              const targetNode = d.target as SankeyNode;
              
              if (d.details) {
                
                // Find the middle point of the path for tooltip placement
                const sourceX = (sourceNode.x1 || 0);
                const sourceY = ((sourceNode.y0 || 0) + (sourceNode.y1 || 0)) / 2;
                const targetX = (targetNode.x0 || 0);
                const targetY = ((targetNode.y0 || 0) + (targetNode.y1 || 0)) / 2;
                
                const xCenter = (sourceX + targetX) / 2;
                const yCenter = (sourceY + targetY) / 2;
                
                const tooltip = svg.append("g")
                  .attr("class", "tooltip")
                  .attr("transform", `translate(${xCenter},${yCenter})`);

                // Add a background to the tooltip
                tooltip.append("rect")
                  .attr("x", -10)
                  .attr("y", -20)
                  .attr("width", d.details.length * 7) // Approximate width
                  .attr("height", 30)
                  .attr("fill", "#000")
                  .attr("opacity", 0.7)
                  .attr("rx", 5);
                
                // Add the text
                tooltip.append("text")
                  .text(d.details.replace(/\n/g, ' '))
                  .attr("x", 5)
                  .attr("y", 0)
                  .style("font-size", "14px")
                  .style("fill", "#ffffff");
              }
            } else {
              // Standard behavior for other visualizations
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
            }
          })
          .on("mouseout", function(_, d: SankeyLink) {
            if (hasColumnPositions) {
              // For the spec visualization
              d3.select(this)
                .style("fill-opacity", 0.85); // Reset opacity
            } else {
              // Standard behavior
              d3.select(this)
                .style("stroke-opacity", d.opacity || (d.isInternalConsumption ? 0.9 : (options.link?.opacity || 0.3)))
                .style("stroke-width", d.isInternalConsumption ? Math.max(3, (d.width || 0) * 1.5) : Math.max(1, d.width || 0))
                .style("stroke-dasharray", d.dashArray || (d.isInternalConsumption ? "10,5" : "none"));
            }
            
            svg.selectAll(".tooltip").remove();
          });

        // Draw the nodes
        const nodes_g = svg.append("g")
          .selectAll("g")
          .data(layoutNodes)
          .join("g")
          .attr("transform", (d) => `translate(${d.x0 || 0},${d.y0 || 0})`);

        // Node rendering approach depending on the visualization type
        if (hasColumnPositions) {
          // For spec-matching visualization, render wider, more distinctive nodes
          nodes_g.append("rect")
            .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
            .attr("width", (d) => {
              // Make nodes wider according to column position
              if (d.columnPosition === 'left') return 15;
              if (d.columnPosition === 'center') return 15;
              if (d.columnPosition === 'right') return 15;
              return (d.x1 || 0) - (d.x0 || 0);
            })
            .style("fill", (d: SankeyNode) => d.color || "#69b3a2")
            .style("stroke", "none") // No stroke for the spec visualization
            .style("opacity", 1); // Full opacity for the spec visualization
        } else {
          // Standard node rendering for other visualizations
          nodes_g.append("rect")
            .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
            .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
            .style("fill", (d: SankeyNode) => d.color || "#69b3a2")
            .style("stroke", (d: SankeyNode) => d.color || "#69b3a2")
            .style("opacity", options.node?.opacity || 0.8);
        }

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
          .style("font-size", function(d) {
            // Customized font size for the Phlo visualization
            const textLength = d.length;
            
            try {
              // Safely get the parent node's data with proper type casting
              const element = this as SVGTextElement;
              const parentNode = element.parentNode as Element;
              if (!parentNode) return "12px"; 
              
              const node = d3.select(parentNode).datum() as SankeyNode;
              
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
              const node = nodeElement.datum() as SankeyNode;
              
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

export default SankeyDiagram;