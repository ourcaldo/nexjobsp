import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const AD_FIELDS = [
  'sidebar_archive_ad_code',
  'sidebar_single_ad_code', 
  'single_top_ad_code',
  'single_bottom_ad_code',
  'single_middle_ad_code',
  'popup_ad_url',
  'popup_ad_enabled',
  'popup_ad_load_settings',
  'popup_ad_max_executions',
  'popup_ad_device'
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('admin_settings')
      .select(AD_FIELDS.join(','))
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return empty object
        return NextResponse.json({ data: {} });
      }
      console.error('Error fetching advertisement settings:', error);
      return NextResponse.json({ error: 'Failed to fetch advertisement settings' }, { status: 500 });
    }

    // If no data found, return empty object
    if (!data) {
      return NextResponse.json({ data: {} });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Public advertisements API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
