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

// Formats a date into a human-friendly relative time like "8 hours ago"
export function formatTimeAgo(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec} second${diffSec === 1 ? '' : 's'} ago`;

  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
