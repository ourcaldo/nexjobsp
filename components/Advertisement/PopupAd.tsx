'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

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
  const [isDismissed, setIsDismissed] = useState(false);

  // Device detection
  const getDeviceType = (): 'mobile' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth <= 768 ? 'mobile' : 'desktop';
  };

  // Check if current page should trigger popup
  const shouldTriggerOnPage = useCallback((loadSettings: string[]): boolean => {
    const currentPath = pathname || '';

    if (loadSettings.includes('all_pages')) return true;

    if (loadSettings.includes('single_articles')) {
      if (/^\/artikel\/[^/]+\/[^/]+\/?$/.test(currentPath)) return true;
    }

    if (loadSettings.includes('article_archive')) {
      if (currentPath === '/artikel/' || currentPath === '/artikel') return true;
      if (/^\/artikel\/[^/]+\/?$/.test(currentPath)) return true;
    }

    if (loadSettings.includes('job_archive')) {
      if (currentPath === '/lowongan-kerja/' || currentPath === '/lowongan-kerja') return true;
      if (currentPath.startsWith('/lowongan-kerja/kategori/')) return true;
      if (currentPath.startsWith('/lowongan-kerja/lokasi/')) return true;
    }

    if (loadSettings.includes('single_jobs')) {
      const jobMatch = currentPath.match(/^\/lowongan-kerja\/[^/]+\/[^/]+\/?$/);
      if (jobMatch && !currentPath.includes('/kategori/') && !currentPath.includes('/lokasi/')) {
        return true;
      }
    }

    return false;
  }, [pathname]);

  // Load popup configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
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

  // Check if already dismissed this session
  useEffect(() => {
    const dismissKey = `popupAd_dismissed_${pathname}`;
    if (sessionStorage.getItem(dismissKey)) {
      setIsDismissed(true);
    }
  }, [pathname]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    const dismissKey = `popupAd_dismissed_${pathname}`;
    sessionStorage.setItem(dismissKey, 'true');
  }, [pathname]);

  // Don't render if not configured, not loaded, or already dismissed
  if (!isConfigLoaded || !popupConfig.enabled || !popupConfig.url || isDismissed) {
    return null;
  }

  // Check page and device compatibility
  if (!shouldTriggerOnPage(popupConfig.loadSettings)) {
    return null;
  }

  const currentDevice = getDeviceType();
  if (popupConfig.device !== 'all' && popupConfig.device !== currentDevice) {
    return null;
  }

  // Render a visible, dismissable notification bar instead of hijacking clicks
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary-900 text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm flex-1">
          <span className="text-xs text-white/60 mr-2">Iklan</span>
          <a
            href={popupConfig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/80 transition-colors"
          >
            Kunjungi sponsor kami →
          </a>
        </p>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Tutup iklan"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PopupAd;