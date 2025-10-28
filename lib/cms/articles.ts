import { supabase } from '@/lib/supabase';
import { NxdbArticle, NxdbArticleCategory, NxdbArticleTag } from '@/lib/supabase';

export interface CreateArticleData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'trash';
  author_id: string;
  featured_image?: string;
  seo_title?: string;
  meta_description?: string;
  schema_types: string[];
  post_date: string;
  published_at?: string;
  category_ids?: string[];
  tag_ids?: string[];
}

export interface UpdateArticleData {
  id: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'trash';
  featured_image?: string;
  seo_title?: string;
  meta_description?: string;
  schema_types?: string[];
  post_date?: string;
  published_at?: string;
  category_ids?: string[];
  tag_ids?: string[];
}

class CmsArticleService {
  async getArticles(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<NxdbArticle[]> {
    try {
      let query = supabase
        .from('nxdb_articles')
        .select(`
          *,
          author:profiles(id, full_name, email),
          categories:nxdb_article_category_relations(
            category:nxdb_article_categories(*)
          ),
          tags:nxdb_article_tag_relations(
            tag:nxdb_article_tags(*)
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
        return [];
      }

      const articles = data?.map(article => ({
        ...article,
        categories: article.categories?.map((rel: any) => rel.category) || [],
        tags: article.tags?.map((rel: any) => rel.tag) || []
      })) || [];

      return articles;
    } catch (error) {
      return [];
    }
  }

  async getArticleById(id: string): Promise<NxdbArticle | null> {
    try {
      const { data, error } = await supabase
        .from('nxdb_articles')
        .select(`
          *,
          author:profiles(id, full_name, email),
          categories:nxdb_article_category_relations(
            category:nxdb_article_categories(*)
          ),
          tags:nxdb_article_tag_relations(
            tag:nxdb_article_tags(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
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
      return null;
    }
  }

  async getArticleBySlug(slug: string): Promise<NxdbArticle | null> {
    try {
      const { data, error } = await supabase
        .from('nxdb_articles')
        .select(`
          *,
          author:profiles(id, full_name, email),
          categories:nxdb_article_category_relations(
            category:nxdb_article_categories(*)
          ),
          tags:nxdb_article_tag_relations(
            tag:nxdb_article_tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
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
      return null;
    }
  }

  async createArticle(articleData: CreateArticleData): Promise<{ success: boolean; article?: NxdbArticle; error?: string }> {
    try {
      const { category_ids, tag_ids, ...articleFields } = articleData;

      const { data: article, error: insertError } = await supabase
        .from('nxdb_articles')
        .insert([articleFields])
        .select()
        .single();

      if (insertError || !article) {
        return { success: false, error: insertError?.message || 'Failed to create article' };
      }

      if (category_ids && category_ids.length > 0) {
        const categoryRelations = category_ids.map(category_id => ({
          article_id: article.id,
          category_id
        }));

        await supabase
          .from('nxdb_article_category_relations')
          .insert(categoryRelations);
      }

      if (tag_ids && tag_ids.length > 0) {
        const tagRelations = tag_ids.map(tag_id => ({
          article_id: article.id,
          tag_id
        }));

        await supabase
          .from('nxdb_article_tag_relations')
          .insert(tagRelations);
      }

      const fullArticle = await this.getArticleById(article.id);
      return { success: true, article: fullArticle || article };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateArticle(articleData: UpdateArticleData): Promise<{ success: boolean; article?: NxdbArticle; error?: string }> {
    try {
      const { id, category_ids, tag_ids, ...articleFields } = articleData;

      const { data: article, error: updateError } = await supabase
        .from('nxdb_articles')
        .update(articleFields)
        .eq('id', id)
        .select()
        .single();

      if (updateError || !article) {
        return { success: false, error: updateError?.message || 'Failed to update article' };
      }

      if (category_ids !== undefined) {
        await supabase
          .from('nxdb_article_category_relations')
          .delete()
          .eq('article_id', id);

        if (category_ids.length > 0) {
          const categoryRelations = category_ids.map(category_id => ({
            article_id: id,
            category_id
          }));

          await supabase
            .from('nxdb_article_category_relations')
            .insert(categoryRelations);
        }
      }

      if (tag_ids !== undefined) {
        await supabase
          .from('nxdb_article_tag_relations')
          .delete()
          .eq('article_id', id);

        if (tag_ids.length > 0) {
          const tagRelations = tag_ids.map(tag_id => ({
            article_id: id,
            tag_id
          }));

          await supabase
            .from('nxdb_article_tag_relations')
            .insert(tagRelations);
        }
      }

      const fullArticle = await this.getArticleById(id);
      return { success: true, article: fullArticle || article };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('nxdb_articles')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCategories(): Promise<NxdbArticleCategory[]> {
    try {
      const { data, error } = await supabase
        .from('nxdb_article_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  async getTags(): Promise<NxdbArticleTag[]> {
    try {
      const { data, error } = await supabase
        .from('nxdb_article_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  async createCategory(name: string): Promise<{ success: boolean; category?: NxdbArticleCategory; error?: string }> {
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { data, error } = await supabase
        .from('nxdb_article_categories')
        .insert([{ name, slug, description: '' }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, category: data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createTag(name: string): Promise<{ success: boolean; tag?: NxdbArticleTag; error?: string }> {
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { data, error } = await supabase
        .from('nxdb_article_tags')
        .insert([{ name, slug }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, tag: data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let finalSlug = slug;
    let counter = 1;

    while (true) {
      let query = supabase
        .from('nxdb_articles')
        .select('id')
        .eq('slug', finalSlug)
        .limit(1);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        break;
      }

      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }
}

export const cmsArticleService = new CmsArticleService();
