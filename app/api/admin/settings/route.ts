import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { AdminSettings } from '@/lib/supabase';
import { timingSafeCompare } from '@/lib/utils/crypto';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const authResult = await checkAuthentication(request, supabase);
  if (!authResult.success) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching admin settings:', error);
      return apiError('Failed to fetch settings', 500);
    }

    if (!data || error?.code === 'PGRST116') {
      return apiSuccess(null);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('Error in GET:', error);
    return apiError('Failed to fetch settings', 500);
  }
}

export async function POST(request: NextRequest) {
  return handleUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

async function handleUpdate(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const authResult = await checkAuthentication(request, supabase);
  if (!authResult.success) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const settings = await request.json();

    if (!settings || typeof settings !== 'object') {
      return apiError('Invalid settings data', 400);
    }

    // Get existing settings
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let result;
    if (existingSettings?.id) {
      // Update existing settings
      result = await supabase
        .from('admin_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from('admin_settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving admin settings:', result.error);
      return apiError('Failed to save settings', 500);
    }

    if (settings.robots_txt !== undefined) {
      try {
        revalidatePath('/robots.txt');
      } catch (revalError) {
        // Silent fail
      }
    }

    return apiSuccess(result.data);
  } catch (error) {
    console.error('Error in handleUpdate:', error);
    return apiError('Failed to update settings', 500);
  }
}

// Authentication check function
async function checkAuthentication(request: NextRequest, supabase: any): Promise<{ success: boolean; error?: string }> {
  // Method 1: Check for API token in headers
  const apiToken = request.headers.get('authorization')?.replace('Bearer ', '') || request.headers.get('x-api-token');
  const validToken = process.env.API_TOKEN;

  if (apiToken && validToken && timingSafeCompare(apiToken, validToken)) {
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
