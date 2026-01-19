/**
 * Design System Tokens - Enhanced Version
 * Centralized design tokens for colors, typography, spacing, etc.
 * Updated with improved accessibility and visual consistency
 */

// Color Palette
export const colors = {
  // Primary colors - Better contrast for accessibility
  primary: {
    main: '#0066CC',    // Better contrast ratio
    light: '#3399FF',   // Lighter variant
    dark: '#003399',    // Darker variant
    lighter: '#99C2FF', // Very light
    darker: '#002266',  // Very dark
    bg: '#F0F7FF',      // Primary background tint
  },

  // Secondary colors - Enhanced purple
  secondary: {
    main: '#7C3AED',    // More vibrant purple
    light: '#A78BFA',
    dark: '#5B21B6',
    lighter: '#C4B5FD',
    darker: '#4C1D95',
    bg: '#F5F3FF',      // Secondary background tint
  },

  // Status colors - More distinct for better UX
  status: {
    active: '#22C55E',      // Green - Active/Operating
    inactive: '#EF4444',    // Red - Inactive/Stopped
    warning: '#F59E0B',     // Orange - Warning/Pilot
    maintenance: '#8B5CF6', // Purple - Maintenance
    pending: '#FBBF24',     // Yellow - Pending
  },

  // Semantic colors - Enhanced
  success: {
    main: '#22C55E',    // Modern green
    light: '#4ADE80',
    dark: '#16A34A',
    bg: '#F0FDF4',      // Success background
  },

  warning: {
    main: '#F59E0B',    // Modern orange
    light: '#FBBF24',
    dark: '#D97706',
    bg: '#FFFBEB',      // Warning background
  },

  error: {
    main: '#EF4444',    // Modern red
    light: '#F87171',
    dark: '#DC2626',
    bg: '#FEF2F2',      // Error background
  },

  info: {
    main: '#3B82F6',    // Modern blue
    light: '#60A5FA',
    dark: '#2563EB',
    bg: '#EFF6FF',      // Info background
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },

  // Background colors
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
    dark: '#0F172A',    // Modern dark sidebar (instead of #001529)
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors - Better contrast
  text: {
    primary: '#111827',     // Near black for better readability
    secondary: '#6B7280',   // Gray for secondary text
    disabled: '#9CA3AF',    // Clearer disabled state
    hint: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#0066CC',
  },

  // Border colors
  border: {
    light: '#E5E7EB',
    main: '#D1D5DB',
    dark: '#374151',
    focus: '#0066CC',      // Focus border color
  },
};

// Typography - Enhanced
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
    // New weights for better hierarchy
    body: 400,
    bodyBold: 500,
    headings: 600,
    headingsHeavy: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
    // New line heights for better readability
    body: 1.6,
    headings: 1.3,
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
  '2xl': '32px',
  full: '9999px',
};

// Shadows - Enhanced with better depth
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  // Card shadows
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Elevation shadows
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 32px 64px -16px rgba(0, 0, 0, 0.3)',

  // Special shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  card: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
  cardHover: '0 10px 20px rgba(0,0,0,0.1), 0 6px 10px rgba(0,0,0,0.08)',
  modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  drawer: '0 0 0 1px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 3px rgba(0, 102, 204, 0.15)',
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

  // Common transition presets
  default: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Animation durations
export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

// New: Utility tokens for common patterns
export const utility = {
  // Card styles
  card: {
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 200ms ease',
  },

  // Button styles
  button: {
    height: '40px',
    padding: '0 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 150ms ease',
  },

  // Input styles
  input: {
    height: '40px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
  },

  // Focus styles (accessibility)
  focusRing: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.15)',
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
  animation,
  utility,
};

export default theme;
