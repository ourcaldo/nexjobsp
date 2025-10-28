'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Globe, BarChart3 } from 'lucide-react';
import { supabaseAdminService } from '@/lib/supabase/admin';
import { useToast } from '@/components/ui/ToastProvider';

const SystemSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    site_url: '',
    ga_id: '',
    gtm_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const adminSettings = await supabaseAdminService.getSettings();
      if (adminSettings) {
        setSettings({
          site_url: adminSettings.site_url || '',
          ga_id: adminSettings.ga_id || '',
          gtm_id: adminSettings.gtm_id || ''
        });
      }
    } catch (error) {
      showToast('error', 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const result = await supabaseAdminService.saveSettings(settings);
      
      if (result.success) {
        showToast('success', 'System settings saved successfully!');
      } else {
        showToast('error', result.error || 'Failed to save system settings');
      }
    } catch (error) {
      showToast('error', 'Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General System Settings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Globe className="h-6 w-6 mr-3 text-primary-600" />
            General System Settings
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure basic system and environment settings.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site URL
            </label>
            <input
              type="url"
              name="site_url"
              value={settings.site_url}
              onChange={handleInputChange}
              placeholder="https://nexjob.tech"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              The main URL of your website
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Settings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-primary-600" />
            Analytics Configuration
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure Google Analytics and Tag Manager.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                name="ga_id"
                value={settings.ga_id}
                onChange={handleInputChange}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                name="gtm_id"
                value={settings.gtm_id}
                onChange={handleInputChange}
                placeholder="GTM-XXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Note: Database and storage configurations are managed via environment variables (.env file)
          </p>
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
          Save System Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;