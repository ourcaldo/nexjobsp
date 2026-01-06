# Nexjob Project - Comprehensive Architecture Analysis

## Executive Summary

The Nexjob project is a Next.js 14-based job portal with a sophisticated backend admin panel, Supabase database integration, and TugasCMS external CMS integration. The architecture follows a layered approach with clear separation between frontend, backend services, and external integrations.

**Key Findings:**
- Settings are split between `.env` (infrastructure), Supabase database (admin-editable), and CMS backend
- Admin panel is fully functional with role-based access control
- CMS integration is abstracted through a factory pattern for flexibility
- Multiple hardcoded values could be moved to `.env` or CMS backend
- Clear opportunities for consolidation and centralization

---

## 1. Current Backend Admin Structure

### 1.1 Admin Panel Location & Access

**Path**: `/app/backend/admin/` (accessible at `/backend/admin/` or `/admin/`)

**Access Control**:
- Super admin only (role-based via Supabase Auth)
- Redirects non-admin users to `/login/`
- All routes protected with `noindex`, `nofollow`, `nocache` meta tags

**Route Structure**:
```
/backend/admin/                    # Dashboard (index)
/backend/admin/seo                 # SEO Settings
/backend/admin/advertisement       # Advertisement Settings
/backend/admin/sitemap             # Robots.txt Management
/backend/admin/integration         # CMS Integration Settings
/backend/admin/system              # System Settings (GA, GTM, Site URL)
/backend/admin/users               # User Management
```

### 1.2 Admin Components Architecture

**Main Components** (in `components/admin/`):
- `AdminLayout.tsx` - Main layout with sidebar navigation
- `Dashboard.tsx` - System stats and health checks
- `SEOSettings.tsx` - SEO metadata and templates
- `AdvertisementSettings.tsx` - Ad code and popup configuration
- `SitemapManagement.tsx` - Robots.txt editor
- `IntegrationSettings.tsx` - CMS API configuration
- `SystemSettings.tsx` - GA, GTM, Site URL
- `UserManagement.tsx` - User role management

**Key Pattern**: All components use dynamic imports with loading fallbacks for performance optimization.

### 1.3 Admin Service Layer

**File**: `lib/supabase/admin.ts`

**SupabaseAdminService Class** provides:
- `getSettings()` - Fetch admin settings with caching (2-minute TTL)
- `saveSettings()` - Update settings in Supabase
- `getCurrentProfile()` - Get logged-in user profile
- `isSuperAdmin()` - Check user role
- `signInWithEmail()` - Email/password authentication
- `signOut()` - Logout functionality
- `updateLastSitemapGeneration()` - Track sitemap updates

**Caching Strategy**:
- 2-minute cache TTL for admin context (reduced from 5 minutes for freshness)
- Cache cleared on successful settings save
- Separate cache for public vs. admin settings

---

## 2. Environment Variables Usage

### 2.1 Current Environment Configuration

**File**: `.env.example` and `lib/env.ts`

**Environment Variables Breakdown**:

#### Site Configuration
```env
NEXT_PUBLIC_SITE_URL=https://nexjob.tech
```

#### CMS Configuration
```env
CMS_TIMEOUT=10000
# Note: CMS_ENDPOINT and CMS_TOKEN are in Supabase settings, not .env
```

#### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://base.nexjob.tech
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jwt-token>
SUPABASE_SERVICE_ROLE_KEY=<service-role-token>
```

#### Supabase Storage (S3-Compatible)
```env
SUPABASE_STORAGE_ACCESS_KEY=<access-key>
SUPABASE_STORAGE_SECRET_KEY=<secret-key>
SUPABASE_STORAGE_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
SUPABASE_STORAGE_REGION=ap-southeast-1
```

#### Analytics
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ENABLE_DEV=false
NEXT_PUBLIC_GTM_ENABLE_DEV=false
```

#### Development & Security
```env
NODE_ENV=production
PORT=5000
API_TOKEN=v6BtVqyV2WturhsAdECx
LOG_LEVEL=info
```

