/**
 * Design System Tokens
 * Centralized design tokens for colors, typography, spacing, etc.
 */

// Color Palette
export const colors = {
  // Primary colors
  primary: {
    main: '#0066e6',
    light: '#3385ff',
    dark: '#0052bd',
    lighter: '#99c2ff',
    darker: '#003d8f',
  },

  // Secondary colors
  secondary: {
    main: '#5e16a0',
    light: '#7e3db8',
    dark: '#450e7a',
    lighter: '#b794d6',
    darker: '#2d0750',
  },

  // Semantic colors
  success: {
    main: '#52c41a',
    light: '#73d13d',
    dark: '#389e0d',
  },

  warning: {
    main: '#faad14',
    light: '#ffc53d',
    dark: '#d48806',
  },

  error: {
    main: '#ff4d4f',
    light: '#ff7875',
    dark: '#cf1322',
  },

  info: {
    main: '#1890ff',
    light: '#40a9ff',
    dark: '#096dd9',
  },

  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#fafafa',
    gray100: '#f5f5f5',
    gray200: '#e8e8e8',
    gray300: '#d9d9d9',
    gray400: '#bfbfbf',
    gray500: '#8c8c8c',
    gray600: '#595959',
    gray700: '#434343',
    gray800: '#262626',
    gray900: '#141414',
  },

  // Background colors
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    dark: '#001529', // For dark sidebar
  },

  // Text colors
  text: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(0, 0, 0, 0.65)',
    disabled: 'rgba(0, 0, 0, 0.25)',
    hint: 'rgba(0, 0, 0, 0.45)',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#f0f0f0',
    main: '#d9d9d9',
    dark: '#434343',
  },
};

// Typography
export const typography = {
  fontFamily: {
    base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    code: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Spacing (8px base scale)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
  '5xl': '96px',
};

// Breakpoints (mobile-first)
export const breakpoints = {
  xs: '480px',   // Mobile portrait
  sm: '576px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '992px',   // Desktop
  xl: '1200px',  // Large desktop
  '2xl': '1600px', // Extra large desktop
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Z-index layers
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Transitions
export const transitions = {
  duration: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
  },

  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Export combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  borderRadius,
  shadows,
  zIndex,
  transitions,
};

export default theme;
