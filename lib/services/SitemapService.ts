import { CMSProvider } from '@/lib/cms/interface';
import { getCMSProvider } from '@/lib/cms/factory';

export class SitemapService {
  private cms: CMSProvider;
  
  constructor() {
    this.cms = getCMSProvider();
  }
  
  async getSitemaps() {
    return await this.cms.getSitemaps();
  }
  
  async getSitemapXML(sitemapPath: string): Promise<string | null> {
    return await this.cms.getSitemapXML(sitemapPath);
  }
}

export const sitemapService = new SitemapService();
