import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as appConfig } from '@/lib/config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle sitemap.xml requests
  if (pathname === '/sitemap.xml') {
    try {
      // Fetch sitemap from CMS
      const response = await fetch(`${appConfig.cms.endpoint}/api/v1/sitemap.xml`, {
        headers: {
          'Authorization': `Bearer ${appConfig.cms.token}`,
        },
        signal: AbortSignal.timeout(appConfig.cms.timeout),
      });

      if (response.ok) {
        const sitemapXml = await response.text();
        return new NextResponse(sitemapXml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': `public, max-age=${appConfig.cache.sitemapTtl / 1000}`,
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching sitemap from CMS:', error);
    }

    // Fallback: return basic sitemap
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appConfig.site.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appConfig.site.url}/lowongan-kerja</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${appConfig.site.url}/artikel</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // Handle other sitemap files (existing functionality)
  if (pathname.endsWith('.xml') && pathname.includes('sitemap')) {
    try {
      const sitemapFile = pathname.replace(/^\//, '');
      console.log(`[Sitemap Middleware] Proxying request: ${pathname} → ${appConfig.cms.endpoint}/api/v1/sitemaps/${sitemapFile}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.cms.timeout);
      
      const response = await fetch(`${appConfig.cms.endpoint}/api/v1/sitemaps/${sitemapFile}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml',
          'Authorization': `Bearer ${appConfig.cms.token}`,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
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

      // Security: Check for malicious patterns
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

      // URL transformations
      xml = xml.replace(/https:\/\/cms\.nexjob\.tech\/api\/v1\/sitemaps\//g, `${appConfig.site.url}/`);
      xml = xml.replace(/\/api\/v1\/sitemaps\//g, '/');
      xml = xml.replace(/\/jobs\//g, '/lowongan-kerja/');
      xml = xml.replace(/\/blog\//g, '/artikel/');

      console.log(`[Sitemap Middleware] Successfully served ${sitemapFile} (${xml.length} bytes)`);

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': `public, max-age=${appConfig.cache.sitemapTtl / 1000}, stale-while-revalidate=86400`,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[Sitemap Middleware] Timeout fetching ${pathname}`);
        return NextResponse.next();
      }
      
      console.error(`[Sitemap Middleware] Error processing ${pathname}:`, error);
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/sitemap.xml', '/:path*.xml'],
};
