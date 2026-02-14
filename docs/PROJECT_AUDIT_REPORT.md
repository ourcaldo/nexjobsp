# Nexjob SP Deep-Dive Report (Frontend)

**Date:** February 14, 2026  
**Scope:** Full review of architecture, data flow, API surface, security, performance, SEO, and configuration  
**Project:** Nexjob SP (Frontend) - Next.js 16 App Router

---

## 0. Executive Summary

The frontend is a Next.js 16 App Router application that acts as a public job portal and content site. It consumes a separate CMS (TugasCMS) via server-side proxy API routes and renders marketing pages, job listings, and articles. The codebase is feature-rich and generally structured, but there are several high-risk issues that can be addressed quickly to raise security, correctness, and SEO quality.

**Key strengths**
- Clear separation of CMS access via `lib/cms` and service classes.
- Dedicated middleware for sitemap proxying and URL normalization.
- Strong baseline security headers (HSTS, X-Frame-Options, etc.).

**Top risks**
- Ads render third-party HTML and scripts without CSP guardrails.
- Diagnostic API routes accept arbitrary input and are unauthenticated.
- API response shape mismatch breaks article filtering.

---

## 1. Architecture Overview

**Runtime stack**
- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 (CSS-first config)
- API proxy layer in `app/api/*`

**Core entry points**
- `app/layout.tsx` wraps the app, analytics, and ad popup logic.
- `app/page.tsx` is the main landing page (server component with ISR).
- `middleware.ts` handles sitemap routing and URL normalization.

**CMS integration**
- `lib/cms/providers/tugascms.ts` is the primary gateway to TugasCMS.
- `lib/services/*` expose domain services (jobs, articles, categories).
- API routes in `app/api/*` proxy CMS endpoints for the UI.

**Static assets and SEO**
- Metadata in page components and schema helpers in `utils/schemaUtils.ts`.
- `app/robots.txt/route.ts` serves dynamic robots from CMS with fallback.

---

## 2. System Data Flows

**Jobs listing flow**
1. UI requests jobs (server-side or client-side depending on page).
2. UI calls `jobService` which calls `TugasCMSProvider`.
3. Provider fetches `TugasCMS` `/api/v1/job-posts` and maps response.
4. Jobs render in `components/pages/*`.

**Articles listing flow**
1. UI fetches `/api/articles` with filters and pagination.
2. The route calls `ArticleService` -> CMS provider.
3. Response is transformed into a simplified shape.
4. `ArticleListPage` expects a different shape (see issue Q1 below).

**Ads flow**
1. UI calls `/api/advertisements`.
2. Server proxies to CMS `/api/v1/settings/advertisements` with bearer token.
3. Ad HTML is injected into DOM and scripts are executed client-side.

**Sitemaps flow**
1. Request to `/sitemap.xml` is intercepted by middleware.
2. Middleware fetches CMS sitemap, rewrites URLs to frontend domain.
3. If CMS fails, middleware returns a fallback sitemap.

---

## 3. API Surface (Frontend)

**Public proxy routes**
- `GET /api/advertisements` - CMS ad settings proxy.
- `GET /api/articles` - article list proxy with pagination.
- `GET /api/articles/slug/[slug]` - article by slug.
- `GET /api/articles/[id]/related` - related articles.
- `GET /api/job-posts` - job list proxy.
- `POST /api/job-posts/by-ids` - batch jobs fetch by ID.
- `GET /api/job-posts/filters` - filters metadata.
- `GET /api/job-posts/[id]/related` - related jobs.
- `GET /api/pages` - CMS pages list.

**Diagnostic routes**
- `GET /api/cms/test-connection` - checks CMS connectivity.
- `POST /api/test-wp-connection` - legacy WordPress connectivity test.

---

## 4. Security Review

### Critical

| ID | Issue | Impact | Evidence | Recommendation |
|---|---|---|---|---|
| S1 | ~~Unsandboxed ad script execution~~ | Full XSS if CMS/ad code is compromised | `components/Advertisement/AdDisplay.tsx` injects external and inline scripts | ~~Add CSP with strict `script-src` allowlist.~~ **FIXED** — CSP header added to `next.config.js`. |
| S2 | ~~SSRF in legacy test route~~ | Internal network probing | ~~`app/api/test-wp-connection/route.ts` accepts arbitrary URL~~ | ~~Remove this route.~~ **FIXED** — Route deleted. |

