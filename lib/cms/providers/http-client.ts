import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

const log = logger.child('cms:http');

/**
 * Shared HTTP client for CMS API communication.
 * Handles authentication, timeouts, and initialization.
 */
export class CMSHttpClient {
  private baseUrl: string;
  private timeout: number;
  private authToken: string;
  private settingsInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.baseUrl = config.cms.endpoint;
    this.timeout = config.cms.timeout;
    this.authToken = config.cms.token;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Ensures CMS settings are loaded. Currently a no-op since config is
   * read synchronously from env vars at construction time.
   * Retained for future async config sources (e.g. DB-stored settings).
   */
  async ensureInitialized(): Promise<void> {
    if (this.settingsInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.loadSettings();
    await this.initializationPromise;
  }

  private async loadSettings(): Promise<void> {
    try {
      this.baseUrl = config.cms.endpoint;
      this.authToken = config.cms.token;
      this.timeout = config.cms.timeout;
      this.settingsInitialized = true;
    } catch (error) {
      log.error('Failed to load CMS settings', {}, error);
      this.settingsInitialized = true;
    }
  }

  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
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
}
