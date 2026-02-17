import { NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';
import { logger } from '@/lib/logger';

const log = logger.child('api:job-posts:filters');

export async function GET() {
  try {
    // Call CMS service server-side (has access to cms_token from database)
    const filterData = await jobService.getFiltersData();
    
    return NextResponse.json({
      success: true,
      data: filterData
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    log.error('Failed to fetch job filters', { route: '/api/job-posts/filters' }, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch filter data'
      },
      { status: 500 }
    );
  }
}
