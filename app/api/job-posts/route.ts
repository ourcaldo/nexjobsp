import { NextRequest, NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build filters from query params
    const filters: any = {};
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }
    
    // Location filters
    if (searchParams.get('location')) {
      filters.location = searchParams.get('location');
    }
    
    if (searchParams.get('city')) {
      filters.cities = [searchParams.get('city')];
    }
    
    if (searchParams.get('employment_type')) {
      filters.jobTypes = [searchParams.get('employment_type')];
    }
    
    if (searchParams.get('experience_level')) {
      filters.experiences = [searchParams.get('experience_level')];
    }
    
    if (searchParams.get('education_level')) {
      filters.educations = [searchParams.get('education_level')];
    }
    
    if (searchParams.get('job_category')) {
      filters.categories = [searchParams.get('job_category')];
    }
    
    // Work policy filters
    if (searchParams.get('work_policy')) {
      filters.workPolicies = [searchParams.get('work_policy')];
    }
    
    // Salary range filters
    if (searchParams.get('salary_range')) {
      filters.salaries = [searchParams.get('salary_range')];
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    
    // Call CMS service server-side (has access to cms_token from database)
    const response = await cmsService.getJobs(filters, page, limit);
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in job-posts API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch jobs' 
      },
      { status: 500 }
    );
  }
}
