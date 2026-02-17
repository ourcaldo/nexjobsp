# Nexjobsp — Full Project Audit Report

**Date:** 2025-06-17  
**Scope:** All files in `app/`, `components/`, `lib/`, `hooks/`, `utils/`, `types/`, `styles/`, and root config  
**Files audited:** 96  

---

## Executive Summary

The nexjobsp codebase is a Next.js 16 + Tailwind CSS 4 frontend for an Indonesian job board. The architecture is sound — clean route structure, proper ISR caching, server/client component separation, and a CMS provider pattern. However, the audit reveals **88 issues** across security, performance, accessibility, code quality, and configuration.

**Critical issues** center on XSS vectors (unsanitized CMS HTML, ad injection, allowed `style` attributes) and infrastructure (broken rate limiting in cluster mode, running as root). **High priority** items include type safety gaps (`any` abuse), silent error swallowing, and React 19 type mismatches.

| Severity | Count |
|----------|-------|
| 🔴 Critical (C) | 8 |
| 🟠 High (H) | 13 |
| 🟡 Medium (M) | 33 |
| 🟢 Low (L) | 21 |
| 🔵 Enhancement (E) | 13 |
| **Total** | **88** |

---

## Issue Tracker

### 🔴 Critical (C)

| Code | Description | Files Affected | Status |
|------|-------------|----------------|--------|
| C-1 | **XSS: Unsanitized CMS content via `dangerouslySetInnerHTML`** — Article content rendered without DOMPurify sanitization. CMS compromise = full XSS on all visitors. | `app/artikel/[category]/[slug]/ArticleContentWrapper.tsx` | ⬜ |
| C-2 | **XSS: Raw ad code injected via innerHTML + script execution** — `insertMiddleAd` and `AdDisplay` inject arbitrary HTML/JS from API without sanitization or sandboxing. | `app/artikel/[category]/[slug]/ArticleContentWrapper.tsx`, `components/Advertisement/AdDisplay.tsx` | ⬜ |
| C-3 | **XSS: `style` attribute allowed in sanitizer** — `DEFAULT_ALLOWED_ATTR` includes `style`, enabling CSS-based XSS (`expression()`, data exfiltration via `background:url()`). | `lib/utils/sanitize.ts` | ⬜ |
| C-4 | **Regex injection in `renderTemplate`** — Template keys used in `new RegExp()` without escaping. Metacharacters in keys cause crashes or unexpected matches. | `utils/templateUtils.ts` | ⬜ |
| C-5 | **Rate limiter broken in cluster mode** — In-memory `Map` is per-worker. PM2 `instances: 'max'` means each worker has independent limits. Rate limiting is effectively unenforced. | `middleware.ts`, `lib/rate-limit.ts` | ⬜ |
| C-6 | **IP spoofing bypasses rate limiter** — `getClientIp()` blindly trusts `x-forwarded-for` header. Any client can fake their IP to bypass rate limits entirely. | `lib/rate-limit.ts` | ⬜ |
| C-7 | **Running as root on VPS** — `cwd: '/root/nexjobsp'` in PM2 config. Application compromise = full system root access. | `ecosystem.config.js` | ⬜ |
| C-8 | **React 19 / @types/react 18 mismatch** — `@types/react@18.3.23` with `react@19.2.3`. Wrong type definitions, missing React 19 APIs, potential build failures. | `package.json` | ⬜ |

### 🟠 High (H)

