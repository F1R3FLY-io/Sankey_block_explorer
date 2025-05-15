/**
 * Utility for CAPS mode detection and token formatting
 */

/**
 * Checks if the application is running in CAPS mode
 * This uses the __CAPS_MODE__ global variable set in vite.config.ts
 */
export const isCapsMode = (): boolean => {
  // @ts-ignore - This variable is defined in vite.config.ts
  return typeof __CAPS_MODE__ !== 'undefined' && __CAPS_MODE__ === true;
};

/**
 * Gets the appropriate token name based on current mode
 */
export const getTokenName = (): string => {
  return isCapsMode() ? 'CAPS' : 'Phlo';
};

/**
 * Formats a tooltip string replacing Phlo references with CAPS when in CAPS mode
 * @param details The original tooltip details string
 */
export const formatTooltipDetails = (details: string): string => {
  if (!isCapsMode()) return details;
  
  // Replace Phlo references with CAPS
  return details.replace(/Phlo/g, 'CAPS').replace(/phlo/g, 'CAPS');
};