/**
 * Feature Flags Configuration
 * Enable/disable features without code changes
 *
 * UPDATE 2026-01-18: Premium features disabled to focus on core features
 */

export interface FeatureFlags {
  // Premium Features (BETA)
  analytics: boolean;
  approvals: boolean;
  benchmarking: boolean;
  lifecycle: boolean;
  apiCatalog: boolean;

  // Core Features (Always enabled)
  dashboard: boolean;
  systems: boolean;
  organizations: boolean;
  users: boolean;
}

export const featureFlags: FeatureFlags = {
  // Premium Features - DISABLED for now (focus on core features)
  analytics: false,
  approvals: false,
  benchmarking: false,
  lifecycle: false,
  apiCatalog: false,

  // Core Features - ENABLED
  dashboard: true,
  systems: true,
  organizations: true,
  users: true,
};

/**
 * Check if a feature is enabled
 * @param feature - The feature key to check
 * @returns true if feature is enabled, false otherwise
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature] ?? false;
};

/**
 * Get all enabled features
 * @returns Array of enabled feature keys
 */
export const getEnabledFeatures = (): (keyof FeatureFlags)[] => {
  return (Object.keys(featureFlags) as (keyof FeatureFlags)[]).filter(
    (feature) => featureFlags[feature]
  );
};

/**
 * Check if any premium features are enabled
 * @returns true if at least one premium feature is enabled
 */
export const hasPremiumFeaturesEnabled = (): boolean => {
  return (
    featureFlags.analytics ||
    featureFlags.approvals ||
    featureFlags.benchmarking ||
    featureFlags.lifecycle ||
    featureFlags.apiCatalog
  );
};
