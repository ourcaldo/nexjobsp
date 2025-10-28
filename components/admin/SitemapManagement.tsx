'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, FileText, Save } from 'lucide-react';
import { supabaseAdminService } from '@/lib/supabase/admin';
import { useToast } from '@/components/ui/ToastProvider';

const SitemapManagement: React.FC = () => {
  const { showToast } = useToast();
  const [robotsTxt, setRobotsTxt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const adminSettings = await supabaseAdminService.getSettings();
      if (adminSettings) {
        setRobotsTxt(adminSettings.robots_txt || '');
      }
    } catch (error) {
      showToast('error', 'Failed to load robots.txt settings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRobotsTxt(e.target.value);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const result = await supabaseAdminService.saveSettings({ robots_txt: robotsTxt });

      if (result.success) {
        showToast('success', 'Robots.txt saved successfully!');
      } else {
        showToast('error', result.error || 'Failed to save robots.txt');
      }
    } catch (error) {
      showToast('error', 'Failed to save robots.txt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading robots.txt settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Robots.txt Configuration */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-primary-600" />
            Robots.txt Configuration
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure your robots.txt file content. This content will be served at /robots.txt
          </p>
        </div>

        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Robots.txt Content
            </label>
            <textarea
              name="robots_txt"
              value={robotsTxt}
              onChange={handleInputChange}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder={`User-agent: *
Allow: /

# Disallow admin panel
Disallow: /admin/
Disallow: /backend/

# Disallow private pages
Disallow: /profile/
Disallow: /bookmarks/

# Allow specific important pages
Allow: /lowongan-kerja/
Allow: /artikel/

# Sitemaps
Sitemap: https://nexjob.tech/sitemap.xml`}
            />
            <p className="mt-2 text-xs text-gray-500">
              Note: Sitemaps are managed by the external CMS system. Changes here only affect robots.txt.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Robots.txt
        </button>
      </div>
    </div>
  );
};

export default SitemapManagement;