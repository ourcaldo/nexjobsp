import { Job, JobFilters } from '@/types/job';
import { CMSProvider, FilterData, JobsResponse } from '@/lib/cms/interface';
import { getCMSProvider } from '@/lib/cms/factory';

/**
 * @deprecated This service is a trivial pass-through that adds no value (no caching,
 * error handling, or transformation). Consumers should use CMS providers directly
 * via `getCMSProvider()` from `@/lib/cms/factory`.
 */
export class JobService {
  private cms: CMSProvider;
  
  constructor() {
    this.cms = getCMSProvider();
  }
  
  async getJobs(filters?: any, page: number = 1, perPage: number = 24): Promise<JobsResponse> {
    return await this.cms.getJobs(filters, page, perPage);
  }
  
  async getJobById(id: string): Promise<Job | null> {
    return await this.cms.getJobById(id);
  }
  
  async getJobBySlug(slug: string): Promise<Job | null> {
    return await this.cms.getJobBySlug(slug);
  }
  
  async getJobsByIds(jobIds: string[]): Promise<Job[]> {
    return await this.cms.getJobsByIds(jobIds);
  }
  
  async getRelatedJobs(jobId: string, limit: number = 5): Promise<Job[]> {
    return await this.cms.getRelatedJobs(jobId, limit);
  }
  
  async getAllJobsForSitemap(): Promise<Job[]> {
    return await this.cms.getAllJobsForSitemap();
  }
  
  async getFiltersData(): Promise<FilterData> {
    return await this.cms.getFiltersData();
  }
  
  clearFilterCache(): void {
    this.cms.clearFilterCache();
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    return await this.cms.testConnection();
  }
}

export const jobService = new JobService();
