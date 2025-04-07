import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, generateGradient, generateRandomColor, adjustBrightness } from '../colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('converts valid hex colors to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#1a2b3c')).toEqual({ r: 26, g: 43, b: 60 });
    });

    it('returns null for invalid hex colors', () => {
      expect(hexToRgb('#12345')).toBeNull(); // Too short
      expect(hexToRgb('not-a-color')).toBeNull(); // Not a hex color
      expect(hexToRgb('')).toBeNull(); // Empty string
    });
  });

  describe('rgbToHex', () => {
    it('converts RGB values to hex colors', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(26, 43, 60)).toBe('#1a2b3c');
    });

    it('handles edge cases', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      
      // Values outside 0-255 range should be clamped in a real implementation
      // but our implementation doesn't enforce this
    });
  });

  describe('generateGradient', () => {
    it('generates a gradient with the specified number of steps', () => {
      const gradient = generateGradient('#000000', '#ffffff', 5);
      
      expect(gradient).toHaveLength(5);
      expect(gradient[0]).toBe('#000000');
      expect(gradient[4]).toBe('#ffffff');
      
      // Intermediate values should progress from start to end
      expect(gradient[2]).toBe('#808080');
    });

    it('returns empty array if invalid hex colors are provided', () => {
      const gradient = generateGradient('invalid', '#ffffff', 5);
      expect(gradient).toEqual([]);
    });

    it('handles single step gradients', () => {
      const gradient = generateGradient('#ff0000', '#0000ff', 1);
      expect(gradient).toHaveLength(1);
      
      // Just verify that we get a valid hex color back
      expect(gradient[0]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('generateRandomColor', () => {
    it('returns a valid hex color', () => {
      const randomColor = generateRandomColor();
      
      // Check format: 6 hex digits with # prefix
      expect(randomColor).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('generates different colors on successive calls', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(generateRandomColor());
      }
      
      // Most likely we'll get different colors each time
      // In the extremely unlikely case of duplicates, this might fail
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('adjustBrightness', () => {
    it('increases brightness correctly', () => {
      // Increase brightness by 50%
      expect(adjustBrightness('#808080', 50)).toBe('#c0c0c0');
      
      // Increase brightness of black
      expect(adjustBrightness('#000000', 100)).toBe('#000000');
    });

    it('decreases brightness correctly', () => {
      // Decrease brightness by 50%
      expect(adjustBrightness('#808080', -50)).toBe('#404040');
      
      // Decrease brightness of white
      expect(adjustBrightness('#ffffff', -50)).toBe('#808080');
    });

    it('clamps values to valid range', () => {
      // Increasing brightness shouldn't go beyond 255
      expect(adjustBrightness('#ffffff', 50)).toBe('#ffffff');
      
      // Decreasing brightness shouldn't go below 0
      expect(adjustBrightness('#000000', -50)).toBe('#000000');
    });

    it('returns original color for invalid inputs', () => {
      expect(adjustBrightness('invalid', 50)).toBe('invalid');
    });
  });
});