#### Cache Configuration
```env
FILTER_CACHE_TTL=3600000
AUTH_CACHE_DURATION=5000
SITEMAP_CACHE_TTL=300
```

#### Feature Flags
```env
NEXT_PUBLIC_FEATURE_JOB_ALERTS=false
NEXT_PUBLIC_FEATURE_SEARCH_HISTORY=true
NEXT_PUBLIC_FEATURE_SOCIAL_SHARE=true
NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH=false
NEXT_PUBLIC_FEATURE_CHAT_SUPPORT=false
NEXT_PUBLIC_FEATURE_OPTIMISTIC_UPDATES=true
```

### 2.2 Environment Validation

**File**: `lib/env.ts`

**Validation Logic**:
- Checks for critical variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Validates Supabase URL format (must be HTTPS)
- Validates key lengths
- Fails fast in production, warns in development
- Provides helpful error messages

**Current Issues**:
- Some settings are hardcoded in `SupabaseAdminService.defaultSettings` instead of `.env`
- CMS endpoint and token are stored in Supabase, not `.env`
- Storage credentials are in `.env` but also duplicated in Supabase settings

---

## 3. CMS Integration & API Structure

### 3.1 CMS Architecture

**Pattern**: Factory pattern with pluggable providers

**File**: `lib/cms/factory.ts`
```typescript
export const getCMSProvider = (): CMSProvider => {
  const provider = process.env.CMS_PROVIDER || 'tugascms';
  switch (provider) {
    case 'tugascms':
      return new TugasCMSProvider();
    default:
      throw new Error(`Unknown CMS provider: ${provider}`);
  }
};
```

**Current Provider**: TugasCMS (at `https://cms.nexjob.tech`)

### 3.2 CMS Provider Interface

**File**: `lib/cms/interface.ts`

**CMSProvider Interface** defines:
- `getJobs()` - Fetch jobs with filters, pagination
- `getJobById()` / `getJobBySlug()` - Single job retrieval
- `getArticles()` - Fetch articles with pagination
- `getArticleBySlug()` - Single article retrieval
- `getFiltersData()` - Get all filter options (employment types, experience levels, etc.)
- `getCategories()` / `getTags()` - Taxonomy endpoints
- `getPages()` / `getPageBySlug()` - Page management
- `getSitemaps()` / `getSitemapXML()` - Sitemap generation
- `testConnection()` - Connection health check

### 3.3 CMS API Endpoints

**Base URL**: `https://cms.nexjob.tech/api/v1`

**Key Endpoints**:
- `GET /api/v1/job-posts` - List jobs with extensive filtering
- `GET /api/v1/job-posts/{id}` - Single job
- `GET /api/v1/posts` - Articles
- `GET /api/v1/categories` - Job categories
- `GET /api/v1/tags` - Job tags
- `GET /api/v1/sitemaps` - Sitemap data

**Authentication**: Bearer token (stored in Supabase `admin_settings.cms_token`)

**Filtering Capabilities**:
- Employment type, experience level, education level
- Salary range (min/max/currency/period/negotiable)
- Location (province, regency, district, village)
- Work policy (remote, hybrid, onsite)
- Skills and benefits
- Deadline filters
- Search and pagination

### 3.4 CMS Integration Points

**Frontend Integration**:
- `lib/services/JobService.ts` - Job data fetching
- `lib/services/ArticleService.ts` - Article data fetching
- `lib/services/CategoryService.ts` - Category data fetching

**API Routes**:
- `/api/cms/test-connection` - Tests CMS connectivity
- `/api/admin/dashboard-stats` - Fetches stats from CMS

**Settings Storage**:
- CMS endpoint: `admin_settings.cms_endpoint`
- CMS token: `admin_settings.cms_token`
- CMS timeout: `admin_settings.cms_timeout`

---

## 4. Supabase Integration & Settings Storage

### 4.1 Supabase Database Schema

