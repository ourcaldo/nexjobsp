
# Nexjob - Modern Job Portal Platform

## Project Overview

Nexjob is a full-featured job portal platform built with Next.js 14, TypeScript, Supabase, and WordPress as headless CMS. It provides advanced job search, user management, content management, and comprehensive admin controls.

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 14.0.4 with React 18.3.1
- **Language**: TypeScript 5.8.3
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage for file uploads
- **CMS**: WordPress (Headless) for job and article content
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.344.0
- **Rich Text**: TipTap Editor for content creation

### Development Environment
- **Port**: 5000 (configured in .env.example and next.config.js)
- **Node Version**: >=18.0.0
- **Package Manager**: npm >=8.0.0
- **Environment Files**: Uses `.env` (not `.env.local`) for configuration

## 📁 Project Structure

```
nexjob-portal/
├── app/                             # Next.js App Router
│   ├── api/                        # API route handlers
│   │   ├── admin/                  # Admin-only endpoints
│   │   ├── public/                 # Public API endpoints
│   │   └── user/                   # User-specific endpoints
│   ├── admin/                      # Admin panel entry point
│   ├── artikel/                    # Article pages (/artikel/*)
│   ├── backend/admin/              # Full admin panel pages
│   ├── bookmarks/                  # User bookmarks page
│   ├── login/ & signup/            # Authentication pages
│   ├── lowongan-kerja/             # Job pages (/lowongan-kerja/*)
│   ├── profile/                    # User profile page
│   ├── sitemap-*/                  # Dynamic sitemap generation
│   ├── [slug]/                     # Dynamic CMS pages
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Homepage
│   └── providers.tsx               # Client providers
├── components/                      # React components
│   ├── admin/                       # Admin panel components
│   ├── pages/                       # Page-level components
│   ├── ui/                          # Reusable UI components
│   ├── Advertisement/               # Ad display components
│   ├── Analytics/                   # GA & GTM components
│   ├── Layout/                      # Header & Footer
│   └── SEO/                         # Schema markup
├── services/                        # Business logic & API calls
├── types/                           # TypeScript definitions
├── utils/                           # Helper functions
├── hooks/                           # Custom React hooks
├── lib/                             # Core utilities (env, supabase)
├── supabase/migrations/             # Database migrations
├── styles/globals.css               # Global Tailwind styles
└── Configuration files
```

## 🔧 Environment Configuration

### Required Environment Variables (.env)
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

## 🚀 Key Features

### 1. Job Management System
- **Job Listings**: Dynamic job pages with SSG/ISR
- **Search & Filtering**: Advanced search with location, category, salary filters
- **Job Categories**: `/lowongan-kerja/kategori/[slug]`
- **Location-based**: `/lowongan-kerja/lokasi/[slug]`
- **Job Details**: Individual job pages `/lowongan-kerja/[slug]`

### 2. Content Management System
- **Articles**: `/artikel/` with category support
- **CMS Pages**: Dynamic pages via `[slug].tsx`
- **Rich Text Editor**: TipTap integration for content creation
- **Media Management**: Supabase storage integration
- **WordPress Integration**: Headless CMS for content

### 3. User Management
- **Authentication**: Supabase Auth (login/signup)
- **User Profiles**: Profile management with image uploads
- **Bookmarks**: Save favorite jobs
- **Role-based Access**: Admin and user roles

### 4. Admin Panel (`/backend/admin/`)
- **Dashboard**: System overview and analytics
- **CMS Management**: Create/edit articles, jobs, pages
- **User Management**: User roles and permissions
- **SEO Settings**: Meta tags, schema markup
- **Advertisement**: Popup and sidebar ad management
- **Sitemap Management**: XML sitemap generation
- **WordPress Integration**: API connection settings
- **System Settings**: Global site configuration
- **Performance Optimized**: All admin components use dynamic imports with `ssr: false` to reduce main bundle size

### 5. SEO & Performance
- **Dynamic Sitemaps**: Auto-generated XML sitemaps
- **Schema Markup**: Structured data for jobs and articles
- **Meta Tags**: Dynamic SEO optimization
- **SSG/ISR**: Static generation with revalidation
- **Image Optimization**: Next.js Image component

## 🔌 API Endpoints

### Public APIs
- `GET /api/public/settings` - Site settings
- `GET /api/public/advertisements` - Advertisement data

### User APIs
- `GET/POST /api/user/profile` - User profile management
- `GET/POST/DELETE /api/user/bookmarks` - Bookmark management
- `GET /api/user/role` - User role information

