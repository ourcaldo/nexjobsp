# Nexjob Architecture - Visual Diagrams & Quick Reference

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXJOB SYSTEM ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  Public Pages       │  │  Admin Panel     │  │  Auth Pages  │   │
│  │  - Job Listings     │  │  - Dashboard     │  │  - Login     │   │
│  │  - Articles         │  │  - SEO Settings  │  │  - Signup    │   │
│  │  - Job Details      │  │  - Ads Settings  │  │  - Profile   │   │
│  │  - Bookmarks        │  │  - User Mgmt     │  │              │   │
│  └─────────────────────┘  └──────────────────┘  └──────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│                          API LAYER (Next.js)                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Admin API Routes    │  │  Public API      │  │  CMS Routes  │  │
│  │  - /api/admin/       │  │  - /api/public/  │  │  - /api/cms/ │  │
│  │  - Settings CRUD     │  │  - Settings      │  │  - Test Conn │  │
│  │  - Dashboard Stats   │  │  - Public Data   │  │              │  │
│  │  - Sitemap Update    │  │                  │  │              │  │
│  └──────────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Business Logic)                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  SupabaseAdminSvc    │  │  JobService      │  │  ArticleSvc  │  │
│  │  - Settings CRUD     │  │  - Get Jobs      │  │  - Get Artic │  │
│  │  - Auth Check        │  │  - Filter Jobs   │  │  - Get Categ │  │
│  │  - Caching           │  │  - Pagination    │  │  - Search    │  │
│  │  - Defaults          │  │  - Caching       │  │              │  │
│  └──────────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────┐                    │
│  │  CategoryService     │  │  CMSProvider     │                    │
│  │  - Get Categories    │  │  (Factory)       │                    │
│  │  - Get Tags          │  │  - TugasCMS      │                    │
│  │  - Caching           │  │  - Extensible    │                    │
│  └──────────────────────┘  └──────────────────┘                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Persistence)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Supabase Database   │  │  TugasCMS API    │  │  Environment │  │
│  │  - admin_settings    │  │  - Job Posts     │  │  Variables   │  │
│  │  - profiles          │  │  - Articles      │  │  - .env file │  │
│  │  - user_bookmarks    │  │  - Categories    │  │              │  │
│  │  - audit_logs        │  │  - Tags          │  │              │  │
│  └──────────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Settings Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SETTINGS MANAGEMENT FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

READING SETTINGS:
─────────────────

Admin Panel
    ↓
SupabaseAdminService.getSettings()
    ↓
Check Cache (2-min TTL)
    ├─ HIT → Return cached settings
    └─ MISS → Query Supabase
         ↓
    admin_settings table
         ↓
    Cache result
         ↓
    Return to Admin Panel


WRITING SETTINGS:
─────────────────

Admin Panel (User submits form)
    ↓
/api/admin/settings/ (PUT)
    ↓
Authenticate (API token or super admin session)
    ↓
Validate settings (Zod schema)
    ↓
SupabaseAdminService.saveSettings()
    ├─ Check if settings exist
    ├─ Update or Insert
    ├─ Log to audit_logs table
    ├─ Create version entry
    └─ Clear cache
         ↓
    Return success response
         ↓
Admin Panel (Show success message)


FALLBACK CHAIN:
───────────────

Request for Settings
    ↓
1. Check Supabase admin_settings table
    ├─ Found → Use it
    └─ Not found → Continue
         ↓
2. Check .env environment variables
    ├─ Found → Use it
    └─ Not found → Continue
         ↓
3. Use hardcoded defaults
    └─ Return default value
```

---

## 3. Admin Panel Access Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL ACCESS CONTROL                       │
└─────────────────────────────────────────────────────────────────────┘

User visits /backend/admin/
    ↓
Check Authentication
    ├─ Not authenticated
    │   └─ Redirect to /login/
    │
    └─ Authenticated
         ↓
    Check Role
         ├─ role = 'user'
         │   └─ Redirect to /login/ (Unauthorized)
         │
         └─ role = 'super_admin'
              ↓
         Load Admin Panel
              ├─ Dashboard
              ├─ SEO Settings
              ├─ Advertisement Settings
              ├─ Robots.txt Management
              ├─ Integration Settings
              ├─ System Settings
              └─ User Management


API ENDPOINT ACCESS:
────────────────────

Request to /api/admin/settings/
    ↓
Check Authorization Header
    ├─ Bearer <API_TOKEN>
    │   └─ Compare with process.env.API_TOKEN (timing-safe)
    │       ├─ Match → Allow
    │       └─ No match → Continue
    │
    └─ Bearer <SESSION_TOKEN>
         ├─ Verify with Supabase
         ├─ Check user role
         │   ├─ super_admin → Allow
         │   └─ user → Deny (401)
         └─ Invalid token → Deny (401)
```

