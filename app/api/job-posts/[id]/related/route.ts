import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/lib/services/JobService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4');

    const relatedJobs = await jobService.getRelatedJobs(id, limit);

    return NextResponse.json({
      success: true,
      data: relatedJobs
    });
  } catch (error) {
    console.error('Error fetching related jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related jobs' },
      { status: 500 }
    );
  }
}
