# Backend Admin Panel Documentation

## Overview

The `/backend/admin/` directory is the **administrative dashboard** for the Nexjob job portal platform. It provides super admin users with centralized access to manage system settings, SEO configurations, advertisements, integrations, user accounts, and other critical platform operations.

**Location**: `app/backend/admin/`
**Route Prefix**: `/backend/admin/`
**Access Level**: Super Admin only (role-based access control via Supabase Auth)
**SEO Protection**: All routes include `noindex`, `nofollow`, `nocache` meta tags to prevent indexing

---

## Architecture & Structure

### Directory Structure
```
app/backend/admin/
├── layout.tsx                    # Root layout with SEO metadata
├── AdminLayoutWrapper.tsx        # Client-side layout wrapper with route detection
├── page.tsx                      # Dashboard page (index route)
├── advertisement/
│   └── page.tsx                 # Advertisement settings page
├── integration/
│   └── page.tsx                 # Integration settings page
├── seo/
│   └── page.tsx                 # SEO settings page
├── sitemap/
│   └── page.tsx                 # Robots.txt management page
├── system/
│   └── page.tsx                 # System settings page
└── users/
    └── page.tsx                 # User management page

components/admin/
├── AdminLayout.tsx              # Main layout component with sidebar navigation
├── Dashboard.tsx                # Dashboard statistics and system status
├── SEOSettings.tsx              # SEO configuration component
├── AdvertisementSettings.tsx    # Advertisement management component
├── SitemapManagement.tsx        # Robots.txt configuration component
├── IntegrationSettings.tsx      # Integration settings component
├── SystemSettings.tsx           # General system settings component
└── UserManagement.tsx           # User account management component
```

### Layout & Navigation

**AdminLayout.tsx** is the main layout component providing:
- **Responsive Sidebar Navigation** with icons for each section
- **Mobile Menu** with collapsible sidebar (toggles on mobile devices)
- **Sidebar Collapse/Expand** toggle for desktop users
- **User Profile Section** showing logged-in admin details
- **Logout Button** for signing out

**Navigation Menu Items**:
1. Dashboard - `/backend/admin/`
2. SEO Settings - `/backend/admin/seo`
3. Advertisement - `/backend/admin/advertisement`
4. Robots.txt - `/backend/admin/sitemap`
5. Integration - `/backend/admin/integration`
6. User Management - `/backend/admin/users`
7. System Settings - `/backend/admin/system`

---

## Core Components & Features

### 1. Dashboard (`/backend/admin/`)

**File**: `components/admin/Dashboard.tsx`

**Purpose**: Overview of system health, statistics, and quick actions

**Features**:
- **Stats Cards**: Display key metrics
  - Total Users (registered user accounts)
  - Active Jobs (published job listings)
  - Published Articles (published articles/blog posts)
  - Total Bookmarks (bookmarked jobs by users)

- **System Status Panel**: Shows connectivity status
  - WordPress API Connection (TugasCMS connection status)
  - Supabase Database Connection
  - Last Sitemap Update timestamp

- **Recent Activity Section**: (Future enhancement)
  - Activity logging and audit trail display
  - Currently shows placeholder "Activity logging coming soon"

- **Quick Actions**: Shortcuts to common operations
  - Update WordPress Settings
  - Generate Sitemap
  - Manage Users

**Data Sources**:
- `/api/admin/dashboard-stats` - Retrieves user, job, article, and bookmark counts
- `/api/cms/test-connection` - Tests WordPress/TugasCMS connectivity
- `supabaseAdminService.getSettings()` - Fetches last sitemap update time

---

### 2. SEO Settings (`/backend/admin/seo`)

**File**: `components/admin/SEOSettings.tsx`

**Purpose**: Configure SEO metadata and templates for all pages

**Settings Sections**:

#### A. General SEO Settings
- **Site Title**: Main title for the website (e.g., "Nexjob")
- **Site Tagline**: Subtitle/tagline (e.g., "Find Your Dream Job")
- **Site Description**: Meta description (e.g., "Platform pencarian kerja terpercaya di Indonesia")

#### B. Dynamic Page Templates
Uses template variables: `{{lokasi}}`, `{{kategori}}`, `{{site_title}}`

- **Location Page Title Template**: Title for location-based job listing pages
  - Example: `Lowongan Kerja di {{lokasi}} - {{site_title}}`
- **Location Page Description Template**: Meta description for location pages
  - Example: `Temukan lowongan kerja terbaru di {{lokasi}}...`
