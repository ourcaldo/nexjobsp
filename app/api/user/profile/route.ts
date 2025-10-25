import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the session token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Return profile data
    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error in user profile API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the session token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // Update user profile
    const profileData = await request.json();

    // Remove sensitive fields that shouldn't be updated through this endpoint
    const allowedFields = [
      'full_name', 'phone', 'birth_date', 'gender', 
      'location', 'photo_url', 'bio'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error in user profile API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
