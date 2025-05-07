import '@testing-library/jest-dom'
import { beforeAll, vi } from 'vitest';

// Mock ResizeObserver for tests
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Add mock to global scope before tests run
beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as any;
});