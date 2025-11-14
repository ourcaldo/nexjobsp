# Nexjob - Modern Job Portal Platform

## Overview

Nexjob is a full-featured job portal platform designed to connect job seekers with opportunities. Built with Next.js 14, TypeScript, Supabase, and WordPress as a headless CMS, it offers advanced job search capabilities, robust user management, flexible content management, and comprehensive administrative controls. The platform aims to be a trusted and efficient job search resource, providing a seamless experience for both users and administrators.

## Recent Changes (November 14, 2025)

**Job URL Structure Migration - Slug to ID (COMPLETED):**
- ✅ Changed job detail URL from `/lowongan-kerja/{category-slug}/{slug}/` to `/lowongan-kerja/{category-slug}/{id}/`
- ✅ Renamed route directory from `[slug]` to `[id]` for clarity
- ✅ Updated all URL generation across the application (JobCard, schema utils, sitemap, CMS provider)
- ✅ Updated page logic to use `getJobById` instead of `getJobBySlug`
- ✅ Renamed JobDetailPage prop from `slug` to `jobId` for consistency
- **Files Modified**: `app/lowongan-kerja/[category]/[id]/page.tsx`, `app/lowongan-kerja/[category]/[id]/opengraph-image.tsx`, `components/JobCard.tsx`, `components/pages/JobDetailPage.tsx`, `utils/schemaUtils.ts`, `lib/utils/sitemap.ts`, `lib/cms/providers/tugascms.ts`
- **Impact**: More consistent URL structure using UUID-based IDs, better alignment with API data structure
- All changes passed architect review with zero TypeScript/LSP errors

**Backend Admin Revamp - Removed Internal CMS & Simplified Configuration (October 28, 2025):**
- ✅ Removed CMS menu from admin sidebar (project now uses external TugasCMS at https://cms.nexjob.tech)
- ✅ Simplified Sitemap Management to only handle robots.txt configuration
- ✅ Removed Database and Storage Configuration from System Settings (now managed via .env)
- ✅ Added noindex/nofollow meta tags to `/backend/admin` routes for SEO protection
- ✅ Updated documentation in project.md with complete implementation details
- **Files Modified**: `components/admin/AdminLayout.tsx`, `SitemapManagement.tsx`, `SystemSettings.tsx`, `app/backend/admin/layout.tsx`
- **Security Improvements**: Database credentials and storage keys no longer exposed in admin UI
- **Impact**: Cleaner admin interface, better separation of concerns, improved security posture
- All changes passed architect review with zero TypeScript/LSP errors

**Phase: UX Enhancements & Best Practices Implementation (COMPLETED):**

**Section 6 - User Experience Enhancements:**
- 6.1: ✅ Loading states with skeleton loaders (`components/ui/JobCardSkeleton.tsx`)
- 6.2: ✅ Empty state component (`components/ui/EmptyState.tsx`)
- 6.3: ✅ Search history with localStorage (`hooks/useSearchHistory.ts`)
- 6.4: ✅ Job alerts setup guide (`docs/JOB_ALERTS_SETUP.md`)
- 6.5: ✅ Social share functionality (`components/ui/ShareButton.tsx`)

**Section 8 - Best Practices & Modern Patterns:**
- 8.1: ✅ Enhanced server actions with structured logging
- 8.2: ✅ Optimistic updates architecture ready
- 8.3: ✅ Parallel data fetching documented
- 8.4: ✅ Structured logging system (`lib/logger.ts`)
- 8.5: ✅ Feature flags system (`lib/features.ts`)

**Critical Fixes:**
- Fixed feature flags to properly check environment variables (removed `|| true` defaults)
- Fixed search history integration with proper React Rules of Hooks compliance
- Fixed nested button HTML violation in search history dropdown
- All implementations passed architect review

## User Preferences

- **Critical Configuration**:
    1. Always use port 5000.
    2. Uses `.env` for environment variables, not `.env.local`.
    3. Requires `npm run build` before production.
    4. Utilizes Supabase PostgreSQL with a specific schema.
- **Common Patterns**:
    - All pages use `GetStaticProps` for SSG/ISR.
    - API routes follow REST conventions.
    - Components are organized by feature/domain.
    - Services handle all external API calls.
    - All filter parameters use IDs, not labels/names (province, city, category, employment type, etc.).
    - Related content fetching uses category/category IDs for both jobs and articles.
- **File Modification Guidelines**:
    - Never modify `.replit`, `package.json`, or config files unless specifically requested.
    - Always use TypeScript strict typing.
    - Follow existing component patterns.
    - Maintain responsive design principles.
    - Preserve SEO optimizations.
- **Code Quality**: Prioritize managing code duplication, adhering to specified naming conventions (PascalCase for components, camelCase for variables/functions, UPPER_SNAKE_CASE for constants), and implementing accessibility standards (ARIA labels, semantic HTML, keyboard navigation).

## System Architecture

Nexjob is built on a modern Jamstack-like architecture, leveraging Next.js 14 for a high-performance, SEO-friendly front-end, and Supabase for backend services, coupled with WordPress as a headless CMS.

### UI/UX Decisions
- **Styling**: Tailwind CSS for utility-first styling, ensuring responsive design and a custom color scheme.
- **Component Library**: Reusable UI components are centralized in `/components/ui/`, including skeletons for loading states and toast notifications for user feedback.
- **Accessibility**: Focus on ARIA labels, semantic HTML, keyboard navigation, and enhanced focus indicators.
- **Design Patterns**: Mobile-first approach, image optimization, lazy loading, and code splitting for performance. Dynamic OpenGraph images are generated for social sharing.

### Technical Implementations
- **Framework**: Next.js 14.0.4 with React 18.3.1 for server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR).
- **Language**: TypeScript 5.8.3 for type safety and improved developer experience.
- **Authentication**: Supabase Auth for user authentication with JWT.
- **Content Editor**: TipTap Editor for rich text content creation within the CMS.
- **Analytics**: Integrated with Google Analytics 4 and Google Tag Manager for comprehensive tracking.
- **Deployment**: Configured for Replit Autoscale deployment, using PM2 for process management in production.

### Feature Specifications
- **Job Management**: Dynamic job listings with advanced search, filtering by location, category, and salary.
- **Content Management**: Articles and dynamic CMS pages managed via WordPress (headless) with rich text editing and media management through Supabase Storage.
- **User Management**: User profiles, job bookmarking, and role-based access control (RBAC).
- **Admin Panel**: Comprehensive `/backend/admin/` dashboard for managing CMS content, users, SEO settings, advertisements, and system configurations. Optimized with dynamic imports to reduce bundle size.
- **SEO & Performance**: Dynamic XML sitemaps, structured data (Schema Markup) for jobs and articles, dynamic meta tags, SSG/ISR, and Next.js Image optimization.

### System Design Choices
- **Monorepo Structure**: Organized `app/` directory following Next.js App Router conventions, with clear separation for API routes, admin features, and public-facing content.
- **Data Flow**: WordPress acts as the content source, feeding data to Next.js via its REST API, which is then statically generated or server-rendered. User-generated content and application data are managed in Supabase.
- **API Endpoints**: Structured public, user-specific, and protected admin APIs.
- **Code Quality**: Strict ESLint, TypeScript strict mode, and Prettier formatting are enforced.

## External Dependencies

- **Database**: PostgreSQL (via Supabase)
- **Authentication & Storage**: Supabase (Auth, Storage)
- **Headless CMS**: WordPress (REST API for content, custom filter API)
- **Icons**: Lucide React
- **Analytics**: Google Analytics 4, Google Tag Manager