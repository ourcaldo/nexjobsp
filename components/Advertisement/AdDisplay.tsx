'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DOMPurify from 'dompurify';
import { isAdExcludedPath } from '@/lib/utils/adUtils';

// Module-level cache: deduplicates fetch() across all AdDisplay instances per render cycle
let adDataPromise: Promise<any> | null = null;
function getAdData(): Promise<any> {
  if (!adDataPromise) {
    adDataPromise = fetch('/api/advertisements').then(r => r.json());
    // Clear cache after 5 minutes
    setTimeout(() => { adDataPromise = null; }, 5 * 60 * 1000);
  }
  return adDataPromise;
}

interface AdDisplayProps {
  position: 'popup_ad_code' | 'sidebar_archive_ad_code' | 'sidebar_single_ad_code' | 'single_top_ad_code' | 'single_bottom_ad_code' | 'single_middle_ad_code' | 'popup' | 'sidebar_archive' | 'sidebar_single' | 'single_top' | 'single_bottom' | 'single_middle';
  className?: string;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ position, className = '' }) => {
  const pathname = usePathname();
  const [adCode, setAdCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Check if current page is excluded from ads (login, signup, profile)
  const excluded = isAdExcludedPath(pathname || '');

  useEffect(() => {
    // Skip fetching ads on excluded pages
    if (excluded) {
      setLoading(false);
      return;
    }

    const loadAd = async () => {
      try {
        // Normalize position to include _ad_code suffix if not already present
        let adPosition = position;
        if (!position.endsWith('_ad_code')) {
          adPosition = `${position}_ad_code` as any;
        }

        // Use shared cached fetch to avoid duplicate requests
        const data = await getAdData();

        if (data.success && data.data && data.data.ad_codes) {
          // Map position to ad_codes field
          const positionMap: Record<string, string> = {
            'sidebar_archive_ad_code': data.data.ad_codes.sidebar_archive || '',
            'sidebar_single_ad_code': data.data.ad_codes.sidebar_single || '',
            'single_top_ad_code': data.data.ad_codes.single_top || '',
            'single_bottom_ad_code': data.data.ad_codes.single_bottom || '',
            'single_middle_ad_code': data.data.ad_codes.single_middle || '',
          };

          setAdCode(positionMap[adPosition] || '');
        }
      } catch (error) {
        console.error('Error loading advertisement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [position, excluded]);

  // Allowed ad network script domains (defense-in-depth)
  const ALLOWED_SCRIPT_DOMAINS = [
    'pagead2.googlesyndication.com',
    'www.googletagservices.com',
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'cdn.adnxs.com',
    'securepubads.g.doubleclick.net',
    'adservice.google.com',
    'tpc.googlesyndication.com',
    'partner.googleadservices.com',
  ];

  const isAllowedScriptSrc = (src: string): boolean => {
    try {
      const url = new URL(src, window.location.origin);
      return ALLOWED_SCRIPT_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain));
    } catch {
      return false;
    }
  };

  // Execute any scripts in the ad code
  useEffect(() => {
    if (adCode) {
      // C-1: Sanitize ad HTML — allow ad-related tags but strip dangerous attributes
      const sanitizedHtml = DOMPurify.sanitize(adCode, {
        ADD_TAGS: ['ins', 'script'],
        ADD_ATTR: ['data-ad-client', 'data-ad-slot', 'data-ad-format', 'data-full-width-responsive', 'async', 'crossorigin', 'data-cfasync'],
        WHOLE_DOCUMENT: false,
      });
      // Create a temporary container to parse the HTML
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = sanitizedHtml;

      // Handle external script tags with src attribute
      const externalScripts = tempContainer.querySelectorAll('script[src]');
      externalScripts.forEach((script) => {
        const newScript = document.createElement('script');
        const src = script.getAttribute('src');

        if (src && isAllowedScriptSrc(src)) {
          newScript.src = src;

          // Copy other attributes
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'src') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });

          // Add load and error handlers
          newScript.onerror = () => {
            console.error(`Failed to load external script for ${position}:`, src);
          };

          // Append to document head to execute
          document.head.appendChild(newScript);
        } else if (src) {
          console.warn(`Blocked ad script from untrusted domain: ${src}`);
        }
      });

      // Handle inline script tags
      const inlineScripts = tempContainer.querySelectorAll('script:not([src])');
      inlineScripts.forEach((script) => {
        if (script.innerHTML.trim()) {
          try {
            // Create new script element for inline scripts
            const newScript = document.createElement('script');
            newScript.textContent = script.innerHTML;

            // Copy attributes
            Array.from(script.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });

            document.head.appendChild(newScript);

            // Clean up after a short delay
            setTimeout(() => {
              if (document.head.contains(newScript)) {
                document.head.removeChild(newScript);
              }
            }, 1000);
          } catch (error) {
            console.error(`Error executing inline script for ${position}:`, error);
          }
        }
      });
    }
  }, [adCode, position]);

  // Never render ads on excluded pages
  if (excluded) return null;

  if (loading) {
    return (
      <div className={`advertisement-${position} ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Advertisement</h3>
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!adCode) {
    return (
      <div className={`advertisement-${position} ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Advertisement</h3>
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">No advertisement configured</span>
        </div>
      </div>
    );
  }

  // C-1: Sanitize ad HTML for display — scripts handled separately via useEffect above
  const sanitizedAdCode = adCode ? DOMPurify.sanitize(adCode, {
    ADD_TAGS: ['ins'],
    ADD_ATTR: ['data-ad-client', 'data-ad-slot', 'data-ad-format', 'data-full-width-responsive', 'data-cfasync'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
  }) : '';

  return (
    <div className={`advertisement-${position} ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Advertisement</h3>
      <div
        className="ad-content-container max-w-full overflow-hidden"
        style={{
          maxWidth: '100%',
          width: '100%',
          display: 'block',
          overflow: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedAdCode }}
      />
    </div>
  );
};

export default AdDisplay;
