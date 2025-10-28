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
      
      console.log('DEBUG robots_txt from DB:', {
        settingsType: typeof settings,
        hasRobotsTxt: !!settings?.robots_txt,
        robotsType: typeof settings?.robots_txt,
        length: settings?.robots_txt?.length,
        settingsKeys: settings ? Object.keys(settings).slice(0, 10) : 'NO SETTINGS',
        preview: typeof settings?.robots_txt === 'string' ? settings.robots_txt.substring(0, 50) : 'NOT A STRING'
      });
      
      if (settings?.robots_txt && typeof settings.robots_txt === 'string' && settings.robots_txt.trim() !== '') {
        robotsTxt = settings.robots_txt;
        console.log('SUCCESS: Serving robots.txt from database');
      } else {
        robotsTxt = defaultRobotsTxt;
        console.error('ERROR: Database robots_txt is invalid or empty! Using fallback');
        console.error('Settings object:', JSON.stringify(settings, null, 2).substring(0, 500));
      }
    } catch (dbError) {
      console.error('Error fetching robots.txt from database:', dbError);
      robotsTxt = defaultRobotsTxt;
      console.error('ERROR: Database fetch failed, using fallback');
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
