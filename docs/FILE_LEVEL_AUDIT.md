# Nexjob Project Audit Report (File-Level Analysis)

> Generated from comprehensive analysis of ~60+ files in the `nexjobsp/` Next.js project.

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Critical Findings](#critical-findings)
3. [File-by-File Analysis](#file-by-file-analysis)
   - [Page Components](#page-components)
   - [Shared Components](#shared-components)
   - [Layout Components](#layout-components)
   - [Advertisement Components](#advertisement-components)
   - [Analytics Components](#analytics-components)
   - [SEO Components](#seo-components)
   - [UI Components](#ui-components)
   - [Skeleton Components](#skeleton-components)
   - [API Routes](#api-routes)
   - [App Page Routes](#app-page-routes)
   - [Config & Styles](#config--styles)
4. [Cross-Cutting Concerns](#cross-cutting-concerns)
5. [Recommendations](#recommendations)

---

## Executive Summary

The nexjobsp project is an Indonesian job portal ("Nexjob") built with:
- **Next.js App Router** with ISR (Incremental Static Regeneration)
- **Tailwind CSS v4** with `@theme` directive
- **TypeScript** throughout
- **TugasCMS** as CMS provider with services layer
- **Google Analytics + GTM** for analytics

### Key Metrics
| Metric | Count |
|---|---|
| Dead code files | **7** |
| Files >300 lines (need refactoring) | **6** |
| `console.error/log/warn` in components (should use logger) | **15+** |
| Duplicated code patterns | **4** |
| Hardcoded values | **6+** |
| Missing `'use client'` directives | **1** |

---

## Critical Findings

### 1. Dead Code (7 files)

| File | Lines | Reason |
|---|---|---|
| `components/pages/ArticlePage.tsx` | ~188 | Not imported in any app route. `/artikel/` uses `ArticleListPage` instead. |
| `components/pages/BookmarkPage.tsx` | ~139 | Not imported anywhere. No `/bookmark` route exists. |
| `components/CMSContent.tsx` | ~22 | Not imported anywhere in the codebase. |
| `components/ui/JobArchiveSkeleton.tsx` | ~110 | Not imported anywhere (no `loading.tsx` files). |
| `components/ui/ArticleArchiveSkeleton.tsx` | ~118 | Not imported anywhere. |
| `components/ui/ArticleDetailSkeleton.tsx` | ~135 | Not imported anywhere. |
| `components/ui/JobDetailSkeleton.tsx` | ~159 | Not imported anywhere. |

### 2. Oversized Files (>300 lines)

| File | Lines | Priority |
|---|---|---|
| `components/pages/JobSearchPage.tsx` | **1107** | **CRITICAL** - largest file in the codebase |
| `components/pages/JobDetailPage.tsx` | **543** | HIGH - contains duplicated mobile/desktop sidebar |
| `styles/globals.css` | **409** | MEDIUM - duplicated CMS content styles |
| `app/artikel/[category]/[slug]/page.tsx` | **~370** | MEDIUM |
| `app/artikel/[category]/page.tsx` | **~346** | MEDIUM |
| `components/pages/ArticleListPage.tsx` | **~340** | MEDIUM |

### 3. `console.error/log/warn` Instead of Logger (15+ instances)

| File | Lines | Count |
|---|---|---|
| `components/pages/HomePage.tsx` | ~58, ~139 | 2 |
| `components/pages/JobSearchPage.tsx` | ~187, ~281, ~350, ~430 | 4 |
| `components/pages/JobDetailPage.tsx` | ~66 | 1 |
| `components/pages/ArticleListPage.tsx` | ~125 | 1 |
| `components/pages/ArticlePage.tsx` | ~41 | 1 (dead code) |
| `components/Layout/Header.tsx` | ~54 | 1 |
| `components/JobSidebar.tsx` | ~64 | 1 |
| `components/Advertisement/AdDisplay.tsx` | ~40, ~74, ~105 | 3 |
| `components/Advertisement/PopupAd.tsx` | ~161 | 1 |
| `app/robots.txt/route.ts` | multiple | 2 |

### 4. Duplicated Code

1. **`formatDate()`** — Identical relative-date logic in both `JobCard.tsx` (server, no hydration guard) and `JobDetailPage.tsx` (client, has hydration guard). Should be extracted to a shared utility.

2. **Mobile/Desktop Sidebar in `JobDetailPage.tsx`** — The "Company Info" and "Job Info" card JSX is **copy-pasted twice**: once for `lg:hidden` (mobile) and once for `hidden lg:block` (desktop). ~150 lines duplicated.

3. **URL param building in `JobSearchPage.tsx`** — The same URL parameter construction pattern is repeated 3 times across `searchWithFilters()`, `loadMoreJobs()`, and `loadInitialData()`.

4. **CMS content styles in `globals.css`** — Styles for headings, paragraphs, lists are defined twice: once for standard HTML selectors (`.cms-content h1`, etc.) and once for Tiptap editor classes (`.tiptap h1`, etc.).

---

## File-by-File Analysis

### Page Components

#### `components/pages/HomePage.tsx`
| Property | Value |
|---|---|
| Lines | ~270 |
| Type | Client (`'use client'`) |
| Purpose | Landing page with hero search, stats, featured jobs, and CTA sections |
| Imports from | `next/navigation`, `next/link`, `next/image`, `lucide-react`, `FilterData`, `SearchableSelect`, `SchemaMarkup`, `schemaUtils`, `Job`, `JobCard`, `sanitizeHTML`, `getBlurDataURL` |
| Exports | `default HomePage` |
| **Issues** | |
| | Hardcoded stats: `"10,000+"`, `"2,500+"`, `"50,000+"` — should be dynamic or from config |
| | Dead state: `user` state + `loadUserBookmarks` + `initializeAuth` exist but auth is removed |
| | `handleBookmarkChange` is empty callback (does nothing) |
| | `TrendingUp`, `Users`, `Code`, `Heart`, `Calculator`, `Truck` imported from lucide-react but unused |
| | `console.error` at 2 locations instead of logger |
| | `window.open` used for internal navigation (should use `router.push`) |

#### `components/pages/JobSearchPage.tsx`
| Property | Value |
|---|---|
| Lines | **1107** |
| Type | Client (`'use client'`) |
| Purpose | Job search page with filters, infinite scroll, URL-driven state, sidebar, and pagination |
| Imports from | `next/navigation`, `lucide-react`, `Job`/`FilterData` types, `useAnalytics`, `JobCard`, `JobSidebar`, `SearchableSelect`, `JobCardSkeleton`, `EmptyState`, `useInfiniteScroll`, `useSearchHistory`, `features` |
| Exports | `default JobSearchPage` |
| **Issues** | |
| | **1107 lines** — #1 refactoring target. Should split into: filter logic hook, URL state hook, search result component, filter bar component |
| | URL param building duplicated 3x (`searchWithFilters`, `loadMoreJobs`, `loadInitialData`) |
| | `console.error` at 4 locations |
| | `handleJobClick` is empty callback |
| | Salary range calculation logic duplicated with CMS provider |

#### `components/pages/JobDetailPage.tsx`
| Property | Value |
|---|---|
| Lines | **543** |
| Type | Client (`'use client'`) |
| Purpose | Job detail view with company info, job metadata, description, related jobs, application modal |
| Imports from | `next/navigation`, `next/link`, `lucide-react` (14 icons), `Job`, `bookmarkService`, `useAnalytics`, `Breadcrumbs`, `JobCard`, `JobApplicationModal`, `sanitizeHTML`, `ShareButton`, `formatLocationName` |
| Exports | `default JobDetailPage` |
| **Issues** | |
| | Mobile/desktop sidebar content **duplicated** (~150 lines identical JSX) |
| | `formatDate` duplicated from `JobCard.tsx` |
| | `console.error` at line ~66 |
| | Bookmark functionality gutted — `handleBookmarkToggle` just shows modal, but login/signup links go to non-existent `/login/` and `/signup/` routes |
| | `handleBookmarkModalLogin` + `handleBookmarkModalSignup` use `window.open` to routes that don't exist |

#### `components/pages/ArticleListPage.tsx`
| Property | Value |
|---|---|
| Lines | ~340 |
| Type | Client (`'use client'`) |
| Purpose | Article listing page with categories, search, pagination |
| Imports from | `useState`, `date-fns`, `lucide-react`, `next/link`, `next/image`, `AdDisplay`, `getBlurDataURL` |
| Exports | `default ArticleListPage` (named export pattern) |
| **Issues** | |
| | `Eye` imported from lucide-react but unused |
| | `console.error` at line ~125 |

#### `components/pages/ArticlePage.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~188 |
| Type | Client (`'use client'`) |
| Purpose | Article detail view (superseded by server-side `app/artikel/[category]/[slug]/page.tsx`) |
| **Status** | **NOT IMPORTED ANYWHERE** — completely dead code |

#### `components/pages/BookmarkPage.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~139 |
| Type | Client (`'use client'`) |
| Purpose | Saved jobs page using localStorage bookmarks |
| **Status** | **NOT IMPORTED ANYWHERE** — no bookmark route exists |

---

### Shared Components

#### `components/JobCard.tsx`
| Property | Value |
|---|---|
| Lines | ~115 |
| Type | Server component (no `'use client'`) |
| Purpose | Reusable job listing card with title, company, location, salary, date |
| Imports from | `next/link`, `lucide-react`, `Job`, `formatLocationName` |
| Exports | `default JobCard` |
| **Issues** | |
| | `formatDate` function duplicated identically in `JobDetailPage.tsx` |

#### `components/JobSidebar.tsx`
| Property | Value |
|---|---|
| Lines | ~295 |
| Type | Client (`'use client'`) |
| Purpose | Filter sidebar with categories, job types, experience, education, work policy, salary range |
| Imports from | `lucide-react`, `FilterData` |
| Exports | `default JobSidebar` |
| **Issues** | |
| | `console.error` at line ~64 |
| | Hardcoded work policy options (`On-site`, `Remote Working`, `Hybrid Working`) |
| | Hardcoded salary ranges (`1-3 Juta`, `4-6 Juta`, etc.) |

#### `components/ArticleSidebar.tsx`
| Property | Value |
|---|---|
| Lines | ~100 |
| Type | Server component (no `'use client'`) |
| Purpose | Article page sidebar with categories and advertisements |
| Imports from | `next/link`, `next/image`, `AdDisplay` |
| Exports | `default ArticleSidebar` |
| **Issues** | |
| | Hardcoded category links (`/artikel/karir`, `/artikel/interview`, etc.) — should be dynamic from CMS |

#### `components/ArticleTableOfContents.tsx`
| Property | Value |
|---|---|
| Lines | ~105 |
| Type | Client (`'use client'`) |
| Purpose | Generates TOC from article HTML content headings (h2, h3) with scroll tracking |
| Imports from | `lucide-react` |
| Exports | `default ArticleTableOfContents` |
| **Issues** | |
| | Creates temporary DOM element in `useEffect` to parse content — consider using a regex or HTML parser instead for reliability |
| | IDs assigned to parsed headings in temp div won't match actual DOM headings unless content is post-processed |

#### `components/SearchableSelect.tsx`
| Property | Value |
|---|---|
| Lines | ~180 |
| Type | Client (`'use client'`) |
| Purpose | Dropdown select with search/filter functionality |
| Exports | `default SearchableSelect` |
| **Issues** | |
| | Hardcoded placeholder `"Cari provinsi..."` — should be a prop since component is generic |

#### `components/Breadcrumbs.tsx`
| Property | Value |
|---|---|
| Lines | ~45 |
| Type | Server component |
| Purpose | Breadcrumb navigation |
| Exports | `default Breadcrumbs` |
| Issues | None |

#### `components/CMSContent.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~22 |
| Type | Server component |
| Purpose | Wrapper for rendering sanitized CMS HTML content |
| **Status** | **NOT IMPORTED ANYWHERE** |

#### `components/ErrorBoundary.tsx`
| Property | Value |
|---|---|
| Lines | ~120 |
| Type | Client (class component) |
| Purpose | React error boundary with Indonesian error/retry UI |
| Imports from | None (standalone) |
| Exports | Named `ErrorBoundary` |
| Used in | `app/layout.tsx` |
| **Issues** | |
| | TODO comment for error tracking service integration |

---

### Layout Components

#### `components/Layout/Header.tsx`
| Property | Value |
|---|---|
| Lines | ~220 |
| Type | Client (`'use client'`) |
| Purpose | Sticky header with logo, nav, mobile off-canvas menu |
| Exports | `default Header` |
| **Issues** | |
| | `User`, `LogOut` imported from lucide-react but unused (auth removed) |
| | `user`, `showUserMenu`, `isInitialized`, `isLoading` state variables exist but auth system is removed |
| | `handleLogout` exists but auth is a no-op |
| | `initializeAuth` exists but just sets null |
| | `console.error` at line ~54 |
| | Re-check auth on pathname change is unnecessary (always null) |

#### `components/Layout/Footer.tsx`
| Property | Value |
|---|---|
| Lines | ~100 |
| Type | Server component |
| Purpose | Site footer with navigation, social links, copyright |
| Exports | `default Footer` |
| **Issues** | |
| | Hardcoded `"© 2025"` — should use `new Date().getFullYear()` |
| | All social media links point to `"#"` (placeholder) |
| | Several footer nav links point to `"#"` |

---

### Advertisement Components

#### `components/Advertisement/AdDisplay.tsx`
| Property | Value |
|---|---|
| Lines | ~150 |
| Type | Client (`'use client'`) |
| Purpose | Fetches and renders ad code from CMS by position |
| Exports | `default AdDisplay` |
| **Issues** | |
| | `console.error` at 3 locations |
| | Uses `dangerouslySetInnerHTML` with unsanitized CMS HTML (security comment notes this) |
| | Executes `<script>` tags via `useEffect` DOM manipulation (security concern) |

#### `components/Advertisement/PopupAd.tsx`
| Property | Value |
|---|---|
| Lines | ~216 |
| Type | Client (`'use client'`) |
| Purpose | Popup ad with session tracking, timing delays, cookie/localStorage state |
| Exports | `default PopupAd` |
| **Issues** | |
| | `console.error` at line ~161 |
| | Complex session management logic — consider simplifying |

---

### Analytics Components

#### `components/Analytics/GoogleAnalytics.tsx`
| Property | Value |
|---|---|
| Lines | ~57 |
| Type | Client (`'use client'`) |
| Purpose | GA4 script injection + pageview tracking |
| Imports from | `next/script`, `next/navigation`, `config` |
| Exports | `default GoogleAnalytics` |
| Issues | Clean |

#### `components/Analytics/GoogleTagManager.tsx`
| Property | Value |
|---|---|
| Lines | ~45 |
| Type | Server component |
| Purpose | GTM script injection |
| Exports | `default GoogleTagManager`, named `GoogleTagManagerNoScript` |
| Issues | Clean |

---

### SEO Components

#### `components/SEO/SchemaMarkup.tsx`
| Property | Value |
|---|---|
| Lines | ~25 |
| Type | Server component |
| Purpose | Renders JSON-LD structured data |
| Issues | Clean |

---

### UI Components

#### `components/ui/Toast.tsx`
| Property | Value |
|---|---|
| Lines | ~115 |
| Type | Client |
| Purpose | Toast notification with auto-dismiss |
| Issues | Clean |

#### `components/ui/ToastProvider.tsx`
| Property | Value |
|---|---|
| Lines | ~60 |
| Type | Client |
| Purpose | Context provider for toast system |
| Issues | Clean |

#### `components/ui/EmptyState.tsx`
| Property | Value |
|---|---|
| Lines | ~35 |
| Type | Server |
| Purpose | Empty state placeholder with icon/text |
| Issues | Clean |

#### `components/ui/ShareButton.tsx`
| Property | Value |
|---|---|
| Lines | ~130 |
| Type | **Missing `'use client'`** — uses `useState` |
| Purpose | Share menu with native share API, Facebook, Twitter, LinkedIn, clipboard |
| Exports | `default ShareButton` |
| **Issues** | |
| | **Missing `'use client'` directive** — uses `useState` and `navigator.share` |
| | Only works because it's imported by `JobDetailPage.tsx` which is already a client component |

#### `components/ui/JobApplicationModal.tsx`
| Property | Value |
|---|---|
| Lines | ~85 |
| Type | Client (`'use client'`) |
| Purpose | Modal with scam warning before redirecting to external application link |
| Issues | Clean |

---

### Skeleton Components

#### `components/ui/JobCardSkeleton.tsx`
| Property | Value |
|---|---|
| Lines | ~60 |
| Type | Server |
| Status | **Active** — imported by `JobSearchPage.tsx` |

#### `components/ui/JobArchiveSkeleton.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~110 |
| Type | Server |
| **Status** | **NOT IMPORTED ANYWHERE** |

#### `components/ui/JobDetailSkeleton.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~159 |
| Type | Server |
| **Status** | **NOT IMPORTED ANYWHERE** |

#### `components/ui/ArticleArchiveSkeleton.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~118 |
| Type | Server |
| **Status** | **NOT IMPORTED ANYWHERE** |

#### `components/ui/ArticleDetailSkeleton.tsx` — DEAD CODE
| Property | Value |
|---|---|
| Lines | ~135 |
| Type | Server |
| **Status** | **NOT IMPORTED ANYWHERE** |

---

### API Routes

#### `app/api/job-posts/route.ts`
| Property | Value |
|---|---|
| Lines | ~115 |
| Type | Server (GET) |
| Purpose | Job posts list with comprehensive filter params |
| Uses logger | Yes |
| Caching | `Cache-Control` headers (5min for search, 10min for browse) |
| Issues | Clean |

#### `app/api/job-posts/by-ids/route.ts`
| Property | Value |
|---|---|
| Lines | ~37 |
| Type | Server (POST) |
| Purpose | Fetch multiple jobs by ID array |
| Uses logger | Yes |
| Issues | Clean |

#### `app/api/job-posts/filters/route.ts`
| Property | Value |
|---|---|
| Lines | ~33 |
| Type | Server (GET) |
| Purpose | Filter metadata (categories, locations, etc.) |
| Uses logger | Yes |
| Caching | 10min `Cache-Control` |
| Issues | Clean |

#### `app/api/job-posts/[id]/related/route.ts`
| Property | Value |
|---|---|
| Lines | ~35 |
| Type | Server (GET) |
| Purpose | Related jobs by category |
| Uses logger | Yes |
| Issues | Clean |

#### `app/api/articles/route.ts`
| Property | Value |
|---|---|
| Lines | ~50 |
| Type | Server (GET), `force-dynamic` |
| Purpose | Article list with pagination and category filter |
| Uses logger | Yes |
| Issues | Clean |

#### `app/api/articles/slug/[slug]/route.ts`
| Property | Value |
|---|---|
| Lines | ~38 |
| Type | Server (GET) |
| Purpose | Single article by slug |
| Uses logger | Yes |
| **Note** | Path is `slug/[slug]`, not just `[slug]` |

#### `app/api/articles/[id]/related/route.ts`
| Property | Value |
|---|---|
| Lines | ~35 |
| Type | Server (GET) |
| Purpose | Related articles |
| Uses logger | Yes |
| Issues | Clean |

#### `app/api/advertisements/route.ts`
| Property | Value |
|---|---|
| Lines | ~60 |
| Type | Server (GET) |
| Purpose | Fetch advertisement settings from CMS |
| Uses logger | Yes |
| **Issues** | |
| | **Inconsistency**: Calls CMS directly (`getCMSProvider().getAdvertisements()`) instead of going through a service layer like other routes |

#### `app/api/cms/test-connection/route.ts`
| Property | Value |
|---|---|
| Lines | ~65 |
| Type | Server (GET) |
| Purpose | CMS connectivity check (requires auth token) |
| Uses logger | Yes |
| Issues | Clean |

#### `app/api/pages/route.ts`
| Property | Value |
|---|---|
| Lines | ~40 |
| Type | Server (GET), `force-dynamic` |
| Purpose | CMS pages list |
| Uses logger | Yes |
| Issues | Clean |

#### `app/api/health/route.ts`
| Property | Value |
|---|---|
| Lines | ~55 |
| Type | Server (GET) |
| Purpose | Health check with CMS connectivity probe |
| Uses logger | Yes |
| Issues | Clean, proper health check pattern |

#### Missing API Routes (listed by user but do not exist)
- `app/api/articles/[id]/route.ts` — only `[id]/related/` exists
- `app/api/job-posts/[id]/route.ts` — only `[id]/related/` exists

---

### App Page Routes

#### `app/page.tsx`
| Lines | ~30 | Server | Root page, renders `HomePage` | Clean |
|---|---|---|---|---|

#### `app/layout.tsx`
| Lines | ~70 | Server | Root layout with ErrorBoundary, Providers, PopupAd, Analytics | Clean |
|---|---|---|---|---|

#### `app/lowongan-kerja/page.tsx`
| Property | Value |
|---|---|
| Lines | ~150 |
| Type | Server, ISR (`revalidate = 300`) |
| Purpose | Job search page with SSR data fetching, renders `JobSearchPage` |
| Issues | Clean |

#### `app/lowongan-kerja/[category]/[id]/page.tsx`
| Property | Value |
|---|---|
| Lines | ~200 |
| Type | Server, ISR |
| Purpose | Job detail page with `generateStaticParams` (top 50 jobs) |
| Uses React `cache()` | Yes |
| **Issues** | `console.error` at line ~72 |

#### `app/lowongan-kerja/kategori/[slug]/page.tsx`
| Property | Value |
|---|---|
| Lines | ~200 |
| Type | Server, ISR |
| Purpose | Category-filtered job listing |
| Static params | From `wpCategoryMappings` |
| Issues | Clean |

#### `app/lowongan-kerja/lokasi/[province]/page.tsx`
| Property | Value |
|---|---|
| Lines | ~230 |
| Type | Server, ISR |
| Purpose | Province-filtered job listing with slug matching |
| **Issues** | Potentially extra closing `};` brace around line ~105 |

#### `app/lowongan-kerja/lokasi/[province]/[regency]/page.tsx`
| Property | Value |
|---|---|
| Lines | ~280 |
| Type | Server, ISR |
| Purpose | Regency-level location filtering with prefix removal logic |
| Issues | Complex regency matching with `KAB.`/`KOTA` prefix stripping |

#### `app/artikel/page.tsx`
| Property | Value |
|---|---|
| Lines | ~180 |
| Type | Server, ISR (`revalidate = 3600`) |
| Purpose | Article list page, renders `ArticleListPage` |
| Issues | Clean |

#### `app/artikel/[category]/page.tsx`
| Property | Value |
|---|---|
| Lines | ~346 |
| Type | Server, ISR (`revalidate = 3600`) |
| Purpose | Category-specific article listing |
| **Issues** | >300 lines; renders article list directly rather than reusing `ArticleListPage` (inconsistent with `/artikel/page.tsx`) |

#### `app/artikel/[category]/[slug]/page.tsx`
| Property | Value |
|---|---|
| Lines | ~370 |
| Type | Server, ISR (`revalidate = 3600`) |
| Purpose | Article detail page with `ArticleContentWrapper` (client component) |
| Uses React `cache()` | Yes |
| **Issues** | >300 lines but mostly metadata generation |

#### `app/robots.txt/route.ts`
| Property | Value |
|---|---|
| Lines | ~70 |
| Type | Server (GET) |
| Purpose | Dynamic robots.txt from CMS with fallback |
| **Issues** | Uses `TugasCMSProvider` directly instead of service layer; `console.error`/`console.warn` instead of logger |

---

### Config & Styles

#### `styles/globals.css`
| Property | Value |
|---|---|
| Lines | **409** |
| Purpose | Tailwind v4 theme config, CMS content styles, custom scrollbar, ad containment, accessibility |
| **Issues** | CMS content styles **duplicated**: `.cms-content` rules AND `.tiptap` rules share identical styles |

#### `.eslintrc.json`
| Lines | 3 | Extends `next/core-web-vitals` only — no TypeScript-specific rules |
|---|---|---|

#### `jest.config.ts`
| Lines | ~18 | Standard Next.js jest config with jsdom |
|---|---|---|

#### `jest.setup.ts`
| Lines | 1 | Imports `@testing-library/jest-dom` |
|---|---|---|

#### `postcss.config.mjs`
| Lines | 5 | Uses `@tailwindcss/postcss` (Tailwind v4) |
|---|---|---|

---

## Cross-Cutting Concerns

### Authentication Remnants
Auth was removed but remnants remain in multiple files:
- **Header.tsx**: `user`, `showUserMenu`, `isInitialized`, `isLoading` state, `handleLogout`, `initializeAuth`, `User`/`LogOut` imports
- **HomePage.tsx**: `user` state, `loadUserBookmarks`, `initializeAuth` callback
- **JobDetailPage.tsx**: Bookmark modal with login/signup links to non-existent routes (`/login/`, `/signup/`)

### Inconsistent CMS Access Patterns
Most routes use the services layer (`JobService`, `ArticleService`, etc.), but:
- `app/api/advertisements/route.ts` calls `getCMSProvider()` directly
- `app/robots.txt/route.ts` instantiates `TugasCMSProvider` directly

### Hardcoded Values Summary
| Location | Value | Should Be |
|---|---|---|
| `HomePage.tsx` | `"10,000+"`, `"2,500+"`, `"50,000+"` stats | Config or dynamic from API |
| `Footer.tsx` | `"© 2025"` | `new Date().getFullYear()` |
| `ArticleSidebar.tsx` | Category links (`/artikel/karir`, etc.) | Dynamic from CMS categories |
| `SearchableSelect.tsx` | `"Cari provinsi..."` placeholder | Generic prop |
| `JobSidebar.tsx` | Work policy options, salary ranges | Config or from CMS |

### Type Safety
- `ArticleListPage.tsx`, `ArticleSidebar.tsx`: Article types use `any` instead of proper interfaces
- `Header.tsx`: `user` typed as `any`
- API routes: Some responses use `any` for CMS data

---

## Recommendations

### Immediate Actions (High Priority)
1. **Delete 7 dead code files** — `ArticlePage`, `BookmarkPage`, `CMSContent`, `JobArchiveSkeleton`, `ArticleArchiveSkeleton`, `ArticleDetailSkeleton`, `JobDetailSkeleton`
2. **Add `'use client'` to `ShareButton.tsx`** — currently works by accident
3. **Replace 15+ `console.error/log` calls** with the existing structured `logger`
4. **Extract `formatDate()` to shared utility** — remove from `JobCard.tsx` and `JobDetailPage.tsx`

### Short-Term Refactoring (Medium Priority)
5. **Split `JobSearchPage.tsx` (1107 lines)** into:
   - `useJobSearch` hook (URL state, fetching, pagination)
   - `JobFilterBar` component
   - `JobSearchResults` component
6. **Extract sidebar component in `JobDetailPage.tsx`** — render once, show/hide with CSS
7. **Clean auth remnants** from `Header.tsx`, `HomePage.tsx`, `JobDetailPage.tsx`
8. **Deduplicate CMS content styles** in `globals.css` (merge `.cms-content` and `.tiptap` rules)
9. **Make hardcoded values configurable** — stats, copyright year, category links, salary ranges

### Long-Term Improvements (Low Priority)
10. **Add proper article type interfaces** to replace `any` in article-related components
11. **Standardize CMS access** — route all CMS calls through service layer
12. **Use skeleton components or delete them** — add `loading.tsx` files for Suspense, or remove unused skeletons
13. **Enhance ESLint config** — add TypeScript rules, import ordering, unused import detection
14. **Add error tracking** — implement the TODO in `ErrorBoundary.tsx`
