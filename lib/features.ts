export const features = {
  jobAlerts: process.env.NEXT_PUBLIC_FEATURE_JOB_ALERTS === 'true',
  searchHistory: process.env.NEXT_PUBLIC_FEATURE_SEARCH_HISTORY === 'true',
  socialShare: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_SHARE === 'true',
  advancedSearch: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH === 'true',
  chatSupport: process.env.NEXT_PUBLIC_FEATURE_CHAT_SUPPORT === 'true',
  optimisticUpdates: process.env.NEXT_PUBLIC_FEATURE_OPTIMISTIC_UPDATES === 'true',
} as const;

export type FeatureFlag = keyof typeof features;

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return features[feature];
};
