import { NextResponse } from 'next/server';
import { SupabaseAdminService } from '@/services/supabaseAdminService';
import { getCurrentDomain } from '@/lib/env';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    let robotsTxt = '';
    
    try {
      const settings = await SupabaseAdminService.getSettingsServerSide();
      robotsTxt = settings.robots_txt;
      console.log('Serving robots.txt from database');
    } catch (dbError) {
      console.error('Error fetching robots.txt from database:', dbError);
      
      // Fallback to default robots.txt content
      const baseUrl = getCurrentDomain();
      robotsTxt = `User-agent: *
Allow: /

# Disallow admin panel
Disallow: /admin/
Disallow: /admin

# Disallow bookmarks (private pages)
Disallow: /bookmarks/
Disallow: /bookmarks

# Allow specific important pages
Allow: /lowongan-kerja/
Allow: /artikel/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`;
      console.log('Using fallback robots.txt content');
    }

    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('Error generating robots.txt', { status: 500 });
  }
}
