/**
 * Shared CMS data transformers
 * Used by both legacy CMSService and TugasCMSProvider during migration
 */

export function transformCMSPageToPage(cmsPage: any): any {
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