- **Category Page Title Template**: Title for category-based pages
  - Example: `Lowongan Kerja {{kategori}} - {{site_title}}`
- **Category Page Description Template**: Meta description for category pages
  - Example: `Temukan lowongan kerja {{kategori}} terbaru...`

#### C. Archive Pages SEO
Configurations for main index pages:

- **Jobs Page**:
  - Jobs Page Title
  - Jobs Page Description

- **Articles Page**:
  - Articles Page Title
  - Articles Page Description

- **Auth Pages**: (Optional future expansion)
  - Login Page Title & Description
  - Signup Page Title & Description
  - Profile Page Title & Description

#### D. Open Graph (OG) Images
For social media sharing metadata:

- **Home Page OG Image**: URL to image for homepage social shares
- **Jobs Page OG Image**: URL to image for job listing page
- **Articles Page OG Image**: URL to image for article page
- **Default Job OG Image**: Fallback image for individual job posts
- **Default Article OG Image**: Fallback image for individual articles

Image preview is displayed when URL is entered.

**Data Storage**: Settings saved to Supabase `settings` table via `supabaseAdminService.saveSettings()`

---

### 3. Advertisement Settings (`/backend/admin/advertisement`)

**File**: `components/admin/AdvertisementSettings.tsx`

**Purpose**: Configure advertisement codes and popup ads across the platform

**Features**:

#### A. Popup Advertisement Settings
- **Enable/Disable Toggle**: Turn popup ads on/off
- **Popup URL**: URL to open in new tab on click (click-anywhere popup)
- **Load Settings**: Choose which pages trigger popup
  - All Pages
  - Single Articles Only
- **Max Executions per Page**: Maximum number of popups per page visit (1-10)
- **Target Device**: Which devices show the popup
  - All Devices
  - Mobile Only
  - Desktop Only

#### B. Regular Advertisement Code Sections
Accept HTML, CSS, and JavaScript code:

1. **Sidebar Archive Articles**
   - Advertisement code for article archive/listing page sidebar

2. **Sidebar Single Article**
   - Advertisement code for individual article page sidebar

3. **Single Article Top**
   - Advertisement at top of article content

4. **Single Article Bottom**
   - Advertisement at bottom of article content

5. **Single Article Middle**
   - Advertisement in middle of article (before H2 tags)

**Features**:
- **Code Editor**: Textarea with monospace font for ad code
- **Preview Toggle**: Show/hide rendered ad code preview
- **HTML Support**: Full HTML, CSS, JS support for third-party ad scripts

**Important Notes**:
- Trust ad codes only from verified sources
- Test on different devices and screen sizes
- Empty fields display no ads
- Supports Google AdSense, Mediavine, AdThrive, and custom scripts

**Data Storage**: Settings saved to Supabase `settings` table

---

### 4. Robots.txt Management (`/backend/admin/sitemap`)

**File**: `components/admin/SitemapManagement.tsx`

**Purpose**: Configure `robots.txt` file for search engine crawling

**Features**:
- **Robots.txt Content Editor**: Large textarea for editing robots.txt rules
- **Default Template**: Includes common rules:
  ```
  User-agent: *
  Allow: /
  
  # Disallow admin panel
  Disallow: /admin/
  Disallow: /backend/
  
  # Disallow private pages
  Disallow: /profile/
  Disallow: /bookmarks/
  
  # Allow specific important pages
  Allow: /lowongan-kerja/
  Allow: /artikel/
  
  # Sitemaps
  Sitemap: https://nexjob.tech/sitemap.xml
  ```

**Served At**: `/robots.txt` - Automatically served by Next.js API route

**Note**: Sitemaps are managed by external CMS system (TugasCMS)

**Data Storage**: Settings saved to Supabase `settings` table

---

### 5. Integration Settings (`/backend/admin/integration`)

**File**: `components/admin/IntegrationSettings.tsx`

**Purpose**: Configure connections to external services and APIs

**Current Integrations**:

#### TugasCMS API Configuration
- **CMS API Endpoint**: Base URL of TugasCMS instance
  - Example: `https://cms.nexjob.tech`
  - Used to fetch jobs, articles, filters data

- **CMS API Token**: Bearer token for API authentication
  - Format: `cms_your-api-token`
  - Stored securely in Supabase settings

- **API Timeout (ms)**: Request timeout duration
  - Range: 1000ms - 60000ms
  - Default: 10000ms (10 seconds)
  - Critical for handling slow API responses

