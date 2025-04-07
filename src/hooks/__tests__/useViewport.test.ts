import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useViewport from '../useViewport';

describe('useViewport', () => {
  // Mock window dimensions
  const setWindowDimensions = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
  };

  // Spy on addEventListener/removeEventListener
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Set initial window dimensions for testing
    setWindowDimensions(1024, 768);
    
    // Setup spies
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Reset mocks
    vi.restoreAllMocks();
  });

  it('should return the current viewport size on initial render', () => {
    const { result } = renderHook(() => useViewport());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('should return correct breakpoint flags based on width', () => {
    // Test with a small mobile viewport
    setWindowDimensions(480, 800);
    const { result: mobileResult } = renderHook(() => useViewport());
    
    expect(mobileResult.current.isXs).toBe(true);
    expect(mobileResult.current.isSm).toBe(false);
    expect(mobileResult.current.isMd).toBe(false);
    expect(mobileResult.current.isLg).toBe(false);
    expect(mobileResult.current.isXl).toBe(false);
    expect(mobileResult.current.is2xl).toBe(false);

    // Test with a tablet viewport
    setWindowDimensions(800, 1024);
    const { result: tabletResult } = renderHook(() => useViewport());
    
    expect(tabletResult.current.isXs).toBe(false);
    expect(tabletResult.current.isSm).toBe(true);
    expect(tabletResult.current.isMd).toBe(true);
    expect(tabletResult.current.isLg).toBe(false);
    expect(tabletResult.current.isXl).toBe(false);
    expect(tabletResult.current.is2xl).toBe(false);

    // Test with a large desktop viewport
    setWindowDimensions(1920, 1080);
    const { result: desktopResult } = renderHook(() => useViewport());
    
    expect(desktopResult.current.isXs).toBe(false);
    expect(desktopResult.current.isSm).toBe(true);
    expect(desktopResult.current.isMd).toBe(true);
    expect(desktopResult.current.isLg).toBe(true);
    expect(desktopResult.current.isXl).toBe(true);
    expect(desktopResult.current.is2xl).toBe(true);
  });

  it('should add a resize event listener on mount', () => {
    renderHook(() => useViewport());
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should remove the resize event listener on unmount', () => {
    const { unmount } = renderHook(() => useViewport());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should update viewport size when window is resized', () => {
    // Initial render with default dimensions
    const { result } = renderHook(() => useViewport());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    
    // Trigger a resize event with new dimensions
    act(() => {
      setWindowDimensions(1366, 900);
      // Manually trigger the resize event handler
      window.dispatchEvent(new Event('resize'));
    });
    
    // Check that the hook updated with new dimensions
    expect(result.current.width).toBe(1366);
    expect(result.current.height).toBe(900);
    
    // Check that the breakpoint flags updated correctly
    expect(result.current.isSm).toBe(true);
    expect(result.current.isMd).toBe(true);
    expect(result.current.isLg).toBe(true);
    expect(result.current.isXl).toBe(true);
    expect(result.current.is2xl).toBe(false);
  });
});