# Nexjob Project Documentation

## Project Overview
Nexjob is a full-featured job portal platform built with Next.js 14, TypeScript, Supabase (PostgreSQL), and WordPress as headless CMS. It provides advanced job search capabilities, user management, content management system, and comprehensive admin controls.

## Technology Stack
- **Framework**: Next.js 14.2.30 (App Router)
- **Language**: TypeScript 5.8.3
- **Database**: PostgreSQL via Supabase
- **CMS**: WordPress (Headless)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Rich Text**: TipTap Editor

## Database Structure

### Core Tables (Supabase)

#### profiles
- `id` (UUID, PK) - User ID matching auth.users
- `email` (text) - User email
- `full_name` (text) - User's full name
- `avatar_url` (text) - Profile image URL
- `role` (text) - User role (user | super_admin)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### user_bookmarks
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `job_id` (text) - Job ID from WordPress CMS
- `created_at` (timestamptz)

#### settings (admin_settings)
- `id` (UUID, PK)
- `api_url` (text) - WordPress API endpoint
- `filters_api_url` (text) - WordPress filters endpoint
- `auth_token` (text) - WordPress auth token
- `site_title` (text)
- `site_tagline` (text)
- `site_description` (text)
- `site_url` (text)
- `ga_id` (text) - Google Analytics ID
- `gtm_id` (text) - Google Tag Manager ID
- SEO template fields
- Advertisement settings
- Sitemap settings
- Created/Updated timestamps

