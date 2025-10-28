'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { bookmarkService } from '@/lib/services/BookmarkService';
import { revalidatePath } from 'next/cache';

export async function toggleBookmark(jobId: string) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const result = await bookmarkService.toggle(user.id, jobId);
  
  revalidatePath('/bookmarks');
  revalidatePath(`/lowongan-kerja/${jobId}`);
  
  return result;
}

export async function getBookmarks() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return await bookmarkService.getBookmarks(user.id);
}

export async function checkBookmark(jobId: string) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isBookmarked: false };
  }
  
  const isBookmarked = await bookmarkService.checkBookmarkExists(user.id, jobId);
  return { isBookmarked };
}
