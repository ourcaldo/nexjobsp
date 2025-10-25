import { Job } from '@/types/job';
import { supabaseAdminService } from './supabaseAdminService';
import { env } from '@/lib/env';

interface FilterData {
  employment_types: string[];
  experience_levels: string[];
  job_categories: Array<{ id: string; name: string; slug: string }>;
  job_tags: Array<{ id: string; name: string; slug: string }>;
  locations: Record<string, string[]>;
  industries: string[];
  salary_ranges: string[];
}

interface JobsResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
  hasMore: boolean;
}

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
  post_type: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  created_at: string;
  updated_at: string;
  job_company_name: string | null;
  employment_type: string | null;
  experience_level: string | null;
  job_salary_min: number | null;
  job_salary_max: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_skills: string[] | null;
  job_location_province: string | null;
  job_location_city: string | null;
  job_industry: string | null;
  job_education: string | null;
  job_gender: string | null;
  job_work_policy: string | null;
  job_application_link: string | null;
  job_source: string | null;
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

class CMSService {
  private baseUrl: string;
  private timeout: number;
  private authToken: string;

  // Cache for filter data with 1 hour cache
  private filterDataCache: { data: FilterData; timestamp: number } | null = null;
  private readonly FILTER_CACHE_TTL = parseInt(process.env.FILTER_CACHE_TTL || '3600000'); // 1 hour

  constructor() {
    // Initialize with environment variables
    this.baseUrl = env.CMS_ENDPOINT;
    this.timeout = parseInt(env.CMS_TIMEOUT || '10000');
    this.authToken = env.CMS_TOKEN;

    // Try to get settings from admin service (browser only)
    if (typeof window !== 'undefined') {
      this.updateFromAdminSettings();
    }
  }

  private async updateFromAdminSettings() {
    try {
      const settings = await supabaseAdminService.getSettings();
      if (!settings) {
        console.warn('Settings not available, using environment variables');
        return;
      }

      // Update CMS settings if available in database
      if (settings.cms_endpoint) this.baseUrl = settings.cms_endpoint;
      if (settings.cms_token) this.authToken = settings.cms_token;
      if (settings.cms_timeout) this.timeout = parseInt(settings.cms_timeout);
    } catch (error) {
      console.warn('Could not load admin settings, using environment variables');
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getCurrentSettings() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      authToken: this.authToken
    };
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
    // Format salary display
    const formatSalary = (min: number | null, max: number | null, currency: string | null, period: string | null): string => {
      if (!min && !max) return 'Negosiasi';
      
      const currencySymbol = currency === 'IDR' ? 'Rp ' : currency === 'USD' ? '$' : '';
      const formatNumber = (num: number) => {
        if (num >= 1000000) {
          return `${(num / 1000000).toFixed(1)}jt`;
        }
        return num.toLocaleString('id-ID');
      };

      if (min && max) {
        return `${currencySymbol}${formatNumber(min)} - ${formatNumber(max)}${period ? '/' + period : ''}`;
      } else if (min) {
        return `${currencySymbol}${formatNumber(min)}+${period ? '/' + period : ''}`;
      } else if (max) {
        return `Up to ${currencySymbol}${formatNumber(max)}${period ? '/' + period : ''}`;
      }
      
      return 'Negosiasi';
    };

    return {
      id: cmsJob.id,
      slug: cmsJob.slug,
      title: cmsJob.title || 'Untitled Job',
      content: cmsJob.content || '',
      company_name: cmsJob.job_company_name || 'Perusahaan',
      kategori_pekerjaan: cmsJob.job_categories?.[0]?.name || '',
      lokasi_provinsi: cmsJob.job_location_province || '',
      lokasi_kota: cmsJob.job_location_city || '',
      tipe_pekerjaan: cmsJob.employment_type || 'Full Time',
      pendidikan: cmsJob.job_education || '',
      industry: cmsJob.job_industry || '',
      pengalaman: cmsJob.experience_level || '',
      tag: cmsJob.job_tags?.[0]?.name || '',
      gender: cmsJob.job_gender || '',
      gaji: formatSalary(
        cmsJob.job_salary_min,
        cmsJob.job_salary_max,
        cmsJob.job_salary_currency,
        cmsJob.job_salary_period
      ),
      kebijakan_kerja: cmsJob.job_work_policy || '',
      link: cmsJob.job_application_link || `https://nexjob.tech/lowongan/${cmsJob.slug}`,
      sumber_lowongan: cmsJob.job_source || 'Nexjob',
      created_at: cmsJob.created_at,
      seo_title: cmsJob.seo_title || cmsJob.title,
      seo_description: cmsJob.meta_description || cmsJob.excerpt || '',
      _id: { $oid: cmsJob.id },
      id_obj: { $numberInt: cmsJob.id }
    };
  }

