import { cmsSettingsService } from '@/lib/services/cms-settings';

export interface AdvertisementConfig {
  // Other ad types remain the same
  sidebar_archive_ad_code?: string;
  sidebar_single_ad_code?: string;
  single_top_ad_code?: string;
  single_bottom_ad_code?: string;
  single_middle_ad_code?: string;

  // New popup ad configuration
  popup_ad_url?: string;
  popup_ad_enabled?: boolean;
  popup_ad_load_settings?: string[];
  popup_ad_max_executions?: number;
  popup_ad_device?: string;
}

class AdvertisementService {
  private adConfig: AdvertisementConfig | null = null;
  private configLoaded = false;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  private cacheTimestamp = 0;

  private isCacheValid(): boolean {
    return this.configLoaded && this.adConfig !== null && (Date.now() - this.cacheTimestamp < this.CACHE_TTL);
  }

  async loadAdConfig(): Promise<AdvertisementConfig> {
    if (this.isCacheValid()) {
      return this.adConfig!;
    }

    try {
      // Use CMS settings service instead of API call
      const settings = await cmsSettingsService.getAdvertisementSettings();

      this.adConfig = {
        sidebar_archive_ad_code: settings?.ad_codes?.sidebar_archive || '',
        sidebar_single_ad_code: settings?.ad_codes?.sidebar_single || '',
        single_top_ad_code: settings?.ad_codes?.single_top || '',
        single_bottom_ad_code: settings?.ad_codes?.single_bottom || '',
        single_middle_ad_code: settings?.ad_codes?.single_middle || '',

        // New popup ad settings
        popup_ad_url: settings?.popup_ad?.url || '',
        popup_ad_enabled: settings?.popup_ad?.enabled || false,
        popup_ad_load_settings: settings?.popup_ad?.load_settings || ['all_pages'],
        popup_ad_max_executions: settings?.popup_ad?.max_executions || 1,
        popup_ad_device: settings?.popup_ad?.device || 'all'
      };
      
      this.configLoaded = true;
      this.cacheTimestamp = Date.now();
      return this.adConfig;
    } catch (error) {
      console.error('Error loading advertisement config:', error);
      return {};
    }
  }

  async getAdCode(position: 'sidebar_archive_ad_code' | 'sidebar_single_ad_code' | 'single_top_ad_code' | 'single_bottom_ad_code' | 'single_middle_ad_code'): Promise<string> {
    const config = await this.loadAdConfig();
    return config[position] || '';
  }

  async getPopupAdConfig(): Promise<{
    url: string;
    enabled: boolean;
    loadSettings: string[];
    maxExecutions: number;
    device: string;
  }> {
    const config = await this.loadAdConfig();
    return {
      url: config.popup_ad_url || '',
      enabled: config.popup_ad_enabled || false,
      loadSettings: config.popup_ad_load_settings || ['all_pages'],
      maxExecutions: config.popup_ad_max_executions || 1,
      device: config.popup_ad_device || 'all'
    };
  }

  // Clear cache when settings are updated
  clearCache(): void {
    this.adConfig = null;
    this.configLoaded = false;
  }

  // Force refresh of ad config
  async refreshConfig(): Promise<AdvertisementConfig> {
    this.clearCache();
    return await this.loadAdConfig();
  }

  // Insert ad in content at H2 tags (for middle ads)
  insertMiddleAd(content: string, adCode: string): string {
    if (!adCode || !content) return content;

    // Check if DOMParser is available (browser environment)
    if (typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const h2Elements = doc.querySelectorAll('h2');

        if (h2Elements.length === 0) return content;

        const middleIndex = Math.floor(h2Elements.length / 2);
        const middleH2 = h2Elements[middleIndex];

        const adContainer = doc.createElement('div');
        adContainer.className = 'advertisement-middle my-6';
        adContainer.innerHTML = `
          <div class="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
          ${adCode}
        `;

        middleH2.parentNode?.insertBefore(adContainer, middleH2);

        return doc.body.innerHTML;
      } catch (error) {
        return content;
      }
    }

    // Fallback for server-side or when DOMParser is not available
    // This should rarely be used since the function is primarily used client-side
    return content;
  }
}

export const advertisementService = new AdvertisementService();