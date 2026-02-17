// TODO: Add unit test coverage (see audit E-11)
import { Job } from '@/types/job';
import { FilterData, JobsResponse } from '../interface';
import { config } from '@/lib/config';
import { CMSHttpClient } from './http-client';
import { logger } from '@/lib/logger';

const log = logger.child('cms:jobs');

// ─── CMS job post shape ──────────────────────────────────────────────
export interface CMSJobPost {
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

// ─── Transformer ─────────────────────────────────────────────────────

export function transformCMSJobToJob(cmsJob: CMSJobPost): Job {
  const formatSalary = (min: string | null, max: string | null, currency: string | null, period: string | null): string => {
    const minNum = min ? parseInt(min) : null;
    const maxNum = max ? parseInt(max) : null;

    if (!minNum && !maxNum) return 'Negosiasi';

    const periodMap: Record<string, string> = {
      monthly: 'bulan',
      yearly: 'tahun',
      weekly: 'minggu',
      daily: 'hari',
      hourly: 'jam',
    };
    const displayPeriod = period ? (periodMap[period.toLowerCase()] || period) : null;

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
        return `${currencySymbol}${formatNumber(minNum)}-${formatNumber(maxNum)} Juta${displayPeriod ? '/' + displayPeriod : ''}`;
      }
      return `${currencySymbol}${formatNumber(minNum)} - ${formatNumber(maxNum)}${displayPeriod ? '/' + displayPeriod : ''}`;
    } else if (minNum) {
      return `${currencySymbol}${formatNumber(minNum)}+${displayPeriod ? '/' + displayPeriod : ''}`;
    } else if (maxNum) {
      return `Hingga ${currencySymbol}${formatNumber(maxNum)}${displayPeriod ? '/' + displayPeriod : ''}`;
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

// ─── Search params interface ─────────────────────────────────────────

export interface JobSearchParams {
  search?: string;
  location?: string;
  cities?: string[];
  jobType?: string;
  jobTypes?: string[];
  experience?: string;
  experiences?: string[];
  education?: string;
  educations?: string[];
  category?: string;
  categories?: string[];
  workPolicies?: string[];
  job_salary_min?: string;
  job_salary_max?: string;
  salaries?: string[];
  salary?: string;
  company?: string;
  companies?: string[];
  tag?: string;
  tags?: string[];
  skill?: string;
  skills?: string[];
  benefit?: string;
  benefits?: string[];
  district?: string;
  districts?: string[];
  village?: string;
  villages?: string[];
  currency?: string;
  salary_currency?: string;
  period?: string;
  salary_period?: string;
  negotiable?: boolean;
  salary_negotiable?: boolean;
  deadline_after?: string;
  deadline_before?: string;
}

// ─── URL builder ─────────────────────────────────────────────────────

export function buildJobsUrl(baseUrl: string, filters: JobSearchParams = {}, page: number = 1, perPage: number = 24): string {
  const params = new URLSearchParams();

  params.set('page', page.toString());
  params.set('limit', perPage.toString());
  params.set('status', 'published');

  if (filters.search && filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.location) params.set('province', filters.location);
  if (filters.cities && filters.cities.length > 0) params.set('city', filters.cities[0]!);

  if (filters.jobType) params.set('employment_type', filters.jobType);
  if (filters.jobTypes && filters.jobTypes.length > 0) params.set('employment_type', filters.jobTypes[0]!);

  if (filters.experience) params.set('experience_level', filters.experience);
  if (filters.experiences && filters.experiences.length > 0) params.set('experience_level', filters.experiences[0]!);

  if (filters.education) params.set('education_level', filters.education);
  if (filters.educations && filters.educations.length > 0) params.set('education_level', filters.educations[0]!);

  if (filters.category) params.set('job_category', filters.category);
  if (filters.categories && filters.categories.length > 0) params.set('job_category', filters.categories[0]!);

  if (filters.workPolicies && filters.workPolicies.length > 0) params.set('work_policy', filters.workPolicies[0]!);

  if (filters.job_salary_min) params.set('job_salary_min', filters.job_salary_min);
  if (filters.job_salary_max) params.set('job_salary_max', filters.job_salary_max);
  if (!filters.job_salary_min && !filters.job_salary_max && filters.salaries && filters.salaries.length > 0) {
    const salaryRange = filters.salaries[0];
    if (salaryRange === '1-3') { params.set('job_salary_min', '1000000'); params.set('job_salary_max', '3000000'); }
    else if (salaryRange === '4-6') { params.set('job_salary_min', '4000000'); params.set('job_salary_max', '6000000'); }
    else if (salaryRange === '7-9') { params.set('job_salary_min', '7000000'); params.set('job_salary_max', '9000000'); }
    else if (salaryRange === '10+') { params.set('job_salary_min', '10000000'); }
  }

  if (filters.company) params.set('company', filters.company);
  if (filters.companies && filters.companies.length > 0) params.set('company', filters.companies[0]!);
  if (filters.tag) params.set('job_tag', filters.tag);
  if (filters.tags && filters.tags.length > 0) params.set('job_tag', filters.tags[0]!);
  if (filters.skill) params.set('skill', filters.skill);
  if (filters.skills && filters.skills.length > 0) params.set('skill', filters.skills[0]!);
  if (filters.benefit) params.set('benefit', filters.benefit);
  if (filters.benefits && filters.benefits.length > 0) params.set('benefit', filters.benefits[0]!);
  if (filters.district) params.set('district', filters.district);
  if (filters.districts && filters.districts.length > 0) params.set('district', filters.districts[0]!);
  if (filters.village) params.set('village', filters.village);
  if (filters.villages && filters.villages.length > 0) params.set('village', filters.villages[0]!);
  if (filters.currency) params.set('salary_currency', filters.currency);
  if (filters.salary_currency) params.set('salary_currency', filters.salary_currency);
  if (filters.period) params.set('salary_period', filters.period);
  if (filters.salary_period) params.set('salary_period', filters.salary_period);
  if (filters.negotiable !== undefined) params.set('salary_negotiable', filters.negotiable.toString());
  if (filters.salary_negotiable !== undefined) params.set('salary_negotiable', filters.salary_negotiable.toString());
  if (filters.deadline_after) params.set('deadline_after', filters.deadline_after);
  if (filters.deadline_before) params.set('deadline_before', filters.deadline_before);

  return `${baseUrl}/api/v1/job-posts?${params.toString()}`;
}

// ─── Job domain operations ───────────────────────────────────────────

export class JobOperations {
  constructor(private http: CMSHttpClient) {}

  private filterDataCache: { data: FilterData; timestamp: number } | null = null;
  private readonly FILTER_CACHE_TTL = config.cache.filterTtl;

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
      skills: [],
    };
  }

