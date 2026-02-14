/**
 * TugasCMS Provider - thin facade that delegates to domain-specific modules.
 *
 * Domain modules:
 *   - http-client.ts  - shared HTTP client (auth, timeout, headers)
 *   - jobs.ts         - job listings, filters, related jobs, sitemap
 *   - articles.ts     - articles, categories, tags
 *   - pages.ts        - CMS pages, sitemaps/robots, advertisements
 */

import { Job } from '@/types/job';
import { CMSProvider, FilterData, JobsResponse } from '../interface';
import { CMSHttpClient } from './http-client';
import { JobOperations } from './jobs';
import { ArticleOperations } from './articles';
import { PageOperations } from './pages';

export class TugasCMSProvider implements CMSProvider {
  private http: CMSHttpClient;
  private jobOps: JobOperations;
  private articleOps: ArticleOperations;
  private pageOps: PageOperations;

  constructor() {
    this.http = new CMSHttpClient();
    this.jobOps = new JobOperations(this.http);
    this.articleOps = new ArticleOperations(this.http);
    this.pageOps = new PageOperations(this.http);
  }

  // --- Job methods ---

  async getJobs(filters?: any, page?: number, perPage?: number): Promise<JobsResponse> {
    return this.jobOps.getJobs(filters, page, perPage);
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobOps.getJobById(id);
  }

  async getJobBySlug(slug: string): Promise<Job | null> {
    return this.jobOps.getJobBySlug(slug);
  }

  async getJobsByIds(jobIds: string[]): Promise<Job[]> {
    return this.jobOps.getJobsByIds(jobIds);
  }

  async getRelatedJobs(jobId: string, limit?: number): Promise<Job[]> {
    return this.jobOps.getRelatedJobs(jobId, limit);
  }

  async getAllJobsForSitemap(): Promise<Job[]> {
    return this.jobOps.getAllJobsForSitemap();
  }

  async getFiltersData(): Promise<FilterData> {
    return this.jobOps.getFiltersData();
  }

  clearFilterCache(): void {
    this.jobOps.clearFilterCache();
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.jobOps.testConnection();
  }

  // --- Article / Category / Tag methods ---

  async getArticles(page?: number, limit?: number, category?: string, search?: string) {
    return this.articleOps.getArticles(page, limit, category, search);
  }

  async getArticleBySlug(slug: string) {
    return this.articleOps.getArticleBySlug(slug);
  }

  async getRelatedArticles(articleSlug: string, limit?: number) {
    return this.articleOps.getRelatedArticles(articleSlug, limit);
  }

  async getCategories(page?: number, limit?: number, search?: string) {
    return this.articleOps.getCategories(page, limit, search);
  }

  async getTags(page?: number, limit?: number, search?: string) {
    return this.articleOps.getTags(page, limit, search);
  }

  async getCategoryWithPosts(idOrSlug: string, page?: number, limit?: number) {
    return this.articleOps.getCategoryWithPosts(idOrSlug, page, limit);
  }

  async getTagWithPosts(idOrSlug: string, page?: number, limit?: number) {
    return this.articleOps.getTagWithPosts(idOrSlug, page, limit);
  }

  // --- Page / Sitemap / Ads methods ---

  async getPages(page?: number, limit?: number, category?: string, tag?: string, search?: string) {
    return this.pageOps.getPages(page, limit, category, tag, search);
  }

  async getPageBySlug(slug: string) {
    return this.pageOps.getPageBySlug(slug);
  }

  async getAllPagesForSitemap() {
    return this.pageOps.getAllPagesForSitemap();
  }

  async getSitemaps() {
    return this.pageOps.getSitemaps();
  }

  async getSitemapXML(sitemapPath: string): Promise<string | null> {
    return this.pageOps.getSitemapXML(sitemapPath);
  }

  async getRobotsTxt(): Promise<string | null> {
    return this.pageOps.getRobotsTxt();
  }

  async getAdvertisements(): Promise<any> {
    return this.pageOps.getAdvertisements();
  }
}
