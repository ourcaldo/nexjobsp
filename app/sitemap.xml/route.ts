import { NextResponse } from 'next/server';
import { sitemapService } from '@/services/sitemapService';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const sitemap = await sitemapService.generateMainSitemapIndex();

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating main sitemap:', error);
    return new NextResponse('Error generating main sitemap', { status: 500 });
  }
}
