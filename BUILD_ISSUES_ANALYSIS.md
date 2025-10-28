# Build Issues Analysis & Solutions

**Date**: October 28, 2025  
**Status**: Analysis Complete - Pending Implementation  
**Severity**: High - Prevents successful production builds

---

## Overview

During production build (`npm run build`), the application encounters two critical errors that prevent successful static page generation for article pages. These issues manifest when building ~182 static pages that require data from the external CMS API.

---

## Problem 1: Next.js Cache Size Limit Exceeded

### Error Message
```
Failed to set Next.js data cache, items over 2MB can not be cached (2152790 bytes)
at IncrementalCache.set
```

### What's Happening

1. During build, `generateStaticParams()` in `app/artikel/[category]/[slug]/page.tsx` fetches all articles
2. It calls `cmsService.getArticles(1, 100)` to retrieve 100 articles at once
3. The API response exceeds 2MB (2,152,790 bytes)
4. Next.js has a hard 2MB limit for cached data
5. Build fails when trying to cache this response

### Technical Details

**File**: `app/artikel/[category]/[slug]/page.tsx` (Line 77)

```typescript
export async function generateStaticParams() {
  const articlesResponse = await cmsService.getArticles(1, 100); // 🔴 Fetches 100 articles
  // Response size: ~2.15 MB (exceeds Next.js 2MB limit)
}
```

**Current Configuration**:
- Line 15 has `export const fetchCache = 'force-no-store'` ✅
- However, this directive only applies to the page component, NOT to `generateStaticParams()`
- The function runs separately and Next.js attempts to cache its result

### Root Cause

- Fetching 100 articles with full content (title, excerpt, content, metadata) creates a massive response
- Each article contains rich text content, which inflates the response size
- Next.js static generation tries to cache all fetched data
- The 2MB cache limit is a hard constraint in Next.js

### Impact

- Build process fails at page generation stage
- Cannot complete static site generation
- Blocks production deployment

---

## Problem 2: CMS API Rate Limiting (HTTP 429)

### Error Message
```
Error fetching article by slug: Error: HTTP 429: Too Many Requests
at r.fetchWithTimeout
```

### What's Happening

1. Next.js generates 182 static pages in parallel (default behavior)
2. For each article page, multiple API calls are made:
   - `getArticleBySlug()` - fetch the article (1 call per page)
   - `getRelatedArticles()` - fetch related content (1 call per page)
3. Both `generateMetadata()` and the page component fetch the same data
4. Total API calls: ~100 article pages × 2-4 calls each = 200-400 requests
5. All requests happen within seconds due to parallel generation
6. CMS API rate limiter kicks in and returns HTTP 429

### Technical Details

**API Call Flow During Build**:

```
For each of 100+ article pages:
├── generateStaticParams() → getArticles(1, 100)     [1 call total, shared]
├── generateMetadata()
│   └── getArticleData()
│       ├── getArticleBySlug(slug)                    [1 call per page]
│       └── getRelatedArticles(slug, 5)               [1 call per page]
└── Page Component
    └── getArticleData() [DUPLICATE]
        ├── getArticleBySlug(slug)                    [1 call per page - DUPLICATE]
        └── getRelatedArticles(slug, 5)               [1 call per page - DUPLICATE]

Total: 2-4 API calls per page × 100 pages = 200-400 requests in seconds
```

**Current State**:
- No retry logic in `lib/cms/service.ts`
- No request throttling or queueing
- No build concurrency limits in `next.config.js`
- Data fetching is duplicated between `generateMetadata()` and page component

### Root Cause

**1. Parallel Page Generation**:
- Next.js builds pages in parallel by default (10-20 concurrent builds)
- Optimized for speed, not external API constraints
- Creates burst traffic that overwhelms rate-limited APIs

**2. No Retry Mechanism**:
- CMS service has no retry logic for failed requests
- When 429 occurs, build immediately fails
- No exponential backoff or request queuing

**3. Duplicate API Calls**:
- `generateMetadata()` fetches article data
- Page component fetches the same data again
- Both run during build = 2x the necessary API calls
- No data deduplication between functions

**4. No Rate Limit Handling**:
- External CMS API has rate limits
- Build process doesn't account for these limits
- No request spacing or throttling

### Impact

- Multiple pages fail to generate due to 429 errors
- Build completes but with missing/failed pages
- Unpredictable build success rate
- Cannot reliably deploy to production

---

## Solutions

### Solution 1: Fix Cache Size Issue

