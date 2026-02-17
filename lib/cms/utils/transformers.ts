/**
 * Shared CMS data transformers
 * Used by both legacy CMSService and TugasCMSProvider during migration
 */

export interface CMSRawPage {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  featured_image?: string | null;
  featuredImage?: string | null;
  publish_date?: string;
  publishDate?: string;
  status: string;
  author_id?: string;
  authorId?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  seo_title?: string | null;
  seo?: { title?: string; metaDescription?: string; focusKeyword?: string };
  meta_description?: string | null;
  focus_keyword?: string | null;
  categories?: Array<{ id: string; name: string; slug: string }>;
  tags?: Array<{ id: string; name: string; slug: string }>;
  template?: string;
  parent_page_id?: string;
  parentPageId?: string;
  menu_order?: number;
  menuOrder?: number;
}

export function transformCMSPageToPage(cmsPage: CMSRawPage) {
  return {
    id: cmsPage.id,
    title: cmsPage.title,
    content: cmsPage.content,
    excerpt: cmsPage.excerpt,
    slug: cmsPage.slug,
    featuredImage: cmsPage.featured_image || cmsPage.featuredImage,
    publishDate: cmsPage.publish_date || cmsPage.publishDate,
    status: cmsPage.status,
    authorId: cmsPage.author_id || cmsPage.authorId,
    createdAt: cmsPage.created_at || cmsPage.createdAt,
    updatedAt: cmsPage.updated_at || cmsPage.updatedAt,
    seo: {
      title: cmsPage.seo_title || cmsPage.seo?.title,
      metaDescription: cmsPage.meta_description || cmsPage.seo?.metaDescription,
      focusKeyword: cmsPage.focus_keyword || cmsPage.seo?.focusKeyword,
      slug: cmsPage.slug
    },
    categories: cmsPage.categories || [],
    tags: cmsPage.tags || [],
    template: cmsPage.template,
    parentPageId: cmsPage.parent_page_id || cmsPage.parentPageId,
    menuOrder: cmsPage.menu_order || cmsPage.menuOrder
  };
}
