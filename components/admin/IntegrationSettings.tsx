'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Database, HardDrive, TestTube, CheckCircle, XCircle, Link2, Globe } from 'lucide-react';
import { supabaseAdminService } from '@/lib/supabase/admin';
import { useToast } from '@/components/ui/ToastProvider';

const IntegrationSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    // TugasCMS API Configuration
    cms_endpoint: '',
    cms_token: '',
    cms_timeout: 10000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const adminSettings = await supabaseAdminService.getSettings();
      if (adminSettings) {
        setSettings({
          cms_endpoint: adminSettings.cms_endpoint || 'https://cms.nexjob.tech',
          cms_token: adminSettings.cms_token || '',
          cms_timeout: adminSettings.cms_timeout || 10000
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('error', 'Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testConnections = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      // Test TugasCMS API connection
      const cmsApiTest = {
        name: 'TugasCMS API',
        success: false,
        error: ''
      };

      // Simple validation tests
      if (settings.cms_endpoint) {
        try {
          // Basic URL validation
          new URL(settings.cms_endpoint);
          
          // Optional: Test actual connection
          const response = await fetch(`${settings.cms_endpoint}/api/v1/posts?limit=1`, {
            headers: settings.cms_token ? {
              'Authorization': `Bearer ${settings.cms_token}`
            } : {}
          });
          
          if (response.ok) {
            cmsApiTest.success = true;
          } else {
            cmsApiTest.error = `API returned status ${response.status}`;
          }
        } catch (error) {
          cmsApiTest.error = 'Failed to connect to CMS API';
        }
      } else {
        cmsApiTest.error = 'Missing CMS endpoint URL';
      }

      const results = {
        success: cmsApiTest.success,
        tests: [cmsApiTest]
      };

      setTestResults(results);
      
      if (results.success) {
        showToast('success', 'CMS connection test passed!');
      } else {
        showToast('error', 'CMS connection test failed. Check the results below.');
      }
    } catch (error) {
      console.error('Error testing integrations:', error);
      showToast('error', 'Failed to test integrations');
      setTestResults({
        success: false,
        tests: [
          { name: 'Integration Test', success: false, error: 'Test failed to run' }
        ]
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const result = await supabaseAdminService.saveSettings(settings);
      
      if (result.success) {
        showToast('success', 'Integration settings saved successfully!');
      } else {
        showToast('error', result.error || 'Failed to save integration settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', 'Failed to save integration settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading integration settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Link2 className="h-6 w-6 mr-3 text-primary-600" />
            Integration Settings
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure database and storage integrations for your application.
          </p>
        </div>
      </div>

      {/* TugasCMS API Configuration */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Globe className="h-6 w-6 mr-3 text-primary-600" />
            TugasCMS API Configuration
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure your TugasCMS external API connection settings.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CMS API Endpoint
            </label>
            <input
              type="url"
              name="cms_endpoint"
              value={settings.cms_endpoint}
              onChange={handleInputChange}
              placeholder="https://cms.nexjob.tech"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Base URL for TugasCMS API endpoint
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CMS API Token
            </label>
            <input
              type="password"
              name="cms_token"
              value={settings.cms_token}
              onChange={handleInputChange}
              placeholder="cms_your-api-token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bearer token for TugasCMS API authentication
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Timeout (ms)
            </label>
            <input
              type="number"
              name="cms_timeout"
              value={settings.cms_timeout}
              onChange={handleInputChange}
              placeholder="10000"
              min="1000"
              max="60000"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Request timeout in milliseconds (default: 10000ms)
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={testConnections}
              disabled={testing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test Connections
            </button>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Integration Settings
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
              )}
              Integration Test Results
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {testResults.tests?.map((test: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{test.name}</div>
                    {test.error && (
                      <div className="text-sm text-red-600">{test.error}</div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {test.success ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm text-red-600">Failed</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;