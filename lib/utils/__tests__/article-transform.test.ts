import { transformArticle } from '../article-transform';

describe('transformArticle', () => {
  it('maps basic fields correctly', () => {
    const raw = {
      id: '123',
      title: 'Test Article',
      slug: 'test-article',
      excerpt: 'Short summary',
      content: '<p>Full content</p>',
      status: 'published',
    };

    const result = transformArticle(raw);

    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Article');
    expect(result.slug).toBe('test-article');
    expect(result.excerpt).toBe('Short summary');
    expect(result.content).toBe('<p>Full content</p>');
    expect(result.status).toBe('published');
  });

  it('normalises featured_image from both field names', () => {
    expect(transformArticle({ featuredImage: 'img1.jpg' }).featured_image).toBe('img1.jpg');
    expect(transformArticle({ featured_image: 'img2.jpg' }).featured_image).toBe('img2.jpg');
  });

  it('normalises date fields from camelCase and snake_case', () => {
    const raw = { publish_date: '2025-01-01', updated_at: '2025-02-01' };
    const result = transformArticle(raw);
    expect(result.published_at).toBe('2025-01-01');
    expect(result.post_date).toBe('2025-01-01');
    expect(result.updated_at).toBe('2025-02-01');
  });

  it('normalises date fields from camelCase variants', () => {
    const raw = { publishDate: '2025-03-01', updatedAt: '2025-04-01' };
    const result = transformArticle(raw);
    expect(result.published_at).toBe('2025-03-01');
    expect(result.updated_at).toBe('2025-04-01');
  });

  it('normalises SEO fields from nested seo object', () => {
    const raw = {
      seo: { title: 'SEO Title', metaDescription: 'SEO Desc' },
    };
    const result = transformArticle(raw);
    expect(result.seo_title).toBe('SEO Title');
    expect(result.meta_description).toBe('SEO Desc');
  });

  it('normalises SEO fields from flat fields', () => {
    const raw = {
      seo_title: 'Flat Title',
      meta_description: 'Flat Desc',
    };
    const result = transformArticle(raw);
    expect(result.seo_title).toBe('Flat Title');
    expect(result.meta_description).toBe('Flat Desc');
  });

  it('defaults categories and tags to empty arrays', () => {
    const result = transformArticle({});
    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it('preserves provided categories and tags', () => {
    const cats = [{ id: '1', name: 'Tech', slug: 'tech' }];
    const tags = [{ id: '2', name: 'JS', slug: 'js' }];
    const result = transformArticle({ categories: cats, tags });
    expect(result.categories).toEqual(cats);
    expect(result.tags).toEqual(tags);
  });

  it('maps author field correctly', () => {
    const raw = {
      author: { id: 'a1', full_name: 'John Doe', email: 'john@test.com' },
    };
    const result = transformArticle(raw);
    expect(result.author).toEqual({ id: 'a1', full_name: 'John Doe', email: 'john@test.com' });
  });

  it('handles null/undefined author', () => {
    expect(transformArticle({ author: null }).author).toBeNull();
    // When author key is missing, the ternary `raw.author ? {...} : null` returns null
    expect(transformArticle({}).author).toBeNull();
  });

  it('defaults status to "published" when missing', () => {
    expect(transformArticle({}).status).toBe('published');
  });

  it('handles author_id from both naming conventions', () => {
    expect(transformArticle({ author_id: 'a1' }).author_id).toBe('a1');
    expect(transformArticle({ authorId: 'a2' }).author_id).toBe('a2');
  });

  it('handles completely empty raw object', () => {
    const result = transformArticle({});
    expect(result.id).toBeUndefined();
    expect(result.title).toBeUndefined();
    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(result.status).toBe('published');
  });
});
