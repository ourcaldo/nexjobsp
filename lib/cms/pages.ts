import { supabase } from '@/lib/supabase';
import { NxdbPage } from '@/lib/supabase';

class CmsPageService {
  async getPages(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<NxdbPage[]> {
    try {
      let query = supabase
        .from('nxdb_pages')
        .select(`
          *,
          author:profiles(id, full_name, email),
          categories:nxdb_page_category_relations(
            category:nxdb_page_categories(*)
          ),
          tags:nxdb_page_tag_relations(
            tag:nxdb_page_tags(*)
          )
        `)
        .order('updated_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters?.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pages:', error);
        return [];
      }

      const pages = data?.map(page => ({
        ...page,
        categories: page.categories?.map((rel: any) => rel.category) || [],
        tags: page.tags?.map((rel: any) => rel.tag) || []
      })) || [];

      return pages;
    } catch (error) {
      console.error('Error fetching pages:', error);
      return [];
    }
  }

  async getPageBySlug(slug: string): Promise<NxdbPage | null> {
    try {
      const { data, error } = await supabase
        .from('nxdb_pages')
        .select(`
          *,
          author:profiles(id, full_name, email),
          categories:nxdb_page_category_relations(
            category:nxdb_page_categories(*)
          ),
          tags:nxdb_page_tag_relations(
            tag:nxdb_page_tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching page by slug:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        categories: data.categories?.map((rel: any) => rel.category) || [],
        tags: data.tags?.map((rel: any) => rel.tag) || []
      };
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      return null;
    }
  }
}

export const cmsPageService = new CmsPageService();
