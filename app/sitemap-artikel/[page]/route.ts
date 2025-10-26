import { NextResponse } from 'next/server';
import { sitemapService } from '@/lib/utils/sitemap';

export const revalidate = 3600; // Revalidate every hour

interface RouteParams {
  params: {
    page: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  let { page } = params;
  
  // Handle .xml extension in the page parameter (from rewrite)
  if (page.endsWith('.xml')) {
    page = page.replace('.xml', '');
  }

  const pageNumber = parseInt(page, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return new NextResponse('Invalid page number', { status: 400 });
  }

  try {
    // Try to get cached chunk data first (ISR-like behavior)
    let articlesForPage = await sitemapService.getCachedArticleChunk(pageNumber);
    
    if (!articlesForPage) {
      console.log(`No cached chunk found for page ${pageNumber}, fetching fresh data...`);
      
      // Fallback: get all data and chunk it
      const { articles } = await sitemapService.getAllSitemapData();
      
      if (!articles || articles.length === 0) {
        return new NextResponse('No articles found', { status: 404 });
      }
      
      // Chunk articles and get the specific page
      const articleChunks = sitemapService.chunkArray(articles, 100);
      articlesForPage = articleChunks[pageNumber - 1];
    }

    if (!articlesForPage || articlesForPage.length === 0) {
      return new NextResponse('Page not found', { status: 404 });
    }

    console.log(`Generating sitemap for artikel page ${pageNumber} with ${articlesForPage.length} articles`);

    const sitemap = await sitemapService.generateArticlesSitemap(articlesForPage, pageNumber);

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating artikel sitemap:', error);
    return new NextResponse('Error generating artikel sitemap', { status: 500 });
  }
}
