import { describe, it, expect } from 'vitest';
import { parseTransfer, hasTransfer } from '../transferParser';

describe('transferParser', () => {
  describe('parseTransfer', () => {
    describe('standard match pattern', () => {
      it('should parse basic match pattern', () => {
        const term = 'match ("addr1", "addr2", 1000)';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 1000
        });
      });

      it('should parse match pattern with extra whitespace', () => {
        const term = 'match (  "addr1"  ,  "addr2"  ,  1000  )';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 1000
        });
      });

      it('should parse match pattern with no spaces', () => {
        const term = 'match("addr1","addr2",1000)';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 1000
        });
      });

      it('should parse match pattern with long addresses', () => {
        const term = 'match ("1111111111111111111111111111111111111111111111111111", "2222222222222222222222222222222222222222222222222222", 5000)';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: '1111111111111111111111111111111111111111111111111111',
          to: '2222222222222222222222222222222222222222222222222222',
          amount: 5000
        });
      });

      it('should parse match pattern with large amounts', () => {
        const term = 'match ("addr1", "addr2", 999999999)';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 999999999
        });
      });
    });

    describe('Embers sendTransfer pattern', () => {
      it('should parse basic Embers sendTransfer pattern', () => {
        const term = `new deployerId(\`rho:rchain:deployerId\`), deployId(\`rho:rchain:deployId\`) in {
    @"sendTransfer"!(
        *deployerId,
        *deployId,
        1649086000000,
        "emberAddr1",
        "emberAddr2",
        2500,
        "Embers wallet transfer"
    )
}`;
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'emberAddr1',
          to: 'emberAddr2',
          amount: 2500
        });
      });

      it('should return null for Embers sendTransfer with template variables (cannot parse at compile time)', () => {
        const term = `new deployerId(\`rho:rchain:deployerId\`), deployId(\`rho:rchain:deployId\`) in {
    @"sendTransfer"!(
        *deployerId,
        *deployId,
        {{ timestamp }},
        {{ wallet_address_from }},
        {{ wallet_address_to }},
        {{ amount }},
        {{ description }}
    )
}`;
        const result = parseTransfer(term);

        // Template variables cannot be parsed as transfers at compile time
        // since we don't know their runtime values
        expect(result).toBeNull();
      });

      it('should parse Embers sendTransfer with single-line format', () => {
        const term = '@"sendTransfer"!(*deployerId, *deployId, 1649086000000, "addr1", "addr2", 3000, "test")';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 3000
        });
      });

      it('should parse Embers sendTransfer without description parameter', () => {
        const term = '@"sendTransfer"!(*deployerId, *deployId, 1649086000000, "addr1", "addr2", 3000)';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 3000
        });
      });

      it('should parse Embers sendTransfer with extra whitespace', () => {
        const term = `@"sendTransfer"!(  *deployerId  ,  *deployId  ,  1649086000000  ,  "addr1"  ,  "addr2"  ,  3000  ,  "test"  )`;
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 3000
        });
      });
    });

    describe('edge cases', () => {
      it('should return null for undefined term', () => {
        const result = parseTransfer(undefined);
        expect(result).toBeNull();
      });

      it('should return null for empty string', () => {
        const result = parseTransfer('');
        expect(result).toBeNull();
      });

      it('should return null for non-transfer Rholang code', () => {
        const term = 'new x in { x!(10) | for(y <- x) { y * 2 } }';
        const result = parseTransfer(term);
        expect(result).toBeNull();
      });

      it('should return null for invalid match pattern (missing closing paren)', () => {
        const term = 'match ("addr1", "addr2", 1000';
        const result = parseTransfer(term);
        expect(result).toBeNull();
      });

      it('should return null for invalid sendTransfer pattern (missing parameters)', () => {
        const term = '@"sendTransfer"!(*deployerId, *deployId)';
        const result = parseTransfer(term);
        expect(result).toBeNull();
      });

      it('should return null for match pattern with non-numeric amount', () => {
        const term = 'match ("addr1", "addr2", "notanumber")';
        const result = parseTransfer(term);
        expect(result).toBeNull();
      });

      it('should parse first match if multiple patterns exist', () => {
        const term = 'match ("addr1", "addr2", 1000) match ("addr3", "addr4", 2000)';
        const result = parseTransfer(term);

        expect(result).toEqual({
          from: 'addr1',
          to: 'addr2',
          amount: 1000
        });
      });
    });
  });

  describe('hasTransfer', () => {
    it('should return true for valid match pattern', () => {
      const term = 'match ("addr1", "addr2", 1000)';
      expect(hasTransfer(term)).toBe(true);
    });

    it('should return true for valid Embers sendTransfer pattern', () => {
      const term = '@"sendTransfer"!(*deployerId, *deployId, 1649086000000, "addr1", "addr2", 3000, "test")';
      expect(hasTransfer(term)).toBe(true);
    });

    it('should return false for non-transfer code', () => {
      const term = 'new x in { x!(10) }';
      expect(hasTransfer(term)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasTransfer(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasTransfer('')).toBe(false);
    });
  });
});
