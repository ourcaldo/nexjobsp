'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match && match[2] ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

// Build a cookie key unique to the current page path
function getPageCookieKey(pathname: string): string {
  const sanitized = pathname.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
  return `popupAd_${sanitized}`;
}

interface PopupConfig {
  url: string;
  enabled: boolean;
  loadSettings: string[];
  maxExecutions: number;
  device: string;
}

const PopupAd: React.FC = () => {
  const pathname = usePathname();
  const configRef = useRef<PopupConfig | null>(null);
  const executionCountRef = useRef(0);
  const listenerAttachedRef = useRef(false);

  // Device detection
  const getDeviceType = (): 'mobile' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth <= 768 ? 'mobile' : 'desktop';
  };

  // Check if current page should trigger popup based on load_settings
  const shouldTriggerOnPage = useCallback((loadSettings: string[]): boolean => {
    const currentPath = pathname || '';

    if (loadSettings.includes('all_pages')) return true;

    if (loadSettings.includes('single_articles')) {
      if (/^\/artikel\/[^/]+\/[^/]+\/?$/.test(currentPath)) return true;
    }

    if (loadSettings.includes('article_page')) {
      if (currentPath === '/artikel/' || currentPath === '/artikel') return true;
      if (/^\/artikel\/[^/]+\/?$/.test(currentPath)) return true;
      if (/^\/artikel\/[^/]+\/[^/]+\/?$/.test(currentPath)) return true;
    }

    if (loadSettings.includes('job_post_page')) {
      if (currentPath === '/lowongan-kerja/' || currentPath === '/lowongan-kerja') return true;
      if (currentPath.startsWith('/lowongan-kerja/kategori/')) return true;
      if (currentPath.startsWith('/lowongan-kerja/lokasi/')) return true;
    }

    if (loadSettings.includes('single_job_post')) {
      const jobMatch = currentPath.match(/^\/lowongan-kerja\/[^/]+\/[^/]+\/?$/);
      if (jobMatch && !currentPath.includes('/kategori/') && !currentPath.includes('/lokasi/')) {
        return true;
      }
    }

    return false;
  }, [pathname]);

  // Click handler — opens ad URL in new tab, tracks via cookie
  const handleClick = useCallback(() => {
    const config = configRef.current;
    if (!config || !config.enabled || !config.url) return;

    const cookieKey = getPageCookieKey(pathname || '/');
    const cookieVal = getCookie(cookieKey);
    const currentExecCount = cookieVal ? parseInt(cookieVal, 10) : 0;

    if (currentExecCount >= config.maxExecutions) return;

    // Open the ad URL in a new tab
    window.open(config.url, '_blank', 'noopener,noreferrer');

    // Update execution count in cookie (expires in 1 day)
    setCookie(cookieKey, String(currentExecCount + 1), 1);
    executionCountRef.current = currentExecCount + 1;

    // If we've reached max executions, remove the listener
    if (currentExecCount + 1 >= config.maxExecutions) {
      document.removeEventListener('click', handleClick);
      listenerAttachedRef.current = false;
    }
  }, [pathname]);

  // Load config and attach click listener
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const response = await fetch('/api/advertisements');
        const data = await response.json();

        if (cancelled) return;

        if (data.success && data.data && data.data.popup_ad) {
          const popupAd = data.data.popup_ad;
          const config: PopupConfig = {
            url: popupAd.url || '',
            enabled: popupAd.enabled || false,
            loadSettings: popupAd.load_settings || [],
            maxExecutions: popupAd.max_executions || 1,
            device: popupAd.device || 'all',
          };

          configRef.current = config;

          // Check if popup should be active
          if (!config.enabled || !config.url) return;

          // Check device compatibility
          const currentDevice = getDeviceType();
          if (config.device !== 'all' && config.device !== currentDevice) return;

          // Check page compatibility
          if (!shouldTriggerOnPage(config.loadSettings)) return;

          // Check if max executions already reached for this page (via cookie)
          const cookieKey = getPageCookieKey(pathname || '/');
          const cookieVal = getCookie(cookieKey);
          const currentExecCount = cookieVal ? parseInt(cookieVal, 10) : 0;
          executionCountRef.current = currentExecCount;

          if (currentExecCount >= config.maxExecutions) return;

          // Attach the click listener
          document.addEventListener('click', handleClick);
          listenerAttachedRef.current = true;
        }
      } catch (error) {
        console.error('PopupAd: Error loading config:', error);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (listenerAttachedRef.current) {
        document.removeEventListener('click', handleClick);
        listenerAttachedRef.current = false;
      }
    };
  }, [pathname, handleClick, shouldTriggerOnPage]);

  // This component renders nothing — it only attaches a click event listener
  return null;
};

export default PopupAd;