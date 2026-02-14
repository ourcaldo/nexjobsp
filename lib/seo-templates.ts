import { config } from '@/lib/config';

/**
 * Default OG images for social sharing.
 * Page-level SEO (title, description) is driven by CMS settings via renderTemplate().
 */
export const seoTemplates = {
  ogImages: {
    home: `${config.site.url}/og-home.jpg`,
    jobs: `${config.site.url}/og-jobs.jpg`,
    articles: `${config.site.url}/og-articles.jpg`,
    defaultJob: `${config.site.url}/og-job-default.jpg`,
    defaultArticle: `${config.site.url}/og-article-default.jpg`,
  },
} as const;