import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.endsWith('.xml') && pathname.includes('sitemap')) {
    try {
      const sitemapFile = pathname.replace(/^\//, '');
      const response = await fetch(`https://cms.nexjob.tech/api/v1/sitemaps/${sitemapFile}`);
      
      if (!response.ok) {
        return NextResponse.next();
      }

      let xml = await response.text();
      xml = xml.replace(/https:\/\/cms\.nexjob\.tech\/api\/v1\/sitemaps\//g, 'https://nexjob.tech/');
      xml = xml.replace(/\/api\/v1\/sitemaps\//g, '/');
      xml = xml.replace(/\/jobs\//g, '/lowongan-kerja/');
      xml = xml.replace(/\/blog\//g, '/artikel/');

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('Sitemap proxy error:', error);
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*.xml',
};