### Admin APIs (Protected)
- `GET/POST /api/admin/settings` - Admin settings
- `POST /api/admin/force-sitemap-update` - Sitemap regeneration
- `POST /api/upload-profile-image` - Image upload

### Utility APIs
- `GET /api/test-wp-connection` - WordPress connectivity test
- `GET /api/settings` - General settings

## 📊 Database Schema (Supabase)

### Core Tables
- **users**: User profiles and authentication
- **bookmarks**: User job bookmarks
- **settings**: Site configuration
- **popup_ads**: Advertisement management
- **articles**: CMS article content
- **media**: File storage references
- **pages**: Dynamic CMS pages

### Key Migrations
- Article system with categories and tags
- Media management system
- Popup advertisement system
- User profile enhancements

## 🎨 Styling & UI

### Tailwind Configuration
- Custom color scheme
- Responsive design patterns
- Component-based styling
- Dark mode support preparation

### Component Library
- **UI Components**: Reusable components in `/components/ui/`
- **Skeletons**: Loading states for better UX
- **Toast Notifications**: User feedback system
- **Modals**: Login prompts and confirmations

## 🔍 Search & Filtering

### WordPress Integration
- Job data sourced from WordPress REST API
- Filter API for categories and locations
- Custom fields for job metadata
- Category mapping for SEO-friendly URLs

### Search Features
- Text-based job search
- Location filtering (cities/provinces)
- Category filtering (job types)
- Salary range filtering
- Experience level filtering

## 📱 Responsive Design

### Mobile-First Approach
- Tailwind CSS responsive utilities
- Mobile navigation
- Touch-friendly interfaces
- Progressive Web App features

### Performance
- Image optimization
- Lazy loading
- Code splitting with dynamic imports
- Bundle optimization
- **Admin Panel Code Splitting**: All admin components use dynamic imports to reduce initial bundle size

## 🚀 Deployment Configuration

### Replit Deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port**: 5000 (configured)
- **Environment**: Production-ready

### PM2 Configuration (ecosystem.config.js)
- Cluster mode with max instances
- Auto-restart on failures
- Memory limits and monitoring
- Log management

### Alternative Deployment (deploy.sh)
- Ubuntu server deployment script
- PM2 process management
- Nginx configuration included
- SSL setup guidance

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Protected admin routes
- API token authentication

### Security Headers
- CORS configuration
- Content Security Policy
- XSS protection
- Frame options

### Data Protection
- Input validation
- SQL injection prevention
- Secure file uploads
- Environment variable protection

## 📈 Analytics & Monitoring

### Google Analytics 4
- Page view tracking
- User interaction events
- Conversion tracking
- Custom dimensions

### Google Tag Manager
- Event management
- Custom tracking
- A/B testing support
- Marketing tags

## 🛠️ Development Workflow

### Available Scripts
```bash
npm run dev          # Development server (port 5000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation
```

### Code Quality
- ESLint configuration
- TypeScript strict mode
- Prettier formatting
- Git hooks (if needed)

## 🔄 Content Flow

### WordPress → Next.js
1. Content created in WordPress CMS
2. REST API provides data to Next.js
3. Static generation with ISR
4. Dynamic revalidation on content updates

### User Generated Content
1. User authentication via Supabase
2. Profile data stored in Supabase
3. Bookmarks and preferences saved
4. Admin panel for content management

## 🎯 SEO Strategy

### URL Structure
- `/lowongan-kerja/` - Job listings
- `/lowongan-kerja/kategori/[category]` - Category pages
- `/lowongan-kerja/lokasi/[location]` - Location pages
- `/artikel/` - Article listings
- `/artikel/[category]/[slug]` - Article pages

### Sitemap Generation
- Dynamic XML sitemaps
- Paginated sitemaps for large datasets
- Automatic updates on content changes
- Search engine optimization

### Schema Markup
- Job posting schema
- Article schema
- Organization schema
- Breadcrumb schema

## 🚨 Important Notes for Replit AI Agent

### Critical Configuration
1. **Port**: Always use port 5000 (configured in multiple files)
2. **Environment**: Uses `.env` not `.env.local`
3. **Build**: Requires `npm run build` before production
4. **Database**: Supabase PostgreSQL with specific schema

### Common Patterns
- All pages use `GetStaticProps` for SSG/ISR
- API routes follow REST conventions
- Components are organized by feature/domain
- Services handle all external API calls
- **All filter parameters use IDs, not labels/names** (province, city, category, employment type, etc.)
- **Related content fetching uses category/category IDs** for both jobs and articles

