import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cmsService } from '@/lib/cms/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    const [
      { count: totalUsers },
      { count: totalBookmarks },
      { count: totalArticles },
      jobsResult
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_bookmarks').select('*', { count: 'exact', head: true }),
      supabase.from('nxdb_articles').select('*', { count: 'exact', head: true }),
      cmsService.getJobs({}, 1, 1)
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalBookmarks: totalBookmarks || 0,
      totalArticles: totalArticles || 0,
      totalJobs: jobsResult?.totalJobs || 0
    };

    return apiSuccess(stats);
  } catch (error) {
    return apiError('Failed to fetch dashboard statistics', 500);
  }
}