---

## 4. CMS Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CMS INTEGRATION ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────┘

Frontend Components
    ↓
Service Layer (JobService, ArticleService, etc.)
    ↓
CMS Factory Pattern
    ├─ getCMSProvider()
    └─ Returns CMSProvider instance
         ↓
    TugasCMSProvider (Current Implementation)
         ├─ Implements CMSProvider interface
         ├─ Handles API calls to TugasCMS
         ├─ Transforms responses
         └─ Manages caching
              ↓
         TugasCMS API (https://cms.nexjob.tech/api/v1)
              ├─ GET /job-posts
              ├─ GET /posts (articles)
              ├─ GET /categories
              ├─ GET /tags
              ├─ GET /filters
              └─ GET /sitemaps


CONFIGURATION:
───────────────

Environment Variables (.env)
    ├─ NEXT_PUBLIC_CMS_ENDPOINT = https://cms.nexjob.tech
    ├─ CMS_TOKEN = <api-token>
    └─ CMS_TIMEOUT = 10000

Supabase admin_settings
    ├─ cms_endpoint (can override .env)
    ├─ cms_token (can override .env)
    └─ cms_timeout (can override .env)

Priority: Supabase > .env > Hardcoded defaults


CACHING STRATEGY:
─────────────────

CMS API Response
    ↓
Cache (1 hour TTL)
    ├─ Subsequent requests within 1 hour
    │   └─ Return cached response
    │
    └─ After 1 hour or manual clear
         └─ Fetch fresh from CMS


ERROR HANDLING:
────────────────

CMS API Call
    ├─ Success (200)
    │   └─ Return data
    │
    ├─ Timeout (>10s)
    │   └─ Return cached data or error
    │
    ├─ Connection Error
    │   └─ Return cached data or empty array
    │
    └─ Auth Error (401)
         └─ Log error, return empty array
```

---

## 5. Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│    profiles          │
├──────────────────────┤
│ id (PK)              │
│ email                │
│ full_name            │
│ role                 │ ──┐
│ created_at           │   │
│ updated_at           │   │
└──────────────────────┘   │
         ↑                 │
         │                 │
         │                 │
    ┌────┴──────────────────────────┐
    │                               │
    │                               ↓
┌──────────────────────┐  ┌──────────────────────┐
│  user_bookmarks      │  │ admin_settings_audit │
├──────────────────────┤  ├──────────────────────┤
│ id (PK)              │  │ id (PK)              │
│ user_id (FK)         │  │ admin_id (FK)        │
│ job_id               │  │ setting_key          │
│ created_at           │  │ old_value            │
└──────────────────────┘  │ new_value            │
                          │ changed_at           │
                          │ ip_address           │
                          │ user_agent           │
                          └──────────────────────┘

┌──────────────────────┐
│  admin_settings      │
├──────────────────────┤
│ id (PK)              │
│ site_title           │
│ site_description     │
│ cms_endpoint         │
│ cms_token            │
│ cms_timeout          │
│ ga_id                │
│ gtm_id               │
│ robots_txt           │
│ popup_ad_enabled     │
│ popup_ad_url         │
│ ... (40+ columns)    │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│ admin_settings_      │
│ versions             │
├──────────────────────┤
│ id (PK)              │
│ version_number       │
│ settings (JSONB)     │
│ created_by (FK)      │
│ created_at           │
│ description          │
│ is_active            │
└──────────────────────┘

┌──────────────────────┐
│ popup_templates      │
├──────────────────────┤
│ id (PK)              │
│ template_key         │
│ title                │
│ content              │
│ button_text          │
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

---

## 6. Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TYPICAL REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

SCENARIO: Admin updates SEO settings

1. User Action
   └─ Admin fills form and clicks "Save"

2. Frontend
   └─ POST /api/admin/settings/
      └─ Body: { site_title: "New Title", ... }
      └─ Headers: { Authorization: "Bearer <token>" }

3. API Route (/api/admin/settings/route.ts)
   ├─ Parse request body
   ├─ Extract authorization header
   ├─ Call checkAuthentication()
   │   ├─ Check API token (timing-safe compare)
   │   └─ OR verify Supabase session + super admin role
   ├─ Validate settings (Zod schema)
   └─ Call SupabaseAdminService.saveSettings()

4. Service Layer (SupabaseAdminService)
   ├─ Get current settings from Supabase
   ├─ Merge with new settings
   ├─ Update admin_settings table
   ├─ Insert audit log entry
   ├─ Create version entry
   ├─ Clear cache
   └─ Return success response

5. Database (Supabase)
   ├─ UPDATE admin_settings SET ...
   ├─ INSERT INTO admin_settings_audit ...
   ├─ INSERT INTO admin_settings_versions ...
   └─ Return updated record

6. API Response
   └─ 200 OK
      └─ Body: { success: true, data: { ... } }

7. Frontend
   ├─ Show success message
   ├─ Refresh settings
   └─ Update UI


SCENARIO: Frontend fetches job listings

1. User Action
   └─ User visits /lowongan-kerja/

2. Frontend Component
   └─ Call JobService.getJobs()

3. Service Layer (JobService)
   ├─ Check cache (1 hour TTL)
   │   ├─ HIT → Return cached jobs
   │   └─ MISS → Continue
   ├─ Get CMS provider via factory
   ├─ Call provider.getJobs()
   └─ Cache result

4. CMS Provider (TugasCMSProvider)
   ├─ Get CMS endpoint from admin_settings
   ├─ Get CMS token from admin_settings
   ├─ Build API URL with filters
   ├─ Make HTTP request to TugasCMS
   └─ Transform response

5. External API (TugasCMS)
   ├─ GET https://cms.nexjob.tech/api/v1/job-posts
   │   └─ Headers: { Authorization: "Bearer <token>" }
   ├─ Query database
   └─ Return paginated results

6. Response Chain
   ├─ TugasCMS → CMS Provider
   ├─ CMS Provider → JobService
   ├─ JobService → Frontend Component
   └─ Frontend Component → Render UI
```

---

## 7. Configuration Priority Matrix

```
┌─────────────────────────────────────────────────────────────────────┐
│              CONFIGURATION SOURCE PRIORITY                          │
└─────────────────────────────────────────────────────────────────────┘

SETTING TYPE                    PRIORITY ORDER
─────────────────────────────────────────────────────────────────────

Infrastructure Settings:
  - Supabase URL                1. .env
  - Supabase Keys               2. Hardcoded (fallback)
  - CMS Endpoint                1. .env
  - CMS Timeout                 2. .env
  - Storage Credentials         1. .env
  - Analytics IDs               1. .env

Content Settings:
  - Site Title                  1. Supabase admin_settings
  - Site Description            2. .env
  - SEO Templates               3. Hardcoded defaults
  - OG Images                   1. Supabase admin_settings
  - Ad Codes                    1. Supabase admin_settings
  - Robots.txt                  1. Supabase admin_settings

Feature Flags:
  - Feature Toggles             1. .env
  - Cache TTLs                  2. .env
  - Timeouts                    3. Hardcoded


RECOMMENDED MIGRATION:
──────────────────────

Current State:
  Infrastructure → .env + Supabase + Hardcoded
  Content → Supabase + Hardcoded

Target State:
  Infrastructure → .env only
  Content → CMS backend (or Supabase if CMS not available)
  Defaults → Hardcoded (fallback only)
```

---

## 8. Quick Reference: File Locations

```
┌─────────────────────────────────────────────────────────────────────┐
│                    QUICK FILE REFERENCE                             │
└─────────────────────────────────────────────────────────────────────┘

ADMIN PANEL:
  Pages:           app/backend/admin/
  Components:      components/admin/
  Service:         lib/supabase/admin.ts
  API Routes:      app/api/admin/

CONFIGURATION:
  Environment:     lib/env.ts
  Supabase Setup:  lib/supabase.ts
  Next.js Config:  next.config.js
  Env Template:    .env.example

CMS INTEGRATION:
  Factory:         lib/cms/factory.ts
  Interface:       lib/cms/interface.ts
  Provider:        lib/cms/providers/tugascms.ts
  Services:        lib/services/

API ROUTES:
  Admin:           app/api/admin/
  Settings:        app/api/settings/ (deprecated)
  Public:          app/api/public/settings/
  CMS:             app/api/cms/

DOCUMENTATION:
  Admin Docs:      docs/BACKEND_ADMIN_DOCUMENTATION.md
  API Docs:        API_Documentation.md
  DB Schema:       Supabase.md
  This Analysis:   ARCHITECTURE_ANALYSIS.md
  Recommendations: RECOMMENDATIONS_AND_ROADMAP.md
  Diagrams:        ARCHITECTURE_DIAGRAMS.md


KEY ENVIRONMENT VARIABLES:
──────────────────────────

NEXT_PUBLIC_SUPABASE_URL          Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY         Supabase service role key
NEXT_PUBLIC_CMS_ENDPOINT          CMS API base URL
CMS_TOKEN                         CMS API authentication token
CMS_TIMEOUT                       CMS API timeout (ms)
NEXT_PUBLIC_SITE_URL              Public site URL
NEXT_PUBLIC_GA_ID                 Google Analytics ID
NEXT_PUBLIC_GTM_ID                Google Tag Manager ID
API_TOKEN                         Admin API authentication token
SUPABASE_STORAGE_*                Storage configuration


KEY SUPABASE TABLES:
────────────────────

admin_settings                     All admin-configurable settings
profiles                          User accounts and roles
user_bookmarks                    Saved jobs
admin_settings_audit              Settings change history
admin_settings_versions           Settings version history
popup_templates                   Popup content templates


KEY API ENDPOINTS:
──────────────────

GET  /api/admin/settings/         Fetch admin settings
PUT  /api/admin/settings/         Update admin settings
GET  /api/admin/dashboard-stats/  Dashboard statistics
GET  /api/public/settings/        Public settings (no auth)
GET  /api/cms/test-connection/    Test CMS connectivity
```

---

## 9. Deployment Checklist

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT CHECKLIST                             │
└─────────────────────────────────────────────────────────────────────┘

PRE-DEPLOYMENT:
  ☐ All environment variables set in .env
  ☐ Supabase database migrations applied
  ☐ CMS API token configured
  ☐ Storage credentials configured
  ☐ Analytics IDs configured
  ☐ Build succeeds: npm run build
  ☐ No TypeScript errors
  ☐ No ESLint warnings

DEPLOYMENT:
  ☐ Deploy to production
  ☐ Verify environment variables loaded
  ☐ Test admin panel access
  ☐ Test settings save/load
  ☐ Test CMS connection
  ☐ Verify cache working
  ☐ Check logs for errors

POST-DEPLOYMENT:
  ☐ Monitor error logs
  ☐ Test all admin features
  ☐ Verify settings persisted
  ☐ Check performance metrics
  ☐ Verify backups running
  ☐ Document any issues
  ☐ Update runbooks if needed


ROLLBACK PROCEDURE:
  1. Identify issue
  2. Check admin_settings_versions table
  3. Find last known good version
  4. Call /api/admin/settings/rollback/{version}
  5. Verify settings restored
  6. Monitor for issues
```

---

## 10. Troubleshooting Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING GUIDE                            │
└─────────────────────────────────────────────────────────────────────┘

ISSUE: Admin panel shows "Unauthorized"
SOLUTION:
  1. Check user role: SELECT role FROM profiles WHERE id = '<user-id>'
  2. Verify role is 'super_admin'
  3. Check session token validity
  4. Clear browser cache and cookies
  5. Try logging out and back in

ISSUE: Settings not saving
SOLUTION:
  1. Check API response status code
  2. Verify authentication header present
  3. Check Supabase connection
  4. Verify admin_settings table exists
  5. Check database permissions
  6. Review error logs

ISSUE: CMS connection failing
SOLUTION:
  1. Verify CMS_ENDPOINT is correct
  2. Verify CMS_TOKEN is valid
  3. Check CMS is running and accessible
  4. Verify network connectivity
  5. Check CMS timeout setting
  6. Review CMS logs

ISSUE: Settings not loading
SOLUTION:
  1. Check cache TTL (should be 2 minutes)
  2. Clear cache: DELETE FROM cache WHERE key = 'admin-settings'
  3. Verify Supabase connection
  4. Check admin_settings table has data
  5. Verify default settings in code

ISSUE: Performance degradation
SOLUTION:
  1. Check cache hit rate
  2. Monitor database query times
  3. Check CMS API response times
  4. Review error logs for timeouts
  5. Consider increasing cache TTL
  6. Check database indexes

ISSUE: Audit logs not recording
SOLUTION:
  1. Verify admin_settings_audit table exists
  2. Check database permissions
  3. Verify audit logging code is enabled
  4. Check for database errors in logs
  5. Verify user ID is being captured
```

---

## Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Flexible configuration management
- ✅ Extensible CMS integration
- ✅ Proper authentication and authorization
- ✅ Caching for performance
- ✅ Error handling and resilience

The diagrams and quick references above should help with understanding, debugging, and extending the system.