#### nxdb_articles
- `id` (UUID, PK)
- `title` (text)
- `slug` (text, unique)
- `content` (text)
- `excerpt` (text)
- `status` (text) - draft | published | trash | scheduled
- `author_id` (UUID, FK → profiles)
- `featured_image` (text)
- `seo_title` (text)
- `meta_description` (text)
- `schema_types` (text[])
- `post_date` (timestamptz)
- `published_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### nxdb_article_categories
- `id` (UUID, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `created_at` (timestamptz)

#### nxdb_article_tags
- `id` (UUID, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `created_at` (timestamptz)

#### nxdb_pages (similar to articles)
- `id` (UUID, PK)
- `title` (text)
- `slug` (text, unique)
- `content` (text)
- `excerpt` (text)
- `status` (text)
- `author_id` (UUID, FK → profiles)
- Plus SEO and metadata fields

#### popup_templates
- `id` (UUID, PK)
- `template_key` (text, unique)
- `title` (text)
- `content` (text)
- `button_text` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Project Structure

```
nexjob-portal/
├── app/                              # Next.js App Router
│   ├── api/                          # API route handlers
│   │   ├── admin/                    # Admin-only endpoints
│   │   ├── public/                   # Public API endpoints
│   │   └── user/                     # User-specific endpoints
│   ├── admin/                        # Admin panel redirect
│   ├── artikel/                      # Article pages
│   ├── backend/admin/                # Full admin panel pages
│   ├── bookmarks/                    # User bookmarks
│   ├── login/ & signup/              # Authentication pages
│   ├── lowongan-kerja/               # Job pages
│   ├── profile/                      # User profile
│   ├── sitemap-*/                    # Dynamic sitemaps
│   ├── [slug]/                       # Dynamic CMS pages
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   └── providers.tsx                 # Client providers
├── components/                       # React components
│   ├── admin/                        # Admin panel components
│   ├── pages/                        # Page-level components
│   ├── ui/                           # Reusable UI components
│   ├── Advertisement/                # Ad display components
│   ├── Analytics/                    # GA & GTM components
│   ├── Layout/                       # Header & Footer
│   └── SEO/                          # Schema markup
├── lib/                              # Core utilities & services
│   ├── cms/                          # CMS-related functionality
│   │   ├── service.ts                # CMS API client
│   │   ├── wordpress.ts              # WordPress REST API client
│   │   ├── articles.ts               # Article CRUD operations
│   │   └── pages.ts                  # Page CRUD operations
│   ├── supabase/                     # Supabase-related functionality
│   │   ├── admin.ts                  # Admin operations
│   │   └── storage.ts                # Storage operations
│   ├── api/                          # Internal API clients
│   │   ├── admin-settings.ts         # Admin settings API
│   │   ├── public-settings.ts        # Public settings API
│   │   ├── user-profile.ts           # User profile API
│   │   └── user-bookmarks.ts         # User bookmarks API
│   ├── utils/                        # Utility services
│   │   ├── bookmarks.ts              # Local bookmark utils
│   │   ├── advertisements.ts         # Advertisement utils
│   │   ├── popup-templates.ts        # Popup template utils
│   │   ├── sitemap.ts                # Sitemap generation
│   │   └── admin-legacy.ts           # Legacy admin compatibility
│   ├── env.ts                        # Environment config
│   └── supabase.ts                   # Supabase client
├── types/                            # TypeScript definitions
├── utils/                            # Helper functions
├── hooks/                            # Custom React hooks
├── styles/                           # Global styles
└── Configuration files
```

## Recent Changes

### 2025-10-26 - Project Import & Initial Setup
- **14:30** - Copied .env.example to .env for environment configuration
- **14:30** - Installed all npm dependencies (578 packages)
- **14:31** - Restarted workflow, Next.js dev server running on port 5000
- **14:32** - Project successfully imported and running
- **Status**: Application accessible but showing CMS connection timeouts (expected without proper WordPress credentials)

### 2025-10-26 - /services Directory Restructuring **[COMPLETED]**
- **15:00** - Beginning restructuring of /services directory to Next.js-friendly /lib structure
- **Reason**: /services directory is not a common pattern in Next.js apps; moving to /lib follows Next.js best practices
- **Implementation Details**:
  
  **New Directory Structure Created**:
  - `/lib/cms/` - CMS and WordPress-related services
  - `/lib/supabase/` - Supabase admin and storage operations  
  - `/lib/api/` - Internal API client services
  - `/lib/utils/` - Utility services (bookmarks, ads, sitemap, etc.)
  
  **File Migrations (15 files total)**:
  
  **CMS Services** (`/lib/cms/`):
  - `services/cmsService.ts` → `lib/cms/service.ts`
  - `services/wpService.ts` → `lib/cms/wordpress.ts`
  - `services/cmsArticleService.ts` → `lib/cms/articles.ts`
  - `services/cmsPageService.ts` → `lib/cms/pages.ts`
  
  **Supabase Services** (`/lib/supabase/`):
  - `services/supabaseAdminService.ts` → `lib/supabase/admin.ts`
  - `services/supabaseStorageService.ts` → `lib/supabase/storage.ts`
  
  **API Client Services** (`/lib/api/`):
  - `services/adminSettingsApiService.ts` → `lib/api/admin-settings.ts`
  - `services/publicSettingsApiService.ts` → `lib/api/public-settings.ts`
  - `services/userProfileApiService.ts` → `lib/api/user-profile.ts`
  - `services/userBookmarkService.ts` → `lib/api/user-bookmarks.ts`
  
  **Utility Services** (`/lib/utils/`):
  - `services/bookmarkService.ts` → `lib/utils/bookmarks.ts`
  - `services/advertisementService.ts` → `lib/utils/advertisements.ts`
  - `services/popupTemplateService.ts` → `lib/utils/popup-templates.ts`
  - `services/sitemapService.ts` → `lib/utils/sitemap.ts`
  - `services/adminService.ts` → `lib/utils/admin-legacy.ts`
  
  **Import Updates**:
  - Updated all 15 moved files to use new absolute import paths (`@/lib/...`)
  - Updated 47+ files across the codebase that imported from `/services/*`
  - Fixed dynamic imports in `app/providers.tsx`
  - All imports now use consistent `@/lib/...` pattern
  
  **Verification**:
  - ✅ Application compiled successfully (908 modules in 4.6s)
  - ✅ Zero remaining imports from `@/services/` directory
  - ✅ Workflow running without module resolution errors
  - ✅ HTTP requests working correctly (200 responses)
  - ✅ Old `/services` directory removed
  
  **Impact**: This restructuring aligns the codebase with Next.js 14 best practices and improves code organization by grouping related functionality logically. All services remain fully functional with improved discoverability.

## Environment Variables

### Required Variables (.env)
```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://nexjob.tech
NEXT_PUBLIC_SITE_NAME=Nexjob
NEXT_PUBLIC_SITE_DESCRIPTION=Platform pencarian kerja terpercaya di Indonesia

# WordPress API (Headless CMS)
NEXT_PUBLIC_WP_API_URL=https://cms.nexjob.tech/wp-json/wp/v2
NEXT_PUBLIC_WP_FILTERS_API_URL=https://cms.nexjob.tech/wp-json/nex/v1/filters-data
NEXT_PUBLIC_WP_AUTH_TOKEN=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uzlzyosmbxgghhmafidk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ENABLE_DEV=false
NEXT_PUBLIC_GTM_ENABLE_DEV=false

# Development
NODE_ENV=production
PORT=5000

# Security
API_TOKEN=v6BtVqyV2WturhsAdECx

# Cache Settings
SITEMAP_CACHE_TTL=300
```

## Development Guidelines

### Port Configuration
- Always use port **5000** (configured in .env and next.config.js)
- Frontend dev server: `npm run dev` binds to 0.0.0.0:5000

### Environment File
- Use `.env` (NOT `.env.local`) per project convention
- Never commit .env to repository
- Update .env.example when adding new variables
- To update .env: Edit .env.example first, then `cp .env.example .env`

### Code Style
- TypeScript strict mode enabled
- Use existing patterns and conventions
- Follow component organization by feature/domain
- All services/utilities should handle errors gracefully

### Database Operations
- Cannot directly access Supabase production database
- For database queries: Provide SQL statements for user to run
- Never push database-related code changes to production without testing

### Debugging
- Never use `console.log` that appears in user's browser
- Use server-side logging when appropriate
- Create debug/test files if needed, but delete before completing tasks

### New Features
- Always write well-refactored code
- Avoid single monolithic functions
- Break down complex logic into smaller, reusable utilities
- Follow existing patterns in the codebase

## API Endpoints

### Public APIs
- `GET /api/public/settings` - Site settings
- `GET /api/public/advertisements` - Advertisement data

### User APIs (Authenticated)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile  
- `GET /api/user/bookmarks` - Get user bookmarks
- `POST /api/user/bookmarks` - Add bookmark
- `DELETE /api/user/bookmarks` - Remove bookmark
- `GET /api/user/role` - Get user role

### Admin APIs (Super Admin Only)
- `GET/PUT /api/admin/settings` - Admin settings
- `POST /api/admin/force-sitemap-update` - Regenerate sitemap
- `POST /api/upload-profile-image` - Image upload

## Key Features

### 1. Job Management
- Dynamic job listings from WordPress CMS
- Advanced search with filters (location, category, salary, experience)
- Job detail pages with SSG/ISR
- Related jobs recommendations

### 2. Content Management
- Articles system with categories and tags
- Dynamic CMS pages
- Rich text editor (TipTap)
- Media management via Supabase Storage
- WordPress headless CMS integration

### 3. User Management  
- Supabase authentication (email/password)
- User profiles with avatar uploads
- Bookmark system for saving jobs
- Role-based access control (user | super_admin)

### 4. Admin Panel
- Dashboard with analytics
- CMS content management (articles, pages)
- User management
- SEO settings and templates
- Advertisement management
- Sitemap generation
- WordPress integration settings
- System configuration

### 5. SEO & Performance
- Dynamic XML sitemaps with ISR-like caching
- Schema markup (JobPosting, Article, Organization)
- Dynamic meta tags
- Static generation with revalidation
- Image optimization

## Important Notes

### For AI Agents Working on This Project
1. **Always read this file (project.md)** to understand the complete project context
2. **Never delete information** from this file - only add to Recent Changes
3. **Update Recent Changes** with proper timeline format for every modification
4. **Database Access**: Cannot access Supabase production - provide SQL for user to run
5. **Environment Variables**: Must edit .env.example then copy to .env
6. **No Browser Console Logs**: Avoid console.log visible to users
7. **Code Quality**: Always write refactored, modular code following existing patterns
8. **Port**: Always use port 5000
9. **Next.js Patterns**: Follow Next.js 14 App Router conventions
10. **TypeScript**: Use strict typing throughout

### WordPress CMS Integration
- Jobs sourced from WordPress REST API
- Filter data cached with 1-hour TTL
- Custom fields with `nexjob_` prefix
- Category mapping for SEO-friendly URLs

### Deployment
- Platform: Replit (Autoscale)
- Build: `npm run build`
- Start: `npm run start`  
- Port: 5000
- Environment: Production-ready with PM2 support

---

**Last Updated**: October 26, 2025, 15:00 WIB
**Maintained By**: Replit AI Agent
