import { config } from '@/lib/config';

/**
 * Consolidated feature flags.
 * Flags defined in config.ts are the source of truth;
 * additional flags that only exist here extend them.
 */
export const features = {
  // From config.ts (source of truth)
  ...config.features,

  // Additional flags not in config.ts
  jobAlerts: process.env.NEXT_PUBLIC_FEATURE_JOB_ALERTS === 'true',
  searchHistory: process.env.NEXT_PUBLIC_FEATURE_SEARCH_HISTORY === 'true',
  chatSupport: process.env.NEXT_PUBLIC_FEATURE_CHAT_SUPPORT === 'true',
} as const;

export type FeatureFlag = keyof typeof features;

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return features[feature];
};
