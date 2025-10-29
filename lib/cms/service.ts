import { Job } from '@/types/job';
import { supabaseAdminService } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

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

export class CMSService {
  private baseUrl: string;
  private timeout: number;
  private authToken: string;
  private settingsInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  // Cache for filter data with 1 hour cache
  private filterDataCache: { data: FilterData; timestamp: number } | null = null;
  private readonly FILTER_CACHE_TTL = parseInt(process.env.FILTER_CACHE_TTL || '3600000'); // 1 hour

  constructor() {
    // Initialize with fallback values (will be overridden by database settings)
    this.baseUrl = env.CMS_ENDPOINT || 'https://cms.nexjob.tech';
    this.timeout = parseInt(env.CMS_TIMEOUT || '10000');
    this.authToken = env.CMS_TOKEN || '';
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
      const settings = await supabaseAdminService.getSettings();
      
      if (!settings) {
        this.settingsInitialized = true;
        return;
      }

      // Update CMS settings from database
      if (settings.cms_endpoint) {
        this.baseUrl = settings.cms_endpoint;
      }
      if (settings.cms_token) {
        this.authToken = settings.cms_token;
      }
      if (settings.cms_timeout) {
        this.timeout = typeof settings.cms_timeout === 'number' 
          ? settings.cms_timeout 
          : parseInt(String(settings.cms_timeout));
      }

      this.settingsInitialized = true;
    } catch (error) {
      this.settingsInitialized = true;
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

    // Build location string
    const locationParts: string[] = [];
    if (cmsJob.regency?.name) locationParts.push(cmsJob.regency.name);
    if (cmsJob.province?.name && !locationParts.includes(cmsJob.province.name)) {
      locationParts.push(cmsJob.province.name);
    }
    const locationString = locationParts.join(', ') || '';

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
      tipe_pekerjaan: cmsJob.employment_type?.name || 'Full Time',
      pendidikan: cmsJob.education_level?.name || '',
      pengalaman: cmsJob.experience_level?.name || '',
      tag: cmsJob.job_tags?.[0]?.name || '',
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
        `https://nexjob.tech/lowongan-kerja/${cmsJob.job_categories?.[0]?.slug || 'uncategorized'}/${cmsJob.slug}`,
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

    // Pagination
    params.set('page', page.toString());
    params.set('limit', perPage.toString());

    // Always filter by published status
    params.set('status', 'published');

    // Search parameter
    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    // Location filters
    // Province filter - use 'province' parameter as per API documentation
    if (filters.location) {
      params.set('province', filters.location);
    }
    
    // City/Regency filter - use 'city' parameter as per API documentation
    if (filters.cities && filters.cities.length > 0) {
      params.set('city', filters.cities[0]);
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

    // Education level filter
    if (filters.education) {
      params.set('education_level', filters.education);
    }
    if (filters.educations && filters.educations.length > 0) {
      params.set('education_level', filters.educations[0]);
    }

    // Category filter
    if (filters.category) {
      params.set('job_category', filters.category);
    }
    if (filters.categories && filters.categories.length > 0) {
      params.set('job_category', filters.categories[0]);
    }

    // Work policy filter (workPolicies) - using work_policy parameter
    if (filters.workPolicies && filters.workPolicies.length > 0) {
      const workPolicy = filters.workPolicies[0];
      params.set('work_policy', workPolicy);
    }

    // NEW: Direct salary min/max (takes priority)
    if (filters.job_salary_min) {
      params.set('job_salary_min', filters.job_salary_min);
    }
    if (filters.job_salary_max) {
      params.set('job_salary_max', filters.job_salary_max);
    }
    // FALLBACK: Old salary range logic (for backward compatibility)
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

    // Company filter - using 'company' alias
    if (filters.company) {
      params.set('company', filters.company);
    }
    if (filters.companies && filters.companies.length > 0) {
      params.set('company', filters.companies[0]);
    }

    // Tag filter - using 'job_tag' parameter
    if (filters.tag) {
      params.set('job_tag', filters.tag);
    }
    if (filters.tags && filters.tags.length > 0) {
      params.set('job_tag', filters.tags[0]);
    }

    // Skill filter
    if (filters.skill) {
      params.set('skill', filters.skill);
    }
    if (filters.skills && filters.skills.length > 0) {
      params.set('skill', filters.skills[0]);
    }

    // Benefit filter
    if (filters.benefit) {
      params.set('benefit', filters.benefit);
    }
    if (filters.benefits && filters.benefits.length > 0) {
      params.set('benefit', filters.benefits[0]);
    }

    // Additional location filters
    // District filter - use 'district' parameter
    if (filters.district) {
      params.set('district', filters.district);
    }
    if (filters.districts && filters.districts.length > 0) {
      params.set('district', filters.districts[0]);
    }

    // Village filter - use 'village' parameter
    if (filters.village) {
      params.set('village', filters.village);
    }
    if (filters.villages && filters.villages.length > 0) {
      params.set('village', filters.villages[0]);
    }

    // Additional salary filters
    // Currency filter - use 'salary_currency' parameter as per API documentation
    if (filters.currency) {
      params.set('salary_currency', filters.currency);
    }
    if (filters.salary_currency) {
      params.set('salary_currency', filters.salary_currency);
    }

    // Period filter - use 'salary_period' parameter as per API documentation
    if (filters.period) {
      params.set('salary_period', filters.period);
    }
    if (filters.salary_period) {
      params.set('salary_period', filters.salary_period);
    }

    // Salary negotiable filter - use 'salary_negotiable' parameter as per API documentation
    if (filters.negotiable !== undefined) {
      params.set('salary_negotiable', filters.negotiable.toString());
    }
    if (filters.salary_negotiable !== undefined) {
      params.set('salary_negotiable', filters.salary_negotiable.toString());
    }

    // Application deadline filters
    if (filters.deadline_after) {
      params.set('deadline_after', filters.deadline_after);
    }
    if (filters.deadline_before) {
      params.set('deadline_before', filters.deadline_before);
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
    await this.ensureInitialized();
    
    try {
      // Use cache if valid
      if (this.isFilterCacheValid() && this.filterDataCache) {
        return this.filterDataCache.data;
      }

      // Fetch filter data from the new job-posts/filters endpoint
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/filters`);
      const data: CMSResponse<FilterData> = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch filter data from CMS');
      }

      // Update cache
      this.filterDataCache = {
        data: data.data,
        timestamp: Date.now()
      };

      return data.data;
    } catch (error) {
      // Return cached data if available, otherwise fallback
      if (this.filterDataCache) {
        return this.filterDataCache.data;
      }

      return this.getFallbackFiltersData();
    }
  }

  clearFilterCache(): void {
    this.filterDataCache = null;
    console.log('Filter cache cleared');
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
    await this.ensureInitialized();
    
    try {
      const url = this.buildJobsUrl(filters, page, perPage);

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
    await this.ensureInitialized();
    
    try {
      // Use query parameter to filter by slug instead of path parameter
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

      // Return the first post from results
      return this.transformCMSJobToJob(data.data.posts[0]);
    } catch (error) {
      console.error('Error fetching job by slug:', error);
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
      console.error('Error fetching job by ID:', error);
      return null;
    }
  }

  // Blog/Article methods
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
      console.error('Error fetching articles:', error);
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
      console.error('Error fetching article by slug:', error);
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
      console.error('Error fetching categories:', error);
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
      console.error('Error fetching tags:', error);
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
      console.error('Error fetching category with posts:', error);
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
      console.error('Error fetching tag with posts:', error);
      return { success: false, data: { tag: null, posts: [], pagination: {} } };
    }
  }

  // Legacy compatibility methods
  setFiltersApiUrl(url: string) {
    console.warn('setFiltersApiUrl is deprecated with CMS API');
  }

  async testFiltersConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    await this.ensureInitialized();
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/categories?limit=1`);
      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getRelatedJobs(jobId: string, limit: number = 5): Promise<Job[]> {
    await this.ensureInitialized();
    
    try {
      // Fetch the job directly from API to get category data
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/job-posts/${jobId}`);
      const data: CMSResponse<CMSJobPost> = await response.json();
      
      if (!data.success || !data.data.job_categories || data.data.job_categories.length === 0) {
        return [];
      }

      // Get the first category ID to filter related jobs
      const categoryId = data.data.job_categories[0].id;
      
      // Fetch jobs from the same category using category ID
      const relatedResponse = await this.getJobs({ categories: [categoryId] }, 1, limit + 1);
      
      // Filter out current job and limit results
      return relatedResponse.jobs
        .filter(job => job.id !== jobId)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching related jobs:', error);
      return [];
    }
  }

  async getRelatedArticles(articleSlug: string, limit: number = 5) {
    await this.ensureInitialized();
    
    try {
      // Fetch the article directly from API to get category data
      const articleResponse = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/posts/${articleSlug}`);
      const articleData = await articleResponse.json();
      
      if (!articleData.success || !articleData.data.categories || articleData.data.categories.length === 0) {
        // If no category, fetch latest articles instead
        const response = await this.getArticles(1, limit + 5);
        if (!response.success) return [];
        
        return response.data.posts
          .filter((post: any) => post.slug !== articleSlug)
          .slice(0, limit);
      }

      // Get the first category ID to filter related articles (use ID not slug!)
      const categoryId = articleData.data.categories[0].id;
      
      // Fetch articles from the same category using category ID
      const relatedResponse = await this.getArticles(1, limit + 5, categoryId);
      
      if (!relatedResponse.success) return [];

      // Filter out current article and limit results
      return relatedResponse.data.posts
        .filter((post: any) => post.slug !== articleSlug)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  }

  // Transform CMS page data from snake_case to camelCase
  private transformCMSPageToPage(cmsPage: any): any {
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

  // Pages methods
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

      // Transform pages to camelCase
      const transformedPages = data.data.pages.map((page: any) => this.transformCMSPageToPage(page));

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

      // Transform page to camelCase
      const transformedPage = this.transformCMSPageToPage(data.data);

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

          // Stop immediately if request failed
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

  // Sitemap methods
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
      // Fetch the sitemap XML from CMS
      const response = await this.fetchWithTimeout(`${this.baseUrl}${sitemapPath}`);
      let xmlContent = await response.text();
      
      // Transform URLs from CMS API structure to site structure
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech';
      
      // Remove /api/v1/sitemaps/ from all URLs in the XML
      // Pattern: https://nexjob.tech/api/v1/sitemaps/sitemap-*.xml -> https://nexjob.tech/sitemap-*.xml
      xmlContent = xmlContent.replace(
        /\/api\/v1\/sitemaps\//g,
        '/'
      );
      
      // Also ensure the domain is correct (in case CMS returns cms.nexjob.tech)
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
}

// Export singleton instance
export const cmsService = new CMSService();
