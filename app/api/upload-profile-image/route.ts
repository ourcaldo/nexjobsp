import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabaseStorageService } from '@/lib/supabase/storage';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get user from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Check file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ message: 'File size exceeds 1MB limit' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const result = await supabaseStorageService.uploadProfileImage(user.id, file);
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 500 });
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_url: result.url })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: result.url 
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}
