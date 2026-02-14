import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';
import { logger } from '@/lib/logger';

const log = logger.child('api:job-posts:related');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4');

    const relatedJobs = await jobService.getRelatedJobs(id, limit);

    return NextResponse.json({
      success: true,
      data: relatedJobs
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    log.error('Failed to fetch related jobs', { route: '/api/job-posts/related' }, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related jobs' },
      { status: 500 }
    );
  }
}
