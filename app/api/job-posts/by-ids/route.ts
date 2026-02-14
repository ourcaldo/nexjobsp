import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';

export async function POST(request: NextRequest) {
  try {
    const { jobIds } = await request.json();

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid job IDs provided' },
        { status: 400 }
      );
    }

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
    console.error('Error fetching jobs by IDs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