  private buildJobsUrl(filters: any = {}, page: number = 1, perPage: number = 24): string {
    const params = new URLSearchParams();

    // Pagination
    params.set('page', page.toString());
    params.set('limit', perPage.toString());

    // Always filter by published status
    params.set('status', 'published');

    // Search parameter
    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    // Employment type filter
    if (filters.jobType) {
      params.set('employment_type', filters.jobType);
    }
    if (filters.jobTypes && filters.jobTypes.length > 0) {
      params.set('employment_type', filters.jobTypes[0]);
    }

    // Experience level filter
    if (filters.experience) {
      params.set('experience_level', filters.experience);
    }
    if (filters.experiences && filters.experiences.length > 0) {
      params.set('experience_level', filters.experiences[0]);
    }

    // Category filter
    if (filters.category) {
      params.set('job_category', filters.category);
    }
    if (filters.categories && filters.categories.length > 0) {
      params.set('job_category', filters.categories[0]);
    }

    return `${this.baseUrl}/api/v1/job-posts?${params.toString()}`;
  }

  // Check if filter cache is valid
  private isFilterCacheValid(): boolean {
    if (!this.filterDataCache) return false;
    return Date.now() - this.filterDataCache.timestamp < this.FILTER_CACHE_TTL;
  }

  // Get filter data with caching
  async getFiltersData(): Promise<FilterData> {
    try {
      // Use cache if valid
      if (this.isFilterCacheValid() && this.filterDataCache) {
        console.log('Using cached filter data');
        return this.filterDataCache.data;
      }

      console.log('Fetching fresh filter data from CMS');

      // Fetch categories and tags in parallel
      const [categoriesResponse, tagsResponse] = await Promise.all([
        this.fetchWithTimeout(`${this.baseUrl}/api/v1/categories?limit=100`),
        this.fetchWithTimeout(`${this.baseUrl}/api/v1/tags?limit=100`)
      ]);

      const categoriesData: CMSResponse<{ categories: Array<{ id: string; name: string; slug: string }> }> = 
        await categoriesResponse.json();
      const tagsData: CMSResponse<{ tags: Array<{ id: string; name: string; slug: string }> }> = 
        await tagsResponse.json();

      // Build filter data structure
      const filterData: FilterData = {
        employment_types: ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'],
        experience_levels: ['Fresh Graduate', '1-2 Years', '2-3 Years', '3-5 Years', '5+ Years'],
        job_categories: categoriesData.success ? categoriesData.data.categories : [],
        job_tags: tagsData.success ? tagsData.data.tags : [],
        locations: this.getFallbackLocations(),
        industries: this.getFallbackIndustries(),
        salary_ranges: ['Below 5 Million', '5-10 Million', '10-15 Million', '15-20 Million', 'Above 20 Million']
      };

      // Update cache
      this.filterDataCache = {
        data: filterData,
        timestamp: Date.now()
      };

      console.log('Filter data cached for 1 hour');
      return filterData;
    } catch (error) {
      console.error('Error fetching filters data:', error);

      // Return cached data if available, otherwise fallback
      if (this.filterDataCache) {
        console.log('Returning cached filter data due to error');
        return this.filterDataCache.data;
      }

      return this.getFallbackFiltersData();
    }
  }

  clearFilterCache(): void {
    this.filterDataCache = null;
    console.log('Filter cache cleared');
  }

