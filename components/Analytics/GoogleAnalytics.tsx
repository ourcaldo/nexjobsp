'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { config } from '@/lib/config';

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
    if (!config.analytics.gaId) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', config.analytics.gaId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  // Validate GA ID format (G-XXXXXXXXXX or UA-XXXXX-X)
  const gaIdPattern = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/;
  const gaId = config.analytics.gaId;

  // Don't render in development unless explicitly enabled
  if (!gaId || !gaIdPattern.test(gaId) || (config.isDevelopment && !config.analytics.enableInDev)) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
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