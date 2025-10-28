import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { apiSuccess, apiError } from '@/lib/api/response';
import { bookmarkService } from '@/lib/services/BookmarkService';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return apiError('No authorization token provided', 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return apiError('Invalid or expired token', 401);
    }

    const bookmarks = await bookmarkService.getBookmarks(user.id);

    return apiSuccess(bookmarks);
  } catch (error) {
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return apiError('No authorization token provided', 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return apiError('Invalid or expired token', 401);
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return apiError('Job ID is required', 400);
    }

    await bookmarkService.createBookmark(user.id, jobId);

    return apiSuccess({ message: 'Bookmark added successfully' });
  } catch (error) {
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return apiError('No authorization token provided', 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return apiError('Invalid or expired token', 401);
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return apiError('Job ID is required', 400);
    }

    await bookmarkService.deleteBookmark(user.id, jobId);

    return apiSuccess({ message: 'Bookmark removed successfully' });
  } catch (error) {
    return apiError('Internal server error', 500);
  }
}