  private getFallbackLocations(): Record<string, string[]> {
    return {
      'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur'],
      'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Tangerang'],
      'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Sidoarjo'],
      'Jawa Tengah': ['Semarang', 'Solo', 'Yogyakarta'],
      'Bali': ['Denpasar', 'Ubud', 'Sanur'],
      'Sumatera Utara': ['Medan', 'Binjai']
    };
  }

  private getFallbackIndustries(): string[] {
    return [
      'Teknologi Informasi',
      'Perbankan',
      'Healthcare',
      'Pendidikan',
      'E-commerce',
      'Otomotif',
      'Digital Marketing',
      'Human Resources',
      'Customer Service',
      'Sales',
      'Logistik',
      'Akuntansi'
    ];
  }

  private getFallbackFiltersData(): FilterData {
    return {
      employment_types: ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'],
      experience_levels: ['Fresh Graduate', '1-2 Years', '2-3 Years', '3-5 Years', '5+ Years'],
      job_categories: [],
      job_tags: [],
      locations: this.getFallbackLocations(),
      industries: this.getFallbackIndustries(),
      salary_ranges: ['Below 5 Million', '5-10 Million', '10-15 Million', '15-20 Million', 'Above 20 Million']
    };
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
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

    try {
      const promises = jobIds.map(async (jobId) => {
        try {
          const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${jobId}`);
          const data: CMSResponse<CMSJobPost> = await response.json();

          if (!data.success) {
            console.warn(`Failed to fetch job ${jobId}`);
            return null;
          }

          return this.transformCMSJobToJob(data.data);
        } catch (error) {
          console.warn(`Error fetching job ${jobId}:`, error);
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
      console.error('Error fetching jobs by IDs:', error);
      return [];
    }
  }

  async getJobs(filters?: any, page: number = 1, perPage: number = 24): Promise<JobsResponse> {
    try {
      const url = this.buildJobsUrl(filters, page, perPage);
      console.log('Fetching jobs from CMS:', url);

      const response = await this.fetchWithTimeout(url);
      const data: CMSResponse<{ posts: CMSJobPost[]; pagination: PaginationMeta }> = await response.json();

      if (!data.success) {
        throw new Error('CMS API returned unsuccessful response');
      }

      // Transform CMS jobs to Job interface
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
      console.error('Error fetching jobs from CMS:', error);
      
      // Return empty fallback instead of mock data
      return {
        jobs: [],
        totalPages: 1,
        currentPage: 1,
        totalJobs: 0,
        hasMore: false
      };
    }
  }

  // Legacy method for backward compatibility
  async getAllJobs(filters?: any): Promise<Job[]> {
    const response = await this.getJobs(filters, 1, 100);
    return response.jobs;
  }

  // Method to get ALL jobs for sitemap generation
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
          console.error(`Error fetching jobs page ${page}:`, error);
          hasMore = false;
        }
      }

      return allJobs;
    } catch (error) {
      console.error('Error fetching all jobs for sitemap:', error);
      return [];
    }
  }

  async getJobBySlug(slug: string): Promise<Job | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${slug}`);
      const data: CMSResponse<CMSJobPost> = await response.json();

      if (!data.success) {
        return null;
      }

      return this.transformCMSJobToJob(data.data);
    } catch (error) {
      console.error('Error fetching job by slug:', error);
      return null;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${id}`);
      const data: CMSResponse<CMSJobPost> = await response.json();

      if (!data.success) {
        return null;
      }

      return this.transformCMSJobToJob(data.data);
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      return null;
    }
  }

  // Blog/Article methods
  async getArticles(page: number = 1, limit: number = 20, category?: string, search?: string) {
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
      console.error('Error fetching articles:', error);
      return { success: false, data: { posts: [], pagination: {} } };
    }
  }

  async getArticleBySlug(slug: string) {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/posts/${slug}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return { success: false, data: null };
    }
  }

  async getCategories(page: number = 1, limit: number = 50) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/categories?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, data: { categories: [], pagination: {} } };
    }
  }

  async getTags(page: number = 1, limit: number = 50) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/tags?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { success: false, data: { tags: [], pagination: {} } };
    }
  }
}

// Export singleton instance
export const cmsService = new CMSService();
