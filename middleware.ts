import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.endsWith('.xml') && pathname.includes('sitemap')) {
    try {
      const sitemapFile = pathname.replace(/^\//, '');
      // TODO: Remove this temporary logging after sitemap verification period (1-2 weeks) - Added Nov 14, 2025
      console.log(`[Sitemap Middleware] Proxying request: ${pathname} → https://cms.nexjob.tech/api/v1/sitemaps/${sitemapFile}`);
      
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
        // TODO: Remove temporary logging - see comment above
        console.error(`[Sitemap Middleware] CMS returned ${response.status} for ${sitemapFile}`);
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

      // TODO: Remove temporary logging - see comment above
      console.log(`[Sitemap Middleware] Successfully served ${sitemapFile} (${xml.length} bytes)`);

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // TODO: Remove temporary logging - see comment above
        console.error(`[Sitemap Middleware] Timeout fetching ${pathname}`);
        return NextResponse.next();
      }
      
      // TODO: Remove temporary logging - see comment above
      console.error(`[Sitemap Middleware] Error processing ${pathname}:`, error);
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*.xml',
};
