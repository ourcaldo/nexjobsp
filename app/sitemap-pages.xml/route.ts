import { NextResponse } from 'next/server';
import { sitemapService } from '@/lib/utils/sitemap';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  try {
    const xml = await sitemapService.generatePagesSitemap();
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating pages sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
