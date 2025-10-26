-- Nexjob Database Schema for Supabase PostgreSQL
-- This file contains the complete database schema for the Nexjob job portal platform
-- Run this script in your Supabase SQL Editor after creating a new project

-- ====================================================================================
-- 1. PROFILES TABLE - User profiles and authentication
-- ====================================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    location TEXT,
    photo_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ====================================================================================
-- 2. ADMIN SETTINGS TABLE - Site configuration and settings
-- ====================================================================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- TugasCMS API Configuration
    cms_endpoint TEXT DEFAULT 'https://cms.nexjob.tech',
    cms_token TEXT,
    cms_timeout INTEGER DEFAULT 10000,
    
    -- Site Information
    site_title TEXT,
    site_tagline TEXT,
    site_description TEXT,
    site_url TEXT,
    
    -- Analytics
    ga_id TEXT,
    gtm_id TEXT,
    
    -- Supabase Storage Configuration
    supabase_storage_endpoint TEXT,
    supabase_storage_region TEXT,
    supabase_storage_access_key TEXT,
    supabase_storage_secret_key TEXT,
    
    -- SEO Page Templates
    location_page_title_template TEXT,
    location_page_description_template TEXT,
    category_page_title_template TEXT,
    category_page_description_template TEXT,
    
    -- Archive Page SEO
    jobs_title TEXT,
    jobs_description TEXT,
    articles_title TEXT,
    articles_description TEXT,
    
    -- Auth Pages SEO
    login_page_title TEXT,
    login_page_description TEXT,
    signup_page_title TEXT,
    signup_page_description TEXT,
    profile_page_title TEXT,
    profile_page_description TEXT,
    
    -- SEO Images
    home_og_image TEXT,
    jobs_og_image TEXT,
    articles_og_image TEXT,
    default_job_og_image TEXT,
    default_article_og_image TEXT,
    
    -- Advertisement Settings
    popup_ad_url TEXT,
    popup_ad_enabled BOOLEAN DEFAULT false,
    popup_ad_load_settings JSONB DEFAULT '[]'::jsonb,
    popup_ad_max_executions INTEGER DEFAULT 0,
    popup_ad_device TEXT DEFAULT 'All' CHECK (popup_ad_device IN ('All', 'Desktop', 'Mobile')),
    sidebar_archive_ad_code TEXT,
    sidebar_single_ad_code TEXT,
    single_top_ad_code TEXT,
    single_bottom_ad_code TEXT,
    single_middle_ad_code TEXT,
    
    -- Sitemap Settings
    sitemap_update_interval INTEGER DEFAULT 300,
    auto_generate_sitemap BOOLEAN DEFAULT true,
    last_sitemap_update TIMESTAMPTZ,
    
    -- Robots.txt
    robots_txt TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage settings
CREATE POLICY "Super admins can manage settings" ON admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Public read access for certain fields (implement via views or functions)
CREATE POLICY "Public can view safe settings" ON admin_settings
    FOR SELECT USING (true);

-- ====================================================================================
-- 3. USER BOOKMARKS TABLE - Job bookmarks for users
-- ====================================================================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate bookmarks
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_bookmarks_unique ON user_bookmarks(user_id, job_id);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_job_id ON user_bookmarks(job_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks(created_at DESC);

-- RLS Policies for user_bookmarks
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================================
-- 4. POPUP TEMPLATES TABLE - Popup advertisement templates
-- ====================================================================================
CREATE TABLE IF NOT EXISTS popup_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    button_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for popup_templates
ALTER TABLE popup_templates ENABLE ROW LEVEL SECURITY;

-- Public can read templates
CREATE POLICY "Public can view templates" ON popup_templates
    FOR SELECT USING (true);

-- Only super admins can manage templates
CREATE POLICY "Super admins can manage templates" ON popup_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ====================================================================================
-- 5. ARTICLE SYSTEM TABLES
-- ====================================================================================

-- 5.1 Article Categories
CREATE TABLE IF NOT EXISTS nxdb_article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON nxdb_article_categories(slug);

-- 5.2 Article Tags
CREATE TABLE IF NOT EXISTS nxdb_article_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_tags_slug ON nxdb_article_tags(slug);

-- 5.3 Articles
CREATE TABLE IF NOT EXISTS nxdb_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'trash', 'scheduled')),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    featured_image TEXT,
    seo_title TEXT,
    meta_description TEXT,
    schema_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    post_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON nxdb_articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON nxdb_articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON nxdb_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON nxdb_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON nxdb_articles(status, published_at DESC);

-- 5.4 Article Category Relations
CREATE TABLE IF NOT EXISTS nxdb_article_category_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES nxdb_articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES nxdb_article_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_article_category_relations_unique 
    ON nxdb_article_category_relations(article_id, category_id);
CREATE INDEX IF NOT EXISTS idx_article_category_relations_article ON nxdb_article_category_relations(article_id);
CREATE INDEX IF NOT EXISTS idx_article_category_relations_category ON nxdb_article_category_relations(category_id);

