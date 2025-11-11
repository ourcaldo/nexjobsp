import { Job, JobFilters } from '@/types/job';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  publish_date: string;
  status: string;
  seo_title: string | null;
  meta_description: string | null;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  post_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
}

export interface FilterData {
  employment_types: Array<{ id: string; name: string; slug: string; post_count: number }>;
  experience_levels: Array<{ id: string; name: string; slug: string; years_min: number; years_max: number | null; post_count: number }>;
  education_levels: Array<{ id: string; name: string; slug: string; post_count: number }>;
  categories: Array<{ id: string; name: string; slug: string; description: string | null; post_count: number }>;
  tags: Array<{ id: string; name: string; slug: string; post_count: number }>;
  salary_range: { min: string; max: string; currencies: string[] };
  work_policy: Array<{ name: string; value: string; post_count: number }>;
  provinces: Array<{ id: string; name: string; post_count: number }>;
  regencies: Array<{ id: string; name: string; province_id: string; post_count: number }>;
  skills: Array<{ name: string; post_count: number }>;
}

export interface JobsResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
  hasMore: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  totalPages: number;
  currentPage: number;
  totalArticles: number;
  hasMore: boolean;
}

export interface CMSProvider {
  getJobs(filters?: any, page?: number, perPage?: number): Promise<JobsResponse>;
  getJobById(id: string): Promise<Job | null>;
  getJobBySlug(slug: string): Promise<Job | null>;
  getJobsByIds(jobIds: string[]): Promise<Job[]>;
  getRelatedJobs(jobId: string, limit?: number): Promise<Job[]>;
  getAllJobsForSitemap(): Promise<Job[]>;
  
  getArticles(page?: number, limit?: number, category?: string, search?: string): Promise<any>;
  getArticleBySlug(slug: string): Promise<any>;
  getRelatedArticles(articleSlug: string, limit?: number): Promise<any>;
  
  getFiltersData(): Promise<FilterData>;
  
  getCategories(page?: number, limit?: number, search?: string): Promise<any>;
  getTags(page?: number, limit?: number, search?: string): Promise<any>;
  getCategoryWithPosts(idOrSlug: string, page?: number, limit?: number): Promise<any>;
  getTagWithPosts(idOrSlug: string, page?: number, limit?: number): Promise<any>;
  
  getPages(page?: number, limit?: number, category?: string, tag?: string, search?: string): Promise<any>;
  getPageBySlug(slug: string): Promise<any>;
  getAllPagesForSitemap(): Promise<any>;
  
  getSitemaps(): Promise<any>;
  getSitemapXML(sitemapPath: string): Promise<string | null>;
  
  testConnection(): Promise<{ success: boolean; data?: any; error?: string }>;
  clearFilterCache(): void;
}