**Priority**: Critical  
**Effort**: Low  
**Files**: `app/artikel/[category]/[slug]/page.tsx`

#### Option A: Reduce Fetch Limit (Recommended)

Reduce the number of articles fetched in `generateStaticParams()`:

```typescript
export async function generateStaticParams() {
  // Change from 100 to 50 articles per fetch
  const articlesResponse = await cmsService.getArticles(1, 50);
  
  // If more than 50 articles exist, implement pagination
  // Fetch page 1 (50 articles), page 2 (next 50), etc.
}
```

**Pros**:
- Simple one-line change
- Reduces response size below 2MB limit
- Minimal risk

**Cons**:
- Only generates static pages for first 50 articles
- Other articles will use fallback/ISR

#### Option B: Implement Paginated Fetching

Fetch articles in multiple smaller batches:

```typescript
export async function generateStaticParams() {
  const allParams = [];
  let page = 1;
  const limit = 50;
  let hasMore = true;
  
  while (hasMore) {
    const response = await cmsService.getArticles(page, limit);
    if (response.success) {
      const params = response.data.posts.map(article => ({
        category: article.categories?.[0]?.slug || 'uncategorized',
        slug: article.slug
      }));
      allParams.push(...params);
      hasMore = response.data.pagination.hasNextPage;
      page++;
    } else {
      hasMore = false;
    }
  }
  
  return allParams;
}
```

**Pros**:
- Generates static pages for ALL articles
- Each fetch stays under 2MB limit
- Complete static generation

**Cons**:
- More complex implementation
- Increases total build time
- More API calls (but smaller)

#### Option C: Use Dynamic Parameters

Skip full static generation for articles:

```typescript
export const dynamicParams = true; // Allow dynamic params
export const revalidate = 3600;     // ISR with 1-hour revalidation

export async function generateStaticParams() {
  // Only generate top 20 most popular articles
  const articlesResponse = await cmsService.getArticles(1, 20);
  return articlesResponse.data.posts.map(...);
}
```

**Pros**:
- Minimal API calls during build
- Fast build times
- Still provides static pages for popular content

**Cons**:
- Most pages generated on-demand (slower first visit)
- Requires ISR configuration

---

### Solution 2: Fix Rate Limiting Issues

**Priority**: Critical  
**Effort**: Medium  
**Files**: `lib/cms/service.ts`, `next.config.js`, `app/artikel/[category]/[slug]/page.tsx`

#### Fix 2A: Add Retry Logic with Exponential Backoff (Critical)

Implement automatic retry for failed requests in the CMS service:

```typescript
// In lib/cms/service.ts

private async fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 5
): Promise<Response> {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If 429, wait and retry
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 30000);
          console.log(`Rate limited. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delayMs = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}
```

**Retry Delays**:
- Attempt 1: Immediate
- Attempt 2: 1 second wait
- Attempt 3: 2 seconds wait
- Attempt 4: 4 seconds wait
- Attempt 5: 8 seconds wait
- Attempt 6: 16 seconds wait

**Pros**:
- Automatically handles temporary rate limits
- Exponential backoff prevents overwhelming API
- High success rate

**Cons**:
- Increases build time when retries occur
- Requires refactoring fetch calls

#### Fix 2B: Limit Build Concurrency (Critical)

Reduce parallel page generation in Next.js:

```javascript
// In next.config.js

const nextConfig = {
  // ... existing config
  experimental: {
    cpus: 1  // Force sequential builds (slowest but safest)
    // OR
    cpus: 2  // Allow 2 concurrent builds (balanced)
  },
};
```

**Impact**:
- Reduces burst API requests
- Spreads requests over longer time period
- Much less likely to hit rate limits

**Trade-off**:
- Slower build times (sequential vs parallel)
- cpus: 1 = safest but slowest
- cpus: 2 = balanced approach

#### Fix 2C: Deduplicate Data Fetching (High Priority)

Use React's `cache()` to prevent duplicate API calls:

```typescript
// In app/artikel/[category]/[slug]/page.tsx

import { cache } from 'react';

// Wrap data fetching in cache()
const getArticleData = cache(async (categorySlug: string, slug: string) => {
  // ... existing implementation
});

// Now both generateMetadata() and page component use the same cached result
export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const data = await getArticleData(params.category, params.slug);
  // First call - fetches from API
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const data = await getArticleData(params.category, params.slug);
  // Second call - uses cached result (no API call)
}
```

**Impact**:
- Reduces API calls by 50%
- Same article only fetched once per build
- Native Next.js feature, no external dependencies

#### Fix 2D: Add Request Throttling (Optional)

Implement simple request queue in CMS service:

```typescript
// In lib/cms/service.ts

