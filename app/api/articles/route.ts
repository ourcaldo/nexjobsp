import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/services/ArticleService';
import { logger } from '@/lib/logger';

const log = logger.child('api:articles');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, Math.min(1000, parseInt(searchParams.get('page') || '1') || 1));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10') || 10));
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const response = await articleService.getArticles(page, limit, category, search);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // Transform response to match expected frontend format
    return NextResponse.json({
      success: true,
      articles: response.data.posts,
      totalPages: response.data.pagination.totalPages,
      currentPage: response.data.pagination.page,
      totalArticles: response.data.pagination.total,
      hasMore: response.data.pagination.page < response.data.pagination.totalPages
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    log.error('Failed to fetch articles', { route: '/api/articles' }, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

