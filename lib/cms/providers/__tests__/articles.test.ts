import { ArticleOperations } from '../articles';

// Mock the http-client
const mockFetchWithTimeout = jest.fn();
const mockEnsureInitialized = jest.fn().mockResolvedValue(undefined);
const mockGetBaseUrl = jest.fn().mockReturnValue('https://cms.test.com');

const mockHttp = {
  fetchWithTimeout: mockFetchWithTimeout,
  ensureInitialized: mockEnsureInitialized,
  getBaseUrl: mockGetBaseUrl,
} as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ArticleOperations', () => {
  let articles: ArticleOperations;

  beforeEach(() => {
    articles = new ArticleOperations(mockHttp);
  });

  describe('getArticles', () => {
    it('fetches articles with default params', async () => {
      const mockResponse = {
        success: true,
        data: {
          posts: [{ id: '1', title: 'Test' }],
          pagination: { page: 1, totalPages: 1, total: 1 },
        },
      };
      mockFetchWithTimeout.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await articles.getArticles();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockFetchWithTimeout).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/posts?')
      );
      const calledUrl = mockFetchWithTimeout.mock.calls[0][0];
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=20');
      expect(calledUrl).toContain('status=published');
      expect(result).toEqual(mockResponse);
    });

    it('passes category and search params', async () => {
      mockFetchWithTimeout.mockResolvedValue({
        json: () => Promise.resolve({ success: true, data: { posts: [], pagination: {} } }),
      });

      await articles.getArticles(2, 10, 'cat-id', 'keyword');

      const calledUrl = mockFetchWithTimeout.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('category=cat-id');
      expect(calledUrl).toContain('search=keyword');
    });

    it('returns fallback on error', async () => {
      mockFetchWithTimeout.mockRejectedValue(new Error('Network error'));

      const result = await articles.getArticles();

      expect(result).toEqual({
        success: false,
        data: { posts: [], pagination: {} },
      });
    });
  });

  describe('getArticleBySlug', () => {
    it('fetches article by slug', async () => {
      const mockArticle = { success: true, data: { id: '1', slug: 'test' } };
      mockFetchWithTimeout.mockResolvedValue({
        json: () => Promise.resolve(mockArticle),
      });

      const result = await articles.getArticleBySlug('test');

      expect(mockFetchWithTimeout).toHaveBeenCalledWith(
        'https://cms.test.com/api/v1/posts/test'
      );
      expect(result).toEqual(mockArticle);
    });

    it('returns fallback on error', async () => {
      mockFetchWithTimeout.mockRejectedValue(new Error('Not found'));

      const result = await articles.getArticleBySlug('missing');

      expect(result).toEqual({ success: false, data: null });
    });
  });

  describe('getRelatedArticles', () => {
    it('fetches related articles by category', async () => {
      // First call: getArticleBySlug
      const articleData = {
        success: true,
        data: {
          slug: 'main-article',
          categories: [{ id: 'cat1' }],
        },
      };
      // Second call: getArticles by category
      const relatedData = {
        success: true,
        data: {
          posts: [
            { slug: 'main-article', title: 'Main' },
            { slug: 'related-1', title: 'Related 1' },
            { slug: 'related-2', title: 'Related 2' },
          ],
          pagination: { page: 1, totalPages: 1 },
        },
      };

      mockFetchWithTimeout
        .mockResolvedValueOnce({ json: () => Promise.resolve(articleData) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(relatedData) });

      const result = await articles.getRelatedArticles('main-article', 5);

      expect(result.success).toBe(true);
      // Should exclude the source article
      expect(result.data).toHaveLength(2);
      expect(result.data.every((a: any) => a.slug !== 'main-article')).toBe(true);
    });

    it('falls back to recent articles when no categories', async () => {
      const articleData = {
        success: true,
        data: { slug: 'no-cat', categories: [] },
      };
      const fallbackData = {
        success: true,
        data: {
          posts: [
            { slug: 'no-cat', title: 'No Cat' },
            { slug: 'other', title: 'Other' },
          ],
          pagination: {},
        },
      };

      mockFetchWithTimeout
        .mockResolvedValueOnce({ json: () => Promise.resolve(articleData) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(fallbackData) });

      const result = await articles.getRelatedArticles('no-cat', 5);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe('other');
    });

    it('returns fallback on error', async () => {
      mockFetchWithTimeout.mockRejectedValue(new Error('fail'));

      const result = await articles.getRelatedArticles('slug', 3);

      expect(result).toEqual({ success: false, data: [] });
    });
  });

  describe('getCategories', () => {
    it('fetches categories with pagination', async () => {
      const mockData = {
        success: true,
        data: { categories: [{ id: '1', name: 'Tech' }], pagination: {} },
      };
      mockFetchWithTimeout.mockResolvedValue({
        json: () => Promise.resolve(mockData),
      });

      const result = await articles.getCategories(1, 20);

      expect(mockFetchWithTimeout).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/categories?')
      );
      expect(result).toEqual(mockData);
    });

    it('returns fallback on error', async () => {
      mockFetchWithTimeout.mockRejectedValue(new Error('fail'));

      const result = await articles.getCategories();

      expect(result).toEqual({
        success: false,
        data: { categories: [], pagination: {} },
      });
    });
  });

  describe('getTags', () => {
    it('fetches tags with search', async () => {
      mockFetchWithTimeout.mockResolvedValue({
        json: () => Promise.resolve({ success: true, data: { tags: [] } }),
      });

      await articles.getTags(1, 50, 'react');

      const calledUrl = mockFetchWithTimeout.mock.calls[0][0];
      expect(calledUrl).toContain('search=react');
    });

    it('returns fallback on error', async () => {
      mockFetchWithTimeout.mockRejectedValue(new Error('fail'));

      const result = await articles.getTags();

      expect(result).toEqual({
        success: false,
        data: { tags: [], pagination: {} },
      });
    });
  });
});
