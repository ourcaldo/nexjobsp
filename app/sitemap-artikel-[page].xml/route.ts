import { NextResponse } from 'next/server';
import { sitemapService } from '@/lib/utils/sitemap';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: { page: string } }
) {
  try {
    const pageNumber = parseInt(params.page, 10);
    
    if (isNaN(pageNumber) || pageNumber < 1) {
      return new NextResponse('Invalid page number', { status: 400 });
    }

    const articles = await sitemapService.getCachedArticleChunk(pageNumber);
    
    if (!articles || articles.length === 0) {
      return new NextResponse('Page not found', { status: 404 });
    }

    const xml = await sitemapService.generateArticlesSitemap(articles, pageNumber);
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating articles sitemap page:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
