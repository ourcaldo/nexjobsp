import { CMSHttpClient } from './http-client';

/**
 * Article, Category, and Tag operations for the CMS.
 */
export class ArticleOperations {
  constructor(private http: CMSHttpClient) {}

  async getArticles(page: number = 1, limit: number = 20, category?: string, search?: string) {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'published',
      });
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/posts?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return { success: false, data: { posts: [], pagination: {} } };
    }
  }

  async getArticleBySlug(slug: string) {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/posts/${slug}`);
      return await response.json();
    } catch (error) {
      return { success: false, data: null };
    }
  }

  async getRelatedArticles(articleSlug: string, limit: number = 5) {
    await this.http.ensureInitialized();
    try {
      const articleResponse = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/posts/${articleSlug}`);
      const articleData = await articleResponse.json();

      if (!articleData.success || !articleData.data.categories || articleData.data.categories.length === 0) {
        const response = await this.getArticles(1, limit + 5);
        if (!response.success || !response.data.posts) return { success: false, data: [] };
        return {
          success: true,
          data: response.data.posts
            .filter((article: any) => article.slug !== articleSlug)
            .slice(0, limit),
        };
      }

      const categoryId = articleData.data.categories[0].id;
      const relatedResponse = await this.getArticles(1, limit + 5, categoryId);
      if (!relatedResponse.success || !relatedResponse.data.posts) return { success: false, data: [] };

      return {
        success: true,
        data: relatedResponse.data.posts
          .filter((article: any) => article.slug !== articleSlug)
          .slice(0, limit),
      };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  async getCategories(page: number = 1, limit: number = 50, search?: string) {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set('search', search);

      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/categories?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return { success: false, data: { categories: [], pagination: {} } };
    }
  }

  async getTags(page: number = 1, limit: number = 50, search?: string) {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set('search', search);

      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/tags?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return { success: false, data: { tags: [], pagination: {} } };
    }
  }

  async getCategoryWithPosts(idOrSlug: string, page: number = 1, limit: number = 20) {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/categories/${idOrSlug}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return { success: false, data: { category: null, posts: [], pagination: {} } };
    }
  }

  async getTagWithPosts(idOrSlug: string, page: number = 1, limit: number = 20) {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const response = await this.http.fetchWithTimeout(
        `${this.http.getBaseUrl()}/api/v1/tags/${idOrSlug}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return { success: false, data: { tag: null, posts: [], pagination: {} } };
    }
  }
}
