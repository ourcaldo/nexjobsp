import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { AdminSettings } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  // Authentication check
  const authResult = await checkAuthentication(request, supabase);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
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
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // If no settings found, return null (client will use defaults)
    if (!data || error?.code === 'PGRST116') {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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

  // Authentication check
  const authResult = await checkAuthentication(request, supabase);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const settings = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ data: result.data, success: true });
  } catch (error) {
    console.error('Error in handleUpdate:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
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
