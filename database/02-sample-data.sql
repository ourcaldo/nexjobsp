-- Sample Data for Nexjob Database
-- This file contains sample data for testing purposes
-- Run this AFTER running 01-schema.sql

-- ====================================================================================
-- 1. SAMPLE POPUP TEMPLATES
-- ====================================================================================
INSERT INTO popup_templates (template_key, title, content, button_text)
VALUES 
    ('bookmark_login', 'Login Required', 'Please login to save job bookmarks and access all features.', 'Login Now'),
    ('welcome', 'Welcome to Nexjob!', 'Start your career journey with us. Find your dream job today.', 'Get Started')
ON CONFLICT (template_key) DO NOTHING;

-- ====================================================================================
-- 2. SAMPLE ARTICLE CATEGORIES
-- ====================================================================================
INSERT INTO nxdb_article_categories (name, slug, description)
VALUES
    ('Tips Karir', 'tips-karir', 'Tips and advice for career development'),
    ('Interview', 'interview', 'Interview preparation and techniques'),
    ('CV & Resume', 'cv-resume', 'How to create an effective CV and resume'),
    ('Pengembangan Diri', 'pengembangan-diri', 'Personal and professional development'),
    ('Gaji & Benefit', 'gaji-benefit', 'Salary negotiation and employee benefits')
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================================
-- 3. SAMPLE ARTICLE TAGS
-- ====================================================================================
INSERT INTO nxdb_article_tags (name, slug)
VALUES
    ('Fresh Graduate', 'fresh-graduate'),
    ('Profesional', 'profesional'),
    ('Remote Work', 'remote-work'),
    ('Freelance', 'freelance'),
    ('Startup', 'startup'),
    ('Corporate', 'corporate')
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================================
-- 4. SAMPLE PAGE CATEGORIES
-- ====================================================================================
INSERT INTO nxdb_page_categories (name, slug, description)
VALUES
    ('Legal', 'legal', 'Legal pages and policies'),
    ('About', 'about', 'About us and company information'),
    ('Help', 'help', 'Help and support pages')
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================================
-- 5. SAMPLE PAGE TAGS
-- ====================================================================================
INSERT INTO nxdb_page_tags (name, slug)
VALUES
    ('Policy', 'policy'),
    ('Terms', 'terms'),
    ('FAQ', 'faq')
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================================
-- SAMPLE DATA INSERTION COMPLETE
-- ====================================================================================
--
-- Note: Admin settings will be created automatically on first application load
-- User profiles will be created automatically on user signup via trigger
--