private lastRequestTime = 0;
private readonly MIN_REQUEST_INTERVAL = 200; // 200ms between requests

private async throttledFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - this.lastRequestTime;
  
  if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
    const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  this.lastRequestTime = Date.now();
  return fetch(url, options);
}
```

**Pros**:
- Guarantees minimum spacing between requests
- Simple implementation
- Works alongside other fixes

**Cons**:
- Increases build time
- May not be necessary if other fixes work

#### Fix 2E: Hybrid Static/ISR Approach (Alternative)

Instead of building all pages statically:

```typescript
// In app/artikel/[category]/[slug]/page.tsx

export const revalidate = 3600; // 1 hour ISR
export const dynamicParams = true;

export async function generateStaticParams() {
  // Only build top 20 most popular/important articles
  const articlesResponse = await cmsService.getArticles(1, 20);
  return articlesResponse.data.posts.map(...);
}
```

**How it works**:
- Build time: Generate 20 static pages
- First visit to other pages: Generated on-demand
- Subsequent visits: Served from cache
- After 1 hour: Regenerated in background

**Pros**:
- Fast builds (20 pages vs 182)
- Minimal API calls during build
- All pages still work (generated on-demand)
- Good balance of speed and coverage

**Cons**:
- First visit to unpopular pages is slower
- Requires ISR infrastructure

---

## Recommended Implementation Plan

### Phase 1: Immediate Fixes (Stops Build Failures)

1. **Add retry logic** to CMS service
   - Priority: Critical
   - Effort: 2-3 hours
   - Impact: Handles 429 errors gracefully

2. **Reduce generateStaticParams limit** from 100 to 50
   - Priority: Critical
   - Effort: 5 minutes
   - Impact: Fixes 2MB cache error

### Phase 2: Optimization (Reduces API Calls)

3. **Add build concurrency limit** (`experimental.cpus = 1`)
   - Priority: High
   - Effort: 5 minutes
   - Impact: Reduces burst requests

4. **Deduplicate data fetching** with React `cache()`
   - Priority: High
   - Effort: 30 minutes
   - Impact: 50% fewer API calls

### Phase 3: Long-term (Optional Enhancements)

5. **Implement paginated fetching** in `generateStaticParams`
   - Priority: Medium
   - Effort: 1 hour
   - Impact: Generates all pages statically

6. **Add request throttling** to CMS service
   - Priority: Low
   - Effort: 30 minutes
   - Impact: Additional safety margin

7. **Consider hybrid SSG/ISR** approach
   - Priority: Low
   - Effort: 1 hour
   - Impact: Faster builds, fewer API calls

---

## Success Metrics

After implementing fixes, successful build should show:

- ✅ Zero cache size errors
- ✅ Zero or minimal 429 rate limit errors
- ✅ All 182 pages generated successfully
- ✅ Build completes in reasonable time (10-20 minutes)
- ✅ No duplicate API calls for same data
- ✅ Reliable, repeatable builds

---

## Testing Plan

1. **Test cache fix**:
   - Run `npm run build`
   - Verify no "2MB cache" errors in logs

2. **Test rate limiting fix**:
   - Run full build
   - Monitor for 429 errors
   - Verify retry logic works (check logs for retry attempts)

3. **Test deduplication**:
   - Add logging to API calls
   - Verify each article fetched only once per build

4. **Test build success**:
   - Verify all 182 pages generated
   - Check build output: "✓ Generating static pages (182/182)"

---

## Additional Notes

### Why This Happens

Next.js is optimized for fast builds with internal/unlimited data sources:
- Generates pages in parallel for speed
- Aggressively caches data
- No built-in rate limit handling
- Doesn't know about external API constraints

When using external APIs with rate limits:
- Parallel generation = burst traffic
- Rate limits get exceeded
- Build failures occur

### External Dependencies

This issue is caused by:
1. **External CMS API** (cms.nexjob.tech) has rate limiting
2. **Large dataset** (100+ articles with full content)
3. **Next.js architecture** (parallel static generation)

### Alternative: Consider Internal CMS

If rate limiting continues to be problematic:
- Move articles to Supabase database
- Fetch from internal database (no rate limits)
- Keep jobs on external CMS (smaller dataset)
- Hybrid approach: critical content internal, supplementary external

---

**Document Version**: 1.0  
**Last Updated**: October 28, 2025  
**Status**: Ready for Implementation
