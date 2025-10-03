/**
 * Transfer parsing utilities for detecting and extracting transfer information
 * from different wallet implementations (standard match pattern and Embers sendTransfer)
 */

export interface TransferData {
  from: string;
  to: string;
  amount: number;
}

/**
 * Parses a deploy term to extract transfer information.
 * Supports two formats:
 * 1. Standard match pattern: match ("from", "to", amount)
 * 2. Embers sendTransfer: @"sendTransfer"!(deployerId, deployId, timestamp, from, to, amount, description)
 *
 * @param term - The deploy term string to parse
 * @returns TransferData object if a transfer is detected, null otherwise
 */
export function parseTransfer(term: string | undefined): TransferData | null {
  if (!term) return null;

  // Try standard match pattern first
  const matchPattern = /match\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*\)/;
  const matchResult = term.match(matchPattern);

  if (matchResult) {
    const [, from, to, amountStr] = matchResult;
    return {
      from,
      to,
      amount: parseInt(amountStr, 10)
    };
  }

  // Try Embers sendTransfer pattern
  // Pattern: @"sendTransfer"!(deployerId, deployId, timestamp, from, to, amount, description)
  // Note: deployerId and deployId are typically *deployerId and *deployId (dereferenced)
  // The addresses and amount can be either quoted strings or template variables
  const sendTransferPattern = /@"sendTransfer"!\s*\(\s*[^,]+\s*,\s*[^,]+\s*,\s*[^,]+\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*[^)]+)?\s*\)/;
  const sendTransferResult = term.match(sendTransferPattern);

  if (sendTransferResult) {
    let [, fromRaw, toRaw, amountRaw] = sendTransferResult;

    // Clean up the extracted values (remove quotes, trim whitespace, handle template variables)
    const from = fromRaw.trim().replace(/^["']|["']$/g, '').replace(/^\{\{\s*|\s*\}\}$/g, '');
    const to = toRaw.trim().replace(/^["']|["']$/g, '').replace(/^\{\{\s*|\s*\}\}$/g, '');
    const amountStr = amountRaw.trim().replace(/^["']|["']$/g, '').replace(/^\{\{\s*|\s*\}\}$/g, '');

    // Parse the amount - handle both numeric strings and template variables
    const amount = parseInt(amountStr, 10);

    // Only return if we have valid data
    if (from && to && !isNaN(amount)) {
      return {
        from,
        to,
        amount
      };
    }
  }

  return null;
}

/**
 * Checks if a deploy term contains a transfer (either format)
 *
 * @param term - The deploy term string to check
 * @returns true if the term contains a transfer, false otherwise
 */
export function hasTransfer(term: string | undefined): boolean {
  return parseTransfer(term) !== null;
}
