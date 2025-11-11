-- ==========================================
-- NEXJOB - DEPRECATED SUPABASE CMS CLEANUP
-- ==========================================
-- Run these queries in your Supabase SQL Editor to drop all deprecated CMS tables
-- These tables are no longer used after migrating to TugasCMS (https://cms.nexjob.tech)
--
-- WARNING: This will permanently delete all data in these tables.
-- Make sure you have backed up any data you need before running these queries.
-- ==========================================

-- Drop junction tables first (foreign key dependencies)
DROP TABLE IF EXISTS public.nxdb_article_categories CASCADE;
DROP TABLE IF EXISTS public.nxdb_article_tags CASCADE;
DROP TABLE IF EXISTS public.nxdb_page_categories CASCADE;
DROP TABLE IF EXISTS public.nxdb_page_tags CASCADE;

-- Drop main article and page tables
DROP TABLE IF EXISTS public.nxdb_articles CASCADE;
DROP TABLE IF EXISTS public.nxdb_pages CASCADE;

-- Drop category and tag tables (if they were specific to CMS)
-- Note: Only drop these if they're not used elsewhere in your system
-- DROP TABLE IF EXISTS public.nxdb_categories CASCADE;
-- DROP TABLE IF EXISTS public.nxdb_tags CASCADE;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
-- Run these after the DROP queries to verify cleanup
--
-- Check remaining nxdb_ tables:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name LIKE 'nxdb_%';
--
-- Expected result: Empty or only nxdb_categories and nxdb_tags if you kept them
-- ==========================================
