/**
 * Converts a hex color to RGB format.
 * @param hex Hex color string (e.g., "#ff0000")
 * @returns RGB color object {r, g, b}
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converts RGB values to a hex color string.
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 * Generates a color gradient between two colors.
 * @param startColor Start color in hex format
 * @param endColor End color in hex format
 * @param steps Number of steps in the gradient
 * @returns Array of hex color strings
 */
export const generateGradient = (
  startColor: string,
  endColor: string,
  steps: number
): string[] => {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  if (!start || !end) return [];

  const gradient: string[] = [];

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(start.r + ratio * (end.r - start.r));
    const g = Math.round(start.g + ratio * (end.g - start.g));
    const b = Math.round(start.b + ratio * (end.b - start.b));

    gradient.push(rgbToHex(r, g, b));
  }

  return gradient;
};

/**
 * Generates a random hex color.
 * @returns Random hex color string
 */
export const generateRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Adjusts the brightness of a hex color.
 * @param hex Hex color string
 * @param percent Brightness adjustment percentage (-100 to 100)
 * @returns Adjusted hex color string
 */
export const adjustBrightness = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const factor = 1 + percent / 100;

  const adjustedR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const adjustedG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const adjustedB = Math.min(255, Math.max(0, Math.round(b * factor)));

  return rgbToHex(adjustedR, adjustedG, adjustedB);
};