-- 5.5 Article Tag Relations
CREATE TABLE IF NOT EXISTS nxdb_article_tag_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES nxdb_articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES nxdb_article_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_article_tag_relations_unique 
    ON nxdb_article_tag_relations(article_id, tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tag_relations_article ON nxdb_article_tag_relations(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tag_relations_tag ON nxdb_article_tag_relations(tag_id);

-- RLS Policies for Articles
ALTER TABLE nxdb_article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_article_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_article_tag_relations ENABLE ROW LEVEL SECURITY;

-- Public can read published articles and their categories/tags
CREATE POLICY "Public can view article categories" ON nxdb_article_categories FOR SELECT USING (true);
CREATE POLICY "Public can view article tags" ON nxdb_article_tags FOR SELECT USING (true);
CREATE POLICY "Public can view published articles" ON nxdb_articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view article category relations" ON nxdb_article_category_relations FOR SELECT USING (true);
CREATE POLICY "Public can view article tag relations" ON nxdb_article_tag_relations FOR SELECT USING (true);

-- Super admins can manage articles
CREATE POLICY "Super admins can manage articles" ON nxdb_articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage article categories" ON nxdb_article_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage article tags" ON nxdb_article_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage article relations" ON nxdb_article_category_relations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage article tag relations" ON nxdb_article_tag_relations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ====================================================================================
-- 6. PAGE SYSTEM TABLES  
-- ====================================================================================

-- 6.1 Page Categories
CREATE TABLE IF NOT EXISTS nxdb_page_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_categories_slug ON nxdb_page_categories(slug);

-- 6.2 Page Tags
CREATE TABLE IF NOT EXISTS nxdb_page_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_tags_slug ON nxdb_page_tags(slug);

-- 6.3 Pages
CREATE TABLE IF NOT EXISTS nxdb_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'trash', 'scheduled')),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    featured_image TEXT,
    seo_title TEXT,
    meta_description TEXT,
    schema_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    post_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON nxdb_pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON nxdb_pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_author_id ON nxdb_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON nxdb_pages(published_at DESC);

-- 6.4 Page Category Relations
CREATE TABLE IF NOT EXISTS nxdb_page_category_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES nxdb_pages(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES nxdb_page_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_category_relations_unique 
    ON nxdb_page_category_relations(page_id, category_id);
CREATE INDEX IF NOT EXISTS idx_page_category_relations_page ON nxdb_page_category_relations(page_id);
CREATE INDEX IF NOT EXISTS idx_page_category_relations_category ON nxdb_page_category_relations(category_id);

-- 6.5 Page Tag Relations
CREATE TABLE IF NOT EXISTS nxdb_page_tag_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES nxdb_pages(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES nxdb_page_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_tag_relations_unique 
    ON nxdb_page_tag_relations(page_id, tag_id);
CREATE INDEX IF NOT EXISTS idx_page_tag_relations_page ON nxdb_page_tag_relations(page_id);
CREATE INDEX IF NOT EXISTS idx_page_tag_relations_tag ON nxdb_page_tag_relations(tag_id);

-- RLS Policies for Pages
ALTER TABLE nxdb_page_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_page_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_page_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxdb_page_tag_relations ENABLE ROW LEVEL SECURITY;

-- Public can read published pages and their categories/tags
CREATE POLICY "Public can view page categories" ON nxdb_page_categories FOR SELECT USING (true);
CREATE POLICY "Public can view page tags" ON nxdb_page_tags FOR SELECT USING (true);
CREATE POLICY "Public can view published pages" ON nxdb_pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view page category relations" ON nxdb_page_category_relations FOR SELECT USING (true);
CREATE POLICY "Public can view page tag relations" ON nxdb_page_tag_relations FOR SELECT USING (true);

-- Super admins can manage pages
CREATE POLICY "Super admins can manage pages" ON nxdb_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage page categories" ON nxdb_page_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage page tags" ON nxdb_page_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage page relations" ON nxdb_page_category_relations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage page tag relations" ON nxdb_page_tag_relations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ====================================================================================
-- 7. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ====================================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_templates_updated_at BEFORE UPDATE ON popup_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_categories_updated_at BEFORE UPDATE ON nxdb_article_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_tags_updated_at BEFORE UPDATE ON nxdb_article_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON nxdb_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_categories_updated_at BEFORE UPDATE ON nxdb_page_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_tags_updated_at BEFORE UPDATE ON nxdb_page_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON nxdb_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================================
-- 8. AUTO-CREATE PROFILE ON USER SIGNUP
-- ====================================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================================
-- SCHEMA SETUP COMPLETE
-- ====================================================================================
-- 
-- Next steps:
-- 1. Run 02-sample-data.sql to populate with sample data (optional)
-- 2. Configure Supabase Storage buckets for file uploads
-- 3. Update your .env file with Supabase credentials
-- 4. Test the application
--
