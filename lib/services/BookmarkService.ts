import { createServerSupabaseClient } from '@/lib/supabase';
import { UserBookmark } from '@/lib/supabase';

export class BookmarkService {
  async getBookmarks(userId: string): Promise<UserBookmark[]> {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }

    return data || [];
  }
  
  async createBookmark(userId: string, jobId: string): Promise<UserBookmark> {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: userId,
        job_id: jobId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bookmark: ${error.message}`);
    }

    return data;
  }
  
  async deleteBookmark(userId: string, jobId: string): Promise<void> {
    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) {
      throw new Error(`Failed to delete bookmark: ${error.message}`);
    }
  }
  
  async checkBookmarkExists(userId: string, jobId: string): Promise<boolean> {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }
  
  async toggle(userId: string, jobId: string): Promise<{ isBookmarked: boolean }> {
    const exists = await this.checkBookmarkExists(userId, jobId);
    
    if (exists) {
      await this.deleteBookmark(userId, jobId);
      return { isBookmarked: false };
    } else {
      await this.createBookmark(userId, jobId);
      return { isBookmarked: true };
    }
  }
}

export const bookmarkService = new BookmarkService();