**Main Tables**:

#### `admin_settings` Table
Stores all admin-configurable settings:
- **CMS Configuration**: `cms_endpoint`, `cms_token`, `cms_timeout`
- **Site Settings**: `site_title`, `site_tagline`, `site_description`, `site_url`
- **SEO Templates**: `location_page_title_template`, `category_page_title_template`, etc.
- **Archive Page SEO**: `jobs_title`, `jobs_description`, `articles_title`, `articles_description`
- **Auth Page SEO**: `login_page_title`, `signup_page_title`, `profile_page_title`, etc.
- **OG Images**: `home_og_image`, `jobs_og_image`, `articles_og_image`, `default_job_og_image`, `default_article_og_image`
- **Advertisement**: `popup_ad_enabled`, `popup_ad_url`, `popup_ad_device`, `sidebar_archive_ad_code`, etc.
- **Robots.txt**: `robots_txt`
- **Analytics**: `ga_id`, `gtm_id`
- **Storage**: `supabase_storage_endpoint`, `supabase_storage_region`, `supabase_storage_access_key`, `supabase_storage_secret_key`
- **Sitemap**: `sitemap_update_interval`, `auto_generate_sitemap`, `last_sitemap_update`

#### `profiles` Table
User account information:
- `id` (UUID, PK)
- `email` (text)
- `full_name` (text, optional)
- `role` ('user' | 'super_admin')
- `created_at`, `updated_at` (timestamps)

#### Other Tables
- `user_bookmarks` - Saved jobs
- `nxdb_articles` - Article content
- `nxdb_article_categories` - Article categories
- `popup_templates` - Popup content templates

### 4.2 Settings Management Flow

**Current Flow**:
1. Admin panel fetches settings from Supabase via `SupabaseAdminService.getSettings()`
2. Settings are cached for 2 minutes
3. Admin updates settings via UI
4. Changes saved to Supabase via `SupabaseAdminService.saveSettings()`
5. Cache is cleared
6. Frontend fetches fresh settings on next request

**API Routes**:
- `GET /api/admin/settings/` - Fetch settings (requires super admin or API token)
- `PUT /api/admin/settings/` - Update settings (requires super admin or API token)
- `GET /api/public/settings/` - Fetch public-safe settings (no auth required)

### 4.3 Settings Hierarchy

**Priority Order** (highest to lowest):
1. Supabase `admin_settings` table (admin-editable)
2. `.env` environment variables (infrastructure)
3. Hardcoded defaults in `SupabaseAdminService.defaultSettings`

**Current Issues**:
- Some defaults are hardcoded instead of using `.env`
- Storage credentials duplicated in both `.env` and Supabase
- No clear separation between infrastructure settings (`.env`) and content settings (Supabase)

---

## 5. Key Configuration Files & Settings Management

### 5.1 Configuration Files

**File**: `lib/env.ts`
- Centralizes environment variable access
- Provides validation and type safety
- Exports `env` object with all configuration

**File**: `lib/supabase.ts`
- Supabase client initialization
- Database type definitions
- Auth state management

**File**: `lib/supabase/admin.ts`
- Admin service with settings management
- Default settings definition
- Caching logic

**File**: `next.config.js`
- Image optimization (remote patterns)
- Security headers
- URL rewrites and redirects
- Trailing slash configuration

### 5.2 Settings Management Patterns

**Pattern 1: Environment Variables** (Infrastructure)
- Used for: Supabase credentials, CMS timeout, analytics IDs, feature flags
- Scope: Application-wide, set at deployment time
- Editable: No (requires redeployment)

**Pattern 2: Supabase Database** (Content & Configuration)
- Used for: SEO settings, ad codes, site metadata, CMS credentials
- Scope: Per-instance, editable at runtime
- Editable: Yes (via admin panel)

**Pattern 3: Hardcoded Defaults** (Fallback)
- Used for: Default SEO templates, default robots.txt
- Scope: Application-wide
- Editable: No (requires code change)

