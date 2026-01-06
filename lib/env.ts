// Environment variables helper for production deployment
export const env = {
  // Site Configuration
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech',
  
  // CMS API
  CMS_ENDPOINT: process.env.NEXT_PUBLIC_CMS_ENDPOINT || 'https://cms.nexjob.tech',
  CMS_TOKEN: process.env.CMS_TOKEN || '',
  CMS_TIMEOUT: process.env.CMS_TIMEOUT || '10000',
  
  // Storage Configuration (if needed)
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY || '',
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY || '',
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT || '',
  STORAGE_REGION: process.env.STORAGE_REGION || 'ap-southeast-1',
  
  // SEO
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Nexjob',
  SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Platform pencarian kerja terpercaya di Indonesia',
  
  // Analytics
  GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
export const validateEnv = () => {
  const missing: string[] = [];
  
  // Check required variables
  if (!env.CMS_ENDPOINT) {
    missing.push('NEXT_PUBLIC_CMS_ENDPOINT');
  }
  if (!env.CMS_TOKEN) {
    missing.push('CMS_TOKEN');
  }
  if (!env.SITE_URL) {
    missing.push('NEXT_PUBLIC_SITE_URL');
  }
  
  if (missing.length > 0) {
    const errorMessage = `Missing critical environment variables: ${missing.join(', ')}`;
    
    if (env.IS_PRODUCTION) {
      // Fail fast in production to prevent silent failures
      throw new Error(errorMessage);
    }
    
    // In development, provide helpful guidance but don't crash
    console.warn(`Warning: ${errorMessage}`);
    console.warn('Please check your .env file and ensure all required variables are set.');
    console.warn('Copy .env.example to .env and fill in the required values.');
    return false;
  }
  
  // Validate CMS endpoint format
  if (env.CMS_ENDPOINT && !env.CMS_ENDPOINT.startsWith('https://')) {
    const errorMessage = 'NEXT_PUBLIC_CMS_ENDPOINT must be a valid HTTPS URL';
    if (env.IS_PRODUCTION) {
      throw new Error(errorMessage);
    }
    console.warn(`Warning: ${errorMessage}`);
    return false;
  }
  
  return true;
};

// Get current domain dynamically - enhanced for production
export const getCurrentDomain = () => {
  // For server-side rendering, always use environment variable in production
  if (typeof window === 'undefined') {
    return env.SITE_URL;
  }
  
  // For client-side, use current origin in development, env var in production
  if (env.IS_PRODUCTION) {
    return env.SITE_URL;
  }
  
  return window.location.origin;
};

// Call validation on module load to ensure it happens on app initialization
validateEnv();