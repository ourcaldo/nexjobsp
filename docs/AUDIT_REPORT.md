# Nexjobsp — Code Audit Report

**Repository:** `nexjobsp` (Next.js 16 frontend)  
**Date:** 2026-02-20  
**Stack:** Next.js 16.1.6, React 19, Tailwind CSS 4, Clerk Auth, TypeScript

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **C** (Critical) | 1 | Security vulnerability requiring immediate action |
| **H** (High) | 7 | Significant bugs, missing validation, performance issues |
| **M** (Medium) | 19 | Code quality, inconsistencies, moderate improvements |
| **L** (Low) | 14 | Minor optimizations, docs, style issues |

---

## C — Critical Issues

### C-1: Ad Code Injection Without Sanitization

**File:** `components/Advertisement/AdDisplay.tsx` ~L186  
**Risk:** XSS / Arbitrary code execution

The component renders CMS ad code via `dangerouslySetInnerHTML` without any sanitization. Inline scripts from ad code are appended to `document.head`. A compromised CMS admin account could inject arbitrary JavaScript that executes on every visitor's browser.

**Fix:** Sanitize HTML (e.g., DOMPurify), restrict inline scripts to known ad patterns, or implement a CSP nonce system. At minimum, document the risk in a security policy.

---

## H — High Issues

### H-1: API Routes Missing Input Validation

**Files:**
- `app/api/job-posts/route.ts` — `filters` typed as `any`, no Zod validation
- `app/api/profile/route.ts` — PUT body forwarded to CMS without validation
- `app/api/profile/experience/route.ts` — POST body unsanitized
- `app/api/profile/education/route.ts` — POST body unsanitized
- `app/api/profile/skills/route.ts` — POST body unsanitized
- `app/api/profile/saved-jobs/route.ts` — page/limit params not validated
- `app/api/job-posts/by-ids/route.ts` — jobIds not validated as UUID

Zod schemas exist in `lib/validation/schemas.ts` but are **never imported or used** by any API route handler.

**Fix:** Wire `jobSearchSchema.parse()` and profile mutation schemas into all route handlers.

### H-2: CMS Token Falls Back to Empty String

**File:** `lib/config.ts` ~L13

`CMS_TOKEN` defaults to `''` instead of throwing. In production, an empty token means all CMS requests send `Authorization: Bearer ` (empty).

**Fix:** Remove `|| ''` fallback; make `validateConfig` throw in production when the token is missing.

### H-3: Raw `<img>` Tags Instead of `next/image`

**Files:**
- `components/Layout/Header.tsx` ~L162, ~L325 — user avatar
- `app/profil/page.tsx` ~L124 — profile avatar

Bypasses Next.js image optimization, lazy loading, and automatic srcset.

**Fix:** Replace with `<Image src={url} width={32} height={32} alt="..." />`.

### H-4: Monolithic 1103-Line Profile Page

**File:** `app/profil/page.tsx`

Entire profile page (profile, saved jobs, settings tabs) is a single `'use client'` component. Ships 20+ lucide icons, all form logic, and 3 tabs in one JS chunk.

**Fix:** Split into route-level pages or use `dynamic()` imports for tab content.

### H-5: Monolithic 501-Line useJobSearch Hook

**File:** `hooks/useJobSearch.ts`

Has a TODO acknowledging it handles too many responsibilities. Dense state with multiple refs, making testing/maintenance difficult.

**Fix:** Refactor into composable hooks: `useJobFilters`, `useJobPagination`, `useJobFetch`.

### H-6: Non-Atomic Skills Update (DELETE then POST)

**File:** `hooks/useProfile.ts` ~L77-L82

`updateSkills` does DELETE all → POST new. If POST fails, all skills are permanently lost.

**Fix:** Implement a single PATCH/PUT endpoint server-side, or add rollback logic.

### H-7: Validation Schemas Are Dead Code

**File:** `lib/validation/schemas.ts`

Well-crafted Zod schemas exist for job search, profile updates, etc. — but they are never imported anywhere. They are effectively dead code.

**Fix:** Import and apply in all API route handlers (fixes H-1 simultaneously).

---

## M — Medium Issues

