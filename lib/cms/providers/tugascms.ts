import { Job } from '@/types/job';
import { config } from '@/lib/config';
import { CMSProvider, FilterData, JobsResponse } from '../interface';
import { transformCMSPageToPage } from '@/lib/cms/utils/transformers';

interface CMSJobPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image: string | null;
  publish_date: string;
  status: string;
  author_id: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  created_at: string;
  updated_at: string;
  job_company_name: string | null;
  job_company_logo: string | null;
  job_company_website: string | null;
  employment_type: { id: string; name: string; slug: string } | null;
  experience_level: { id: string; name: string; slug: string; years_min: number; years_max: number | null } | null;
  education_level: { id: string; name: string; slug: string } | null;
  job_salary_min: string | null;
  job_salary_max: string | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_is_salary_negotiable: boolean | null;
  job_skills: string[] | null;
  job_benefits: string[] | null;
  job_requirements: string | null;
  job_responsibilities: string | null;
  job_application_url: string | null;
  job_application_email: string | null;
  job_deadline: string | null;
  job_province_id: string | null;
  job_regency_id: string | null;
  job_district_id: string | null;
  job_village_id: string | null;
  job_address_detail: string | null;
  job_is_remote: boolean | null;
  job_is_hybrid: boolean | null;
  province: { id: string; name: string } | null;
  regency: { id: string; name: string; province_id: string } | null;
  district: { id: string; name: string; regency_id: string } | null;
  village: { id: string; name: string; district_id: string } | null;
  job_categories: Array<{ id: string; name: string; slug: string }>;
  job_tags: Array<{ id: string; name: string; slug: string }>;
}