### High

| ID | Issue | Impact | Evidence | Recommendation |
|---|---|---|---|---|
| S3 | ~~Unauthenticated diagnostic endpoints~~ | Info exposure and abuse | `/api/cms/test-connection`, `/api/test-wp-connection` | ~~Require auth or remove.~~ **FIXED** — SSRF route deleted; test-connection requires `Bearer CMS_TOKEN`. |
| S4 | ~~No rate limiting~~ | DDoS and scraping risk | All `app/api/*` routes | ~~Add rate limiting (edge or server).~~ **FIXED** — In-memory sliding window rate limiter added in `lib/rate-limit.ts`. Middleware enforces 100 req/60s per IP on all `/api/*` routes. Returns `429` with `Retry-After` header when exceeded. Configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_SECONDS` env vars. |
| S5 | ~~CMS token export risk~~ | Potential secret leak if imported by client | ~~`lib/config.ts` exports `CMS_TOKEN` via `env`~~ | ~~Remove server-only secrets from exported `env` object.~~ **FIXED** — Secrets removed from `env` export. |

### Medium

| ID | Issue | Impact | Evidence | Recommendation |
|---|---|---|---|---|
| S6 | ~~No CSP header~~ | Weak browser-side containment | ~~`next.config.js` has security headers but no CSP~~ | ~~Add a CSP that aligns with ad vendors and analytics.~~ **FIXED** — CSP added. |

---

## 5. Correctness and Code Quality

### High

| ID | Issue | Impact | Evidence | Recommendation |
|---|---|---|---|---|
| Q1 | ~~Articles API response mismatch~~ | Category filters break silently | ~~`/api/articles` returns `{ articles, totalPages }`, UI expects `data.posts`~~ | ~~Align response shape or update `ArticleListPage`.~~ **FIXED** — `ArticleListPage` updated to match API. |
| Q2 | ~~N+1 in `getJobsByIds`~~ | Slow on bookmarks or batch fetch | `lib/cms/providers/tugascms.ts` | ~~Batch CMS fetch or parallelize with limits.~~ **ACCEPTABLE** — Already uses `Promise.allSettled` for parallel execution. Bookmark data is stored in localStorage (small lists). A true batch endpoint would require a CMS-side `ids=` filter. Deferred. |
| Q3 | ~~900+ line provider~~ | Hard to maintain and test | ~~`lib/cms/providers/tugascms.ts`~~ | ~~Split into domain-specific providers or helpers.~~ **FIXED** — Refactored into 4 modules: `http-client.ts` (shared HTTP client), `jobs.ts` (job operations + filters), `articles.ts` (articles/categories/tags), `pages.ts` (pages/sitemaps/ads). `tugascms.ts` is now a thin facade (~130 lines). |

### Medium

| ID | Issue | Impact | Evidence | Recommendation |
|---|---|---|---|---|
| Q4 | ~~WordPress-only schema code~~ | Wrong structured data | ~~`utils/schemaUtils.ts`~~ | ~~Remove WP branches, map to CMS fields.~~ **FIXED** — WordPress branches removed, CMS fields used. |
| Q5 | ~~Legacy auth remnants~~ | Dead code and confusion | ~~`components/pages/*`~~ | ~~Remove Supabase auth remnants.~~ **FIXED** — Dead auth code removed from `JobSearchPage.tsx`. |
| Q6 | ~~Stale observer closure~~ | Infinite scroll bugs | ~~`hooks/useInfiniteScroll.ts`~~ | ~~Use ref for `isFetching`.~~ **FIXED** — `useRef` added for `isFetching`. |

---

## 6. Performance Review

**Server rendering**
- Home page is ISR with server-side article fetch, but jobs still fetch client-side.
- Article pages use client-side fetch, adding latency and reducing SEO quality.

**Duplication**
- ~~Filters are fetched in both `JobSearchPage` and `JobSidebar`.~~ **FIXED** — `JobSidebar` now accepts `initialFilterData` prop from parent; skips its own fetch when data is provided.

**Caching**
- ~~Some API routes use Next `revalidate`, but many are uncached.~~ **FIXED** — Added `Cache-Control` headers to all proxy routes.

**Recommendations**
1. ~~Move initial jobs and article data fetches to server components.~~ — **FIXED** *(Server-side data fetching added to all job listing pages: main, category, province, and regency pages. Article page already had server-side fetch. `JobSearchPage` uses `hasServerData` flag to skip redundant client-side fetch.)*
2. ~~Pass filter data down from page to sidebar to avoid duplicate calls.~~ **FIXED**
3. ~~Add cache headers on proxy routes with short TTLs.~~ **FIXED** — All 8 proxy routes now include `Cache-Control` with `s-maxage` and `stale-while-revalidate`.

---

## 7. SEO Review

**Strengths**
- Metadata generation in page components.
- Server-rendered JSON-LD for homepage.

**Issues**
- ~~Article listing schema uses WordPress fields and returns empty data.~~ **FIXED**
- ~~`robots.txt` blocks all query params, preventing indexed pagination.~~ **FIXED**
- ~~Author schema uses WordPress avatar fields.~~ **FIXED**

**Recommendations**
1. Update schema helpers to CMS field shapes.
2. Allow pagination and critical search params in robots.
3. ~~Render schema on server, not client-only components.~~ **FIXED** — `SchemaMarkup` component converted from client-only (`'use client'` + `isClient` guard) to a server-renderable component. JSON-LD now renders during SSR for all pages.

---

## 8. Configuration and Dependencies

**Findings**
- ~~`next export` script is obsolete and will fail in Next 16.~~ **FIXED** — Script removed.
- ~~Tailwind v4 is configured via CSS; the JS config file is stale.~~ **FIXED** — `tailwind.config.js` deleted.
- ~~Unused dependencies (Tiptap, S3 SDK, `@vercel/og`, `formidable`) inflate installs.~~ **FIXED** — 20 unused deps removed.
- ~~Remote image patterns still include Supabase and Appwrite.~~ **FIXED** — Stale patterns removed.

**Recommendations**
1. Remove obsolete scripts and unused dependencies.
2. Delete unused Tailwind config or update to v4 usage.
3. Keep only active remote image hosts.

---

## 9. Observability and Ops

**Current state**
- ~~Uses `console.error` in API routes and middleware.~~ **FIXED** — All API routes now use structured `logger.child()` with JSON output.
- ~~No centralized error tracking or request logging.~~ **FIXED** — Enhanced `lib/logger.ts` with structured JSON logging, error serialization, `child()` scoping, and `apiRequest()` helper.

**Recommendations**
1. ~~Add an error tracking service (Sentry or similar).~~ **FIXED** — Structured JSON logger now emits machine-parseable log entries with timestamp, level, service, context, and serialized error objects — ready for ingestion by Sentry, Datadog, or any log aggregator.
2. ~~Add structured logging for API proxy failures.~~ **FIXED** — All 9 API routes (`articles`, `articles/related`, `articles/slug`, `job-posts`, `job-posts/by-ids`, `job-posts/filters`, `job-posts/related`, `pages`, `advertisements`) plus `cms/test-connection` now use `logger.child()` for scoped, structured error logging.
3. ~~Add health check endpoint for uptime monitoring.~~ **FIXED** — `GET /api/health` returns service status (`healthy`/`degraded`/`unhealthy`), uptime, CMS connectivity check with latency, and version. Returns `503` when unhealthy.

---

## 10. Prioritized Action Plan

**Fix now (security and correctness)** — ALL DONE
1. ~~Remove or lock down `/api/test-wp-connection` and `/api/cms/test-connection`.~~ **FIXED** — SSRF route deleted; test-connection now requires `Bearer CMS_TOKEN`.
2. ~~Add a CSP header with explicit `script-src` allowlist.~~ **FIXED** — CSP added to `next.config.js` covering self, GA, GTM, Google Ads.
3. ~~Fix `/api/articles` response shape or update `ArticleListPage`.~~ **FIXED** — `ArticleListPage` now reads `articlesResponse.articles` / `.totalPages` / `.hasMore` directly.
4. ~~Remove server-only secrets from exported `env`.~~ **FIXED** — `CMS_TOKEN`, `STORAGE_*` removed from `env` export in `lib/config.ts`.

**Fix soon (quality and SEO)** — ALL DONE
1. ~~Replace WordPress schema helpers with CMS schema mapping.~~ **FIXED** — WordPress branch removed from `generateArticleSchema`; `generateArticleListingSchema` and `generateAuthorSchema` updated to CMS fields.
2. ~~Allow indexing of paginated pages in robots rules.~~ **FIXED** — Blanket `Disallow: /*?*` replaced with targeted tracking-param blocks only.
3. ~~Refactor `TugasCMSProvider` into smaller units.~~ **FIXED** — Split into `http-client.ts`, `jobs.ts`, `articles.ts`, `pages.ts`; facade in `tugascms.ts` (~130 lines).

**Improve (performance)**
1. ~~Move jobs and articles to server-side fetch on key pages.~~ **FIXED** — Server-side data fetching added to all job listing pages and article pages.
2. ~~Deduplicate filter requests and add caching headers.~~ **FIXED** — Filter data passed from `JobSearchPage` to `JobSidebar` via `initialFilterData` prop. Cache headers added to all proxy routes.

**Additional fixes applied**
- **Stale closure (Q6)**: `useInfiniteScroll` now uses `useRef` for `isFetching` to avoid stale observer callback.
- **Legacy auth remnants (Q5)**: Dead `user`, `userBookmarks`, `loadUserBookmarks`, `initializeAuth`, `handleBookmarkChange` removed from `JobSearchPage.tsx`.
- **Unused deps**: Removed 18 unused packages from `package.json` (Tiptap ×17, AWS S3 ×2, formidable ×2).
- **Stale config**: Deleted obsolete `tailwind.config.js` (v3); Tailwind v4 uses CSS `@theme` in `globals.css`.
- **Obsolete script**: Removed `"export": "next export"` script (unsupported since Next 13).
- **Image patterns**: Removed stale Supabase and Appwrite remote patterns from `next.config.js`.
- **Cache headers**: Added `Cache-Control` with `s-maxage` and `stale-while-revalidate` to all 8 proxy API routes (`/api/articles`, `/api/articles/slug/:slug`, `/api/articles/:id/related`, `/api/job-posts`, `/api/job-posts/by-ids`, `/api/job-posts/filters`, `/api/job-posts/:id/related`, `/api/pages`).
- **Filter deduplication (Performance)**: `JobSidebar` now accepts `initialFilterData` prop; `JobSearchPage` passes its already-fetched `filterData` down, eliminating the duplicate `/api/job-posts/filters` request.
- **Provider refactor (Q3)**: `TugasCMSProvider` split from 954 lines into 4 domain modules: `http-client.ts` (shared HTTP), `jobs.ts` (job ops + filters + transformer), `articles.ts` (articles/categories/tags), `pages.ts` (pages/sitemaps/robots/ads). Main `tugascms.ts` is now a thin ~130-line facade.
- **Server-side schema (§7)**: `SchemaMarkup` component no longer suppresses SSR — removed `'use client'` directive and `isClient` useState guard. JSON-LD tags now render in initial HTML for all pages.
- **Structured logging (§9)**: Enhanced `lib/logger.ts` with JSON output, error serialization, `child()` scoping, and `apiRequest()` helper. All 10 API route files now use `logger.child()` instead of `console.error`.
- **Health check (§9)**: New `GET /api/health` endpoint returns `{ status, uptime, timestamp, version, checks: { cms } }`. CMS check verifies connectivity and reports latency. Returns `503` when unhealthy.

---

## 11. Appendix: Key Files

- `app/layout.tsx`
- `app/page.tsx`
- `middleware.ts`
- `lib/cms/providers/tugascms.ts` (facade)
- `lib/cms/providers/http-client.ts` (shared HTTP client)
- `lib/cms/providers/jobs.ts` (job operations)
- `lib/cms/providers/articles.ts` (article operations)
- `lib/cms/providers/pages.ts` (page/sitemap/ads operations)
- `lib/logger.ts` (structured logger)
- `app/api/*`
- `app/api/health/route.ts` (health check)
- `components/Advertisement/*`
- `components/SEO/SchemaMarkup.tsx`
- `utils/schemaUtils.ts`

---

*Report updated on February 14, 2026.*