**Test Connection Feature**:
- **Test Connections Button**: Validates CMS API connectivity
- **Connection Test Results**: Shows success/failure status
- **Error Messages**: Displays specific error details if connection fails

**Future Integrations** (Placeholder):
- Database Configuration (currently in `.env` via admin notes)
- Storage Configuration (S3, Supabase Storage)

**Data Storage**: Settings saved to Supabase `settings` table

---

### 6. System Settings (`/backend/admin/system`)

**File**: `components/admin/SystemSettings.tsx`

**Purpose**: Configure general system and analytics settings

**Settings**:

#### General System Settings
- **Site URL**: The main public URL of the website
  - Example: `https://nexjob.tech`
  - Used for canonical URLs, sitemaps, og:url

#### Analytics Configuration
- **Google Analytics ID**: GA4 property ID
  - Format: `G-XXXXXXXXXX`
  - Used for analytics tracking

- **Google Tag Manager ID**: GTM container ID
  - Format: `GTM-XXXXXXX`
  - Used for tag management and event tracking

**Note**: Database and storage configurations are managed via `.env` file (not UI)

**Data Storage**: Settings saved to Supabase `settings` table

---

### 7. User Management (`/backend/admin/users`)

**File**: `components/admin/UserManagement.tsx`

**Purpose**: Manage user accounts, roles, and permissions

**Features**:

#### User List Display
- **Table Columns**:
  - User (Avatar + Full Name + Email)
  - Role (Badge: Super Admin or User)
  - Joined Date (formatted as: DD MMM YYYY)
  - Actions (Role toggle buttons)

#### Search & Filter
- **Search Box**: Filter users by email or full name (real-time)
- **Role Filter Dropdown**:
  - All Roles
  - Users (regular users)
  - Super Admins (admin users)

#### Statistics Cards
- **Total Users**: Count of all registered users
- **Regular Users**: Count of non-admin users
- **Super Admins**: Count of admin users

#### Role Management
- **Make Admin Button**: Promote regular user to super_admin
- **Remove Admin Button**: Demote super_admin back to user
- **Confirmation**: Changes saved immediately to database

**User Data Fields**:
- `id`: User UUID
- `email`: User email address
- `full_name`: User's full name
- `role`: Either 'user' or 'super_admin'
- `created_at`: Account creation timestamp
- `last_sign_in_at`: Last login timestamp (optional)

**Data Source**: `profiles` table in Supabase

---

## Data Storage & Database

### Supabase Settings Table

Most admin settings are stored in the `settings` table with structure:

```typescript
interface Settings {
  // General
  site_url: string;
  site_title: string;
  site_tagline: string;
  site_description: string;

  // SEO - Dynamic Templates
  location_page_title_template: string;
  location_page_description_template: string;
  category_page_title_template: string;
  category_page_description_template: string;

  // SEO - Archive Pages
  jobs_title: string;
  jobs_description: string;
  articles_title: string;
  articles_description: string;
  login_page_title?: string;
  login_page_description?: string;
  signup_page_title?: string;
  signup_page_description?: string;
  profile_page_title?: string;
  profile_page_description?: string;

  // SEO - OG Images
  home_og_image: string;
  jobs_og_image: string;
  articles_og_image: string;
  default_job_og_image: string;
  default_article_og_image: string;

  // Advertisements
  popup_ad_enabled: boolean;
  popup_ad_url: string;
  popup_ad_load_settings: string[];
  popup_ad_max_executions: number;
  popup_ad_device: 'all' | 'mobile' | 'desktop';
  sidebar_archive_ad_code: string;
  sidebar_single_ad_code: string;
  single_top_ad_code: string;
  single_bottom_ad_code: string;
  single_middle_ad_code: string;

  // Robots.txt
  robots_txt: string;

  // Analytics
  ga_id: string;
  gtm_id: string;

  // Integration
  cms_endpoint: string;
  cms_token: string;
  cms_timeout: number;

  // Metadata
  last_sitemap_update: string;
  created_at: string;
  updated_at: string;
}
```

### User Profiles Table