interface CMSResponse<T> {
  success: boolean;
  data: T;
  cached?: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class TugasCMSProvider implements CMSProvider {
  private baseUrl: string;
  private timeout: number;
  private authToken: string;
  private settingsInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private filterDataCache: { data: FilterData; timestamp: number } | null = null;
  private readonly FILTER_CACHE_TTL = config.cache.filterTtl;

  constructor() {
    this.baseUrl = config.cms.endpoint;
    this.timeout = config.cms.timeout;
    this.authToken = config.cms.token;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.settingsInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadSettingsFromDatabase();
    await this.initializationPromise;
  }

  private async loadSettingsFromDatabase(): Promise<void> {
    try {
      // Use configuration from environment variables instead of database
      this.baseUrl = config.cms.endpoint;
      this.authToken = config.cms.token;
      this.timeout = config.cms.timeout;
      this.settingsInitialized = true;
    } catch (error) {
      console.error('Error loading CMS settings:', error);
      this.settingsInitialized = true;
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  private transformCMSJobToJob(cmsJob: CMSJobPost): Job {
    const formatSalary = (min: string | null, max: string | null, currency: string | null, period: string | null): string => {
      const minNum = min ? parseInt(min) : null;
      const maxNum = max ? parseInt(max) : null;
      
      if (!minNum && !maxNum) return 'Negosiasi';
      
      const currencySymbol = currency === 'IDR' ? 'Rp ' : currency === 'USD' ? '$' : '';
      const formatNumber = (num: number) => {
        if (num >= 1000000) {
          const millions = num / 1000000;
          return millions % 1 === 0 ? `${millions}` : `${millions.toFixed(1)}`;
        }
        return num.toLocaleString('id-ID');
      };

      if (minNum && maxNum) {
        if (minNum >= 1000000 && maxNum >= 1000000) {
          return `${currencySymbol}${formatNumber(minNum)}-${formatNumber(maxNum)} Juta${period ? '/' + period : ''}`;
        }
        return `${currencySymbol}${formatNumber(minNum)} - ${formatNumber(maxNum)}${period ? '/' + period : ''}`;
      } else if (minNum) {
        return `${currencySymbol}${formatNumber(minNum)}+${period ? '/' + period : ''}`;
      } else if (maxNum) {
        return `Up to ${currencySymbol}${formatNumber(maxNum)}${period ? '/' + period : ''}`;
      }
      
      return 'Negosiasi';
    };

    const locationParts: string[] = [];
    if (cmsJob.regency?.name) locationParts.push(cmsJob.regency.name);
    if (cmsJob.province?.name && !locationParts.includes(cmsJob.province.name)) {
      locationParts.push(cmsJob.province.name);
    }

    return {
      id: cmsJob.id,
      slug: cmsJob.slug,
      title: cmsJob.title || 'Untitled Job',
      content: cmsJob.content || '',
      company_name: cmsJob.job_company_name || 'Perusahaan',
      kategori_pekerjaan: cmsJob.job_categories?.[0]?.name || '',
      job_categories: cmsJob.job_categories || [],
      lokasi_provinsi: cmsJob.province?.name || '',
      lokasi_kota: cmsJob.regency?.name || '',
      job_province_id: cmsJob.job_province_id || undefined,
      job_regency_id: cmsJob.job_regency_id || undefined,
      tipe_pekerjaan: cmsJob.employment_type?.name || 'Full Time',
      pendidikan: cmsJob.education_level?.name || '',
      pengalaman: cmsJob.experience_level?.name || '',
      tag: cmsJob.job_tags?.[0]?.name || '',
      job_tags: cmsJob.job_tags || [],
      gender: '',
      gaji: formatSalary(
        cmsJob.job_salary_min,
        cmsJob.job_salary_max,
        cmsJob.job_salary_currency,
        cmsJob.job_salary_period
      ),
      kebijakan_kerja: cmsJob.job_is_remote ? 'Remote Working' : cmsJob.job_is_hybrid ? 'Hybrid Working' : 'On-site',
      industry: cmsJob.job_categories?.[0]?.name || '',
      link: cmsJob.job_application_url || cmsJob.job_application_email ? 
        (cmsJob.job_application_url || `mailto:${cmsJob.job_application_email}`) : 
        `https://nexjob.tech/lowongan-kerja/${cmsJob.job_categories?.[0]?.slug || 'uncategorized'}/${cmsJob.id}`,
      sumber_lowongan: 'Nexjob',
      created_at: cmsJob.created_at,
      seo_title: cmsJob.seo_title || cmsJob.title,
      seo_description: cmsJob.meta_description || cmsJob.excerpt || '',
      _id: { $oid: cmsJob.id },
      id_obj: { $numberInt: cmsJob.id }
    };
  }

  private buildJobsUrl(filters: any = {}, page: number = 1, perPage: number = 24): string {
    const params = new URLSearchParams();

    params.set('page', page.toString());
    params.set('limit', perPage.toString());
    params.set('status', 'published');

    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    if (filters.location) {
      params.set('province', filters.location);
    }
    
    if (filters.cities && filters.cities.length > 0) {
      params.set('city', filters.cities[0]);
    }

    if (filters.jobType) {
      params.set('employment_type', filters.jobType);
    }
    if (filters.jobTypes && filters.jobTypes.length > 0) {
      params.set('employment_type', filters.jobTypes[0]);
    }

    if (filters.experience) {
      params.set('experience_level', filters.experience);
    }
    if (filters.experiences && filters.experiences.length > 0) {
      params.set('experience_level', filters.experiences[0]);
    }

    if (filters.education) {
      params.set('education_level', filters.education);
    }
    if (filters.educations && filters.educations.length > 0) {
      params.set('education_level', filters.educations[0]);
    }

    if (filters.category) {
      params.set('job_category', filters.category);
    }
    if (filters.categories && filters.categories.length > 0) {
      params.set('job_category', filters.categories[0]);
    }

    if (filters.workPolicies && filters.workPolicies.length > 0) {
      const workPolicy = filters.workPolicies[0];
      params.set('work_policy', workPolicy);
    }

    if (filters.job_salary_min) {
      params.set('job_salary_min', filters.job_salary_min);
    }
    if (filters.job_salary_max) {
      params.set('job_salary_max', filters.job_salary_max);
    }
    if (!filters.job_salary_min && !filters.job_salary_max && filters.salaries && filters.salaries.length > 0) {
      const salaryRange = filters.salaries[0];
      if (salaryRange === '1-3') {
        params.set('job_salary_min', '1000000');
        params.set('job_salary_max', '3000000');
      } else if (salaryRange === '4-6') {
        params.set('job_salary_min', '4000000');
        params.set('job_salary_max', '6000000');
      } else if (salaryRange === '7-9') {
        params.set('job_salary_min', '7000000');
        params.set('job_salary_max', '9000000');
      } else if (salaryRange === '10+') {
        params.set('job_salary_min', '10000000');
      }
    }

    if (filters.company) {
      params.set('company', filters.company);
    }
    if (filters.companies && filters.companies.length > 0) {
      params.set('company', filters.companies[0]);
    }

    if (filters.tag) {
      params.set('job_tag', filters.tag);
    }
    if (filters.tags && filters.tags.length > 0) {
      params.set('job_tag', filters.tags[0]);
    }

    if (filters.skill) {
      params.set('skill', filters.skill);
    }
    if (filters.skills && filters.skills.length > 0) {
      params.set('skill', filters.skills[0]);
    }

    if (filters.benefit) {
      params.set('benefit', filters.benefit);
    }
    if (filters.benefits && filters.benefits.length > 0) {
      params.set('benefit', filters.benefits[0]);
    }

    if (filters.district) {
      params.set('district', filters.district);
    }
    if (filters.districts && filters.districts.length > 0) {
      params.set('district', filters.districts[0]);
    }

    if (filters.village) {
      params.set('village', filters.village);
    }
    if (filters.villages && filters.villages.length > 0) {
      params.set('village', filters.villages[0]);
    }

    if (filters.currency) {
      params.set('salary_currency', filters.currency);
    }
    if (filters.salary_currency) {
      params.set('salary_currency', filters.salary_currency);
    }

    if (filters.period) {
      params.set('salary_period', filters.period);
    }
    if (filters.salary_period) {
      params.set('salary_period', filters.salary_period);
    }

    if (filters.negotiable !== undefined) {
      params.set('salary_negotiable', filters.negotiable.toString());
    }
    if (filters.salary_negotiable !== undefined) {
      params.set('salary_negotiable', filters.salary_negotiable.toString());
    }

    if (filters.deadline_after) {
      params.set('deadline_after', filters.deadline_after);
    }
    if (filters.deadline_before) {
      params.set('deadline_before', filters.deadline_before);
    }

    return `${this.baseUrl}/api/v1/job-posts?${params.toString()}`;
  }

  private isFilterCacheValid(): boolean {
    if (!this.filterDataCache) return false;
    return Date.now() - this.filterDataCache.timestamp < this.FILTER_CACHE_TTL;
  }

  private getFallbackFiltersData(): FilterData {
    return {
      employment_types: [],
      experience_levels: [],
      education_levels: [],
      categories: [],
      tags: [],
      salary_range: { min: '0', max: '0', currencies: ['IDR'] },
      work_policy: [],
      provinces: [],
      regencies: [],
      skills: []
    };
  }

  async getFiltersData(): Promise<FilterData> {
    await this.ensureInitialized();
    
    try {
      if (this.isFilterCacheValid() && this.filterDataCache) {
        return this.filterDataCache.data;
      }

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/filters`);
      const data: CMSResponse<FilterData> = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch filter data from CMS');
      }

      this.filterDataCache = {
        data: data.data,
        timestamp: Date.now()
      };

      return data.data;
    } catch (error) {
      if (this.filterDataCache) {
        return this.filterDataCache.data;
      }

      return this.getFallbackFiltersData();
    }
  }

  clearFilterCache(): void {
    this.filterDataCache = null;
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts?limit=1`);
      const data: CMSResponse<{ posts: CMSJobPost[] }> = await response.json();
      return { success: true, data: data.data.posts[0] || null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getJobsByIds(jobIds: string[]): Promise<Job[]> {
    if (jobIds.length === 0) return [];
    
    await this.ensureInitialized();

    try {
      const promises = jobIds.map(async (jobId) => {
        try {
          const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${jobId}`);
          const data: CMSResponse<CMSJobPost> = await response.json();

          if (!data.success) {
            return null;
          }

          return this.transformCMSJobToJob(data.data);
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      return results
        .filter((result): result is PromiseFulfilledResult<Job> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
    } catch (error) {
      return [];
    }
  }

  async getJobs(filters?: any, page: number = 1, perPage: number = 24): Promise<JobsResponse> {
    await this.ensureInitialized();
    
    try {
      const url = this.buildJobsUrl(filters, page, perPage);

      const response = await this.fetchWithTimeout(url);
      const data: CMSResponse<{ posts: CMSJobPost[]; pagination: PaginationMeta }> = await response.json();

      if (!data.success) {
        throw new Error('CMS API returned unsuccessful response');
      }

      const jobs: Job[] = data.data.posts.map(cmsJob => this.transformCMSJobToJob(cmsJob));

      const { pagination } = data.data;

      return {
        jobs,
        totalPages: pagination.totalPages,
        currentPage: pagination.page,
        totalJobs: pagination.total,
        hasMore: pagination.hasNextPage
      };
    } catch (error) {
      return {
        jobs: [],
        totalPages: 1,
        currentPage: 1,
        totalJobs: 0,
        hasMore: false
      };
    }
  }

  async getJobBySlug(slug: string): Promise<Job | null> {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        slug: slug,
        status: 'published',
        limit: '1'
      });
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts?${params.toString()}`);
      const data: CMSResponse<{ posts: CMSJobPost[]; pagination: PaginationMeta }> = await response.json();

      if (!data.success || !data.data.posts || data.data.posts.length === 0) {
        return null;
      }

      return this.transformCMSJobToJob(data.data.posts[0]);
    } catch (error) {
      return null;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        status: 'published'
      });
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${id}?${params.toString()}`);
      const data: CMSResponse<CMSJobPost> = await response.json();

      if (!data.success) {
        return null;
      }

      return this.transformCMSJobToJob(data.data);
    } catch (error) {
      return null;
    }
  }

  async getAllJobsForSitemap(): Promise<Job[]> {
    try {
      const allJobs: Job[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await this.getJobs({}, page, 100);

          if (response.jobs.length === 0) {
            hasMore = false;
          } else {
            allJobs.push(...response.jobs);
            hasMore = response.hasMore && page < response.totalPages;
            page++;
          }
        } catch (error) {
          hasMore = false;
        }
      }

      return allJobs;
    } catch (error) {
      return [];
    }
  }

  async getArticles(page: number = 1, limit: number = 20, category?: string, search?: string) {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'published'
      });

      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/posts?${params.toString()}`
      );
      const data = await response.json();

      return data;
    } catch (error) {
      return { success: false, data: { posts: [], pagination: {} } };
    }
  }

  async getArticleBySlug(slug: string) {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/posts/${slug}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: null };
    }
  }

  async getCategories(page: number = 1, limit: number = 50, search?: string) {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) params.set('search', search);

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/categories?${params.toString()}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: { categories: [], pagination: {} } };
    }
  }

  async getTags(page: number = 1, limit: number = 50, search?: string) {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) params.set('search', search);

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/tags?${params.toString()}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: { tags: [], pagination: {} } };
    }
  }

  async getCategoryWithPosts(idOrSlug: string, page: number = 1, limit: number = 20) {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/categories/${idOrSlug}?${params.toString()}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: { category: null, posts: [], pagination: {} } };
    }
  }

  async getTagWithPosts(idOrSlug: string, page: number = 1, limit: number = 20) {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/tags/${idOrSlug}?${params.toString()}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: { tag: null, posts: [], pagination: {} } };
    }
  }

  async getRelatedJobs(jobId: string, limit: number = 5): Promise<Job[]> {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${jobId}`);
      const data: CMSResponse<CMSJobPost> = await response.json();
      
      if (!data.success || !data.data.job_categories || data.data.job_categories.length === 0) {
        return [];
      }

      const categoryId = data.data.job_categories[0].id;
      
      const relatedResponse = await this.getJobs({ categories: [categoryId] }, 1, limit + 1);
      
      return relatedResponse.jobs
        .filter(job => job.id !== jobId)
        .slice(0, limit);
    } catch (error) {
      return [];
    }
  }

  async getRelatedArticles(articleSlug: string, limit: number = 5) {
    await this.ensureInitialized();
    
    try {
      const articleResponse = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/posts/${articleSlug}`);
      const articleData = await articleResponse.json();
      
      if (!articleData.success || !articleData.data.categories || articleData.data.categories.length === 0) {
        const response = await this.getArticles(1, limit + 5);
        
        if (!response.success || !response.data.posts) {
          return { success: false, data: [] };
        }
        
        return { 
          success: true, 
          data: response.data.posts
            .filter((article: any) => article.slug !== articleSlug)
            .slice(0, limit) 
        };
      }

      const categoryId = articleData.data.categories[0].id;
      
      const relatedResponse = await this.getArticles(1, limit + 5, categoryId);
      
      if (!relatedResponse.success || !relatedResponse.data.posts) {
        return { success: false, data: [] };
      }

      const relatedArticles = relatedResponse.data.posts
        .filter((article: any) => article.slug !== articleSlug)
        .slice(0, limit);

      return { success: true, data: relatedArticles };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  async getPages(page: number = 1, limit: number = 20, category?: string, tag?: string, search?: string) {
    await this.ensureInitialized();
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'published'
      });

      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      if (search) params.set('search', search);

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/pages?${params.toString()}`
      );
      const data = await response.json();

      if (!data.success) {
        return { success: false, data: { pages: [], pagination: {} } };
      }

      const transformedPages = data.data.pages.map((page: any) => transformCMSPageToPage(page));

      return {
        success: true,
        data: {
          pages: transformedPages,
          pagination: data.data.pagination
        },
        cached: data.cached
      };
    } catch (error) {
      console.error('Error fetching pages:', error);
      return { success: false, data: { pages: [], pagination: {} } };
    }
  }

  async getPageBySlug(slug: string) {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/pages/${slug}`);
      const data = await response.json();

      if (!data.success || !data.data) {
        return { success: false, data: null };
      }

      const transformedPage = transformCMSPageToPage(data.data);

      return {
        success: true,
        data: transformedPage,
        cached: data.cached
      };
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      return { success: false, data: null };
    }
  }

  async getAllPagesForSitemap() {
    await this.ensureInitialized();
    
    try {
      const allPages: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await this.getPages(page, 100);

          if (!response.success) {
            console.error('Failed to fetch pages for sitemap');
            break;
          }

          if (!response.data.pages || response.data.pages.length === 0) {
            hasMore = false;
          } else {
            allPages.push(...response.data.pages);
            hasMore = response.data.pagination?.hasNextPage || false;
            page++;
          }
        } catch (error) {
          console.error(`Error fetching pages page ${page}:`, error);
          break;
        }
      }

      return allPages;
    } catch (error) {
      console.error('Error fetching all pages for sitemap:', error);
      return [];
    }
  }

  async getSitemaps() {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/sitemaps`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sitemaps:', error);
      return { success: false, data: { sitemaps: [] } };
    }
  }

  async getSitemapXML(sitemapPath: string): Promise<string | null> {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${sitemapPath}`);
      let xmlContent = await response.text();
      
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech';
      
      xmlContent = xmlContent.replace(
        /\/api\/v1\/sitemaps\//g,
        '/'
      );
      
      xmlContent = xmlContent.replace(
        /https?:\/\/cms\.nexjob\.tech\//g,
        `${siteUrl}/`
      );
      
      return xmlContent;
    } catch (error) {
      console.error('Error fetching sitemap XML:', error);
      return null;
    }
  }

  async getRobotsTxt(): Promise<string | null> {
    await this.ensureInitialized();
    
    try {
      console.log('Fetching robots.txt from CMS API...');
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/robots.txt`);
      const robotsContent = await response.text();
      
      console.log('Successfully fetched robots.txt from CMS');
      return robotsContent;
    } catch (error) {
      console.error('Error fetching robots.txt from CMS:', error);
      return null;
    }
  }

  async getAdvertisements(): Promise<any> {
    await this.ensureInitialized();

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/settings/advertisements`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching advertisements from CMS:', error);
      // Return default empty advertisements
      return {
        success: true,
        data: {
          popup_ad: {
            enabled: false,
            url: '',
            load_settings: [],
            max_executions: 0,
            device: 'all'
          },
          ad_codes: {
            sidebar_archive: '',
            sidebar_single: '',
            single_top: '',
            single_bottom: '',
            single_middle: ''
          }
        }
      };
    }
  }
}
