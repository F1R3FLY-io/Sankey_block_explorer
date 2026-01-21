import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isCapsMode, getTokenName, formatTooltipDetails } from '../capsUtils';

// Type for global with CAPS mode flag
interface GlobalWithCapsMode {
  __CAPS_MODE__?: boolean;
}

describe('capsUtils', () => {
  // Store original global variable if it exists
  let originalCapsMode: boolean | undefined;
  const globalWithCaps = global as unknown as GlobalWithCapsMode;

  beforeEach(() => {
    // Store the original value if it exists
    if (typeof globalWithCaps.__CAPS_MODE__ !== 'undefined') {
      originalCapsMode = globalWithCaps.__CAPS_MODE__;
    }
  });

  afterEach(() => {
    // Reset the global variable after each test
    if (typeof originalCapsMode !== 'undefined') {
      globalWithCaps.__CAPS_MODE__ = originalCapsMode;
    } else {
      delete globalWithCaps.__CAPS_MODE__;
    }
  });

  describe('isCapsMode', () => {
    it('returns false when __CAPS_MODE__ is undefined', () => {
      delete globalWithCaps.__CAPS_MODE__;
      expect(isCapsMode()).toBe(false);
    });

    it('returns false when __CAPS_MODE__ is false', () => {
      globalWithCaps.__CAPS_MODE__ = false;
      expect(isCapsMode()).toBe(false);
    });

    it('returns true when __CAPS_MODE__ is true', () => {
      globalWithCaps.__CAPS_MODE__ = true;
      expect(isCapsMode()).toBe(true);
    });
  });

  describe('getTokenName', () => {
    it('returns "Phlo" when CAPS mode is disabled', () => {
      globalWithCaps.__CAPS_MODE__ = false;
      expect(getTokenName()).toBe('Phlo');
    });

    it('returns "CAPS" when CAPS mode is enabled', () => {
      globalWithCaps.__CAPS_MODE__ = true;
      expect(getTokenName()).toBe('CAPS');
    });
  });

  describe('formatTooltipDetails', () => {
    it('returns original string when CAPS mode is disabled', () => {
      globalWithCaps.__CAPS_MODE__ = false;
      const details = 'From: 0x123\nTo: 0x456\nPhlo: 1000';
      expect(formatTooltipDetails(details)).toBe(details);
    });

    it('replaces "Phlo" with "CAPS" when CAPS mode is enabled', () => {
      globalWithCaps.__CAPS_MODE__ = true;
      const details = 'From: 0x123\nTo: 0x456\nPhlo: 1000';
      const expected = 'From: 0x123\nTo: 0x456\nCAPS: 1000';
      expect(formatTooltipDetails(details)).toBe(expected);
    });

    it('replaces "phlo" with "CAPS" when CAPS mode is enabled', () => {
      globalWithCaps.__CAPS_MODE__ = true;
      const details = 'From: 0x123\nTo: 0x456\nphlo: 1000';
      const expected = 'From: 0x123\nTo: 0x456\nCAPS: 1000';
      expect(formatTooltipDetails(details)).toBe(expected);
    });

    it('replaces all occurrences of Phlo/phlo in a complex string', () => {
      globalWithCaps.__CAPS_MODE__ = true;
      const details = 'Total Phlo: 1000\nAvailable phlo: 500\nPerformance impact of Phlo consumption';
      const expected = 'Total CAPS: 1000\nAvailable CAPS: 500\nPerformance impact of CAPS consumption';
      expect(formatTooltipDetails(details)).toBe(expected);
    });

    it('handles cases where Phlo appears multiple times with different casing', () => {
      globalWithCaps.__CAPS_MODE__ = true;
      const details = 'Phlo: 1000 phlo used out of 5000 Total Phlo';
      const expected = 'CAPS: 1000 CAPS used out of 5000 Total CAPS';
      expect(formatTooltipDetails(details)).toBe(expected);
    });
  });
});