// helpers.ts
import { Dimensions } from "react-native";

// iPhone X dimensions (reference screen)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
export { SCREEN_WIDTH, SCREEN_HEIGHT };
/**
 * Responsive font size
 * @param size - font size for iPhone X
 * @returns responsive font size
 */
export function fontEq(size: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return size * scale; // no rounding, more accurate
}

/**
 * Responsive height
 * @param value - height based on iPhone X
 * @returns responsive height
 */
export function getHeightEquivalent(value: number): number {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return value * scale; // no rounding
}

/**
 * Responsive width
 * @param value - width based on iPhone X
 * @returns responsive width
 */
export function getWidthEquivalent(value: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return value * scale; // no rounding
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
