import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/services/ArticleService';
import { logger } from '@/lib/logger';

const log = logger.child('api:articles:slug');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const response = await articleService.getArticleBySlug(slug);

    if (!response.success || !response.data) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    log.error('Failed to fetch article by slug', { route: '/api/articles/slug' }, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
