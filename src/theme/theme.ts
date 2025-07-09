import { MD3DarkTheme, MD3LightTheme } from "react-native-paper"

// Light theme colors from global.css variables
export const lightColors = {
  background: "#FFFFFF",
  foreground: "#0C0A09",
  card: "#FFFFFF",
  cardForeground: "#0C0A09",
  popover: "#FFFFFF",
  popoverForeground: "#0C0A09",
  primary: "#1A202C",
  primaryForeground: "#F5F7FA",
  secondary: "#F1F5F9",
  secondaryForeground: "#1A202C",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  accent: "#F1F5F9",
  accentForeground: "#1A202C",
  destructive: "#EF4444",
  destructiveForeground: "#F5F7FA",
  border: "#E2E8F0",
  input: "#E2E8F0",
  ring: "#0C0A09",
  chart1: "#FF6B35",
  chart2: "#3AA89B",
  chart3: "#1F485D",
  chart4: "#F6B93B",
  chart5: "#FF8C42",
}

// Dark theme colors from global.css variables
export const darkColors = {
  background: "#0C0A09",
  foreground: "#F5F7FA",
  card: "#0C0A09",
  cardForeground: "#F5F7FA",
  popover: "#0C0A09",
  popoverForeground: "#F5F7FA",
  primary: "#F5F7FA",
  primaryForeground: "#1A202C",
  secondary: "#1F2937",
  secondaryForeground: "#F5F7FA",
  muted: "#1F2937",
  mutedForeground: "#A3A3A3",
  accent: "#1F2937",
  accentForeground: "#F5F7FA",
  destructive: "#7F1D1D",
  destructiveForeground: "#F5F7FA",
  border: "#1F2937",
  input: "#1F2937",
  ring: "#CBD5E1",
  chart1: "#3B82F6",
  chart2: "#10B981",
  chart3: "#F59E0B",
  chart4: "#9333EA",
  chart5: "#EC4899",
}

// PetPal branded theme
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#FF7A47",
    secondary: "#FF9B73",
    tertiary: "#FFB899",
    surface: "#FFFFFF",
    background: "#FFF5F0",
    onPrimary: "#FFFFFF",
    onSecondary: "#8B4513",
    onSurface: "#8B4513",
    onBackground: "#8B4513",
    outline: "#E8E8E8",
  },
}

// Dark theme variant
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FF7A47",
    secondary: "#FF9B73",
    tertiary: "#FFB899",
    surface: "#1F2937",
    background: "#121212",
    onPrimary: "#FFFFFF",
    onSecondary: "#F5F7FA",
    onSurface: "#F5F7FA",
    onBackground: "#F5F7FA",
    outline: "#374151",
  }
}

// Main colors used throughout the app
export const colors = {
  primary: "#FF7A47",
  secondary: "#FF9B73",
  tertiary: "#FFB899",
  background: "#FFF5F0",
  surface: "#FFFFFF",
  text: "#8B4513",
  textSecondary: "#8B4513",
  border: "#E8E8E8",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
}

export default theme;