| # | File | Issue | Fix |
|---|------|-------|-----|
| M-1 | `next.config.js` L36 | CSP `script-src` includes `'unsafe-inline'` in production, weakening XSS protection | Use nonces or hashes; remove `'unsafe-inline'` in production |
| M-2 | `next.config.js` L40 | CSP `img-src` allows `http:` (insecure image loading) | Remove `http:` from img-src |
| M-3 | `next.config.js` L46 | CSP missing `frame-ancestors 'self'` (modern replacement for X-Frame-Options) | Add `frame-ancestors 'self'` to CSP |
| M-4 | `lib/config.ts` L27 | Storage credentials default to empty strings — unclear if feature is used | Gate behind feature flag or remove if unused |
| M-5 | `proxy.ts` L10 | Only `/profil(.*)` is protected; future auth routes must be manually added | Document the convention or use a broader pattern |
| M-6 | `app/api/profile/saved-jobs/route.ts` | `page`/`limit` query params not bounded | Apply `parseInt` with min/max bounds |
| M-7 | Multiple API routes | Inconsistent response format — some use helpers, others raw `NextResponse.json()` | Standardize all to use `lib/api/response.ts` helpers |
| M-8 | `app/artikel/page.tsx` L103 | Canonical URL missing trailing slash (inconsistent with `trailingSlash: true`) | Use `${url}/artikel/` with trailing slash |
| M-9 | `components/pages/HomePage.tsx` | Entire homepage is `'use client'` despite mostly static content | Extract static sections into server components |
| M-10 | `components/pages/ArticleListPage.tsx` | Entire article list is `'use client'` | Keep article rendering server-side; only interactive parts need client |
| M-11 | `app/lowongan-kerja/page.tsx` L14 | `cache()` wrapping `getJobsData` — redundant in Next.js 16 App Router | Remove `cache()` wrapper |
| M-12 | `hooks/useSearchHistory.ts` L18 | `loadHistory` not in useEffect deps, not wrapped in useCallback | Wrap in `useCallback` and add to effect deps |
| M-13 | `lib/services/JobService.ts` | Marked `@deprecated` — pass-through with no added value. Used by all routes. | Remove service layer or add caching/error mapping |
| M-14 | `lib/cms/factory.ts` L9 | Factory pattern for single provider (YAGNI) | Simplify or document rationale |
| M-15 | `lib/cms/providers/http-client.ts` L28 | `ensureInitialized()` does nothing meaningful | Remove initialization ceremony |
| M-16 | `components/Advertisement/PopupAd.tsx` L85 | Popup ad URLs from CMS not validated against whitelist | Validate protocol is `https:` at minimum |
| M-17 | `types/job.ts` | Just re-exports from `lib/cms/interface` — adds no value | Consolidate types in one location |
| M-18 | `lib/cms/interface.ts` L29 | MongoDB internal fields (`_id`, `id_obj`) leaking into frontend types | Strip in data transformer |
| M-19 | `lib/rate-limit.ts` | No max store size — unbounded Map growth under attack | Add max entries guard (reject if >50k entries) |

---

## L — Low Issues

| # | File | Issue | Fix |
|---|------|-------|-----|
| L-1 | `.env.example` | Missing env vars read in code: `RATE_LIMIT_MAX_REQUESTS`, `LOG_LEVEL`, `CMS_PROVIDER` | Document all env vars |
| L-2 | `lib/utils/schemaUtils.ts` L48 | Organization schema has placeholder social media URLs | Move to config or remove until real accounts exist |
| L-3 | `components/Layout/Header.tsx` L253 | Mobile menu hardcodes "Nexjob" instead of `config.site.name` | Use config value |
| L-4 | `components/Layout/Footer.tsx` L73 | Links to `/tentang-kami`, `/kontak`, etc. — these pages may not exist (404s) | Create pages or link to CMS-served ones |
| L-5 | `hooks/useInfiniteScroll.ts` | Missing test coverage (TODO) | Add unit tests |
| L-6 | `hooks/useAnalytics.ts` | `trackPageView` not auto-triggered on pathname changes | Add auto-tracking in useEffect or document manual usage |
| L-7 | `lib/services/cmsUserApi.ts` | No timeout on fetch() calls to CMS user endpoints | Add `AbortSignal.timeout()` |
| L-8 | `styles/globals.css` | 30+ `!important` rules in `.cms-content` | Justified for CMS content, but could use more specific selectors |
| L-9 | `app/providers.tsx` L12 | Config validation runs client-side after mount | Move to build-time or server-side check |
| L-10 | `ecosystem.config.js` L7 | PM2 instances=1, no multi-core usage | Document trade-off vs cluster mode |
| L-11 | `app/profil/page.tsx` ~L91 | `initials` computation can crash on empty name part | Add `.filter(Boolean)` guard |
| L-12 | `lib/utils/bookmarks.ts` | Client-side bookmarks (localStorage) exist alongside server-side saved jobs — two systems | Unify: sync localStorage to server for authenticated users |
| L-13 | `next.config.js` L81 | No `deviceSizes`/`imageSizes` tuning for target audience | Consider tuning for mobile-heavy Indonesian users |
| L-14 | `lib/rate-limit.ts` L62 | IP fallback to `'anonymous'` — all unknown IPs share one bucket | Monitor anonymous bucket size |

---

## Enhancement Opportunities

| # | Area | Opportunity | Rationale |
|---|------|-------------|-----------|
| E-1 | **Caching** | Transform deprecated service layer into caching layer with `unstable_cache()` or in-memory TTL | Services add no value as pass-throughs; cache layer would be valuable |
| E-2 | **Bundle Size** | Convert `HomePage`, `ArticleListPage` from full `'use client'` to server-component-first with interactive islands | Significant JS bundle reduction; these are mostly data display pages |
| E-3 | **Testing** | Add tests for `useInfiniteScroll`, `useSearchHistory`, `useJobSearch` (all have TODO comments) | Critical hooks with complex state that are hard to test manually |
| E-4 | **Monitoring** | Add Prometheus/OpenTelemetry metrics to health endpoint | Current health check only checks CMS connectivity; add memory, request counts, error rates |
| E-5 | **i18n** | No internationalization framework — all strings hardcoded in Indonesian | If expansion is planned, consider i18n framework early |
| E-6 | **PWA** | No manifest.json or service worker | For a job portal, offline support and push notifications (job alerts) would improve engagement |

---

## Top 5 Priorities

1. **[C] C-1** — Sanitize or isolate ad code injection in `AdDisplay.tsx`
2. **[H] H-1/H-7** — Wire existing Zod schemas into API route handlers
3. **[H] H-2** — Make `CMS_TOKEN` required in production
4. **[H] H-4** — Split 1103-line profile page into smaller components
5. **[H] H-3** — Replace raw `<img>` tags with `next/image`