### 5.3 Default Settings Definition

**Location**: `lib/supabase/admin.ts` (lines 8-100+)

**Hardcoded Defaults Include**:
- SEO templates with `{{lokasi}}` and `{{kategori}}` placeholders
- Default robots.txt with admin/bookmarks disallow rules
- Default OG image URLs using `env.SITE_URL`
- Default advertisement settings (all disabled)
- Default sitemap settings

**Issues**:
- Defaults are duplicated in both instance method and static method
- Some defaults reference `.env` variables, creating coupling
- No way to override defaults without code change

---

## 6. API Routes Related to Admin Functionality

### 6.1 Admin API Routes

**Route**: `/api/admin/dashboard-stats/`
- **Method**: GET
- **Auth**: Requires super admin role
- **Returns**: `{ totalUsers, totalJobs, totalArticles, totalBookmarks }`
- **Implementation**: Queries Supabase profiles, bookmarks, and CMS for stats

**Route**: `/api/admin/settings/`
- **Method**: GET, POST, PUT
- **Auth**: Requires API token or super admin session
- **GET**: Fetches current settings from Supabase
- **POST/PUT**: Updates settings in Supabase
- **Validation**: Checks for API token or Supabase session with super admin role

**Route**: `/api/admin/force-sitemap-update/`
- **Method**: POST (inferred from directory)
- **Auth**: Requires super admin role
- **Purpose**: Manually trigger sitemap generation

### 6.2 Settings API Routes

**Route**: `/api/settings/`
- **Status**: DEPRECATED
- **Redirect**: Points to `/api/public/settings/` for security

**Route**: `/api/public/settings/`
- **Method**: GET
- **Auth**: None required
- **Returns**: Public-safe settings only (no sensitive data)
- **Caching**: 5-minute TTL

### 6.3 CMS Integration Routes

**Route**: `/api/cms/test-connection/`
- **Method**: GET
- **Auth**: None required
- **Returns**: `{ success, data: { connection, filters } }`
- **Purpose**: Tests CMS API connectivity and filter data availability

### 6.4 Authentication & Authorization

**Authentication Methods**:
1. **API Token** (for external/automated access)
   - Header: `Authorization: Bearer <API_TOKEN>`
   - Stored in `.env` as `API_TOKEN`
   - Timing-safe comparison to prevent timing attacks

2. **Supabase Session** (for admin panel)
   - Session token from Supabase Auth
   - Verified against `profiles.role === 'super_admin'`
   - Cached for 5 seconds to reduce database queries

**Authorization Checks**:
- All admin routes check for super admin role
- Settings API requires either API token or super admin session
- Public settings API has no auth requirement

---

## 7. Hardcoded Values That Could Be Moved

### 7.1 To `.env` (Infrastructure Settings)

**Current Hardcoded Values**:
1. **CMS Endpoint**: `'https://cms.nexjob.tech'` (in `lib/env.ts` and `admin.ts`)
   - Should be: `NEXT_PUBLIC_CMS_ENDPOINT` in `.env`
   - Reason: Infrastructure configuration, not content

2. **Supabase Storage Endpoint**: `'https://uzlzyosmbxgghhmafidk.supabase.co/storage/v1/s3'`
   - Should be: `SUPABASE_STORAGE_ENDPOINT` in `.env` (already there, but also hardcoded)
   - Reason: Infrastructure configuration

3. **Supabase Storage Region**: `'ap-southeast-1'`
   - Should be: `SUPABASE_STORAGE_REGION` in `.env` (already there, but also hardcoded)
   - Reason: Infrastructure configuration

4. **Storage Credentials**: Access key and secret key
   - Currently: In `.env` and duplicated in Supabase
   - Should be: Only in `.env` (remove from Supabase)
   - Reason: Security - credentials should not be in database

5. **API Timeout**: `10000` (10 seconds)
   - Currently: In `.env` as `CMS_TIMEOUT`
   - Also: In Supabase as `cms_timeout`
   - Should be: Only in `.env`
   - Reason: Infrastructure setting, not content

