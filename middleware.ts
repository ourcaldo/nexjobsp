import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.endsWith('.xml') && pathname.includes('sitemap')) {
    try {
      const sitemapFile = pathname.replace(/^\//, '');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`https://cms.nexjob.tech/api/v1/sitemaps/${sitemapFile}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return NextResponse.next();
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || (!contentType.includes('xml') && !contentType.includes('text'))) {
        return NextResponse.next();
      }

      let xml = await response.text();
      
      if (!xml || xml.trim().length === 0) {
        return NextResponse.next();
      }

      if (!xml.includes('<urlset') && !xml.includes('<sitemapindex')) {
        return NextResponse.next();
      }

      const maliciousPatterns = [
        /<script[^>]*>/i,
        /javascript:/i,
        /onerror=/i,
        /onclick=/i,
        /onload=/i,
        /<iframe/i,
        /<embed/i,
        /<object/i,
      ];

      for (const pattern of maliciousPatterns) {
        if (pattern.test(xml)) {
          return NextResponse.next();
        }
      }

      xml = xml.replace(/https:\/\/cms\.nexjob\.tech\/api\/v1\/sitemaps\//g, 'https://nexjob.tech/');
      xml = xml.replace(/\/api\/v1\/sitemaps\//g, '/');
      xml = xml.replace(/\/jobs\//g, '/lowongan-kerja/');
      xml = xml.replace(/\/blog\//g, '/artikel/');

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.next();
      }
      
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*.xml',
};
