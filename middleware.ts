import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as appConfig } from '@/lib/config';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes (except sitemap XML which are public/cached)
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    const result = checkRateLimit(ip);

    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Attach rate limit headers to the response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    return response;
  }

  // Handle sitemap.xml requests
  if (pathname === '/sitemap.xml') {
    try {
      // Fetch sitemap from CMS
      const response = await fetch(`${appConfig.cms.endpoint}/api/v1/sitemaps/sitemap.xml`, {
        headers: {
          'Authorization': `Bearer ${appConfig.cms.token}`,
        },
        signal: AbortSignal.timeout(appConfig.cms.timeout),
      });

      if (response.ok) {
        let sitemapXml = await response.text();

        // Transform CMS URLs to frontend URLs (scoped to <loc> tags for XML safety)
        sitemapXml = sitemapXml.replace(/<loc>(.*?)<\/loc>/g, (_match, url) => {
          let rewritten = url.replace(/https:\/\/cms\.nexjob\.tech\/api\/v1\/sitemaps\//g, `${appConfig.site.url}/`);
          rewritten = rewritten.replace(/\/api\/v1\/sitemaps\//g, '/');
          return `<loc>${rewritten}</loc>`;
        });

        return new NextResponse(sitemapXml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': `public, max-age=${appConfig.cache.sitemapTtl / 1000}`,
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    } catch (error) {
      logger.error('Error fetching sitemap from CMS:', {}, error);
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
        logger.error(`CMS returned ${response.status} for ${sitemapFile}`, { module: 'Sitemap Middleware' });
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

      // URL transformations (scoped to <loc> tags for XML safety)
      xml = xml.replace(/<loc>(.*?)<\/loc>/g, (_match, url) => {
        let rewritten = url.replace(/https:\/\/cms\.nexjob\.tech\/api\/v1\/sitemaps\//g, `${appConfig.site.url}/`);
        rewritten = rewritten.replace(/\/api\/v1\/sitemaps\//g, '/');
        rewritten = rewritten.replace(/\/jobs\//g, '/lowongan-kerja/');
        rewritten = rewritten.replace(/\/blog\//g, '/artikel/');
        return `<loc>${rewritten}</loc>`;
      });

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': `public, max-age=${appConfig.cache.sitemapTtl / 1000}, stale-while-revalidate=86400`,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(`Timeout fetching ${pathname}`, { module: 'Sitemap Middleware' });
        return NextResponse.next();
      }

      logger.error(`Error processing ${pathname}`, { module: 'Sitemap Middleware' }, error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/sitemap.xml', '/:path*.xml'],
};
