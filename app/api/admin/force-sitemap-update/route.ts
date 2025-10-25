import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { adminService } from '@/services/adminService';
import { sitemapService } from '@/services/sitemapService';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  // Authentication check
  const authResult = await checkAuthentication(request, supabase);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    // Clear all sitemap cache
    adminService.clearSitemapCache();
    sitemapService.clearAllSitemapCaches();
    
    // Update last generation timestamp
    adminService.updateLastSitemapGeneration();

    // Make requests to all sitemap endpoints to regenerate them (using new URLs)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const regeneratePromises = [
      fetch(`${baseUrl}/sitemap.xml?force=true`),
      fetch(`${baseUrl}/sitemap-pages.xml?force=true`),
      fetch(`${baseUrl}/sitemap-loker.xml?force=true`),
      fetch(`${baseUrl}/sitemap-artikel.xml?force=true`)
    ];

    // Wait for main sitemaps to regenerate first
    const results = await Promise.allSettled(regeneratePromises);
    
    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to regenerate sitemap ${index}:`, result.reason);
      }
    });

    return NextResponse.json({ 
      message: 'Sitemap update forced successfully',
      timestamp: new Date().toISOString(),
      regenerated: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    });
  } catch (error) {
    console.error('Error forcing sitemap update:', error);
    return NextResponse.json({ message: 'Error forcing sitemap update' }, { status: 500 });
  }
}

// Authentication check function
async function checkAuthentication(request: NextRequest, supabase: any): Promise<{ success: boolean; error?: string }> {
  // Method 1: Check for API token in headers
  const apiToken = request.headers.get('authorization')?.replace('Bearer ', '') || request.headers.get('x-api-token');
  const validToken = process.env.API_TOKEN;

  if (apiToken && validToken && apiToken === validToken) {
    return { success: true };
  }

  // Method 2: Check for Supabase session token and verify super admin role
  const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (sessionToken && sessionToken !== validToken) {
    try {
      // Verify the session token with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
      
      if (authError || !user) {
        return { success: false, error: 'Invalid session token' };
      }

      // Check if user is super admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super admin access required' };
      }

      return { success: true };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Session validation failed' };
    }
  }

  return { success: false, error: 'Unauthorized: Valid API token or super admin session required' };
}
