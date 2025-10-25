'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { env } from '@/lib/env';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!env.GA_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', env.GA_ID!, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  // Don't render in development unless explicitly enabled
  if (!env.GA_ID || (env.IS_DEVELOPMENT && !process.env.NEXT_PUBLIC_GA_ENABLE_DEV)) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${env.GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${env.GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;