### Development Commands
```bash
# Start development (Replit workflow)
npm run dev -- -H 0.0.0.0 -p ${PORT:-5000}

# Build and test
npm run build
npm run start

# Type checking
npm run type-check
```

### File Modification Guidelines
- Never modify `.replit`, `package.json`, or config files unless specifically requested
- Always use TypeScript strict typing
- Follow existing component patterns
- Maintain responsive design principles
- Preserve SEO optimizations

### Deployment on Replit
1. Ensure all dependencies are installed
2. Run `npm run build` to generate production build
3. Use Autoscale deployment with:
   - Build command: `npm run build`
   - Run command: `npm run start`
   - Port: 5000

## 📋 Code Quality & Standards

### Code Duplication Management

**Date Formatting Utilities (Implemented: Oct 28, 2025)**
Created shared utilities in `lib/utils/date.ts` to eliminate duplicate date formatting logic:
- `formatRelativeDate()` - Converts dates to relative format (e.g., "2 jam lalu", "3 hari lalu")
- `formatFullDate()` - Formats dates as full localized Indonesian format
- `isHotJob()` - Checks if a job is within the "hot" time threshold (12 hours)
- `getHoursAgo()` - Calculates hours since a given date

**Components Using Shared Utilities:**
- `components/JobCard.tsx` - Uses formatRelativeDate, isHotJob, getHoursAgo
- `components/admin/Dashboard.tsx` - Uses formatFullDate

**Remaining Duplication to Address:**
- **Card Wrapper Patterns**: Common card styling and structure patterns exist across multiple components (JobCard, ArticleCard). Consider extracting if pattern becomes more widespread.
- **API Error Handling**: Error handling patterns are similar across API routes. Could be abstracted into middleware or utility functions if more routes are added.
- **Form Validation**: Some form validation logic is duplicated. Consider using a validation library like Zod more consistently across forms.

### Naming Conventions

**File & Folder Naming:**
- **Components**: PascalCase for all component files (e.g., `JobCard.tsx`, `Header.tsx`)
- **Folders**: lowercase with hyphens for routes (e.g., `lowongan-kerja`, `backend/admin`)
- **API Routes**: lowercase with hyphens (e.g., `api/user/bookmarks`)
- **Utilities**: camelCase for utility files (e.g., `date.ts`, `format.ts`)
- **Types**: singular PascalCase (e.g., `job.ts`, `user.ts`)

**Code Naming:**
- **Variables**: camelCase (e.g., `jobData`, `isBookmarked`)
- **Functions**: camelCase (e.g., `formatDate`, `handleClick`)
- **Components**: PascalCase (e.g., `JobCard`, `BookmarkButton`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`, `MAX_JOBS`)
- **Types/Interfaces**: PascalCase (e.g., `Job`, `UserProfile`)

**Consistency Notes:**
- Component folders follow Next.js conventions (app router uses lowercase)
- Some legacy files may use different conventions - prefer current standards for new files
- Admin components are in `components/admin/` (PascalCase) while routes are in `app/backend/admin/` (lowercase)
- This is intentional: components are code modules (PascalCase), routes are URLs (lowercase)

### Accessibility Standards (Oct 28, 2025)

**ARIA Labels & Semantic HTML:**
- All interactive elements have proper aria-label attributes
- Icon-only buttons include descriptive labels (e.g., "Simpan lowongan kerja", "Buka menu navigasi")
- Keyboard navigation fully supported with Enter/Space key handling
- Skip-to-content link implemented in main layout for keyboard users
- Focus indicators enhanced with visible outlines and transitions

**Components with Accessibility:**
- `components/JobCard.tsx` - Full ARIA labels, keyboard navigation for bookmarks
- `components/Layout/Header.tsx` - Navigation landmarks, mobile menu accessibility
- `components/Layout/Footer.tsx` - Semantic navigation with proper landmarks
- `app/layout.tsx` - Skip-to-content link for keyboard navigation

**SEO & OpenGraph:**
- Dynamic OpenGraph images for job pages (`app/lowongan-kerja/[slug]/opengraph-image.tsx`)
- Generated using @vercel/og with proper dimensions (1200x630)
- Shows job title, company, location, and salary information
- Custom branding with Nexjob logo and gradient backgrounds

This documentation provides comprehensive context for future Replit AI Agent interactions with the Nexjob project.
