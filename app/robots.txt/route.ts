import { NextResponse } from 'next/server';
import { SupabaseAdminService } from '@/lib/supabase/admin';
import { getCurrentDomain } from '@/lib/env';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    let robotsTxt = '';
    const baseUrl = getCurrentDomain();
    
    const defaultRobotsTxt = `User-agent: *
Allow: /

# Disallow admin panel
Disallow: /admin/
Disallow: /backend/

# Disallow private pages
Disallow: /profile/
Disallow: /bookmarks/

# Allow specific important pages
Allow: /lowongan-kerja/
Allow: /artikel/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`;
    
    try {
      const settings = await SupabaseAdminService.getSettingsServerSide();
      robotsTxt = settings.robots_txt;
      
      // Use fallback if database value is empty or null
      if (!robotsTxt || robotsTxt.trim() === '') {
        robotsTxt = defaultRobotsTxt;
        console.log('Using default robots.txt (database value empty)');
      } else {
        console.log('Serving robots.txt from database');
      }
    } catch (dbError) {
      console.error('Error fetching robots.txt from database:', dbError);
      robotsTxt = defaultRobotsTxt;
      console.log('Using fallback robots.txt content (database error)');
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
