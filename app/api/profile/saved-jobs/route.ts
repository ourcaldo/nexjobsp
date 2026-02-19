import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cmsUserRequest } from '@/lib/services/cmsUserApi';

// GET /api/profile/saved-jobs — List saved jobs with pagination
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const page = request.nextUrl.searchParams.get('page') || '1';
  const limit = request.nextUrl.searchParams.get('limit') || '20';

  const result = await cmsUserRequest(userId, `/saved-jobs?page=${page}&limit=${limit}`);
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

// POST /api/profile/saved-jobs — Save a job { job_post_id: uuid }
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = await cmsUserRequest(userId, '/saved-jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
