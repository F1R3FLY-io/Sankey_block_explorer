import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as d3 from 'd3';
import SankeyLink from '../SankeyLink';
import { SankeyLink as SankeyLinkType } from '../SankeyTypes';
import * as capsUtils from '../../../utils/capsUtils';

// Mock d3 select and other methods
vi.mock('d3', () => {
  const mockSelection = {
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis()
  };

  return {
    select: vi.fn().mockReturnValue(mockSelection)
  };
});

// Mock the capsUtils module
vi.mock('../../../utils/capsUtils', () => ({
  isCapsMode: vi.fn().mockReturnValue(false),
  getTokenName: vi.fn().mockReturnValue('Phlo'),
  formatTooltipDetails: vi.fn((details) => details)
}));

describe('SankeyLink', () => {
  // Sample test data
  const testLinks: SankeyLinkType[] = [
    { 
      source: 'node1', 
      target: 'node2', 
      value: 100,
      color: '#ff0000',
      details: 'From: 0xabcd\nTo: 0x1234\nPhlo: 1000'
    }
  ];

  // Mock SVG element
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgSelection = d3.select(svgElement) as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a SankeyLink instance and render links', () => {
    // Create a SankeyLink instance
    new SankeyLink({
      links: testLinks,
      hasColumnPositions: false,
      options: {},
      svgSelection
    });

    // Verify that the links were rendered
    expect(svgSelection.append).toHaveBeenCalledWith('g');
    expect(svgSelection.selectAll).toHaveBeenCalledWith('path');
  });
  
  it('should create tooltips with formatTooltipDetails', () => {
    // Spy on formatTooltipDetails
    const spy = vi.spyOn(capsUtils, 'formatTooltipDetails');
    
    // Create a SankeyLink instance with a link that has details
    const sankeyLink = new SankeyLink({
      links: testLinks,
      hasColumnPositions: false,
      options: {},
      svgSelection
    });

    // Simulate a mouseover event to trigger tooltip creation
    // Access the private method using any type
    (sankeyLink as any).handleMouseOver(
      new MouseEvent('mouseover'), 
      testLinks[0], 
      document.createElementNS('http://www.w3.org/2000/svg', 'path')
    );

    // Verify that formatTooltipDetails was called with the link details
    expect(spy).toHaveBeenCalledWith(testLinks[0].details);
  });
});

// Test SankeyLink in CAPS mode
describe('SankeyLink in CAPS mode', () => {
  // Sample test data
  const testLinks: SankeyLinkType[] = [
    { 
      source: 'node1', 
      target: 'node2', 
      value: 100,
      color: '#ff0000',
      details: 'From: 0xabcd\nTo: 0x1234\nPhlo: 1000'
    }
  ];

  // Mock SVG element
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgSelection = d3.select(svgElement) as any;

  // Setup for mocking
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock capsUtils for CAPS mode
    vi.mocked(capsUtils.isCapsMode).mockReturnValue(true);
    vi.mocked(capsUtils.getTokenName).mockReturnValue('CAPS');
    vi.mocked(capsUtils.formatTooltipDetails).mockImplementation(
      (details) => details.replace(/Phlo/g, 'CAPS').replace(/phlo/g, 'CAPS')
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should use formatTooltipDetails to replace Phlo with CAPS in tooltips', () => {
    // Spy on formatTooltipDetails
    const spy = vi.spyOn(capsUtils, 'formatTooltipDetails');
    
    // Create a SankeyLink instance
    const sankeyLink = new SankeyLink({
      links: testLinks,
      hasColumnPositions: false,
      options: {},
      svgSelection
    });

    // Simulate a mouseover event to trigger tooltip creation
    (sankeyLink as any).handleMouseOver(
      new MouseEvent('mouseover'), 
      testLinks[0], 
      document.createElementNS('http://www.w3.org/2000/svg', 'path')
    );

    // Verify formatTooltipDetails was called
    expect(spy).toHaveBeenCalledWith(testLinks[0].details);
    
    // Confirm the implementation transforms Phlo to CAPS
    expect(spy.mock.results[0].value).toContain('CAPS');
    expect(spy.mock.results[0].value).not.toContain('Phlo');
  });
});