6. **Site URL**: `env.SITE_URL`
   - Currently: In `.env` as `NEXT_PUBLIC_SITE_URL`
   - Also: In Supabase as `site_url`
   - Should be: Only in `.env`
   - Reason: Infrastructure setting, not content

### 7.2 To CMS Backend (Content Settings)

**Settings That Should Move to CMS**:
1. **SEO Settings**
   - Site title, tagline, description
   - Page title templates
   - Archive page titles/descriptions
   - OG images
   - Reason: Content management, not infrastructure

2. **Advertisement Settings**
   - Popup ad configuration
   - Ad codes for different page sections
   - Reason: Marketing content, managed by marketing team

3. **Analytics Configuration**
   - GA ID, GTM ID
   - Reason: Analytics configuration, not infrastructure

4. **Robots.txt**
   - Reason: SEO configuration, managed by SEO team

**Benefits of Moving to CMS**:
- Centralized content management
- No need to redeploy frontend for content changes
- Better separation of concerns
- CMS team can manage without frontend knowledge

### 7.3 Recommended Migration Plan

**Phase 1: Consolidate Infrastructure Settings**
1. Move all hardcoded infrastructure values to `.env`
2. Remove duplicates from Supabase
3. Remove hardcoded defaults from code

**Phase 2: Move Content to CMS**
1. Create CMS endpoints for SEO settings
2. Create CMS endpoints for advertisement settings
3. Create CMS endpoints for analytics configuration
4. Update frontend to fetch from CMS instead of Supabase

**Phase 3: Simplify Supabase**
1. Keep only user data and bookmarks in Supabase
2. Move all settings to CMS
3. Reduce Supabase schema complexity

---

## 8. Architecture Patterns & Dependencies

### 8.1 Service Layer Architecture

**Pattern**: Service-based architecture with dependency injection

**Services**:
- `JobService` - Job data fetching and filtering
- `ArticleService` - Article data fetching
- `CategoryService` - Category data fetching
- `SupabaseAdminService` - Admin settings management
- `AdminSettingsApiService` - Admin settings API client
- `PublicSettingsApiService` - Public settings API client

**Dependency Flow**:
```
Components
    ↓
API Routes / Services
    ↓
CMS Provider / Supabase Client
    ↓
External APIs (TugasCMS, Supabase)
```

### 8.2 Caching Strategy

**Multi-Level Caching**:
1. **API Response Caching** (CMS)
   - 1-hour cache for job/article data
   - Automatic invalidation on content update

2. **Settings Caching** (Admin Service)
   - 2-minute cache for admin settings
   - 5-minute cache for public settings
   - Manual cache clear on save

3. **Auth State Caching**
   - 5-second cache for auth state
   - Prevents excessive database queries

4. **Filter Data Caching**
   - Cached at service level
   - Cleared on demand

### 8.3 Error Handling & Resilience

**Patterns**:
- Timeout handling (10-15 second timeouts on API calls)
- Retry logic with exponential backoff
- Fallback to defaults on error
- Graceful degradation

**Example** (from `admin.ts`):
```typescript
// Retry logic with exponential backoff
if (this.authRetryCount < this.MAX_AUTH_RETRIES) {
  this.authRetryCount++;
  await new Promise(resolve => 
    setTimeout(resolve, Math.pow(2, this.authRetryCount) * 1000)
  );
  return this.getCurrentProfile();
}
```

### 8.4 Security Considerations

**Current Security Measures**:
1. **Role-Based Access Control** - Super admin only for admin panel
2. **API Token Authentication** - Timing-safe comparison
3. **Session Validation** - Supabase session verification
4. **SEO Protection** - noindex/nofollow on admin routes
5. **HTTPS Only** - All external URLs use HTTPS
6. **Secure Headers** - Implemented in `next.config.js`

