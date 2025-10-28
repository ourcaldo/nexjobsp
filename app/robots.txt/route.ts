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
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Query ONLY the robots_txt column, nothing else
      const { data, error } = await supabase
        .from('admin_settings')
        .select('robots_txt')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      console.log('DEBUG robots_txt query result:', {
        hasData: !!data,
        hasError: !!error,
        errorDetails: error ? { code: error.code, message: error.message } : null,
        dataKeys: data ? Object.keys(data) : 'NO DATA',
        robotsTxtType: typeof data?.robots_txt,
        robotsTxtLength: data?.robots_txt?.length,
        robotsTxtPreview: typeof data?.robots_txt === 'string' ? data.robots_txt.substring(0, 50) : 'NOT A STRING'
      });
      
      if (!error && data?.robots_txt && typeof data.robots_txt === 'string' && data.robots_txt.trim() !== '') {
        robotsTxt = data.robots_txt;
        console.log('SUCCESS: Serving robots.txt from database');
      } else {
        robotsTxt = defaultRobotsTxt;
        console.error('ERROR: Database robots_txt is invalid or empty! Using fallback');
        if (error) {
          console.error('Database error:', error);
        }
        if (data) {
          console.error('Data received:', JSON.stringify(data, null, 2));
        }
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
