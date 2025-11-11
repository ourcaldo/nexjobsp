import { CMSProvider } from '@/lib/cms/interface';
import { getCMSProvider } from '@/lib/cms/factory';

export class CategoryService {
  private cms: CMSProvider;
  
  constructor() {
    this.cms = getCMSProvider();
  }
  
  async getCategories(page: number = 1, limit: number = 50, search?: string) {
    return await this.cms.getCategories(page, limit, search);
  }
  
  async getTags(page: number = 1, limit: number = 50, search?: string) {
    return await this.cms.getTags(page, limit, search);
  }
  
  async getCategoryWithPosts(idOrSlug: string, page: number = 1, limit: number = 20) {
    return await this.cms.getCategoryWithPosts(idOrSlug, page, limit);
  }
  
  async getTagWithPosts(idOrSlug: string, page: number = 1, limit: number = 20) {
    return await this.cms.getTagWithPosts(idOrSlug, page, limit);
  }
}

export const categoryService = new CategoryService();
