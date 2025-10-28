import { NextResponse } from 'next/server';
import { SupabaseAdminService } from '@/lib/supabase/admin';
import { getCurrentDomain } from '@/lib/env';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await SupabaseAdminService.getSettingsServerSide();
    const robotsTxt = settings.robots_txt || '';

    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=300, s-maxage=300, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating robots.txt', { status: 500 });
  }
}
