import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SankeyDiagram } from '../visualizations';
import { SankeyLayoutType } from '../visualizations/SankeyTypes';
import { determineLayoutType } from '../visualizations/SankeyUtils';
import { generateTerminatingPath, generateDirectPath, generateStandardPath } from '../visualizations/SankeyPathGenerators';

// Mock data
const mockNodes = [
  { id: 'node1', name: 'Node 1', value: 100, color: '#ff5c5c' },
  { id: 'node2', name: 'Node 2', value: 200, color: '#5c5cff' },
];

const mockLinks = [
  { source: 'node1', target: 'node2', value: 100, color: '#ff5c5c' },
];

const parallelLinks = [
  { source: 'node1', target: 'node1', value: 100, color: '#ff5c5c' },
  { source: 'node2', target: 'node2', value: 200, color: '#5c5cff' },
];

const customPositionNodes = [
  { id: 'node1', name: 'Node 1', value: 100, color: '#ff5c5c', columnPosition: 'left' as const },
  { id: 'node2', name: 'Node 2', value: 200, color: '#5c5cff', columnPosition: 'right' as const },
];

// Mock functions
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  })),
}));

vi.mock('d3-sankey', () => ({
  sankey: vi.fn(() => ({
    nodeWidth: vi.fn().mockReturnThis(),
    nodePadding: vi.fn().mockReturnThis(),
    extent: vi.fn().mockReturnThis(),
    __proto__: function(data: any) { return { nodes: [], links: [] }; }
  })),
  sankeyLinkHorizontal: vi.fn(() => vi.fn()),
}));

describe('SankeyDiagram', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders container elements', () => {
    render(<SankeyDiagram nodes={mockNodes} links={mockLinks} />);
    
    // Assert container and SVG exist
    const container = document.querySelector('.min-h-\\[500px\\]');
    expect(container).toBeInTheDocument();
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
  
  it('shows placeholder when no data is provided', () => {
    render(<SankeyDiagram nodes={[]} links={[]} />);
    
    // Assert placeholder text is shown
    expect(screen.getByText('Internal Phlo Consumption Visualization')).toBeInTheDocument();
  });
});

describe('SankeyUtils', () => {
  it('correctly determines layout type', () => {
    // Test parallel layout
    expect(determineLayoutType(parallelLinks)).toBe(SankeyLayoutType.PARALLEL);
    
    // Test custom layout
    const customLinks = [
      { 
        source: { id: 'node1', columnPosition: 'left' }, 
        target: { id: 'node2', columnPosition: 'right' },
        value: 100
      }
    ];
    expect(determineLayoutType(customLinks)).toBe(SankeyLayoutType.CUSTOM);
    
    // Test standard layout
    expect(determineLayoutType(mockLinks)).toBe(SankeyLayoutType.STANDARD);
  });
});

describe('SankeyPathGenerators', () => {
  it('generates terminating path', () => {
    const params = {
      sourceX: 100,
      sourceY: 100,
      targetX: 300,
      targetY: 100,
      sourceWidth: 20,
      targetWidth: 0,
      value: 100,
      midWidth: 10
    };
    
    const path = generateTerminatingPath(params);
    expect(path).toContain('M ');
    expect(path).toContain('C ');
    expect(path).toContain('Z');
  });
  
  it('generates direct path', () => {
    const params = {
      sourceX: 100,
      sourceY: 100,
      targetX: 300,
      targetY: 100,
      sourceWidth: 20,
      targetWidth: 15,
      value: 100
    };
    
    const path = generateDirectPath(params);
    expect(path).toContain('M ');
    expect(path).toContain('C ');
    expect(path).toContain('L ');
    expect(path).toContain('Z');
  });
  
  it('generates standard path', () => {
    const params = {
      sourceX: 100,
      sourceY: 100,
      targetX: 300,
      targetY: 100,
      sourceWidth: 20,
      targetWidth: 15,
      value: 100
    };
    
    const path = generateStandardPath(params);
    expect(path).toContain('M ');
    expect(path).toContain('C ');
    expect(path).toContain('L ');
    expect(path).toContain('Z');
  });
});