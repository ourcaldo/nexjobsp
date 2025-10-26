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
    let jobsForPage = await sitemapService.getCachedJobChunk(pageNumber);
    
    if (!jobsForPage) {
      console.log(`No cached chunk found for page ${pageNumber}, fetching fresh data...`);
      
      // Fallback: get all data and chunk it
      const { jobs } = await sitemapService.getAllSitemapData();
      
      if (!jobs || jobs.length === 0) {
        return new NextResponse('No jobs found', { status: 404 });
      }
      
      // Chunk jobs and get the specific page
      const jobChunks = sitemapService.chunkArray(jobs, 100);
      jobsForPage = jobChunks[pageNumber - 1];
    }

    if (!jobsForPage || jobsForPage.length === 0) {
      return new NextResponse('Page not found', { status: 404 });
    }

    console.log(`Generating sitemap for loker page ${pageNumber} with ${jobsForPage.length} jobs`);

    const sitemap = await sitemapService.generateJobsSitemap(jobsForPage, pageNumber);

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating loker sitemap:', error);
    return new NextResponse('Error generating loker sitemap', { status: 500 });
  }
}
