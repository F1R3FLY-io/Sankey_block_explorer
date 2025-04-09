import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock ReactDOM.createRoot
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({ render: mockRender }));

vi.mock('react-dom/client', () => {
  return {
    default: {
      createRoot: mockCreateRoot
    },
    createRoot: mockCreateRoot
  };
});

// Mock App component
vi.mock('../App', () => ({
  default: () => <div data-testid="mock-app">Mocked App</div>,
}));

// Store original getElementById for restoration
const originalGetElementById = document.getElementById;
// Create mock function with better typing
const mockGetElementById = vi.fn();

describe('main', () => {
  beforeEach(() => {
    // Reset the mocks
    vi.resetAllMocks();
    
    // Setup mocked DOM element
    document.getElementById = mockGetElementById;
    mockGetElementById.mockReturnValue(document.createElement('div'));
  });
  
  afterEach(() => {
    // Restore the original method
    document.getElementById = originalGetElementById;
  });

  it('renders App component inside the root element', async () => {
    // Create a mock root element
    const rootElement = document.createElement('div');
    mockGetElementById.mockReturnValue(rootElement);
    
    // Import the main module which will execute the code
    await import('../main');
    
    // Verify getElementById was called with 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root');
    
    // Verify createRoot was called with the root element
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    
    // Verify render was called
    expect(mockRender).toHaveBeenCalled();
    
    // Get the first argument of the render call
    const renderCall = mockRender.mock.calls[0][0];
    
    // Verify React.StrictMode is used
    expect(renderCall.type).toBe(React.StrictMode);
    
    // Verify App component is rendered inside StrictMode
    expect(renderCall.props.children.type.name).toBe('default');
  });
});