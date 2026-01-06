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

// Validation function
export const validateConfig = () => {
  const missing: string[] = [];
  
  if (!config.cms.endpoint) missing.push('NEXT_PUBLIC_CMS_ENDPOINT');
  if (!config.cms.token) missing.push('CMS_TOKEN');
  if (!config.site.url) missing.push('NEXT_PUBLIC_SITE_URL');
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    if (config.isProduction) {
      throw new Error(errorMessage);
    }
    console.warn(`Warning: ${errorMessage}`);
    return false;
  }
  
  return true;
};

// Auto-validate on import
validateConfig();