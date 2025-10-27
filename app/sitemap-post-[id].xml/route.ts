import { NextResponse } from 'next/server';
import { cmsService } from '@/lib/cms/service';

export const revalidate = 3600; // Revalidate every hour

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Fetch sitemap XML from CMS and transform URLs
    const xmlContent = await cmsService.getSitemapXML(`/api/v1/sitemaps/sitemap-post-${id}.xml`);

    if (!xmlContent) {
      return new NextResponse('Sitemap not found', { status: 404 });
    }

    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error proxying post sitemap chunk:', error);
    return new NextResponse('Error proxying post sitemap chunk', { status: 500 });
  }
}
