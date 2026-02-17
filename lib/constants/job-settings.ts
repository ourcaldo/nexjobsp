/**
 * Shared job page settings used across all lowongan-kerja routes.
 * Centralised here to avoid duplication.
 */
export const JOB_PAGE_SETTINGS = {
  site_title: 'Nexjob',
  jobs_title: 'Lowongan Kerja {{lokasi}} {{kategori}} - {{site_title}}',
  jobs_description: 'Temukan lowongan kerja terbaru {{lokasi}} {{kategori}} di Indonesia. Lamar sekarang!',
  jobs_og_image: '/og-jobs.jpg',
  category_page_title_template: 'Lowongan Kerja {{kategori}} - {{site_title}}',
  category_page_description_template: 'Temukan lowongan kerja {{kategori}} terbaru dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda di bidang {{kategori}}.',
  location_page_title_template: 'Lowongan Kerja di {{lokasi}} - {{site_title}}',
  location_page_description_template: 'Temukan lowongan kerja terbaru di {{lokasi}} dari berbagai perusahaan terpercaya.',
} as const;

export type JobPageSettings = typeof JOB_PAGE_SETTINGS;
