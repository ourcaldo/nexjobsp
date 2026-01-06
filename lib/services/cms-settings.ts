import { config } from '@/lib/config';

interface CMSAdvertisementSettings {
  popup_ad: {
    enabled: boolean;
    url: string;
    load_settings: string[]; // ['all_pages', 'single_articles']
    max_executions: number;
    device: 'all' | 'mobile' | 'desktop';
  };
  ad_codes: {
    sidebar_archive: string;
    sidebar_single: string;
    single_top: string;
    single_bottom: string;
    single_middle: string;
  };
}

interface CMSSitemapSettings {
  update_interval: number; // seconds
  auto_generate: boolean;
  last_update: string; // ISO timestamp
  robots_txt_additions?: string; // Additional robots.txt rules
}

interface CMSSettings {
  advertisements: CMSAdvertisementSettings;
  sitemap: CMSSitemapSettings;
}

class CMSSettingsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = config.cache.cmsTtl;

  async getAdvertisementSettings(): Promise<CMSAdvertisementSettings> {
    return this.fetchWithCache('advertisements', '/api/v1/settings/advertisements');
  }

  async getSitemapSettings(): Promise<CMSSitemapSettings> {
    return this.fetchWithCache('sitemap', '/api/v1/settings/sitemap');
  }

  private async fetchWithCache<T>(key: string, endpoint: string): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${config.cms.endpoint}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${config.cms.token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.cms.timeout),
      });

      if (!response.ok) {
        throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`CMS API returned error: ${data.message || 'Unknown error'}`);
      }

      this.cache.set(key, { data: data.data, timestamp: Date.now() });
      return data.data;
    } catch (error) {
      console.error(`Error fetching ${key} from CMS:`, error);
      
      // Return cached data if available, otherwise defaults
      if (cached) {
        console.warn(`Using cached ${key} data due to CMS error`);
        return cached.data;
      }
      
      console.warn(`Using default ${key} settings due to CMS error`);
      return this.getDefaultSettings(key);
    }
  }

  private getDefaultSettings(key: string): any {
    const defaults = {
      advertisements: {
        popup_ad: {
          enabled: false,
          url: '',
          load_settings: [],
          max_executions: 0,
          device: 'all',
        },
        ad_codes: {
          sidebar_archive: '',
          sidebar_single: '',
          single_top: '',
          single_bottom: '',
          single_middle: '',
        },
      },
      sitemap: {
        update_interval: 300,
        auto_generate: true,
        last_update: new Date().toISOString(),
        robots_txt_additions: '',
      },
    };
    
    return defaults[key as keyof typeof defaults];
  }

  // Clear cache manually (useful for testing or forced refresh)
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Get cache status for debugging
  getCacheStatus(): { key: string; age: number; size: number }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: now - value.timestamp,
      size: JSON.stringify(value.data).length,
    }));
  }
}

export const cmsSettingsService = new CMSSettingsService();
export type { CMSAdvertisementSettings, CMSSitemapSettings };