  async getFiltersData(): Promise<FilterData> {
    await this.http.ensureInitialized();
    try {
      if (this.isFilterCacheValid() && this.filterDataCache) {
        return this.filterDataCache.data;
      }

      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/job-posts/filters`);
      const data: CMSResponse<FilterData> = await response.json();

      if (!data.success) throw new Error('Failed to fetch filter data from CMS');

      this.filterDataCache = { data: data.data, timestamp: Date.now() };
      return data.data;
    } catch (error) {
      log.error('Failed to fetch filter data from CMS', {}, error);
      if (this.filterDataCache) return this.filterDataCache.data;
      return this.getFallbackFiltersData();
    }
  }

  clearFilterCache(): void {
    this.filterDataCache = null;
  }

  async getJobs(filters?: JobSearchParams, page: number = 1, perPage: number = 24): Promise<JobsResponse> {
    await this.http.ensureInitialized();
    try {
      const url = buildJobsUrl(this.http.getBaseUrl(), filters, page, perPage);
      const response = await this.http.fetchWithTimeout(url);
      const data: CMSResponse<{ posts: CMSJobPost[]; pagination: PaginationMeta }> = await response.json();

      if (!data.success) throw new Error('CMS API returned unsuccessful response');

      const jobs: Job[] = data.data.posts.map(cmsJob => transformCMSJobToJob(cmsJob));
      const { pagination } = data.data;

      return {
        jobs,
        totalPages: pagination.totalPages,
        currentPage: pagination.page,
        totalJobs: pagination.total,
        hasMore: pagination.hasNextPage,
      };
    } catch (error) {
      log.error('Failed to fetch jobs', { page, perPage }, error);
      return { jobs: [], totalPages: 1, currentPage: 1, totalJobs: 0, hasMore: false };
    }
  }

  async getJobBySlug(slug: string): Promise<Job | null> {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({ slug, status: 'published', limit: '1' });
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/job-posts?${params.toString()}`);
      const data: CMSResponse<{ posts: CMSJobPost[]; pagination: PaginationMeta }> = await response.json();
      if (!data.success || !data.data.posts || data.data.posts.length === 0) return null;
      return transformCMSJobToJob(data.data.posts[0]!);
    } catch (error) {
      log.error('Failed to fetch job by slug', { slug }, error);
      return null;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    await this.http.ensureInitialized();
    try {
      const params = new URLSearchParams({ status: 'published' });
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/job-posts/${id}?${params.toString()}`);
      const data: CMSResponse<CMSJobPost> = await response.json();
      if (!data.success) return null;
      return transformCMSJobToJob(data.data);
    } catch (error) {
      log.error('Failed to fetch job by ID', { id }, error);
      return null;
    }
  }

  async getJobsByIds(jobIds: string[]): Promise<Job[]> {
    if (jobIds.length === 0) return [];
    await this.http.ensureInitialized();

    const BATCH_SIZE = 10;
    const allJobs: Job[] = [];

    try {
      for (let i = 0; i < jobIds.length; i += BATCH_SIZE) {
        const batch = jobIds.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (jobId) => {
          try {
            const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/job-posts/${jobId}`);
            const data: CMSResponse<CMSJobPost> = await response.json();
            if (!data.success) return null;
            return transformCMSJobToJob(data.data);
          } catch {
            return null;
          }
        });

        const results = await Promise.allSettled(promises);
        const jobs = results
          .filter((result): result is PromiseFulfilledResult<Job> =>
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);
        allJobs.push(...jobs);
      }

      return allJobs;
    } catch (error) {
      log.error('Failed to fetch jobs by IDs', { count: jobIds.length }, error);
      return allJobs;
    }
  }

  async getRelatedJobs(jobId: string, limit: number = 5): Promise<Job[]> {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/job-posts/${jobId}`);
      const data: CMSResponse<CMSJobPost> = await response.json();

      if (!data.success || !data.data.job_categories || data.data.job_categories.length === 0) return [];

      const categoryId = data.data.job_categories[0]!.id;
      const relatedResponse = await this.getJobs({ categories: [categoryId] }, 1, limit + 1);
      return relatedResponse.jobs.filter(job => job.id !== jobId).slice(0, limit);
    } catch (error) {
      log.error('Failed to fetch related jobs', { jobId, limit }, error);
      return [];
    }
  }

  async getAllJobsForSitemap(): Promise<Job[]> {
    const MAX_PAGES = 100; // Upper bound to prevent infinite loops
    try {
      const allJobs: Job[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= MAX_PAGES) {
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
          log.error(`Failed to fetch sitemap jobs page ${page}`, {}, error);
          hasMore = false;
        }
      }

      if (page > MAX_PAGES) {
        log.warn(`Sitemap job fetch hit max page limit (${MAX_PAGES}), returning ${allJobs.length} jobs`);
      }

      return allJobs;
    } catch (error) {
      log.error('Failed to fetch all jobs for sitemap', {}, error);
      return [];
    }
  }

  async testConnection(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    await this.http.ensureInitialized();
    try {
      const response = await this.http.fetchWithTimeout(`${this.http.getBaseUrl()}/api/v1/job-posts?limit=1`);
      const data: CMSResponse<{ posts: CMSJobPost[] }> = await response.json();
      return { success: true, data: data.data.posts[0] || null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