User management uses the `profiles` table:

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'super_admin';
  created_at: string;
  last_sign_in_at?: string;
}
```

---

## Authentication & Access Control

### Super Admin Check
- All admin pages check if user has `role === 'super_admin'`
- Non-admin users are redirected to `/login/`
- Authentication handled by `supabaseAdminService.checkAuth()`

### Service Layer
- `lib/supabase/admin.ts` contains all admin operations
- Methods: `getSettings()`, `saveSettings()`, `getCurrentProfile()`, `signOut()`

---

## API Routes Used

### Dashboard Stats
- **Endpoint**: `/api/admin/dashboard-stats`
- **Method**: GET
- **Returns**: `{ totalUsers, totalJobs, totalArticles, totalBookmarks }`

### CMS Connection Test
- **Endpoint**: `/api/cms/test-connection`
- **Method**: GET
- **Returns**: `{ success: boolean, data: { connection: boolean, filters: boolean } }`

---

## Dynamic Imports & Performance

All admin pages use Next.js dynamic imports to reduce bundle size:

```typescript
const Dashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <div>Loading admin dashboard...</div>,
  ssr: false
});
```

Benefits:
- Components load only when needed
- Faster initial page load
- Smaller main bundle
- Better performance on slower connections

---

## Future Enhancement Opportunities

### Current Roadmap
1. **Move Analytics Settings to CMS Backend**: Site URL, GA ID, GTM ID will be managed via external CMS
2. **Move General Settings to CMS Backend**: Move remaining settings to CMS for centralized management
3. **Frontend Dependency**: Frontend will fetch settings from CMS backend instead of Supabase

### Recommended Improvements
1. **Activity Logging**: Implement audit trail for settings changes
2. **Settings History**: Track changes with timestamps and user information
3. **Backup/Restore**: Allow settings export and import
4. **Advanced Permissions**: Role-based access for specific sections
5. **Settings Preview**: Live preview of changes before saving
6. **Bulk User Management**: CSV import/export for users
7. **Two-Factor Authentication**: Enhanced security for admin accounts
8. **API Documentation**: Generate OpenAPI docs for admin APIs

---

## Security Considerations

### Current Protections
1. **Role-Based Access**: Super admin only access
2. **SEO Protection**: noindex/nofollow on all admin routes
3. **Secure Storage**: Settings encrypted in Supabase
4. **API Keys**: Stored securely with Bearer token authentication
5. **Dynamic Imports**: Reduces exposure of admin code in main bundle

### Recommendations
1. **Rate Limiting**: Implement on admin API endpoints
2. **Audit Logging**: Log all settings changes with user/timestamp
3. **Approval Workflows**: Require approval for critical changes
4. **Session Timeout**: Auto-logout after inactivity
5. **IP Whitelisting**: Restrict admin access by IP (optional)
6. **Change Notifications**: Email alerts for critical changes

---

## Configuration Examples

### Sample Settings in Supabase
```json
{
  "site_url": "https://nexjob.tech",
  "site_title": "Nexjob",
  "site_tagline": "Find Your Dream Job",
  "site_description": "Platform pencarian kerja terpercaya di Indonesia",
  "location_page_title_template": "Lowongan Kerja di {{lokasi}} - {{site_title}}",
  "location_page_description_template": "Temukan lowongan kerja terbaru di {{lokasi}}...",
  "ga_id": "G-XXXXXXXXXX",
  "gtm_id": "GTM-XXXXXXX",
  "cms_endpoint": "https://cms.nexjob.tech",
  "cms_timeout": 10000,
  "popup_ad_enabled": false,
  "popup_ad_device": "all"
}
```

---

## Testing & Verification Checklist

- [ ] Verify admin access requires super_admin role
- [ ] Test all settings save correctly to Supabase
- [ ] Confirm CMS connection test works
- [ ] Check robots.txt is served correctly at `/robots.txt`
- [ ] Verify OG images display in preview
- [ ] Test user role changes update database
- [ ] Confirm SEO templates apply to dynamic pages
- [ ] Verify popup ads trigger on configured pages
- [ ] Test ad code preview renders correctly
- [ ] Check dashboard stats update in real-time
- [ ] Verify all routes have noindex meta tags
- [ ] Test mobile responsive layout

---

## Support & Troubleshooting

### Common Issues

**Settings not saving**:
- Check Supabase database connection
- Verify user has super_admin role
- Check browser console for errors

**CMS connection fails**:
- Verify CMS endpoint URL is correct
- Check API token is valid
- Verify network connectivity
- Check CMS timeout setting

**Ad codes not displaying**:
- Verify code is valid HTML/JavaScript
- Check browser console for script errors
- Test on target device (mobile/desktop)
- Ensure popup is enabled and not blocked by ad blocker

---

**Last Updated**: December 21, 2025
**Documentation Version**: 1.0
**Maintained By**: Development Team
