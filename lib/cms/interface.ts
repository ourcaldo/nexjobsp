import { Job, JobFilters } from '@/types/job';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  publish_date: string;
  published_at?: string;
  post_date?: string;
  updated_at?: string;
  status: string;
  author_id?: string;
  seo_title: string | null;
  meta_description: string | null;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  author: { id?: string; full_name?: string; email?: string } | null;
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

// Generic API response wrapper for CMS endpoints
export interface APIResponse<T> {
  success: boolean;
  data: T;
  cached?: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Specific response types
export interface ArticlesResponseData {
  posts: Article[];
  pagination: PaginationData;
}

export interface PagesResponseData {
  pages: Page[];
  pagination: PaginationData;
}

export interface CategoriesResponseData {
  categories: Category[];
  pagination: PaginationData;
}

export interface TagsResponseData {
  tags: Tag[];
  pagination: PaginationData;
}

export interface AdvertisementSettings {
  popup_ad: {
    enabled: boolean;
    url: string;
    load_settings: string[];
    max_executions: number;
    device: 'all' | 'mobile' | 'desktop';
  };
  ad_codes: {
    sidebar_archive: string;
    sidebar_single: string;
    single_top: string;
    single_bottom: string;
    single_middle: string;
  };
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string | null;
  status: string;
  seo_title?: string | null;
  meta_description?: string | null;
}

export interface CMSProvider {
  getJobs(filters?: JobFilters, page?: number, perPage?: number): Promise<JobsResponse>;
  getJobById(id: string): Promise<Job | null>;
  getJobBySlug(slug: string): Promise<Job | null>;
  getJobsByIds(jobIds: string[]): Promise<Job[]>;
  getRelatedJobs(jobId: string, limit?: number): Promise<Job[]>;
  getAllJobsForSitemap(): Promise<Job[]>;

  // Article methods - return API response wrapper
  getArticles(page?: number, limit?: number, category?: string, search?: string): Promise<APIResponse<ArticlesResponseData>>;
  getArticleBySlug(slug: string): Promise<APIResponse<Article | null>>;
  getRelatedArticles(articleSlug: string, limit?: number): Promise<APIResponse<Article[]>>;

  getFiltersData(): Promise<FilterData>;

  // Category/Tag methods - return API response wrapper
  getCategories(page?: number, limit?: number, search?: string): Promise<APIResponse<CategoriesResponseData>>;
  getTags(page?: number, limit?: number, search?: string): Promise<APIResponse<TagsResponseData>>;
  getCategoryWithPosts(idOrSlug: string, page?: number, limit?: number): Promise<APIResponse<{ category: Category; posts: Article[] } | null>>;
  getTagWithPosts(idOrSlug: string, page?: number, limit?: number): Promise<APIResponse<{ tag: Tag; posts: Article[] } | null>>;

  // Page methods - return API response wrapper
  getPages(page?: number, limit?: number, category?: string, tag?: string, search?: string): Promise<APIResponse<PagesResponseData>>;
  getPageBySlug(slug: string): Promise<APIResponse<Page | null>>;
  getAllPagesForSitemap(): Promise<Page[]>;

  getSitemaps(): Promise<string[]>;
  getSitemapXML(sitemapPath: string): Promise<string | null>;
  getRobotsTxt(): Promise<string | null>;

  getAdvertisements(): Promise<AdvertisementSettings | null>;

  testConnection(): Promise<{ success: boolean; message?: string; error?: string }>;
  clearFilterCache(): void;
}
