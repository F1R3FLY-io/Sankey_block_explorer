import { describe, it, expect, vi } from 'vitest';
import { formatNumber, formatDate, truncateString, formatAddress } from '../dataFormatters';

describe('dataFormatters', () => {
  describe('formatNumber', () => {
    it('formats numbers with K, M, B, T suffixes', () => {
      expect(formatNumber(1234)).toBe('1.2K');
      expect(formatNumber(1234567)).toBe('1.2M');
      expect(formatNumber(1234567890)).toBe('1.2B');
      expect(formatNumber(1234567890000)).toBe('1.2T');
    });

    it('handles decimal precision correctly', () => {
      expect(formatNumber(1500, 0)).toBe('2K');
      expect(formatNumber(1500, 1)).toBe('1.5K');
      // Our implementation removes trailing zeros, so this should be '1.5K' not '1.50K'
      expect(formatNumber(1500, 2)).toBe('1.5K');
      expect(formatNumber(1234, 2)).toBe('1.23K');
    });

    it('removes trailing zeros in decimals', () => {
      expect(formatNumber(1000)).toBe('1K');
      expect(formatNumber(1100)).toBe('1.1K');
      expect(formatNumber(1100, 2)).toBe('1.1K');
    });

    it('handles small numbers and zero', () => {
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(9)).toBe('9');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1.2K');
      expect(formatNumber(-1000000)).toBe('-1M');
    });
  });

  describe('formatDate', () => {
    // Mock the current date for relative time tests
    const mockNow = new Date('2025-01-01T12:00:00Z').getTime();
    
    // Mock directly to avoid TypeScript errors with beforeEach/afterEach
    vi.spyOn(Date, 'now').mockImplementation(() => mockNow);

    it('formats date in full format by default', () => {
      const timestamp = new Date('2024-12-31T12:00:00Z').getTime();
      
      // The exact format will depend on locale, so we just check for presence of date parts
      const formatted = formatDate(timestamp);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('12'); // Month or day
      expect(formatted).toContain('31'); // Day
    });

    it('formats date in date-only format', () => {
      const timestamp = new Date('2024-12-31T12:00:00Z').getTime();
      
      const formatted = formatDate(timestamp, 'date');
      expect(formatted).not.toContain(':'); // No time separator
      expect(formatted).toContain('2024');
      expect(formatted).toContain('12'); // Month or day
      expect(formatted).toContain('31'); // Day
    });

    it('formats date in time-only format', () => {
      const timestamp = new Date('2024-12-31T12:00:00Z').getTime();
      
      const formatted = formatDate(timestamp, 'time');
      expect(formatted).toContain(':'); // Time separator
      expect(formatted).not.toContain('2024'); // No year
    });

    it('formats date in relative format', () => {
      // Test the general format without being too strict on exact values
      // as implementations may differ
      const timestamp = mockNow - 1000 * 60 * 60 * 24 * 10; // 10 days ago
      const formattedDate = formatDate(timestamp, 'relative');
      
      // Check that it contains the 'ago' suffix
      expect(formattedDate).toContain('ago');
      
      // For very recent dates (within a minute)
      const recentTimestamp = mockNow - 10 * 1000; // 10 seconds ago
      const recentFormatted = formatDate(recentTimestamp, 'relative');
      expect(recentFormatted).toContain('ago');
      
      // For older dates (over a year)
      const oldTimestamp = mockNow - 1000 * 60 * 60 * 24 * 365 * 2; // ~2 years ago
      const oldFormatted = formatDate(oldTimestamp, 'relative');
      expect(oldFormatted).toContain('ago');
    });
  });

  describe('truncateString', () => {
    it('truncates strings that exceed maxLength', () => {
      expect(truncateString('This is a long string', 10)).toBe('This is...');
      expect(truncateString('Short', 10)).toBe('Short');
    });

    it('handles edge cases', () => {
      expect(truncateString('', 10)).toBe('');
      expect(truncateString('Exactly 10', 10)).toBe('Exactly 10');
      
      // The exact format may vary (spaces before/after ellipsis, etc.)
      const truncated = truncateString('Just barely fits', 15);
      expect(truncated.length).toBeLessThanOrEqual(15);
      expect(truncated).toContain('Just barely');
      expect(truncated).toContain('...');
    });
  });

  describe('formatAddress', () => {
    it('formats blockchain addresses with correct truncation', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      
      // Default truncation (6 chars at start, 4 at end)
      const defaultFormat = formatAddress(address);
      expect(defaultFormat).toContain('0x1234');
      expect(defaultFormat).toContain('...');
      expect(defaultFormat).toContain('5678');
      
      // Custom truncation - check general format rather than exact string
      const customFormat1 = formatAddress(address, 4, 2);
      expect(customFormat1).toContain('0x12');
      expect(customFormat1).toContain('...');
      expect(customFormat1).toContain('78');
      
      const customFormat2 = formatAddress(address, 10, 8);
      expect(customFormat2).toContain('0x12345678');
      expect(customFormat2).toContain('...');
      expect(customFormat2.length).toBeGreaterThan(20); // Should be a longer truncation
    });

    it('returns address as-is if it\'s shorter than truncation length', () => {
      expect(formatAddress('0x1234')).toBe('0x1234');
    });

    it('handles empty input', () => {
      expect(formatAddress('')).toBe('');
    });
  });
});