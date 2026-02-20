import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cmsUserRequest } from '@/lib/services/cmsUserApi';
import { profileUpdateSchema } from '@/lib/validation/schemas';

// GET /api/profile — Get full user profile (user + skills + experience + education)
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const result = await cmsUserRequest(userId, '');
  if (!result.success) {
    const status = result.error === 'User not found' ? 404 : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

// PUT /api/profile — Update basic profile fields (name, bio, avatar, phone)
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    );
  }

  const result = await cmsUserRequest(userId, '', {
    method: 'PUT',
    body: JSON.stringify(parsed.data),
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
