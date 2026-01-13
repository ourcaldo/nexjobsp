import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/services/ArticleService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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
      totalPages: response.data.pagination.total_pages,
      currentPage: response.data.pagination.page,
      totalArticles: response.data.pagination.total,
      hasMore: response.data.pagination.page < response.data.pagination.total_pages
    });
  } catch (error) {
    console.error('Error in articles API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

