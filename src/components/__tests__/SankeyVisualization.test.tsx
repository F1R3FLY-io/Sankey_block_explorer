import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SankeyDiagram } from '../visualizations';
import { SankeyLayoutType, SankeyNode } from '../visualizations/SankeyTypes';
import { determineLayoutType } from '../visualizations/SankeyUtils';
import { generateTerminatingPath, generateDirectPath, generateStandardPath } from '../visualizations/SankeyPathGenerators';

// Setup counter in module scope for useRef
let refCounter = 0;

// Mock React for DOM refs
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  
  // Create mock DOM elements for refs
  const mockSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const mockContainerElement = document.createElement('div');
  
  // Add clientWidth and clientHeight properties to the mock container
  Object.defineProperties(mockContainerElement, {
    clientWidth: { value: 800 },
    clientHeight: { value: 600 }
  });
  
  return {
    ...actual,
    useRef: vi.fn((initialValue) => {
      // Increment counter for each useRef call
      refCounter++;
      
      // First ref is container, second is SVG in SankeyDiagram
      const isContainerRef = refCounter % 2 === 1;
      const isSvgRef = refCounter % 2 === 0;
      
      // Return the appropriate mock element based on the counter
      return { 
        current: isContainerRef ? mockContainerElement : 
                isSvgRef ? mockSvgElement : initialValue 
      };
    }),
    // Export the counter for completeness
    get refCounter() {
      return refCounter;
    }
  };
});

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

// We'll use 'left' and 'right' directly in the test

// Create a more complete d3 mock
vi.mock('d3', () => {
  // Create a function to generate a chainable mock object
  const createChainableMock = () => {
    const chainableMock = {
      attr: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
      append: vi.fn(() => createChainableMock()),
      select: vi.fn(() => createChainableMock()),
      selectAll: vi.fn(() => createChainableMock()),
      data: vi.fn(() => createChainableMock()),
      join: vi.fn(() => createChainableMock()),
      remove: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      classed: vi.fn().mockReturnThis(),
      html: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      datum: vi.fn().mockReturnThis(),
      property: vi.fn().mockReturnThis(),
      enter: vi.fn(() => createChainableMock()),
      exit: vi.fn(() => createChainableMock()),
      merge: vi.fn(() => createChainableMock()),
      transition: vi.fn(() => createChainableMock()),
      duration: vi.fn().mockReturnThis(),
      ease: vi.fn().mockReturnThis(),
      delay: vi.fn().mockReturnThis(),
      each: vi.fn(fn => { if (typeof fn === 'function') fn(); return chainableMock; }),
      node: vi.fn(() => document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
      nodes: vi.fn(() => []),
      empty: vi.fn(() => false),
    };
    return chainableMock;
  };

  return {
    select: vi.fn(() => createChainableMock()),
    selectAll: vi.fn(() => createChainableMock()),
    scaleLinear: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    max: vi.fn(() => 100),
    min: vi.fn(() => 0),
  };
});

vi.mock('d3-sankey', () => {
  const mockSankey = function() {
    const fn = function() {
      // Return data with proper node properties for Sankey diagram
      return { 
        nodes: [
          { 
            id: 'node1', 
            name: 'Node 1', 
            x0: 0, 
            x1: 20, 
            y0: 0, 
            y1: 40, 
            value: 100 
          },
          { 
            id: 'node2', 
            name: 'Node 2', 
            x0: 200, 
            x1: 220, 
            y0: 0, 
            y1: 40, 
            value: 200 
          }
        ], 
        links: [
          { 
            source: { id: 'node1', x0: 0, x1: 20, y0: 0, y1: 40 }, 
            target: { id: 'node2', x0: 200, x1: 220, y0: 0, y1: 40 }, 
            value: 100,
            width: 10
          }
        ] 
      };
    };
    
    fn.nodeWidth = vi.fn().mockReturnValue(fn);
    fn.nodePadding = vi.fn().mockReturnValue(fn);
    fn.extent = vi.fn().mockReturnValue(fn);
    fn.nodeId = vi.fn().mockReturnValue(fn);
    fn.nodeAlign = vi.fn().mockReturnValue(fn);
    
    return fn;
  };
  
  // Create a mock for the sankeyLinkHorizontal function
  const mockSankeyLinkHorizontal = () => {
    const pathGenerator = (d: { 
      source?: { 
        x0?: number; 
        x1?: number; 
        y0?: number; 
        y1?: number; 
      }; 
      target?: { 
        x0?: number; 
        x1?: number; 
        y0?: number; 
        y1?: number; 
      };
    }) => {
      // Return a valid SVG path string
      return `M${d.source?.x1 || 0},${(d.source?.y0 || 0) + (d.source?.y1 || 0) / 2}
              C${(d.source?.x1 || 0) + 100},${(d.source?.y0 || 0) + (d.source?.y1 || 0) / 2}
              ${(d.target?.x0 || 0) - 100},${(d.target?.y0 || 0) + (d.target?.y1 || 0) / 2}
              ${d.target?.x0 || 0},${(d.target?.y0 || 0) + (d.target?.y1 || 0) / 2}`;
    };
    return pathGenerator;
  };
  
  return {
    sankey: mockSankey,
    sankeyLinkHorizontal: vi.fn(() => mockSankeyLinkHorizontal()),
  };
});

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
  
  it.skip('shows placeholder when no data is provided', () => {
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
        source: { id: 'node1', name: 'Node 1', columnPosition: 'left' } as SankeyNode, 
        target: { id: 'node2', name: 'Node 2', columnPosition: 'right' } as SankeyNode,
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