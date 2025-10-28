// Environment variables helper for production deployment
export const env = {
  // Site Configuration
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech',
  
  // CMS API
  CMS_ENDPOINT: process.env.NEXT_PUBLIC_CMS_ENDPOINT || 'https://cms.tugasin.me',
  CMS_TOKEN: process.env.CMS_TOKEN || '',
  CMS_TIMEOUT: process.env.CMS_TIMEOUT || '10000',
  
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Supabase Storage S3-Compatible Configuration
  SUPABASE_STORAGE_ACCESS_KEY: process.env.SUPABASE_STORAGE_ACCESS_KEY || '',
  SUPABASE_STORAGE_SECRET_KEY: process.env.SUPABASE_STORAGE_SECRET_KEY || '',
  SUPABASE_STORAGE_ENDPOINT: process.env.SUPABASE_STORAGE_ENDPOINT || '',
  SUPABASE_STORAGE_REGION: process.env.SUPABASE_STORAGE_REGION || 'ap-southeast-1',
  
  // SEO (now handled by database settings)
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || '',
  SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
  
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
  
  // Check client-side required variables using the env object (not process.env directly)
  if (!env.SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!env.SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  // Check server-side only variables (only if on server)
  if (typeof window === 'undefined') {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY');
    }
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
  
  // Validate Supabase URL format
  if (env.SUPABASE_URL && !env.SUPABASE_URL.startsWith('https://')) {
    const errorMessage = 'NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL';
    if (env.IS_PRODUCTION) {
      throw new Error(errorMessage);
    }
    console.warn(`Warning: ${errorMessage}`);
    return false;
  }
  
  // Validate Supabase keys are not empty
  if (env.SUPABASE_ANON_KEY && env.SUPABASE_ANON_KEY.length < 10) {
    const errorMessage = 'NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)';
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