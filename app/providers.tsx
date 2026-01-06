'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Validate environment variables after React has initialized
    const validateAndInitialize = async () => {
      try {
        // Import and validate environment only after component mount
        const { validateConfig } = await import('@/lib/config');
        validateConfig();
      } catch (error) {
        console.error('Configuration validation failed:', error);
        // In development, we can continue with warnings
        // In production, this would prevent the app from starting with invalid config
        if (process.env.NODE_ENV === 'production') {
          // Don't throw in production to prevent app crash
          console.error('Critical: Configuration validation failed in production');
        }
      }
    };

    validateAndInitialize();
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
