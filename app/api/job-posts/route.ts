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
    
    // Salary range filters - Direct min/max parameters
    if (searchParams.get('job_salary_min')) {
      filters.job_salary_min = searchParams.get('job_salary_min');
    }
    if (searchParams.get('job_salary_max')) {
      filters.job_salary_max = searchParams.get('job_salary_max');
    }

    // Company filter
    if (searchParams.get('company') || searchParams.get('company_name') || searchParams.get('job_company_name')) {
      filters.company = searchParams.get('company') || searchParams.get('company_name') || searchParams.get('job_company_name');
    }

    // Tag filter
    if (searchParams.get('tag') || searchParams.get('job_tag')) {
      filters.tag = searchParams.get('tag') || searchParams.get('job_tag');
    }

    // Skill filter
    if (searchParams.get('skill')) {
      filters.skill = searchParams.get('skill');
    }

    // Benefit filter
    if (searchParams.get('benefit')) {
      filters.benefit = searchParams.get('benefit');
    }

    // Additional location filters
    if (searchParams.get('district') || searchParams.get('district_id')) {
      filters.district = searchParams.get('district') || searchParams.get('district_id');
    }

    if (searchParams.get('village') || searchParams.get('village_id')) {
      filters.village = searchParams.get('village') || searchParams.get('village_id');
    }

    // Additional salary filters
    if (searchParams.get('currency') || searchParams.get('salary_currency')) {
      filters.currency = searchParams.get('currency') || searchParams.get('salary_currency');
    }

    if (searchParams.get('period') || searchParams.get('salary_period')) {
      filters.period = searchParams.get('period') || searchParams.get('salary_period');
    }

    if (searchParams.get('negotiable') || searchParams.get('salary_negotiable')) {
      const negotiableValue = searchParams.get('negotiable') || searchParams.get('salary_negotiable');
      filters.negotiable = negotiableValue === 'true';
    }

    // Application deadline filters
    if (searchParams.get('deadline_after')) {
      filters.deadline_after = searchParams.get('deadline_after');
    }

    if (searchParams.get('deadline_before')) {
      filters.deadline_before = searchParams.get('deadline_before');
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
