# Nexjob Database Setup

This directory contains SQL scripts to set up the complete Nexjob database schema in Supabase PostgreSQL.

## Files

- **01-schema.sql** - Complete database schema with tables, indexes, RLS policies, and triggers
- **02-sample-data.sql** - Sample data for testing (optional)
- **README.md** - This file

## Database Tables

### Core Tables
1. **profiles** - User profiles and authentication data
2. **admin_settings** - Site-wide configuration and settings
3. **user_bookmarks** - User job bookmarks

### Content Management (Articles)
4. **nxdb_articles** - Article content
5. **nxdb_article_categories** - Article categories
6. **nxdb_article_tags** - Article tags
7. **nxdb_article_category_relations** - Many-to-many relations between articles and categories
8. **nxdb_article_tag_relations** - Many-to-many relations between articles and tags

### Content Management (Pages)
9. **nxdb_pages** - CMS pages
10. **nxdb_page_categories** - Page categories
11. **nxdb_page_tags** - Page tags
12. **nxdb_page_category_relations** - Many-to-many relations between pages and categories
13. **nxdb_page_tag_relations** - Many-to-many relations between pages and tags

### Other Tables
14. **popup_templates** - Popup advertisement templates

## Installation Steps

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Note down your project URL and keys

### 2. Run the Schema Script
1. Open Supabase SQL Editor
2. Copy the entire content of `01-schema.sql`
3. Paste and run the script
4. Wait for completion (should take a few seconds)

### 3. (Optional) Add Sample Data
1. In Supabase SQL Editor
2. Copy the entire content of `02-sample-data.sql`
3. Paste and run the script
4. This will populate categories, tags, and templates for testing

### 4. Configure Storage (For File Uploads)
1. Go to Supabase Storage
2. Create a new bucket named `nexjob-uploads`
3. Set bucket to public or configure appropriate policies
4. Update your `.env` file with storage configuration

### 5. Update Environment Variables
Update your `.env` file with the Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- **Public access** - Published articles and pages are publicly readable
- **User access** - Users can only manage their own bookmarks and profiles
- **Admin access** - Super admins have full access to all tables

### Automatic Features
1. **Auto-create profile** - Profile is automatically created when user signs up
2. **Auto-update timestamps** - `updated_at` fields are automatically updated on changes
3. **Cascade deletes** - Related data is automatically cleaned up when parent records are deleted

## Database Schema Diagram

```
profiles (Users)
├── nxdb_articles (authored articles)
├── nxdb_pages (authored pages)
└── user_bookmarks (user's saved jobs)

nxdb_articles
├── author → profiles
├── nxdb_article_category_relations → nxdb_article_categories
└── nxdb_article_tag_relations → nxdb_article_tags

nxdb_pages
├── author → profiles
├── nxdb_page_category_relations → nxdb_page_categories
└── nxdb_page_tag_relations → nxdb_page_tags
```

## Creating Your First Admin User

After running the schema:

1. Sign up normally through the application
2. Find your user ID in Supabase Authentication tab
3. Run this SQL to make yourself a super admin:

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

## Troubleshooting

### Error: relation "auth.users" does not exist
- This means you're not running the script in a Supabase project
- Make sure you're using Supabase PostgreSQL, not a regular PostgreSQL database

### Error: permission denied
- Make sure you're running the script as the Supabase service role
- Use the SQL Editor in Supabase Dashboard (it runs with proper permissions)

### Tables not appearing
- Refresh your Supabase dashboard
- Check the SQL Editor for any error messages
- Make sure the entire script ran successfully

## Next Steps

After setting up the database:
1. Configure WordPress API endpoints in admin settings
2. Test user registration and login
3. Create some test articles and pages
4. Test the bookmark system
5. Configure SEO settings

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Review the project README.md
- Check the Next.js app code for implementation details
