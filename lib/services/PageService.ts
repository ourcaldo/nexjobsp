import { CMSProvider } from '@/lib/cms/interface';
import { getCMSProvider } from '@/lib/cms/factory';

export class PageService {
  private cms: CMSProvider;
  
  constructor() {
    this.cms = getCMSProvider();
  }
  
  async getPages(page: number = 1, limit: number = 20, category?: string, tag?: string, search?: string) {
    return await this.cms.getPages(page, limit, category, tag, search);
  }
  
  async getPageBySlug(slug: string) {
    return await this.cms.getPageBySlug(slug);
  }
  
  async getAllPagesForSitemap() {
    return await this.cms.getAllPagesForSitemap();
  }
}

export const pageService = new PageService();
