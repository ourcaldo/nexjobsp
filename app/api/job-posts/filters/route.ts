import { NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';

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
    console.error('Error in job-posts/filters API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch filter data' 
      },
      { status: 500 }
    );
  }
}
