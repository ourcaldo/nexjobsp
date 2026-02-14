import { NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';
import { logger } from '@/lib/logger';

const log = logger.child('api:health');
const startTime = Date.now();

/**
 * Health check endpoint for uptime monitoring.
 * Returns service status, uptime, and CMS connectivity.
 *
 * GET /api/health
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'degraded' | 'down'; latencyMs?: number; error?: string }> = {};

  // Check CMS connectivity
  const cmsStart = Date.now();
  try {
    const result = await jobService.testConnection();
    checks.cms = {
      status: result.success ? 'ok' : 'degraded',
      latencyMs: Date.now() - cmsStart,
      ...(result.error && { error: result.error }),
    };
  } catch (error) {
    checks.cms = {
      status: 'down',
      latencyMs: Date.now() - cmsStart,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const overallStatus = Object.values(checks).every(c => c.status === 'ok')
    ? 'healthy'
    : Object.values(checks).some(c => c.status === 'down')
      ? 'unhealthy'
      : 'degraded';

  const response = {
    status: overallStatus,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  if (overallStatus !== 'healthy') {
    log.warn('Health check degraded', { status: overallStatus, checks });
  }

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
