import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const log = logger.child('api:job-posts:by-ids');

const jobIdsSchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1, 'At least one job ID is required').max(50, 'Maximum 50 IDs allowed'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = jobIdsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid job IDs provided' },
        { status: 400 }
      );
    }

    const { jobIds } = parsed.data;

    const jobs = await jobService.getJobsByIds(jobIds);

    return NextResponse.json({
      success: true,
      data: jobs
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    log.error('Failed to fetch jobs by IDs', { route: '/api/job-posts/by-ids' }, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
