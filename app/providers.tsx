'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import { ToastProvider } from '@/components/ui/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  // L-9: Config validation moved to build-time / server-side (validateConfig in config.ts
  // now throws in production when required env vars are missing)

  return (
    <ClerkProvider
      localization={idID}
      appearance={{
        variables: {
          colorPrimary: '#0f2b3c',
          colorTextOnPrimaryBackground: '#ffffff',
        },
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </ClerkProvider>
  );
}
