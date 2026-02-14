import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/services/ArticleService';
import { logger } from '@/lib/logger';

const log = logger.child('api:articles:related');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const relatedArticles = await articleService.getRelatedArticles(id, limit);

    return NextResponse.json({
      success: true,
      data: relatedArticles
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    log.error('Failed to fetch related articles', { route: '/api/articles/related' }, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related articles' },
      { status: 500 }
    );
  }
}
