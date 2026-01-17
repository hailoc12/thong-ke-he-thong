/**
 * Responsive Utilities
 * Helper functions and media queries for responsive design
 */

import { breakpoints } from '../theme/tokens';

/**
 * Media query helper
 * Usage: const isMobile = useMediaQuery(mediaQueries.mobile);
 */
export const mediaQueries = {
  // Mobile first - min-width queries
  mobile: `(min-width: ${breakpoints.xs})`,
  tablet: `(min-width: ${breakpoints.md})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  wide: `(min-width: ${breakpoints.xl})`,

  // Max-width queries (for mobile-first approach)
  maxMobile: `(max-width: ${breakpoints.sm})`,
  maxTablet: `(max-width: ${breakpoints.md})`,
  maxDesktop: `(max-width: ${breakpoints.lg})`,

  // Range queries
  mobileOnly: `(max-width: ${breakpoints.md})`,
  tabletOnly: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktopOnly: `(min-width: ${breakpoints.lg})`,
};

/**
 * CSS Media Queries for styled components
 */
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

/**
 * Get responsive span for Ant Design Grid
 * Returns { xs, sm, md, lg, xl } object based on desktop span
 *
 * @param desktopSpan - Span for desktop (out of 24)
 * @returns Grid span object
 *
 * Example:
 * <Col {...getResponsiveSpan(12)}>
 *   // Will be: xs={24} sm={24} md={12} lg={12} xl={12}
 * </Col>
 */
export const getResponsiveSpan = (desktopSpan: number) => {
  // Full width on mobile, half on tablet+
  if (desktopSpan <= 8) {
    return {
      xs: 24,
      sm: 24,
      md: 12,
      lg: desktopSpan,
      xl: desktopSpan,
    };
  }

  // Half width on mobile, as specified on tablet+
  if (desktopSpan <= 12) {
    return {
      xs: 24,
      sm: 24,
      md: desktopSpan,
      lg: desktopSpan,
      xl: desktopSpan,
    };
  }

  // Full width on mobile and tablet, as specified on desktop
  return {
    xs: 24,
    sm: 24,
    md: 24,
    lg: desktopSpan,
    xl: desktopSpan,
  };
};

/**
 * Get responsive gutter for Ant Design Grid
 * Returns [horizontal, vertical] gutters based on screen size
 */
export const getResponsiveGutter = (): [number, number] | { xs: number; sm: number; md: number; lg: number } => {
  return {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
  };
};

/**
 * Check if current viewport matches media query
 * Uses window.matchMedia for SSR safety
 */
export const matchMedia = (query: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
};

/**
 * Hook to detect current breakpoint
 * Returns: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 */
export const useBreakpoint = (): string => {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;

  if (width < parseInt(breakpoints.sm)) return 'xs';
  if (width < parseInt(breakpoints.md)) return 'sm';
  if (width < parseInt(breakpoints.lg)) return 'md';
  if (width < parseInt(breakpoints.xl)) return 'lg';
  if (width < parseInt(breakpoints['2xl'])) return 'xl';
  return '2xl';
};

/**
 * Helper to check if mobile viewport
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(breakpoints.md);
};

/**
 * Helper to check if tablet viewport
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
};

/**
 * Helper to check if desktop viewport
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
};

/**
 * Responsive font size calculator
 * Scales font size based on viewport width
 */
export const getResponsiveFontSize = (baseSize: number, minSize?: number, maxSize?: number): string => {
  const min = minSize || baseSize * 0.75;
  const max = maxSize || baseSize * 1.25;

  return `clamp(${min}px, ${baseSize}px + 0.5vw, ${max}px)`;
};

/**
 * Get responsive padding/margin
 * Returns smaller values on mobile, larger on desktop
 */
export const getResponsiveSpacing = (baseSpacing: number): { xs: number; md: number; lg: number } => {
  return {
    xs: baseSpacing * 0.5,
    md: baseSpacing * 0.75,
    lg: baseSpacing,
  };
};

export default {
  mediaQueries,
  media,
  getResponsiveSpan,
  getResponsiveGutter,
  matchMedia,
  useBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getResponsiveFontSize,
  getResponsiveSpacing,
};
