import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    // Get user from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'No authorization token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user bookmarks
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bookmarks:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch bookmarks' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error in bookmark API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    // Get user from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'No authorization token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Add bookmark
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        job_id: jobId
      });

    if (error) {
      console.error('Error adding bookmark:', error);
      return NextResponse.json({ success: false, error: 'Failed to add bookmark' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in bookmark API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    // Get user from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'No authorization token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Remove bookmark
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error removing bookmark:', error);
      return NextResponse.json({ success: false, error: 'Failed to remove bookmark' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in bookmark API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
