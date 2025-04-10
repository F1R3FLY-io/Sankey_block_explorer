import { SimulationNodeDatum } from 'd3';

/**
 * Represents a node in the Sankey diagram
 */
export interface SankeyNode extends SimulationNodeDatum {
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

/**
 * Represents a link (flow) between nodes in the Sankey diagram
 */
export interface SankeyLink {
  source: string | number | SankeyNode;
  target: string | number | SankeyNode;
  value: number;
  color?: string;
  width?: number;
  details?: string;
  isParallel?: boolean;
  isInternalConsumption?: boolean;
  isTerminating?: boolean; // Flag to indicate flows that terminate midway
  dashArray?: string;
  opacity?: number;
  gradientStart?: string;
  gradientEnd?: string;
}

/**
 * Complete data for a Sankey diagram
 */
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Configuration options for Sankey diagram appearance
 */
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

/**
 * Props for the SankeyDiagram component
 */
export interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  options?: SankeyOptions;
}

/**
 * Layout types for Sankey diagrams
 */
export enum SankeyLayoutType {
  STANDARD = 'standard',
  PARALLEL = 'parallel',
  CUSTOM = 'custom'
}

/**
 * Parameters for path generation
 */
export interface PathParams {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceWidth: number;
  targetWidth: number;
  value: number;
}