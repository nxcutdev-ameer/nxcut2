export const colors = {
  // Primary brand colors - Purple gradient theme
  primary: "#6366f1", // Main purple from the gradient
  primaryLight: "#e0e7ff", // Light purple for backgrounds
  primaryDark: "#4f46e5", // Darker purple for hover states

  // Secondary colors - Pink accent from gradient
  secondary: "#ec4899", // Pink from the gradient
  secondaryLight: "#fce7f3", // Light pink
  secondaryDark: "#db2777", // Darker pink

  // Background colors
  background: "#f8fafc", // Main app background
  backgroundSecondary: "#f1f5f9", // Secondary background
  white: "#ffffff",

  // Surface colors
  surface: "#ffffff", // Card backgrounds
  surfaceElevated: "#ffffff", // Elevated surfaces

  // Text colors
  text: "#1e293b", // Primary text - dark slate
  textSecondary: "#64748b", // Secondary text - medium slate
  textMuted: "#94a3b8", // Muted text - light slate
  textInverse: "#ffffff", // White text for dark backgrounds

  // Border colors
  border: "#e2e8f0", // Light border
  borderLight: "#f1f5f9", // Very light border
  borderFocus: "#6366f1", // Focused border (primary)

  // Status colors matching the dashboard
  success: "#22c55e", // Green for positive metrics (+75%, +106.5%)
  successLight: "#dcfce7",
  successDark: "#16a34a",

  warning: "#f59e0b", // Orange for warnings
  warningLight: "#fef3c7",
  warningDark: "#d97706",

  danger: "#ef4444", // Red for negative metrics (-98.2%, -99.8%)
  dangerLight: "#fee2e2",
  dangerDark: "#dc2626",

  info: "#3b82f6", // Blue for information
  infoLight: "#dbeafe",
  infoDark: "#2563eb",

  // Button colors
  buttonPrimary: "#1e293b", // Black/dark buttons like "Continue"
  buttonPrimaryHover: "#0f172a",
  buttonSecondary: "#ffffff",
  buttonSecondaryHover: "#f8fafc",
  buttonDisabled: "#f1f5f9",
  buttonTextDisabled: "#cbd5e1",

  // Chart colors (matching the dashboard charts)
  chart: {
    primary: "#6366f1", // Purple line
    secondary: "#a5b4fc", // Light purple line
    tertiary: "#ec4899", // Pink accent
    background: "#f8fafc",
    grid: "#e2e8f0",
    axis: "#64748b",
  },

  // Gradient colors (for the business wallet card)
  gradient: {
    start: "#6366f1", // Purple start
    middle: "#8b5cf6", // Purple-pink middle
    end: "#ec4899", // Pink end
  },

  // Gray scale
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Legacy support
  extraLightGray: "#f1f5f9",
  black: "#0f172a",

  // Special UI states
  overlay: "rgba(15, 23, 42, 0.5)", // Dark overlay
  backdrop: "rgba(0, 0, 0, 0.25)", // Modal backdrop

  // Status indicators for business metrics
  metrics: {
    positive: "#22c55e", // Green for positive changes
    negative: "#ef4444", // Red for negative changes
    neutral: "#64748b", // Gray for no change
    unchanged: "#94a3b8", // Light gray for 0% changes
  },

  // Channel colors (for sales by channel)
  channels: {
    offline: "#64748b", // Gray for offline sales
    fresha: "#6366f1", // Primary purple for Fresha marketplace
    booking: "#3b82f6", // Blue for booking links
    social: "#f59e0b", // Orange for social
    marketing: "#ec4899", // Pink for marketing
  },
};

export const shadows = {
  small: {
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
};

// Theme object for easy usage
export const theme = {
  colors,
  shadows,
  // Additional theme properties
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    round: 50,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export default theme;
