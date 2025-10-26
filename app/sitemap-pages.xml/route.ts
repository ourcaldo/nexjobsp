import { NextResponse } from 'next/server';
import { sitemapService } from '@/lib/utils/sitemap';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const sitemap = await sitemapService.generatePagesSitemap();

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating pages sitemap:', error);
    return new NextResponse('Error generating pages sitemap', { status: 500 });
  }
}
