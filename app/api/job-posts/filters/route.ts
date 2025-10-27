import { NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export async function GET() {
  try {
    // Call CMS service server-side (has access to cms_token from database)
    const filterData = await cmsService.getFiltersData();
    
    return NextResponse.json({
      success: true,
      data: filterData
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
