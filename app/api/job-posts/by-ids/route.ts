import { NextRequest, NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export async function POST(request: NextRequest) {
  try {
    const { jobIds } = await request.json();

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid job IDs provided' },
        { status: 400 }
      );
    }

    const jobs = await cmsService.getJobsByIds(jobIds);

    return NextResponse.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs by IDs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
