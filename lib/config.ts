// Simplified configuration without Supabase
export const config = {
  // Site Configuration
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Nexjob',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Platform pencarian kerja terpercaya di Indonesia',
  },

  // CMS Configuration
  cms: {
    endpoint: process.env.NEXT_PUBLIC_CMS_ENDPOINT || 'https://cms.nexjob.tech',
    token: process.env.CMS_TOKEN || '',
    timeout: parseInt(process.env.CMS_TIMEOUT || '10000'),
  },

  // Analytics
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    enableInDev: process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_GA_ENABLE_DEV === 'true',
  },

  // Storage (if needed)
  storage: {
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    endpoint: process.env.STORAGE_ENDPOINT || '',
    region: process.env.STORAGE_REGION || 'ap-southeast-1',
    bucket: process.env.STORAGE_BUCKET || 'nexjob-uploads',
  },

  // Performance
  cache: {
    filterTtl: parseInt(process.env.FILTER_CACHE_TTL || '3600000'),
    cmsTtl: parseInt(process.env.CMS_CACHE_TTL || '1800000'),
    sitemapTtl: parseInt(process.env.SITEMAP_CACHE_TTL || '300000'),
  },

  // Feature Flags
  features: {
    socialShare: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_SHARE === 'true',
    advancedSearch: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH === 'true',
    optimisticUpdates: process.env.NEXT_PUBLIC_FEATURE_OPTIMISTIC_UPDATES === 'true',
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Validation function — runs on both client and server
export const validateConfig = () => {
  const missing: string[] = [];
  const isServer = typeof window === 'undefined';

  // Public variables — required in all environments
  if (!config.cms.endpoint) missing.push('NEXT_PUBLIC_CMS_ENDPOINT');
  if (!config.site.url) missing.push('NEXT_PUBLIC_SITE_URL');

  // Server-only variables — only checked on the server
  if (isServer) {
    if (!config.cms.token) missing.push('CMS_TOKEN');
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    console.warn(`Warning: ${errorMessage}`);
    return false;
  }

  return true;
};

// Get current domain dynamically - enhanced for production
export const getCurrentDomain = () => {
  // For server-side rendering, always use environment variable in production
  if (typeof window === 'undefined') {
    return config.site.url;
  }

  // For client-side, use current origin in development, env var in production
  if (config.isProduction) {
    return config.site.url;
  }

  return window.location.origin;
};

// Export env object for compatibility with existing imports
// NOTE: Only public/non-secret values should be exported here.
// Server-only secrets (CMS_TOKEN, STORAGE keys) must be accessed
// via `config.cms.token` or `config.storage.*` on the server side only.
export const env = {
  // Site Configuration
  SITE_URL: config.site.url,
  SITE_NAME: config.site.name,
  SITE_DESCRIPTION: config.site.description,

  // CMS API (public endpoint only — token is server-only via config.cms.token)
  CMS_ENDPOINT: config.cms.endpoint,
  CMS_TIMEOUT: config.cms.timeout.toString(),

  // Analytics
  GA_ID: config.analytics.gaId,
  GTM_ID: config.analytics.gtmId,

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: config.isProduction,
  IS_DEVELOPMENT: config.isDevelopment,
} as const;

// Validate in development on both client and server
if (process.env.NODE_ENV === 'development') {
  validateConfig();
}