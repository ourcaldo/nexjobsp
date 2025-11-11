import { CMSProvider } from '@/lib/cms/interface';
import { getCMSProvider } from '@/lib/cms/factory';

export class ArticleService {
  private cms: CMSProvider;
  
  constructor() {
    this.cms = getCMSProvider();
  }
  
  async getArticles(page: number = 1, limit: number = 20, category?: string, search?: string) {
    return await this.cms.getArticles(page, limit, category, search);
  }
  
  async getArticleBySlug(slug: string) {
    return await this.cms.getArticleBySlug(slug);
  }
  
  async getRelatedArticles(articleSlug: string, limit: number = 5) {
    return await this.cms.getRelatedArticles(articleSlug, limit);
  }
}

export const articleService = new ArticleService();
