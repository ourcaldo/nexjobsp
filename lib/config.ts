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
    token: process.env.CMS_TOKEN || 'placeholder-token',
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

// Validation function
export const validateConfig = () => {
  // Skip validation during build time completely
  if (typeof window === 'undefined') {
    return true;
  }
  
  const missing: string[] = [];
  
  if (!config.cms.endpoint) missing.push('NEXT_PUBLIC_CMS_ENDPOINT');
  if (!config.cms.token || config.cms.token === 'placeholder-token') missing.push('CMS_TOKEN');
  if (!config.site.url) missing.push('NEXT_PUBLIC_SITE_URL');
  
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
export const env = {
  // Site Configuration
  SITE_URL: config.site.url,
  SITE_NAME: config.site.name,
  SITE_DESCRIPTION: config.site.description,
  
  // CMS API
  CMS_ENDPOINT: config.cms.endpoint,
  CMS_TOKEN: config.cms.token,
  CMS_TIMEOUT: config.cms.timeout.toString(),
  
  // Storage Configuration
  STORAGE_ACCESS_KEY: config.storage.accessKey,
  STORAGE_SECRET_KEY: config.storage.secretKey,
  STORAGE_ENDPOINT: config.storage.endpoint,
  STORAGE_REGION: config.storage.region,
  
  // Analytics
  GA_ID: config.analytics.gaId,
  GTM_ID: config.analytics.gtmId,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: config.isProduction,
  IS_DEVELOPMENT: config.isDevelopment,
} as const;

// Only validate in development and client-side only
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  validateConfig();
}