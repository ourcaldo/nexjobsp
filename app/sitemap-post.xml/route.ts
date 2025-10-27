import { NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Fetch sitemap XML from CMS and transform URLs
    const xmlContent = await cmsService.getSitemapXML('/api/v1/sitemaps/sitemap-post.xml');

    if (!xmlContent) {
      return new NextResponse('Error fetching post sitemap from CMS', { status: 500 });
    }

    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error proxying post sitemap:', error);
    return new NextResponse('Error proxying post sitemap', { status: 500 });
  }
}