| Code | Description | Files Affected | Status |
|------|-------------|----------------|--------|
| H-1 | **XSS: GA/GTM IDs interpolated into inline scripts** — `config.analytics.gaId` and `gtmId` are injected into `dangerouslySetInnerHTML` script strings without validation. | `components/Analytics/GoogleAnalytics.tsx`, `components/Analytics/GoogleTagManager.tsx` | ⬜ |
| H-2 | **XSS: `ArticleTableOfContents` uses `innerHTML` to parse content** — Raw untrusted HTML assigned to `tempDiv.innerHTML`. Use `DOMParser` instead (doesn't execute scripts). | `components/ArticleTableOfContents.tsx` | ⬜ |
| H-3 | **`notFound()` catch swallowed + null `filterData` TypeError** — `notFound()` throw caught by generic catch block. If `filterData` is null, `filterData.provinces` throws TypeError before `notFound()` runs. | `app/lowongan-kerja/[category]/[id]/page.tsx` | ⬜ |
| H-4 | **No input validation on API query params** — `parseInt` without bounds checking. `limit=999999` or `limit=NaN` can cause upstream API abuse or memory issues. | `app/api/job-posts/route.ts`, `app/api/articles/route.ts`, `app/api/pages/route.ts`, `app/api/job-posts/[id]/related/route.ts`, `app/api/articles/[id]/related/route.ts` | ⬜ |
| H-5 | **No length limit on `jobIds` array in POST body** — Client can send thousands of IDs, causing excessive upstream API load. | `app/api/job-posts/by-ids/route.ts` | ⬜ |
| H-6 | **Error details leaked to API clients** — `error.message` from server internals sent to clients. Can expose paths, database info, or service names. | `app/api/job-posts/route.ts`, `app/api/job-posts/filters/route.ts` | ⬜ |
| H-7 | **Pervasive `any` types in CMS layer** — 15+ function signatures use `any`, defeating TypeScript. Silent runtime bugs from typos or shape mismatches. | `lib/cms/providers/jobs.ts`, `lib/cms/providers/articles.ts`, `lib/cms/providers/tugascms.ts`, `lib/cms/utils/transformers.ts`, `lib/api/response.ts`, `utils/schemaUtils.ts` | ⬜ |
| H-8 | **Silent error swallowing in CMS providers** — All catch blocks return empty results `{ jobs: [], ... }` without logging. User sees no data and no error. | `lib/cms/providers/jobs.ts`, `lib/cms/providers/articles.ts`, `lib/cms/providers/pages.ts` | ⬜ |
| H-9 | **Unbounded parallel requests in `getJobsByIds`** — `Promise.all(ids.map(...))` with no concurrency limit. 100+ IDs = 100+ simultaneous HTTP requests. | `lib/cms/providers/jobs.ts` | ⬜ |
| H-10 | **ts-jest 29 / Jest 30 incompatibility** — `ts-jest@^29` targets Jest 29 but project uses `jest@^30`. Tests may fail or not run. | `package.json` | ⬜ |
| H-11 | **No `prefers-reduced-motion` media query** — Animations play unconditionally. WCAG 2.1 SC 2.3.3 violation for motion-sensitive users. | `styles/globals.css` | ⬜ |
| H-12 | **ArticleTableOfContents TOC is non-functional** — Heading IDs set on temp div don't match actual DOM. IntersectionObserver and scroll-to find no elements. | `components/ArticleTableOfContents.tsx` | ⬜ |
| H-13 | **PopupAd opens new tab on ANY click** — Global click listener opens `window.open()` on every page click. Hostile UX, browser popup blocker trigger, phishing vector. | `components/Advertisement/PopupAd.tsx` | ⬜ |

### 🟡 Medium (M)

| Code | Description | Files Affected | Status |
|------|-------------|----------------|--------|
| M-1 | **Duplicate data fetching** — `generateMetadata` and page component call same data function twice (no `cache()` wrapper). Double API calls on 5+ routes. | `app/artikel/page.tsx`, `app/lowongan-kerja/page.tsx`, `app/lowongan-kerja/kategori/[slug]/page.tsx`, `app/lowongan-kerja/lokasi/[province]/page.tsx`, `app/lowongan-kerja/lokasi/[province]/[regency]/page.tsx` | ⬜ |
| M-2 | **Missing loading.tsx for nested routes** — No streaming loading UI for article category, article detail, job detail, category, and location routes. | `app/artikel/[category]/`, `app/artikel/[category]/[slug]/`, `app/lowongan-kerja/[category]/[id]/`, `app/lowongan-kerja/kategori/[slug]/`, `app/lowongan-kerja/lokasi/` | ⬜ |
| M-3 | **`<a href>` used instead of `<Link>` for internal navigation** — Breadcrumbs and internal links use plain `<a>`, causing full-page reloads. | `app/lowongan-kerja/page.tsx`, `app/artikel/[category]/[slug]/page.tsx`, location pages, `components/Layout/Footer.tsx` | ⬜ |
| M-4 | **Unused imports across codebase** — `FilterData`, `ArrowRight`, `MapPin`, `Clock`, `Banknote`, `Building`, `Eye`, `normalizeSlug` imported but unused. | `app/page.tsx`, `app/artikel/[category]/[slug]/page.tsx`, `components/pages/HomePage.tsx`, `components/pages/JobDetailPage.tsx`, `components/pages/ArticleListPage.tsx`, `components/JobSidebar.tsx`, `app/lowongan-kerja/lokasi/[province]/page.tsx` | ⬜ |
| M-5 | **Deprecated `onKeyPress` used** — `onKeyPress` removed in modern DOM specs. Doesn't fire for some keys. | `components/pages/HomePage.tsx`, `components/pages/JobSearchPage.tsx` | ⬜ |
| M-6 | **Toast infinite re-render loop** — `onClose` in `useEffect` dependency array, but parent creates inline callback. Timer restarts infinitely. | `components/ui/Toast.tsx` | ⬜ |
| M-7 | **Toasts stack on same position** — All toasts render at `fixed bottom-4 right-4`, overlapping. Only last toast visible. | `components/ui/ToastProvider.tsx` | ⬜ |
| M-8 | **SearchableSelect missing ARIA combobox pattern** — No `role="combobox"`, `aria-expanded`, `aria-activedescendant`, keyboard scrolling. | `components/SearchableSelect.tsx` | ⬜ |
| M-9 | **Mobile menu: no focus trap, no Escape key, no scroll lock** — Keyboard users can tab outside menu. Page scrolls behind overlay. | `components/Layout/Header.tsx` | ⬜ |
| M-10 | **JobApplicationModal: no focus trap, Escape, ARIA, or backdrop close** — Missing `role="dialog"`, `aria-modal`. Focus escapes. Backdrop click doesn't close. | `components/ui/JobApplicationModal.tsx` | ⬜ |
| M-11 | **`<img>` tags injected without `alt` attributes** — String replacement adds styling to CMS images but doesn't ensure accessibility `alt` text. | `app/artikel/[category]/[slug]/ArticleContentWrapper.tsx` | ⬜ |
| M-12 | **`formatDistance` outputs English on Indonesian site** — `date-fns` defaults to English. No `{ locale: id }` passed. | `app/artikel/[category]/page.tsx`, `app/artikel/[category]/[slug]/page.tsx`, `components/pages/ArticleListPage.tsx` | ⬜ |
| M-13 | **ArticleSidebar passes empty `relatedArticles={[]}`** — Fetched related articles exist but aren't passed to sidebar. | `app/artikel/[category]/[slug]/page.tsx` | ⬜ |
| M-14 | **CSP allows `unsafe-eval` and `unsafe-inline`** — Enables XSS vectors. `unsafe-eval` should be dev-only. | `next.config.js` | ⬜ |
| M-15 | **PM2 config: npm wrapper, all cores, hardcoded log paths** — `script: 'npm'` breaks signal handling. `instances: 'max'` uses all CPUs. Hardcoded `/root/.pm2/logs/`. | `ecosystem.config.js` | ⬜ |
| M-16 | **~150 lines of duplicated CSS** — `.cms-content` and `.tiptap-*` styles are near-identical copies. | `styles/globals.css` | ⬜ |
| M-17 | **Duplicate feature flag systems** — `lib/config.ts` and `lib/features.ts` both define feature flags independently. | `lib/config.ts`, `lib/features.ts` | ⬜ |
| M-18 | **Duplicate API response helpers** — Both `successResponse`/`errorResponse` (Response) and `apiSuccess`/`apiError` (NextResponse) exported. | `lib/api/response.ts` | ⬜ |
| M-19 | **`validateConfig()` skips server-side validation** — Returns immediately for `typeof window === 'undefined'`, which is where env var validation matters most. | `lib/config.ts` | ⬜ |
| M-20 | **`getAllJobsForSitemap` has no upper bound** — While loop with no max page limit. CMS bug returning `hasMore: true` = infinite loop. | `lib/cms/providers/jobs.ts` | ⬜ |
| M-21 | **`getSitemapXML` uses fragile regex URL rewriting** — String replace on XML can corrupt non-URL content. | `lib/cms/providers/pages.ts`, `middleware.ts` | ⬜ |
| M-22 | **Service layer adds no value** — 5 service files are trivial pass-throughs with zero logic, caching, or error handling. | `lib/services/ArticleService.ts`, `lib/services/CategoryService.ts`, `lib/services/JobService.ts`, `lib/services/PageService.ts`, `lib/services/SitemapService.ts` | ⬜ |
| M-23 | **No localStorage JSON validation** — `JSON.parse(localStorage.getItem(...))` without try-catch. Corrupted data crashes UI. | `hooks/useSearchHistory.ts`, `lib/utils/bookmarks.ts` | ⬜ |
| M-24 | **`useJobSearch` hook is 488 lines** — Manages search, pagination, URL sync, analytics, filters, sidebar state in one hook. Untestable. | `hooks/useJobSearch.ts` | ⬜ |
| M-25 | **Bookmarks have no SSR guard** — Direct `localStorage` access without `typeof window` check. Crashes during SSR. | `lib/utils/bookmarks.ts` | ⬜ |
| M-26 | **No `collectCoverageFrom` in jest config** — Coverage collects from all files including generated code. | `jest.config.ts` | ⬜ |
| M-27 | **Missing test mocks** — No `window.matchMedia`, `IntersectionObserver`, `ResizeObserver` mocks. Components using these crash in tests. | `jest.setup.ts` | ⬜ |
| M-28 | **No global `focus-visible` styles** — No custom focus indicator for keyboard navigation across interactive elements. | `styles/globals.css` | ⬜ |
| M-29 | **Inconsistent `PaginationData` naming** — Mixes `snake_case` (`total_pages`) with `camelCase` (`hasNextPage`). `AdminSettings` has both `site_description` and `siteDescription`. | `lib/cms/interface.ts` | ⬜ |
| M-30 | **Test mock doesn't match production code** — Tests mock singleton `tugasCMSProvider` but route uses `new TugasCMSProvider()`. All tests pass vacuously. | `app/robots.txt/__tests__/route.test.ts` | ⬜ |
| M-31 | **`revalidate` inconsistency** — Homepage: 24h, articles list: 5min, article category: 1h, job detail: 5min. No documented strategy. | `app/page.tsx`, `app/artikel/page.tsx`, `app/artikel/[category]/page.tsx`, `app/lowongan-kerja/[category]/[id]/page.tsx` | ⬜ |
| M-32 | **`Job` interface missing `status`, `updated_at`, `deadline` fields** — Can't filter by status, show update dates, or display application deadlines. | `lib/cms/interface.ts` | ⬜ |
| M-33 | **`tsconfig.json` recommendations** — `jsx: "react-jsx"` should be `"preserve"`, missing `noUncheckedIndexedAccess`. | `tsconfig.json` | ⬜ |

### 🟢 Low (L)

| Code | Description | Files Affected | Status |
|------|-------------|----------------|--------|
| L-1 | **Not-found page uses English text** — "Uh-oh... I think I took a wrong turn." on an Indonesian site. | `app/not-found.tsx` | ⬜ |
| L-2 | **Breadcrumbs missing `aria-label="Breadcrumb"` and `<ol>/<li>` semantics** — Screen readers can't identify navigation purpose. | `components/Breadcrumbs.tsx`, multiple page files | ⬜ |
| L-3 | **Loading skeletons lack `role="status"` and `aria-busy`** — Assistive tech can't announce loading state. | `app/artikel/loading.tsx`, `app/lowongan-kerja/loading.tsx` | ⬜ |
| L-4 | **Suspense fallback is plain "Loading..." text** — Inconsistent with skeleton loaders used elsewhere. | `app/lowongan-kerja/page.tsx` | ⬜ |
| L-5 | **`console.warn` used instead of logger** — `robots.txt/route.ts` uses `console.warn` instead of structured logger. | `app/robots.txt/route.ts` | ⬜ |
| L-6 | **Missing `<main>` wrapper in article list page** — Inconsistent page structure and missing accessibility landmark. | `app/artikel/page.tsx` | ⬜ |
| L-7 | **`JobCard` not fully clickable** — Only title and "Lihat Detail" are links. Card hover suggests full interactivity but clicking body/tags/salary does nothing. | `components/JobCard.tsx` | ⬜ |
| L-8 | **Footer has 12+ placeholder `href="#"` links** — Scroll to top on click, non-functional, confusing UX. | `components/Layout/Footer.tsx` | ⬜ |
| L-9 | **Toast missing `role="alert"` / `aria-live`** — Screen readers don't announce toast notifications. | `components/ui/Toast.tsx` | ⬜ |
| L-10 | **Error retry buttons lack `aria-label`** — No descriptive label for screen readers. | `app/artikel/error.tsx`, `app/lowongan-kerja/error.tsx` | ⬜ |
| L-11 | **`Header` nav `hover:font-bold` causes layout shift** — Bold text is wider, making adjacent items jitter on hover. | `components/Layout/Header.tsx` | ⬜ |
| L-12 | **ArticleSidebar has hardcoded category links** — Links may not match actual CMS category slugs. | `components/ArticleSidebar.tsx` | ⬜ |
| L-13 | **`ShareButton` SSR/hydration mismatch** — `window.location.href` used during render. Empty on server, populated on client. | `components/ui/ShareButton.tsx` | ⬜ |
| L-14 | **`getAllCities` called twice in render** — Creates new arrays each call, triggering unnecessary re-renders of child components. | `components/JobSidebar.tsx` | ⬜ |
| L-15 | **`package.json` version is `0.0.0`** — Confusing logs and metrics. | `package.json` | ⬜ |
| L-16 | **Port exposed to client bundle** — `env: { PORT: process.env.PORT }` in next.config makes PORT available client-side via `process.env.PORT`. | `next.config.js` | ⬜ |
| L-17 | **Hardcoded social media URLs in Organization schema** — May not exist or may change. Should be in config. | `utils/schemaUtils.ts` | ⬜ |
| L-18 | **Breadcrumb schema duplicates position numbers** — Home inserted at position 1, remaining items also start at 1. | `utils/schemaUtils.ts` | ⬜ |
| L-19 | **`ensureTrailingSlash` false positive on domains** — Checks for `.` to detect file extensions but domain names also have dots. | `utils/urlUtils.ts` | ⬜ |
| L-20 | **`Math.ceil` rounding in date utils** — Shows "1 jam lagu" when only 1 minute passed. Should use `Math.floor`. | `lib/utils/date.ts` | ⬜ |
| L-21 | **Fallback sitemap `<lastmod>` uses current date** — Search engines see constantly changing lastmod, reducing crawl trust. | `middleware.ts` | ⬜ |

### 🔵 Enhancement (E)

| Code | Description | Files Affected | Status |
|------|-------------|----------------|--------|
| E-1 | **Move shared settings to constants file** — Same `settings` object duplicated in 5+ job page files. | `app/lowongan-kerja/page.tsx` and 4 other page files | ⬜ |
| E-2 | **Extract `transformArticle()` utility** — Article field mapping logic copy-pasted in 3 files. | `app/artikel/page.tsx`, `app/artikel/[category]/page.tsx`, `app/artikel/[category]/[slug]/page.tsx` | ⬜ |
| E-3 | **Add missing `generateStaticParams`** — No pre-built pages for location/regency routes. Cold-start penalty for popular pages. | `app/lowongan-kerja/lokasi/[province]/[regency]/page.tsx` | ⬜ |
| E-4 | **Add `output: 'standalone'` for Docker/PM2** — Reduces deployed `node_modules` size significantly. | `next.config.js` | ⬜ |
| E-5 | **Metadata missing `viewport` and `themeColor`** — Root layout only sets favicon. Missing standard metadata. | `app/layout.tsx` | ⬜ |
| E-6 | **Move Organization/WebSite schema to layout** — Currently only on homepage, should be site-wide. | `app/layout.tsx`, `app/page.tsx` | ⬜ |
| E-7 | **Cache ad data across instances** — Each `AdDisplay` makes its own `fetch()`. Page with 3 ad slots = 3 identical API calls. | `components/Advertisement/AdDisplay.tsx` | ⬜ |
| E-8 | **Add `React.memo` to `JobCard`** — Rendered in lists of 6+. All cards re-render when parent state changes. | `components/JobCard.tsx` | ⬜ |
| E-9 | **Breadcrumbs component: add JSON-LD structured data** — Missing BreadcrumbList schema for rich search results. | `components/Breadcrumbs.tsx` | ⬜ |
| E-10 | **Add `coverageThreshold` to jest config** — No minimum coverage enforcement. | `jest.config.ts` | ⬜ |
| E-11 | **Add test coverage for CMS providers, hooks, and sanitize** — 3 existing test files cover only date, text utils, and schemas. | `lib/cms/providers/`, `hooks/`, `lib/utils/sanitize.ts` | ⬜ |
| E-12 | **Implement ErrorBoundary error tracking** — `errorData` object created but never sent anywhere (TODO in code). | `components/ErrorBoundary.tsx` | ⬜ |
| E-13 | **ArticleListPage tags are non-functional** — Tags have `cursor-pointer` and hover styling but no onClick or Link. | `components/pages/ArticleListPage.tsx` | ⬜ |

---

## Priority Fix Order

### Phase 1 — Security (C-1 through C-8, H-1 through H-6)
1. Sanitize all CMS HTML with DOMPurify before rendering (C-1, C-2)
2. Remove `style` from sanitizer allowlist (C-3)
3. Escape regex keys in `renderTemplate` (C-4)
4. Fix rate limiter for cluster mode or switch to single instance (C-5, C-6)
5. Create non-root user for VPS deployment (C-7)
6. Update `@types/react` to v19 (C-8)
7. Validate GA/GTM IDs against regex patterns (H-1)
8. Replace `innerHTML` with `DOMParser` in TOC (H-2)
9. Add input validation bounds on API params (H-4, H-5)
10. Return generic error messages to clients (H-6)

### Phase 2 — Stability & Types (H-7 through H-13, M-1 through M-6)
1. Replace `any` types with proper interfaces (H-7)
2. Add error logging to CMS providers (H-8)
3. Add concurrency limit to `getJobsByIds` (H-9)
4. Fix ts-jest version (H-10)
5. Add `prefers-reduced-motion` (H-11)
6. Fix TOC heading ID matching (H-12)
7. Fix PopupAd global click behavior (H-13)
8. Wrap data functions with `cache()` (M-1)
9. Add loading.tsx skeletons (M-2)

### Phase 3 — Quality & Accessibility (M-7 through M-33, L-*, E-*)
1. Fix toast, modal, and menu accessibility (M-6, M-7, M-9, M-10)
2. Add ARIA patterns to SearchableSelect (M-8)
3. Localize date-fns to Indonesian (M-12)
4. Replace `<a>` with `<Link>` for internal routes (M-3)
5. Clean up unused imports (M-4)
6. Consolidate duplicated code (M-16 through M-18, E-1, E-2)
7. Fix remaining Low and Enhancement items

---

*Report generated by full codebase audit covering 96 files across all directories.*
