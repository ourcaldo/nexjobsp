// TODO: Add unit test coverage (see audit E-11)
import { transformCMSPageToPage, CMSRawPage } from '@/lib/cms/utils/transformers';
import { Page, AdvertisementSettings } from '../interface';
import { CMSHttpClient } from './http-client';
import { logger } from '@/lib/logger';

const log = logger.child('cms:pages');

/**
 * CMS page operations (static pages, sitemaps, robots, advertisements).
 */
export class PageOperations {
  constructor(private http: CMSHttpClient) {}

  async getPages(page: number = 1, limit: number = 20, category?: string, tag?: string, search?: string) {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'published',
      });
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      if (search) params.set('search', search);

      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/pages?${params.toString()}`
      );
      const data = await response.json();

      if (!data.success) {
        return { success: false, data: { pages: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } };
      }

      const transformedPages = data.data.pages.map((page: CMSRawPage) => transformCMSPageToPage(page));
      return {
        success: true,
        data: { pages: transformedPages, pagination: data.data.pagination },
        cached: data.cached,
      };
    } catch (error) {
      log.error('Failed to fetch pages', {}, error);
      return { success: false, data: { pages: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } };
    }
  }

  async getPageBySlug(slug: string) {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/pages/${slug}`);
      const data = await response.json();

      if (!data.success || !data.data) return { success: false, data: null };

      return {
        success: true,
        data: transformCMSPageToPage(data.data),
        cached: data.cached,
      };
    } catch (error) {
      log.error('Failed to fetch page by slug', { slug }, error);
      return { success: false, data: null };
    }
  }

  async getAllPagesForSitemap() {
    await this.http.ensureInitialized();
    try {
      const allPages: Page[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await this.getPages(page, 100);
          if (!response.success || !response.data.pages || response.data.pages.length === 0) {
            hasMore = false;
          } else {
            allPages.push(...response.data.pages);
            hasMore = response.data.pagination?.hasNextPage || false;
            page++;
          }
        } catch (error) {
          log.error(`Failed to fetch pages page ${page}`, {}, error);
          break;
        }
      }

      return allPages;
    } catch (error) {
      log.error('Failed to fetch all pages for sitemap', {}, error);
      return [];
    }
  }

  async getSitemaps() {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/sitemaps`);
      return await response.json();
    } catch (error) {
      log.error('Failed to fetch sitemaps', {}, error);
      return { success: false, data: { sitemaps: [] } };
    }
  }

  async getSitemapXML(sitemapPath: string): Promise<string | null> {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}${sitemapPath}`);
      let xmlContent = await response.text();

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech';
      const cmsEndpoint = process.env.NEXT_PUBLIC_CMS_ENDPOINT || 'https://cms.nexjob.tech';
      const cmsHost = cmsEndpoint.replace(/https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cmsRegex = new RegExp(`https?://${cmsHost}/`, 'g');
      // Replace URLs only within <loc> tags for XML safety (M-21)
      xmlContent = xmlContent.replace(/<loc>(.*?)<\/loc>/g, (_match, url) => {
        let rewritten = url.replace(/\/api\/v1\/sitemaps\//g, '/');
        rewritten = rewritten.replace(cmsRegex, `${siteUrl}/`);
        return `<loc>${rewritten}</loc>`;
      });

      return xmlContent;
    } catch (error) {
      log.error('Failed to fetch sitemap XML', { sitemapPath }, error);
      return null;
    }
  }

  async getRobotsTxt(): Promise<string | null> {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/robots.txt`);
      return await response.text();
    } catch (error) {
      log.error('Failed to fetch robots.txt from CMS', {}, error);
      return null;
    }
  }

  async getAdvertisements(): Promise<AdvertisementSettings | null> {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/settings/advertisements`
      );
      return await response.json();
    } catch (error) {
      log.error('Failed to fetch advertisements from CMS', {}, error);
      return null;
    }
  }
}
