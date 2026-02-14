import { NextRequest, NextResponse } from 'next/server'
import { TugasCMSProvider } from '@/lib/cms/providers/tugascms'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600 // 1 hour in seconds

export async function GET(request: NextRequest) {
  try {
    // Fetch robots.txt from TugasCMS backend
    const cmsProvider = new TugasCMSProvider()
    const robotsContent = await cmsProvider.getRobotsTxt()

    if (!robotsContent) {
      console.warn('No robots.txt content from CMS, using fallback')

      // Fallback robots.txt if CMS fails
      const fallbackRobots = `User-agent: *
Allow: /

# Allow important pages for SEO
Allow: /lowongan-kerja/
Allow: /artikel/

# Sitemaps
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech'}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/

# Block internal search and tracking params, but allow pagination
Disallow: /search?
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?fbclid=*
Disallow: /*?gclid=*

# Crawl delay for politeness
Crawl-delay: 1`

      return new NextResponse(fallbackRobots, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes for fallback
          'X-Robots-Tag': 'noindex',
          'X-Source': 'fallback'
        }
      })
    }

    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1 hour cache
        'X-Robots-Tag': 'noindex',
        'X-Source': 'cms',
        'X-Generated-At': new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching robots.txt:', error)

    // Emergency fallback robots.txt
    const emergencyRobots = `User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech'}/sitemap.xml
Crawl-delay: 1`

    return new NextResponse(emergencyRobots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=60, s-maxage=60', // 1 minute for emergency fallback
        'X-Robots-Tag': 'noindex',
        'X-Source': 'emergency-fallback'
      }
    })
  }
}