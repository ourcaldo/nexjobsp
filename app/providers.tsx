'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ToastProvider } from '@/components/ui/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    let authInitialized = false;
    
    // Initialize auth state with proper waiting
    const initializeAuth = async () => {
      try {
        if (!mounted || authInitialized) return;
        
        // Wait for Supabase to initialize (shorter wait)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!mounted) return;
        
        // Get current session to ensure auth state is restored
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          authInitialized = true;
          
          // Dispatch a custom event to notify components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('authInitialized', { 
              detail: { session } 
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();

    // Set up auth state change listener for the entire app
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Clear auth cache on state changes
      const { clearAuthCache } = await import('@/lib/supabase');
      clearAuthCache();
      
      // Dispatch auth state change event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
          detail: { event, session } 
        }));
      }
      
      if (event === 'SIGNED_OUT') {
        // Clear any cached data and redirect to home
        router.push('/');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // If on login page, redirect to home
        if (pathname === '/login' || pathname === '/login/') {
          router.push('/');
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Don't force a full page reload, just update state
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  useEffect(() => {
    // Validate environment variables after React has initialized
    const validateAndInitialize = async () => {
      try {
        // Import and validate environment only after component mount
        const { validateEnv } = await import('@/lib/env');
        validateEnv();
      } catch (error) {
        console.error('Environment validation failed:', error);
        // In development, we can continue with warnings
        // In production, this would prevent the app from starting with invalid config
        if (process.env.NODE_ENV === 'production') {
          // Don't throw in production to prevent app crash
          console.error('Critical: Environment validation failed in production');
        }
      }
    };

    validateAndInitialize();
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
