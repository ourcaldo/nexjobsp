import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

const log = logger.child('cms:user-api');

/**
 * CMS User API helper — makes authenticated requests to the CMS user endpoints.
 * Used by nexjobsp API routes as a proxy layer (server-side only).
 */
export async function cmsUserRequest<T = any>(
  clerkId: string,
  path: string = '',
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const url = `${config.cms.endpoint}/api/v1/users/${clerkId}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.cms.token}`,
        ...(options.headers || {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      log.warn('CMS user API error', { url, status: response.status, error: json.error });
      return { success: false, error: json.error || `CMS error ${response.status}` };
    }

    return json;
  } catch (err) {
    log.error('CMS user API request failed', { url }, err);
    return { success: false, error: 'Failed to communicate with CMS' };
  }
}
