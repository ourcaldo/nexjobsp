# Nexjob Frontend — Full Audit Report

**Date:** 2025-07-15  
**Project:** nexjobsp (Next.js 16 / React 19 / Tailwind CSS 4)  
**Scope:** Directory structure, code quality, performance, security, SEO, maintainability, dead code, optimization opportunities  
**Stats:** 98 TypeScript files · ~9,500 lines · 343 lines CSS

---

## Table of Contents

1. [Directory Structure Analysis](#1-directory-structure-analysis)
2. [Dead Code & Unused Files](#2-dead-code--unused-files)
3. [Architectural Concerns](#3-architectural-concerns)
4. [Code Quality & Correctness](#4-code-quality--correctness)
5. [Performance & Optimization](#5-performance--optimization)
6. [Security](#6-security)
7. [SEO & Accessibility](#7-seo--accessibility)
8. [Configuration & Build](#8-configuration--build)
9. [Testing & Observability](#9-testing--observability)
10. [Prioritized Recommendations](#10-prioritized-recommendations)
11. [Issue Tracker](#issue-tracker)

---

## 1. Directory Structure Analysis

### Current Tree

```
nexjobsp/
├── .eslintrc.json
├── .env.example
├── .gitignore
├── ecosystem.config.js          # PM2 config
├── jest.config.ts
├── jest.setup.ts
├── middleware.ts                 # Rate limiter + sitemap proxy
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tsconfig.json
│
├── app/                          # Next.js App Router pages & API routes
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── providers.tsx
│   ├── robots.txt/               # route handler for robots.txt
│   │   ├── route.ts
│   │   └── __tests__/route.test.ts
│   ├── api/
│   │   ├── advertisements/route.ts
│   │   ├── articles/
│   │   │   ├── route.ts
│   │   │   ├── slug/[slug]/route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── related/route.ts
│   │   ├── cms/test-connection/route.ts
│   │   ├── health/route.ts
│   │   ├── job-posts/
│   │   │   ├── route.ts
│   │   │   ├── by-ids/route.ts
│   │   │   ├── filters/route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── related/route.ts
│   │   └── pages/route.ts
│   ├── artikel/
│   │   ├── page.tsx
│   │   └── [category]/
│   │       ├── page.tsx
│   │       └── [slug]/
│   │           ├── page.tsx
│   │           └── ArticleContentWrapper.tsx
│   └── lowongan-kerja/
│       ├── page.tsx
│       ├── kategori/[slug]/page.tsx
│       ├── lokasi/[province]/
│       │   ├── page.tsx
│       │   └── [regency]/page.tsx
│       └── [category]/[id]/
│           ├── page.tsx
│           └── opengraph-image.tsx
│
├── components/
│   ├── Advertisement/
│   │   ├── AdDisplay.tsx
│   │   └── PopupAd.tsx
│   ├── Analytics/
│   │   ├── GoogleAnalytics.tsx
│   │   └── GoogleTagManager.tsx
│   ├── Layout/
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── SEO/
│   │   └── SchemaMarkup.tsx
│   ├── pages/                    # Page-level client components
│   │   ├── ArticleListPage.tsx
│   │   ├── ArticlePage.tsx       ⚠ DEAD CODE
│   │   ├── BookmarkPage.tsx      ⚠ DEAD CODE
│   │   ├── HomePage.tsx
│   │   ├── JobDetailPage.tsx
│   │   └── JobSearchPage.tsx     ⚠ 1,002 lines — needs refactor
│   ├── ui/
│   │   ├── ArticleArchiveSkeleton.tsx   ⚠ DEAD CODE
│   │   ├── ArticleDetailSkeleton.tsx    ⚠ DEAD CODE
│   │   ├── EmptyState.tsx
│   │   ├── JobApplicationModal.tsx
│   │   ├── JobArchiveSkeleton.tsx       ⚠ DEAD CODE
│   │   ├── JobCardSkeleton.tsx
│   │   ├── JobDetailSkeleton.tsx        ⚠ DEAD CODE
│   │   ├── ShareButton.tsx
│   │   ├── Toast.tsx
│   │   └── ToastProvider.tsx
│   ├── ArticleSidebar.tsx
│   ├── ArticleTableOfContents.tsx
│   ├── Breadcrumbs.tsx
│   ├── CMSContent.tsx                   ⚠ DEAD CODE
│   ├── ErrorBoundary.tsx
│   ├── JobCard.tsx
│   ├── JobSidebar.tsx
│   └── SearchableSelect.tsx
│
├── hooks/
│   ├── useAnalytics.ts
│   ├── useInfiniteScroll.ts
│   └── useSearchHistory.ts
│
├── lib/
│   ├── api/
│   │   └── response.ts
│   ├── cms/
│   │   ├── factory.ts
│   │   ├── interface.ts
│   │   ├── providers/
│   │   │   ├── articles.ts
│   │   │   ├── http-client.ts
│   │   │   ├── jobs.ts
│   │   │   ├── pages.ts
│   │   │   └── tugascms.ts
│   │   └── utils/
│   │       └── transformers.ts
│   ├── services/
│   │   ├── ArticleService.ts
│   │   ├── CategoryService.ts
│   │   ├── JobService.ts
│   │   ├── PageService.ts
│   │   └── SitemapService.ts
│   ├── utils/
│   │   ├── bookmarks.ts
│   │   ├── crypto.ts              ⚠ DEAD CODE
│   │   ├── csrf.ts                ⚠ DEAD CODE
│   │   ├── date.ts
│   │   ├── image.ts
│   │   ├── result.ts              ⚠ DEAD CODE
│   │   ├── sanitize.ts
│   │   └── xml-validator.ts       ⚠ DEAD CODE
│   ├── validation/
│   │   └── schemas.ts
│   ├── config.ts
│   ├── features.ts
│   ├── logger.ts
│   ├── rate-limit.ts
│   └── seo-templates.ts
│
├── styles/
│   └── globals.css
│
├── types/
│   └── job.ts
│
├── utils/                         ⚠ STRUCTURAL: duplicates lib/utils purpose
│   ├── schemaUtils.ts
│   ├── templateUtils.ts
│   ├── textUtils.ts
│   └── urlUtils.ts
│
└── docs/
    └── PROJECT_AUDIT_REPORT.md
```

### 1.1 Structural Issues

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| S1 | **Two `utils/` directories** | Medium | Root `utils/` (4 files) and `lib/utils/` (8 files) split utility code across two locations. The `tsconfig.json` maps `@/utils/*` → `./utils/*` and `@/lib/*` → `./lib/*`, making them both accessible but confusingly split. |
| S2 | **No `loading.tsx` or `error.tsx` boundaries** | Medium | None of the route segments define `loading.tsx` or `error.tsx`. Next.js App Router relies on these for Suspense boundaries and error recovery. Users see an unhandled blank state during async loading. |
| S3 | **No route groups for layout isolation** | Low | All public pages share the root layout. If admin pages or distinct layout variants are added later, the flat structure requires refactoring. |
| S4 | **`components/pages/` conflates with `app/`** | Low | Having page-level client components in `components/pages/` is a valid pattern, but the naming mirrors `app/` routes and can confuse newcomers. Consider renaming to `components/views/` or `components/features/`. |
| S5 | **`types/` contains only `job.ts`** | Low | CMS interface types (`Article`, `FilterData`, `Page`, etc.) live in `lib/cms/interface.ts`. The `types/` folder holds only `Job` + `AdminSettings`. Either consolidate all types into `types/` or move `job.ts` into `lib/cms/interface.ts`. |
| S6 | **`robots.txt/` route handler uses directory convention** | Info | `app/robots.txt/route.ts` is a valid but unusual pattern. Next.js 14+ supports `app/robots.ts` as a metadata convenience. |

### 1.2 Recommended Structure

```
nexjobsp/
├── app/                    # Keep as-is (mostly clean)
├── components/
│   ├── features/           # Rename from pages/ — page-level client views
│   ├── layout/             # Header, Footer
│   ├── ui/                 # Primitives: skeletons, buttons, modals
│   └── shared/             # Breadcrumbs, ErrorBoundary, etc.
├── hooks/                  # Keep as-is
├── lib/
│   ├── api/                # Keep response helpers
│   ├── cms/                # Keep provider pattern
│   ├── services/           # Keep service layer
│   ├── utils/              # Merge root utils/ here
│   └── validation/         # Keep Zod schemas
├── styles/
├── types/                  # Consolidate ALL type definitions
└── docs/
```

---

## 2. Dead Code & Unused Files

All files confirmed unused via grep search across the entire project:

| File | Lines | Evidence |
|------|-------|----------|
| `components/pages/ArticlePage.tsx` | 171 | Zero imports found. Archived article page component from earlier design. |
| `components/pages/BookmarkPage.tsx` | ~140 | Zero imports. No `/bookmark` page route exists in `app/`. |
| `components/CMSContent.tsx` | ~50 | Zero imports. Superseded by inline `dangerouslySetInnerHTML` + `sanitizeHTML()` usage. |
| `components/ui/JobArchiveSkeleton.tsx` | ~100 | Zero imports. Unused skeleton variant. |
| `components/ui/ArticleArchiveSkeleton.tsx` | ~80 | Zero imports. |
| `components/ui/ArticleDetailSkeleton.tsx` | ~80 | Zero imports. |
| `components/ui/JobDetailSkeleton.tsx` | 146 | Zero imports. `JobDetailPage.tsx` has its own inline loading state. |
| `lib/utils/crypto.ts` | 52 | Only imported by `csrf.ts` which is also dead. |
| `lib/utils/csrf.ts` | 81 | Zero imports from any non-dead file. CSRF middleware was never wired in. |
| `lib/utils/result.ts` | 90 | Zero imports. `Result<T,E>` type never adopted. |
| `lib/utils/xml-validator.ts` | 102 | Zero imports. XML validation done inline in `middleware.ts`. |

**Total dead code: ~1,092 lines across 11 files.**

### 2.1 Dead / Vestigial Code Within Active Files

| Location | Issue |
|----------|-------|
| `components/Layout/Header.tsx` | Auth-related state (`user`, `handleLogout`, login/signup links) — no auth system exists. ~40 lines. |
| `components/pages/HomePage.tsx` | `checkUser()` function (lines ~130-140) references removed auth system. |
| `components/pages/JobDetailPage.tsx` | Login modal state and auth check remnants. |
| `types/job.ts: AdminSettings` | Contains Supabase references in comments, auth page SEO properties that don't apply. ~30 lines of unused properties. |
| `lib/config.ts: storage{}` | Storage config block (access key, secret key, endpoint) is defined but never consumed anywhere. |
| `lib/validation/schemas.ts` | `createBookmarkSchema`, `deleteBookmarkSchema`, `updateProfileSchema`, `contactFormSchema`, `adminSettingsSchema` — none are actually imported/used. |

---

## 3. Architectural Concerns

### 3.1 CMS Provider Creates New Instance Per Service (No Singleton)

```typescript
// lib/cms/factory.ts
export const getCMSProvider = (): CMSProvider => {
  return new TugasCMSProvider(); // New instance every call
};

// Each service creates its own instance:
// JobService → getCMSProvider() → new TugasCMSProvider()  
// ArticleService → getCMSProvider() → new TugasCMSProvider()  
// CategoryService → getCMSProvider() → new TugasCMSProvider()  
// etc.
```

**Impact:** 5 separate `TugasCMSProvider` + `CMSHttpClient` + `JobOperations` (with its own `filterDataCache`) instances exist. The filter cache in `JobOperations` only benefits requests routed through `JobService` — if filters are fetched by a different code path, the cache is duplicated.

**Fix:** Cache the singleton in the factory:

```typescript
let cached: CMSProvider | null = null;
export const getCMSProvider = (): CMSProvider => {
  if (!cached) cached = new TugasCMSProvider();
  return cached;
};
```

### 3.2 Service Layer Adds No Value

Every service class (`JobService`, `ArticleService`, `CategoryService`, `PageService`, `SitemapService`) is a pure pass-through to `CMSProvider` with zero business logic. Example:

```typescript
class ArticleService {
  async getArticles(...) { return this.cms.getArticles(...); }   // pass-through
  async getArticleBySlug(...) { return this.cms.getArticleBySlug(...); }  // pass-through
}
```

This adds an unnecessary abstraction layer, 5 extra files (~240 lines), and mental overhead. The service pattern is justified when services add caching, validation, or business rules — none of which apply here.

**Recommendation:** Either:
- Delete the service layer and import from `getCMSProvider()` directly, OR
- Give services actual responsibilities (e.g., response caching, error mapping, metric recording)

### 3.3 Inconsistent Error Handling Patterns

| Pattern | Where Used |
|---------|-----------|
| Return empty/null silently | CMS provider methods (`jobs.ts`, `articles.ts`, `pages.ts`) |
| `console.error()` + return fallback | Most page routes, components |
| `logger.error()` + return fallback | API routes, `pages.ts` provider |
| Throw errors | Not used anywhere except `http-client.ts` `fetchWithTimeout()` |

The result is that errors are swallowed silently in many code paths. The `Result<T,E>` type in `lib/utils/result.ts` was designed for this but never adopted.

### 3.4 `not-found.tsx` Uses Inline Styles (160 lines)

The 404 page uses extensive inline `style={}` objects and mouse event handlers instead of Tailwind classes. This is the only file in the project that avoids Tailwind, creating a styling inconsistency. Also, it uses a `'use client'` directive just for `useRouter()` which isn't needed — `<Link>` handles navigation without client-side hooks.

### 3.5 `providers.tsx` Validates Config Client-Side Only

```typescript
// providers.tsx
useEffect(() => {
  const { validateConfig } = await import('@/lib/config');
  validateConfig();
}, []);
```

`validateConfig()` explicitly skips server-side validation (`if (typeof window === 'undefined') return true`). This means a missing `CMS_TOKEN` won't be caught until the first API call fails at runtime. Config validation should happen at build-time or server startup.

---

## 4. Code Quality & Correctness

### 4.1 Critical Issues

| # | Issue | File | Details |
|---|-------|------|---------|
| Q1 | **`ShareButton.tsx` missing `'use client'`** | `components/ui/ShareButton.tsx` | Uses `useState`, `useEffect`, `navigator.clipboard`, `window.location` — all require client. Works by accident because parent is 'use client', but the component is not correctly annotated. |
| Q2 | **Duplicate `formatDate()` utility** | `JobCard.tsx`, `JobDetailPage.tsx` | Both define their own `formatDate()` function instead of using the shared `formatRelativeDate()` from `lib/utils/date.ts`. |
| Q3 | **`any` type proliferation** | Multiple files | `filters?: any` in `getJobs()`, `transformCMSPageToPage(cmsPage: any)`, `getAdvertisements(): Promise<any>`, etc. At least 12 uses of `any` in the CMS provider layer. |
| Q4 | **`AdminSettings` type has camelCase/snake_case duplicates** | `types/job.ts` | `apiUrl` + `api_url`, `authToken` + `auth_token`, `siteTitle` + `site_title` — all properties exist in both conventions. This is a maintenance trap. |
| Q5 | **Inconsistent `revalidate` values** | Page routes | `app/page.tsx` uses `revalidate = 86400` (24h), job listing pages use `revalidate = 3600` (1h), article pages use `revalidate = 86400`. No documented rationale for the differences. |

### 4.2 Medium Issues

| # | Issue | File | Details |
|---|-------|------|---------|
| Q6 | **41 raw `console.error/warn/log` calls** | Project-wide | Despite having a structured `logger`, 41 calls remain scattered across middleware, page routes, components, and utilities. 4 of these are inside `logger.ts` itself (expected). ~37 should be migrated to `logger`. Note: client-side components (`'use client'`) can't directly use the server logger — a client-side log adapter is needed. |
| Q7 | **`ecosystem.config.js` sets `max_memory_restart: '10G'`** | `ecosystem.config.js` | 10 GB is unreasonably high; a Next.js app should restart at 1–2 GB max. This effectively disables PM2's memory guard. |
| Q8 | **`generateEtags: false` in `next.config.js`** | `next.config.js` | ETags are disabled, losing free conditional GET responses (304 Not Modified). No documented reason. |
| Q9 | **`tsconfig.json` targets `es2017` with `es6` lib** | `tsconfig.json` | Target is `es2017` but lib is `es6`. Should be at least `es2017` lib or preferably `["dom", "dom.iterable", "esnext"]` for modern Next.js. Also uses `"jsx": "react-jsx"` instead of the recommended `"preserve"` for Next.js App Router. |
| Q10 | **MongoDB-style `_id.$oid` and `id_obj.$numberInt` in Job type** | `types/job.ts`, `jobs.ts` | These fields are vestiges of a MongoDB data model but the CMS uses PostgreSQL. They're populated with UUID strings, causing type confusion. |

---

## 5. Performance & Optimization

### 5.1 High Impact

| # | Issue | Impact | Details |
|---|-------|--------|---------|
| P1 | **`JobSearchPage.tsx` is 1,002 lines** | Large bundle | This single client component bundles all search, filter, pagination, and display logic. It should be split into hooks (`useJobSearch`, `useJobFilters`) and sub-components (`FilterPanel`, `SearchResults`, `Pagination`). |
| P2 | **`JobDetailPage.tsx` duplicates sidebar JSX** | ~150 wasted lines | The sidebar is rendered twice (mobile + desktop) with nearly identical JSX. Extract a `<JobSidebarPanel />` component. |
| P3 | **No `loading.tsx` Suspense boundaries** | Poor perceived perf | Without `loading.tsx`, navigations to server-rendered pages show no visual feedback. Add skeleton loading states in `app/lowongan-kerja/loading.tsx` and `app/artikel/loading.tsx`. |
| P4 | **CMS provider factory creates duplicate instances** | Memory waste | See §3.1. Each of the 5 services gets its own `TugasCMSProvider` instance, wasting memory and preventing shared caching. |
| P5 | **`getRelatedArticles()` makes 2–3 sequential HTTP calls** | Slow | First fetches the article to get categories, then fetches articles by category, then filters and slices. This could be a single CMS API call if the backend supports a `related` endpoint. |

### 5.2 Medium Impact

| # | Issue | Impact | Details |
|---|-------|--------|---------|
| P6 | **No `next/dynamic` lazy loading** | Bundle size | Large client components (`JobSearchPage`, `HomePage`, `PopupAd`) are statically imported. Use `dynamic(() => import(...), { ssr: false })` for interactive-only components like `PopupAd`, `ShareButton`, `JobApplicationModal`. |
| P7 | **`globals.css` has duplicate selectors** | CSS bloat | `.cms-content` and `.tiptap` rules overlap significantly. The file is 343 lines — consolidate shared rules. |
| P8 | **`wpLocationMappings` hardcoded in `urlUtils.ts`** | Maintenance | 37 province-to-ID mappings are hardcoded. If provinces change, this requires a code change. Should come from the CMS/API. |
| P9 | **`schemaUtils.ts` is 261 lines** | Could be leaner | JSON-LD schema generation functions contain a lot of inline object literals. Consider using a structured builder or template approach. Not urgent. |
| P10 | **Image in `not-found.tsx` loaded from CDN without blur placeholder** | LCP | The `nexjob.b-cdn.net/404.png` image has no `placeholder="blur"` or `blurDataURL`, causing a content flash on slow connections. |

### 5.3 Low Impact

| # | Issue | Details |
|---|-------|---------|
| P11 | `@types/dompurify` in dependencies | `dompurify` was replaced by `sanitize-html` but its types package remains. Unused dep. |
| P12 | `dompurify` in dependencies | The actual package is also still in `package.json` but unused. Only `sanitize-html` is imported. |
| P13 | `tailwind.config.js` exists but is empty/not found | Tailwind 4 uses CSS-first config via `globals.css`. The JS config file may be vestigial. |

---

## 6. Security

All critical security issues from the first audit have been fixed. Remaining:

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| Sec1 | **`console.error` leaks in sitemap middleware** | Low | `middleware.ts` still uses `console.error` with full error objects. In edge runtime, these appear in platform logs but controlled environments are fine. Migrate to `logger` for consistency. |
| Sec2 | **Rate limiter is in-memory only** | Known | Documented decision — works for single-instance deployment behind PM2. Not effective with horizontal scaling (multiple instances). Would need Redis/KV store for distributed deployment. |
| Sec3 | **CSP allows `'unsafe-inline'` and `'unsafe-eval'` for scripts** | Medium | Required for Google Tag Manager and ad scripts. Document this trade-off. Consider nonce-based CSP for future improvement. |
| Sec4 | **`getAdvertisements()` double-sets Authorization header** | Low | In `pages.ts`, `getAdvertisements()` manually sets an `Authorization` header that's already set by `CMSHttpClient.getHeaders()`, and extracts the token incorrectly with string manipulation. |

---

## 7. SEO & Accessibility

### Status: Strong Foundation

The project has good SEO infrastructure:
- JSON-LD schemas (Website, Organization, JobPosting, BreadcrumbList, BlogPosting)
- Dynamic `generateMetadata()` on all page routes
- Canonical URLs with trailing slashes
- Open Graph + Twitter Card tags
- ISR (`revalidate`) on all pages
- Proper heading hierarchy in most components

### Remaining Issues

| # | Issue | Details |
|---|-------|---------|
| SEO1 | **No `generateMetadata()` for category job pages** | `app/lowongan-kerja/kategori/[slug]/page.tsx` — verify `generateMetadata` delivers category-specific titles. |
| SEO2 | **Missing `alt` text on some images** | `Header.tsx` logo and some article images use generic or empty `alt` attributes. |
| SEO3 | **Skip-to-content link in `layout.tsx`** | Good practice — present and working. The CSS class `skip-to-content` should be verified to be visually hidden until focused. |
| SEO4 | **No `sitemap.xml` entry for artikel category pages** | The middleware proxies sitemap XML from CMS. Verify CMS generates entries for `/artikel/[category]/` pages. |
| SEO5 | **`seoTemplates` used only on homepage** | `generatePageSeo` helper and `seoTemplates` constants exist but only `seoTemplates.ogImages.home` is used from page routes. The `location()`, `category()`, `jobsPage()`, `articlesPage()` helpers are unused — page routes inline their own SEO strings. |

---

## 8. Configuration & Build

### 8.1 `tsconfig.json` Issues

```jsonc
{
  "target": "es2017",        // ⚠ Should be "es2022" or "esnext" for Next.js 16
  "lib": ["dom", "dom.iterable", "es6"],  // ⚠ "es6" is outdated; use "esnext"
  "jsx": "react-jsx",        // ⚠ Next.js recommends "preserve"
  "moduleResolution": "node"  // ⚠ Should be "bundler" for Next.js ≥13.4
}
```

### 8.2 `package.json` Issues

| Issue | Details |
|-------|---------|
| `@types/dompurify` in dependencies (not devDependencies) | Should be devDependencies and can be removed entirely since dompurify is unused. |
| `@types/sanitize-html` in dependencies (not devDependencies) | Should be in devDependencies. |
| `dompurify` in dependencies | Unused — `sanitize-html` is used instead. Remove. |
| `eslint-config-next` is v14 | Project uses Next.js 16; eslint config should be `^16.x`. |
| `autoprefixer` in devDependencies | Tailwind CSS 4 handles autoprefixing internally; this is unused. |
| Missing `"type": "module"` | `postcss.config.mjs` uses ESM but `next.config.js` uses CJS (`require`). Inconsistent module system. |

### 8.3 `next.config.js` Issues

| Issue | Details |
|-------|---------|
| `swcMinify: true` | Deprecated in Next.js 15+; SWC minification is now the default. Remove. |
| `generateEtags: false` | Disables free 304 responses. Remove unless there's a specific reason. |
| Rewrite `/bookmark/` → `/bookmarks` | No `/bookmarks` page exists. Dead rewrite rule. |
| Rewrite `/admin` → `/backend/admin` | No `/backend/admin` page exists. Dead rewrite rule. |

### 8.4 `ecosystem.config.js` Issues

| Issue | Details |
|-------|---------|
| `max_memory_restart: '10G'` | Should be `'1G'` or `'2G'`. |
| `instances: 'max'` | Uses all CPU cores. For a single VPS, consider `instances: 2` to leave resources for OS/DB. |
| Hardcoded `cwd: '/var/www/nexjob-frontend'` | Environment-specific path. |

---

## 9. Testing & Observability

### 9.1 Testing

| Issue | Details |
|-------|---------|
| **Only 1 test file exists** | `app/robots.txt/__tests__/route.test.ts` — tests the robots.txt handler only. |
| **0% coverage** on services, CMS providers, utilities, hooks, components | No unit tests, integration tests, or e2e tests for any business logic. |
| **Jest configured but unused** | `jest.config.ts`, `jest.setup.ts` exist but the test suite is essentially empty. |
| **No CI pipeline** | No GitHub Actions, no lint/test automation. |

### 9.2 Observability

| Issue | Status |
|-------|--------|
| Structured logger | ✅ Implemented (`lib/logger.ts`) with JSON output, child scoping, error serialization |
| Logger adoption | ⚠ Only API route handlers use `logger.child()`. 37+ `console.error` calls remain outside API routes. |
| Health check endpoint | ✅ `GET /api/health` with CMS connectivity, uptime, version, latency |
| Error tracking (Sentry/etc.) | ❌ Not implemented (deferred). |
| Performance monitoring | ❌ No Web Vitals reporting, no server timing. |
| Uptime monitoring | ❌ No external health check monitoring configured. |

---

## 10. Prioritized Recommendations

### Critical (Should Fix)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| **R1** | Delete 11 dead code files (~1,092 lines) | 10 min | Clean codebase, smaller bundle |
| **R2** | Remove vestial auth code from `Header.tsx`, `HomePage.tsx`, `JobDetailPage.tsx` | 30 min | Remove confusing dead state, reduce client JS |
| **R3** | Add `'use client'` to `ShareButton.tsx` | 1 min | Correctness fix |
| **R4** | Make CMS factory a singleton (§3.1) | 5 min | Fix duplicated cache instances, save memory |
| **R5** | Fix `ecosystem.config.js` — `max_memory_restart: '1G'` | 1 min | Prevent unbounded memory growth |

### High Priority

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| **R6** | Add `loading.tsx` skeletons for `/lowongan-kerja/` and `/artikel/` routes | 1 hour | Dramatically better UX during navigation |
| **R7** | Split `JobSearchPage.tsx` into hooks + sub-components | 2-3 hours | Maintainability, testability, bundle optimization |
| **R8** | Merge root `utils/` into `lib/utils/` | 30 min | Clean structure, single source of truth |
| **R9** | Remove `dompurify` and `@types/dompurify` from `package.json` | 1 min | Remove unused dependency |
| **R10** | Update `tsconfig.json` to modern settings | 10 min | Better type checking, align with Next.js 16 |
| **R11** | Remove dead rewrites/redirects from `next.config.js` | 5 min | Configuration hygiene |

### Medium Priority

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| **R12** | Migrate remaining `console.error` to `logger` (server-side files only) | 1 hour | Consistent structured logging |
| **R13** | Remove deprecated `swcMinify` and re-enable `generateEtags` | 2 min | Follow Next.js 16 best practices |
| **R14** | Extract duplicate `formatDate()` into shared util | 15 min | DRY principle |
| **R15** | Clean up `AdminSettings` type — remove snake/camel duplicates | 30 min | Type safety |
| **R16** | Add `error.tsx` boundaries for error recovery | 1 hour | Resilience |
| **R17** | Lazy-load `PopupAd`, `JobApplicationModal`, `ShareButton` with `next/dynamic` | 30 min | Smaller initial bundle |
| **R18** | Fix `getAdvertisements()` double authorization header | 10 min | Correctness |

### Low Priority / Nice to Have

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| **R19** | Delete or adopt `Result<T,E>` pattern from `lib/utils/result.ts` | Variable | Consistent error handling |
| **R20** | Refactor `not-found.tsx` to use Tailwind CSS instead of inline styles | 1 hour | Consistency |
| **R21** | Consolidate `types/job.ts` types into `lib/cms/interface.ts` | 30 min | Single type location |
| **R22** | Remove unused validation schemas from `lib/validation/schemas.ts` | 10 min | Dead code cleanup |
| **R23** | Add proper test suite for critical paths (services, CMS providers) | 4-8 hours | Reliability |
| **R24** | Set up GitHub Actions CI for lint + type-check + test | 2 hours | Quality gate |
| **R25** | Evaluate if service layer adds value; consider removing | 1 hour | Reduce abstraction |
| **R26** | Update `eslint-config-next` from v14 to v16 | 5 min | Alignment |
| **R27** | Remove `autoprefixer` from devDependencies | 1 min | Unused dep |
| **R28** | Unify `seoTemplates` usage — use the helpers or inline, not both | 30 min | Code consistency |

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| Total TypeScript files | 98 |
| Total lines of TypeScript | ~9,500 |
| Dead code files | 11 (~1,092 lines, 11.5%) |
| Raw `console.error/warn` calls | 41 (37 outside logger) |
| Test files | 1 |
| `any` type uses in CMS layer | 12+ |
| Largest file | `JobSearchPage.tsx` (1,002 lines) |
| Unused npm dependencies | 3 (`dompurify`, `@types/dompurify`, `autoprefixer`) |

---

## Issue Tracker

| ID | Issue | File(s) | Status |
|----|-------|---------|--------|
| **C-1** | Delete 11 dead code files (~1,092 lines) | `components/pages/ArticlePage.tsx`, `components/pages/BookmarkPage.tsx`, `components/CMSContent.tsx`, `components/ui/JobArchiveSkeleton.tsx`, `components/ui/ArticleArchiveSkeleton.tsx`, `components/ui/ArticleDetailSkeleton.tsx`, `components/ui/JobDetailSkeleton.tsx`, `lib/utils/crypto.ts`, `lib/utils/csrf.ts`, `lib/utils/result.ts`, `lib/utils/xml-validator.ts` | [x] |
| **C-2** | Remove vestigial auth code (dead login/logout state) | `components/Layout/Header.tsx`, `components/pages/HomePage.tsx`, `components/pages/JobDetailPage.tsx` | [x] |
| **C-3** | Add missing `'use client'` directive | `components/ui/ShareButton.tsx` | [x] |
| **C-4** | Make CMS factory a singleton (prevent duplicate cache instances) | `lib/cms/factory.ts` | [x] |
| **C-5** | Fix `max_memory_restart` from `'10G'` to `'1G'` | `ecosystem.config.js` | [x] |
| **H-1** | Add `loading.tsx` skeleton boundaries for route segments | `app/lowongan-kerja/loading.tsx`, `app/artikel/loading.tsx` | [x] |
| **H-2** | Split `JobSearchPage.tsx` (1,002 lines) into hooks + sub-components | `components/pages/JobSearchPage.tsx` | [x] |
| **H-3** | Merge root `utils/` into `lib/utils/` (two utils dirs) | `utils/*` → `lib/utils/` | [x] |
| **H-4** | Remove unused `dompurify` and `@types/dompurify` dependencies | `package.json` | [x] |
| **H-5** | Update `tsconfig.json` to modern Next.js 16 settings | `tsconfig.json` | [x] |
| **H-6** | Remove dead rewrites/redirects (`/bookmark/`, `/admin`) | `next.config.js` | [x] |
| **M-1** | Migrate remaining `console.error` to structured `logger` (server-side) | `middleware.ts`, `app/page.tsx`, `app/robots.txt/route.ts`, `app/lowongan-kerja/page.tsx`, `app/lowongan-kerja/[category]/[id]/page.tsx`, `app/lowongan-kerja/kategori/[slug]/page.tsx`, `app/artikel/page.tsx`, `app/artikel/[category]/page.tsx`, `app/artikel/[category]/[slug]/page.tsx` | [x] |
| **M-2** | Remove deprecated `swcMinify` and re-enable `generateEtags` | `next.config.js` | [x] |
| **M-3** | Extract duplicate `formatDate()` into shared util | `components/JobCard.tsx`, `components/pages/JobDetailPage.tsx` → `lib/utils/date.ts` | [x] |
| **M-4** | Clean `AdminSettings` type — remove snake/camel duplicates | `types/job.ts` | [x] |
| **M-5** | Add `error.tsx` boundaries for error recovery | `app/lowongan-kerja/error.tsx`, `app/artikel/error.tsx` | [x] |
| **M-6** | Lazy-load `PopupAd`, `JobApplicationModal`, `ShareButton` with `next/dynamic` | `app/layout.tsx`, `components/pages/JobDetailPage.tsx` | [x] |
| **M-7** | Fix `getAdvertisements()` double authorization header | `lib/cms/providers/pages.ts` | [x] |
| **L-1** | Delete or adopt `Result<T,E>` pattern | `lib/utils/result.ts` | [x] |
| **L-2** | Refactor `not-found.tsx` to use Tailwind CSS instead of inline styles | `app/not-found.tsx` | [x] |
| **L-3** | Consolidate `types/job.ts` types into `lib/cms/interface.ts` | `types/job.ts` → `lib/cms/interface.ts` | [x] |
| **L-4** | Remove unused validation schemas | `lib/validation/schemas.ts` | [x] |
| **L-5** | Add proper test suite for critical paths | `lib/services/`, `lib/cms/providers/` | [x] |
| **L-6** | Set up GitHub Actions CI (lint + type-check + test) | `.github/workflows/` | [x] |
| **L-7** | Evaluate if service layer adds value; consider removing | `lib/services/*` | [x] |
| **L-8** | Update `eslint-config-next` from v14 to v16 | `package.json` | [x] |
| **L-9** | Remove unused `autoprefixer` from devDependencies | `package.json` | [x] |
| **L-10** | Unify `seoTemplates` usage — use helpers or inline, not both | `lib/seo-templates.ts`, page routes | [x] |

---

*End of report.*
