import { config } from '@/lib/config';

export const seoTemplates = {
  // Dynamic Page Templates
  location: {
    title: (lokasi: string) => `Lowongan Kerja di ${lokasi} - ${config.site.name}`,
    description: (lokasi: string) => 
      `Temukan lowongan kerja terbaru di ${lokasi}. Dapatkan pekerjaan impian Anda dengan gaji terbaik di ${config.site.name}.`,
  },
  
  category: {
    title: (kategori: string) => `Lowongan Kerja ${kategori} - ${config.site.name}`,
    description: (kategori: string) => 
      `Temukan lowongan kerja ${kategori} terbaru. Dapatkan pekerjaan impian Anda dengan gaji terbaik di ${config.site.name}.`,
  },
  
  // Archive Pages
  jobs: {
    title: `Lowongan Kerja Terbaru - ${config.site.name}`,
    description: 'Temukan lowongan kerja terbaru dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda dengan gaji terbaik.',
  },
  
  articles: {
    title: `Tips Karir & Panduan Kerja - ${config.site.name}`,
    description: 'Artikel dan panduan karir terbaru untuk membantu perjalanan karir Anda. Tips interview, CV, dan pengembangan karir.',
  },
  
  // Default OG Images
  ogImages: {
    home: `${config.site.url}/og-home.jpg`,
    jobs: `${config.site.url}/og-jobs.jpg`,
    articles: `${config.site.url}/og-articles.jpg`,
    defaultJob: `${config.site.url}/og-job-default.jpg`,
    defaultArticle: `${config.site.url}/og-article-default.jpg`,
  },
} as const;

// Helper functions for dynamic SEO
export const generatePageSeo = {
  locationPage: (lokasi: string) => ({
    title: seoTemplates.location.title(lokasi),
    description: seoTemplates.location.description(lokasi),
    ogImage: seoTemplates.ogImages.jobs,
  }),
  
  categoryPage: (kategori: string) => ({
    title: seoTemplates.category.title(kategori),
    description: seoTemplates.category.description(kategori),
    ogImage: seoTemplates.ogImages.jobs,
  }),
  
  jobsPage: () => ({
    title: seoTemplates.jobs.title,
    description: seoTemplates.jobs.description,
    ogImage: seoTemplates.ogImages.jobs,
  }),
  
  articlesPage: () => ({
    title: seoTemplates.articles.title,
    description: seoTemplates.articles.description,
    ogImage: seoTemplates.ogImages.articles,
  }),
};