**Potential Improvements**:
1. Rate limiting on admin API endpoints
2. Audit logging for settings changes
3. Two-factor authentication for admin accounts
4. IP whitelisting for admin access
5. Encryption for sensitive settings in database

---

## 9. Current State Summary

### 9.1 What's Working Well

✅ **Admin Panel**
- Fully functional with all major features
- Clean UI with responsive design
- Proper role-based access control
- Good separation of concerns

✅ **CMS Integration**
- Flexible factory pattern for provider switching
- Comprehensive filtering and search
- Proper pagination support
- Connection testing capability

✅ **Settings Management**
- Multi-level caching for performance
- Proper validation and error handling
- Fallback to defaults on error
- Clear separation of admin vs. public settings

✅ **API Architecture**
- RESTful design
- Proper authentication and authorization
- Good error handling
- Extensible design

### 9.2 Areas for Improvement

⚠️ **Configuration Management**
- Hardcoded values scattered across codebase
- Duplicated settings in `.env` and Supabase
- No clear separation between infrastructure and content settings
- Defaults duplicated in multiple places

⚠️ **Settings Storage**
- Too many settings in Supabase that should be in `.env`
- Storage credentials duplicated
- No audit trail for settings changes
- No settings versioning or rollback

⚠️ **CMS Integration**
- CMS credentials stored in Supabase (should be in `.env`)
- Limited to single CMS provider (TugasCMS)
- No fallback mechanism if CMS is down
- No caching strategy for filter data

⚠️ **Admin Functionality**
- No activity logging or audit trail
- No settings preview before saving
- No bulk user management
- Limited user role options (only user/super_admin)

### 9.3 Recommended Next Steps

**Short Term (1-2 weeks)**:
1. Move all hardcoded infrastructure values to `.env`
2. Remove duplicate settings from Supabase
3. Add audit logging for settings changes
4. Implement rate limiting on admin API endpoints

**Medium Term (1-2 months)**:
1. Create CMS endpoints for content settings
2. Migrate SEO settings to CMS
3. Migrate advertisement settings to CMS
4. Implement settings versioning and rollback

**Long Term (2-3 months)**:
1. Simplify Supabase schema (remove settings table)
2. Implement advanced admin features (activity logging, approvals)
3. Add support for multiple CMS providers
4. Implement comprehensive audit trail

---

## 10. File Reference Guide

### Core Admin Files
- `app/backend/admin/` - Admin panel pages
- `components/admin/` - Admin UI components
- `lib/supabase/admin.ts` - Admin service layer
- `app/api/admin/` - Admin API routes

### Configuration Files
- `lib/env.ts` - Environment variable management
- `lib/supabase.ts` - Supabase client setup
- `.env.example` - Environment variable template
- `next.config.js` - Next.js configuration

### CMS Integration
- `lib/cms/factory.ts` - CMS provider factory
- `lib/cms/interface.ts` - CMS provider interface
- `lib/cms/providers/tugascms.ts` - TugasCMS implementation
- `lib/services/JobService.ts` - Job data service
- `lib/services/ArticleService.ts` - Article data service

### API Routes
- `app/api/admin/` - Admin API endpoints
- `app/api/settings/` - Settings API (deprecated)
- `app/api/public/settings/` - Public settings API
- `app/api/cms/` - CMS integration endpoints

### Documentation
- `docs/BACKEND_ADMIN_DOCUMENTATION.md` - Admin panel documentation
- `API_Documentation.md` - CMS API documentation
- `Supabase.md` - Database schema documentation

---

## Conclusion

The Nexjob project has a well-structured backend admin system with clear separation of concerns and good architectural patterns. The main opportunities for improvement are:

1. **Consolidating configuration** - Move hardcoded values to `.env`
2. **Centralizing content management** - Move content settings to CMS backend
3. **Improving security** - Add audit logging and rate limiting
4. **Enhancing admin features** - Add activity logging, approvals, versioning

The current architecture provides a solid foundation for these improvements and can be extended without major refactoring.
