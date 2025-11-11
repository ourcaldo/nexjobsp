import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase';
import { jobService } from '@/lib/services/JobService';
import { articleService } from '@/lib/services/ArticleService';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    const [
      { count: totalUsers },
      { count: totalBookmarks },
      jobsResult,
      articlesResult
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_bookmarks').select('*', { count: 'exact', head: true }),
      jobService.getJobs({}, 1, 1),
      articleService.getArticles(1, 1)
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalBookmarks: totalBookmarks || 0,
      totalArticles: (articlesResult?.success && articlesResult?.data?.pagination?.total) || 0,
      totalJobs: jobsResult?.totalJobs || 0
    };

    return apiSuccess(stats);
  } catch (error) {
    return apiError('Failed to fetch dashboard statistics', 500);
  }
}
