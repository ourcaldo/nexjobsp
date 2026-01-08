'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const PopupAd: React.FC = () => {
  const pathname = usePathname();
  const [popupConfig, setPopupConfig] = useState({
    url: '',
    enabled: false,
    loadSettings: ['all_pages'],
    maxExecutions: 1,
    device: 'all'
  });
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Device detection
  const getDeviceType = (): 'mobile' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth <= 768 ? 'mobile' : 'desktop';
  };

  // Check if current page should trigger popup
  const shouldTriggerOnPage = useCallback((loadSettings: string[]): boolean => {
    const currentPath = pathname || '';

    if (loadSettings.includes('all_pages')) {
      return true;
    }

    if (loadSettings.includes('single_articles')) {
      // Check if current page is a single article page
      return currentPath.startsWith('/artikel/') && !currentPath.endsWith('/artikel/');
    }

    return false;
  }, [pathname]);

  /**
   * Generate a random alphanumeric string.
   */
  const generateRandomString = useCallback((length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  /**
   * Generate a session ID with timestamp and random string.
   */
  const generateSessionId = useCallback((): string => {
    return 'session_' + Date.now() + '_' + generateRandomString(8);
  }, [generateRandomString]);

  /**
   * Generate a page-unique key for session tracking.
   */
  const getPageKey = useCallback((): string => {
    return pathname || '';
  }, [pathname]);

  /**
   * Clear sessionStorage from other pages to ensure only current page has session
   */
  const clearOtherPagesSessions = useCallback((): void => {
    const currentPageKey = getPageKey();
    const allKeys = Object.keys(sessionStorage);

    // Find all sessionID_ and tabOpened_ keys that are NOT for current page
    const keysToRemove = allKeys.filter(key => {
      if (key.startsWith('sessionID_') || key.startsWith('tabOpened_')) {
        const pageFromKey = key.replace('sessionID_', '').replace('tabOpened_', '');
        return pageFromKey !== currentPageKey;
      }
      return false;
    });

    // Remove cookies from other pages
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
  }, [getPageKey]);

  /**
   * Initialize session ID, once per page session.
   */
  const initSession = useCallback((): void => {
    const sessionKey = 'sessionID_' + getPageKey();
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, generateSessionId());
    }
  }, [getPageKey, generateSessionId]);

  /**
   * Open the target URL in a new tab, only once per page session.
   */
  const openTabOnce = useCallback((): void => {
    const tabKey = 'tabOpened_' + getPageKey();
    if (!sessionStorage.getItem(tabKey)) {
      window.open(popupConfig.url, '_blank');
      sessionStorage.setItem(tabKey, 'true');
    }
  }, [popupConfig.url, getPageKey]);

  /**
   * Main handler to be triggered by user interaction.
   * EXACTLY like reference - init session and open tab ONLY on user click
   */
  const handleUserEventTrigger = useCallback((): void => {
    initSession();
    openTabOnce();
  }, [initSession, openTabOnce]);

  // Load popup configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Fetch from proxy API route instead of direct CMS call
        const response = await fetch('/api/advertisements');
        const data = await response.json();
        
        if (data.success && data.data && data.data.popup_ad) {
          setPopupConfig({
            url: data.data.popup_ad.url || '',
            enabled: data.data.popup_ad.enabled || false,
            loadSettings: data.data.popup_ad.load_settings || ['all_pages'],
            maxExecutions: data.data.popup_ad.max_executions || 1,
            device: data.data.popup_ad.device || 'all'
          });
        }
        setIsConfigLoaded(true);
      } catch (error) {
        console.error('PopupAd: Error loading popup config:', error);
        setIsConfigLoaded(true);
      }
    };

    loadConfig();
  }, []);

  // Set up click event listener and cleanup sessionStorage when page changes
  useEffect(() => {
    if (!isConfigLoaded || !popupConfig.enabled || !popupConfig.url) {
      return;
    }

    // Check if should trigger on this page
    if (!shouldTriggerOnPage(popupConfig.loadSettings)) {
      return;
    }

    // Check device compatibility
    const currentDevice = getDeviceType();
    if (popupConfig.device !== 'all' && popupConfig.device !== currentDevice) {
      return;
    }

    // CLEAR sessionStorage dari page lain saat mount component
    clearOtherPagesSessions();

    const handleClick = (event: MouseEvent) => {
      handleUserEventTrigger();
    };

    // Add click listener to document
    document.addEventListener('click', handleClick, { passive: true });

    // Cleanup function - HAPUS sessionStorage dari halaman sebelumnya
    return () => {
      document.removeEventListener('click', handleClick);

      // HAPUS sessionStorage untuk halaman ini saat pindah halaman
      const currentPageKey = getPageKey();
      const sessionKey = 'sessionID_' + currentPageKey;
      const tabKey = 'tabOpened_' + currentPageKey;

      if (sessionStorage.getItem(sessionKey) || sessionStorage.getItem(tabKey)) {
        sessionStorage.removeItem(sessionKey);
        sessionStorage.removeItem(tabKey);
      }
    };
  }, [isConfigLoaded, popupConfig, pathname, shouldTriggerOnPage, getPageKey, clearOtherPagesSessions, handleUserEventTrigger]);

  // Component renders nothing (invisible)
  return null;
};

export default PopupAd;