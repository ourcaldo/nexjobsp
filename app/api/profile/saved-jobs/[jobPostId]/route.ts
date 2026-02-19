import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cmsUserRequest } from '@/lib/services/cmsUserApi';

// GET /api/profile/saved-jobs/[jobPostId] — Check if a job is saved
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobPostId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { jobPostId } = await params;
  const result = await cmsUserRequest(userId, `/saved-jobs/${jobPostId}`);
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}

// DELETE /api/profile/saved-jobs/[jobPostId] — Unsave a job
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobPostId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { jobPostId } = await params;
  const result = await cmsUserRequest(userId, `/saved-jobs/${jobPostId}`, { method: 'DELETE' });
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
