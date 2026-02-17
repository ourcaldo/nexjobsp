/**
 * Shared article field mapping / transformation utility.
 * Normalises the raw CMS article shape into the CommonArticle format
 * used across all /artikel routes.
 */

export interface CommonArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  published_at: string | null;
  post_date: string | null;
  updated_at: string | null;
  seo_title: string | null;
  meta_description: string | null;
  status: string;
  author_id?: string;
  categories: any[];
  tags: any[];
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

/**
 * Transform a raw CMS article object into the common article shape.
 */
export function transformArticle(raw: any): CommonArticle {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    content: raw.content,
    featured_image: raw.featured_image || raw.featuredImage,
    published_at: raw.publish_date || raw.publishDate,
    post_date: raw.publish_date || raw.publishDate,
    updated_at: raw.updated_at || raw.updatedAt,
    seo_title: raw.seo?.title || raw.seo_title,
    meta_description: raw.seo?.metaDescription || raw.meta_description,
    status: raw.status || 'published',
    author_id: raw.author_id || raw.authorId,
    categories: raw.categories || [],
    tags: raw.tags || [],
    author: raw.author
      ? {
          id: raw.author.id,
          full_name: raw.author.full_name || raw.author.name,
          email: raw.author.email,
        }
      : null,
  };
}
