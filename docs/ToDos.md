# TODOs

## Issue #6: Block Explorer doesn't understand transfers issued by Embers

**Status:** ✅ Resolved (Short-term fix implemented)
**Priority:** High
**Link:** https://github.com/F1R3FLY-io/Sankey_block_explorer/issues/6

### Problem Description
The block explorer currently uses a regex pattern in `BlockCard.tsx:57` to detect transfers:
```javascript
const termMatch = deploy.term?.match(/match \("([^"]+)", "([^"]+)", (\d+)\)/);
```

However, Embers sends transfers using a different pattern:
```scala
new deployerId(`rho:rchain:deployerId`), deployId(`rho:rchain:deployId`) in {
    @"sendTransfer"!(
        *deployerId,
        *deployId,
        {{ timestamp }},
        {{ wallet_address_from }},
        {{ wallet_address_to }},
        {{ amount }},
        {{ description }}
    )
}
```

This mismatch means transfers from Embers are not detected or displayed by the block explorer.

### Suggested Solutions

#### Option 1: Extend Pattern Matching (Short-term)
Add additional regex pattern to detect the `@"sendTransfer"!` format:
- Update `BlockCard.tsx:57` to check for multiple patterns
- Extract parameters from the `@"sendTransfer"!` call
- Normalize the extracted data to match the existing transfer data structure
- **Pros:** Quick fix, minimal changes
- **Cons:** Fragile, doesn't scale with multiple wallet implementations

#### Option 2: Implement Transfer Event Notification (Recommended - Long-term)
Implement Mike's notification proposal for standardized transfer events:
- Define a standard transfer event schema that all wallets must emit
- Update Embers to emit standardized transfer events
- Update block explorer to listen for these standard events
- Create a transfer event parser/validator
- **Pros:** Scalable, standardized approach, works with any wallet implementation
- **Cons:** Requires coordination with wallet developers, more implementation work

#### Option 3: Hybrid Approach
Implement both solutions:
1. Add pattern matching for Embers transfers immediately (Option 1)
2. Work on standardized event notification system (Option 2) in parallel
3. Phase out pattern matching once event system is adopted
- **Pros:** Immediate fix + long-term scalability
- **Cons:** More maintenance until migration is complete

### Implementation Status

#### ✅ Completed (Short-term Fix)
- [x] Created `src/utils/transferParser.ts` utility module
  - Supports both standard `match()` and Embers `@"sendTransfer"!()` patterns
  - Returns normalized `TransferData` structure
- [x] Updated `BlockCard.tsx` to use new parser at all 6 transfer detection locations
- [x] Added comprehensive unit tests (22 tests in `transferParser.test.ts`)
- [x] Added integration tests (10+ new tests in `BlockCard.test.tsx`)
- [x] Added mock data for Embers and mixed transfer patterns
- [x] Enabled previously skipped tests
- [x] All 176 tests passing ✅
- [x] Build successful ✅

#### 🔄 Future Work (Long-term Solution)
- [ ] Review Mike's notification proposal specification
- [ ] Design standard transfer event schema
- [ ] Coordinate with Embers team on event emission standardization
- [ ] Document transfer event schema for wallet developers
- [ ] Create migration guide for wallet implementations
- [ ] Phase out pattern matching once event system is adopted

### Related Files
**Implementation:**
- `src/utils/transferParser.ts` - Transfer parsing utility (NEW)
- `src/utils/__tests__/transferParser.test.ts` - Parser unit tests (NEW)
- `src/components/BlockCard.tsx` - Updated to use new parser
- `src/components/__tests__/BlockCard.test.tsx` - Enhanced integration tests
- `src/test/mocks.ts` - Added Embers mock data

**Future:**
- Transfer event parser/validator module
- Transfer event schema documentation
