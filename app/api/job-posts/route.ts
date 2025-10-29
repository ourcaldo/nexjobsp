import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: any = {};
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }
    
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
    
    if (searchParams.get('work_policy')) {
      filters.workPolicies = [searchParams.get('work_policy')];
    }
    
    if (searchParams.get('job_salary_min')) {
      filters.job_salary_min = searchParams.get('job_salary_min');
    }
    if (searchParams.get('job_salary_max')) {
      filters.job_salary_max = searchParams.get('job_salary_max');
    }

    if (searchParams.get('company') || searchParams.get('company_name') || searchParams.get('job_company_name')) {
      filters.company = searchParams.get('company') || searchParams.get('company_name') || searchParams.get('job_company_name');
    }

    if (searchParams.get('tag') || searchParams.get('job_tag')) {
      filters.tag = searchParams.get('tag') || searchParams.get('job_tag');
    }

    if (searchParams.get('skill')) {
      filters.skill = searchParams.get('skill');
    }

    if (searchParams.get('benefit')) {
      filters.benefit = searchParams.get('benefit');
    }

    if (searchParams.get('district') || searchParams.get('district_id')) {
      filters.district = searchParams.get('district') || searchParams.get('district_id');
    }

    if (searchParams.get('village') || searchParams.get('village_id')) {
      filters.village = searchParams.get('village') || searchParams.get('village_id');
    }

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

    if (searchParams.get('deadline_after')) {
      filters.deadline_after = searchParams.get('deadline_after');
    }

    if (searchParams.get('deadline_before')) {
      filters.deadline_before = searchParams.get('deadline_before');
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    
    const response = await jobService.getJobs(filters, page, limit);
    
    // DEBUG: Check if job_categories exists in first job
    if (response.jobs.length > 0 && response.jobs[0].slug === 'demo-job') {
      console.log('[API /job-posts] First job (demo-job) data:', {
        slug: response.jobs[0].slug,
        has_job_categories: !!response.jobs[0].job_categories,
        job_categories_length: response.jobs[0].job_categories?.length || 0,
        job_categories: response.jobs[0].job_categories
      });
    }
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch jobs' 
      },
      { status: 500 }
    );
  }
}
