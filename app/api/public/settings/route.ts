import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const PUBLIC_FIELDS = [
  'site_title',
  'site_tagline', 
  'site_description',
  'site_url',
  'location_page_title_template',
  'location_page_description_template',
  'category_page_title_template',
  'category_page_description_template',
  'jobs_title',
  'jobs_description',
  'articles_title',
  'articles_description',
  'login_page_title',
  'login_page_description',
  'signup_page_title',
  'signup_page_description',
  'profile_page_title',
  'profile_page_description',
  'home_og_image',
  'jobs_og_image',
  'articles_og_image',
  'default_job_og_image',
  'default_article_og_image',
  'robots_txt',
  'auto_generate_sitemap'
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('admin_settings')
      .select(PUBLIC_FIELDS.join(','))
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return empty object
        return NextResponse.json({ data: {} });
      }
      console.error('Error fetching public settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // If no data found, return empty object
    if (!data) {
      return NextResponse.json({ data: {} });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Public settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
