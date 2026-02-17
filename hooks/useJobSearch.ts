'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Job } from '@/types/job';
import { FilterData } from '@/lib/cms/interface';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { features } from '@/lib/features';

export interface SidebarFilters {
  cities: string[];
  jobTypes: string[];
  experiences: string[];
  educations: string[];
  industries: string[];
  workPolicies: string[];
  categories: string[];
  salaries: string[];
}

/**
 * @todo This hook is ~488 lines and handles too many responsibilities.
 * It should be refactored into smaller, composable hooks:
 *  - useJobFilters: filter state and URL sync
 *  - useJobPagination: page tracking, infinite scroll, load-more
 *  - useJobAnalytics: page-view and search tracking
 *  - useJobFetch: data fetching and caching logic
 * Refactoring deferred until adequate test coverage is in place.
 */
interface UseJobSearchProps {
  initialCategory?: string;
  initialLocation?: string;
  initialLocationName?: string;
  locationType?: 'province' | 'city';
  initialProvinceId?: string;
  initialCityId?: string;
  provinceSlug?: string;
  serverJobs?: Job[] | null;
  serverTotalJobs?: number;
  serverHasMore?: boolean;
  serverCurrentPage?: number;
  serverFilterData?: FilterData | null;
}

export function useJobSearch({
  initialCategory,
  initialLocation,
  initialLocationName,
  locationType = 'province',
  initialProvinceId,
  initialCityId,
  provinceSlug,
  serverJobs = null,
  serverTotalJobs = 0,
  serverHasMore = false,
  serverCurrentPage = 1,
  serverFilterData = null,
}: UseJobSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackPageView, trackSearch, trackFilterUsage } = useAnalytics();
  const searchHistory = useSearchHistory();
  const isSearchHistoryEnabled = features.searchHistory;

  // Refs
  const initialDataLoadedRef = useRef(false);
  const isSearchingRef = useRef(false);
  const currentFiltersRef = useRef<any>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const hasServerData = serverJobs !== null && serverJobs.length > 0;

  // State
  const [jobs, setJobs] = useState<Job[]>(hasServerData ? serverJobs : []);
  const [loading, setLoading] = useState(!hasServerData);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<FilterData | null>(serverFilterData);
  const [currentPage, setCurrentPage] = useState(hasServerData ? serverCurrentPage : 1);
  const [hasMore, setHasMore] = useState(hasServerData ? serverHasMore : true);
  const [totalJobs, setTotalJobs] = useState(hasServerData ? serverTotalJobs : 0);
  const [displayedJobsCount, setDisplayedJobsCount] = useState(hasServerData ? serverJobs.length : 0);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(
    initialProvinceId ||
    (initialLocation && locationType === 'province' ? initialLocation : '')
  );
  const previousProvinceRef = useRef<string>(selectedProvince);

  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilters>({
    cities: initialCityId ? [initialCityId] : (initialLocation && locationType === 'city' ? [initialLocation] : []),
    jobTypes: [],
    experiences: [],
    educations: [],
    industries: [],
    workPolicies: [],
    categories: initialCategory ? [initialCategory] : [],
    salaries: [],
  });

  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- Helpers ---

  const calculateSalaryRange = useCallback((selectedRanges: string[]): { min: string | null; max: string | null } => {
    if (!selectedRanges || selectedRanges.length === 0) return { min: null, max: null };

    const rangeMapping: Record<string, { min: number; max: number | null }> = {
      '1-3': { min: 1_000_000, max: 3_000_000 },
      '4-6': { min: 4_000_000, max: 6_000_000 },
      '7-9': { min: 7_000_000, max: 9_000_000 },
      '10+': { min: 10_000_000, max: null },
    };

    if (selectedRanges.length === 4) return { min: '1000000', max: null };

    let minSalary = Number.MAX_SAFE_INTEGER;
    let maxSalary: number | null = null;
    let hasOpenRange = false;

    selectedRanges.forEach((range) => {
      const mapping = rangeMapping[range];
      if (mapping) {
        minSalary = Math.min(minSalary, mapping.min);
        if (mapping.max === null) {
          hasOpenRange = true;
        } else if (!hasOpenRange) {
          maxSalary = maxSalary === null ? mapping.max : Math.max(maxSalary, mapping.max);
        }
      }
    });

    return {
      min: minSalary === Number.MAX_SAFE_INTEGER ? null : String(minSalary),
      max: hasOpenRange ? null : maxSalary !== null ? String(maxSalary) : null,
    };
  }, []);

  const getCurrentFilters = useCallback(() => {
    const locationFilter = selectedProvince || (initialLocation && locationType === 'province' ? initialLocation : '');
    return { search: keyword, location: locationFilter, sortBy, ...sidebarFilters };
  }, [keyword, selectedProvince, sortBy, sidebarFilters, initialLocation, locationType]);

  const hasFiltersChanged = useCallback(
    (newFilters: any) => JSON.stringify(newFilters) !== JSON.stringify(currentFiltersRef.current),
    [],
  );

  const buildSearchParams = useCallback(
    (filters: any, page: number) => {
      const salaryRange = calculateSalaryRange(filters.salaries);
      return new URLSearchParams({
        page: String(page),
        limit: '24',
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.cities?.length > 0 && { city: filters.cities[0] }),
        ...(filters.categories?.length > 0 && { job_category: filters.categories[0] }),
        ...(filters.jobTypes?.length > 0 && { employment_type: filters.jobTypes[0] }),
        ...(filters.experiences?.length > 0 && { experience_level: filters.experiences[0] }),
        ...(filters.educations?.length > 0 && { education_level: filters.educations[0] }),
        ...(filters.workPolicies?.length > 0 && { work_policy: filters.workPolicies[0] }),
        ...(salaryRange.min && { job_salary_min: salaryRange.min }),
        ...(salaryRange.max && { job_salary_max: salaryRange.max }),
      });
    },
    [calculateSalaryRange],
  );

  // --- Data fetching ---

  const loadInitialData = useCallback(async () => {
    if (initialDataLoadedRef.current) return;

    if (hasServerData && !searchParams?.get('search') && !searchParams?.get('location') && !searchParams?.get('category')) {
      initialDataLoadedRef.current = true;
      if (!serverFilterData) {
        try {
          const response = await fetch('/api/job-posts/filters');
          const result = await response.json();
          if (result.success) setFilterData(result.data);
        } catch {
          /* filter data is non-critical */
        }
      }
      currentFiltersRef.current = getCurrentFilters();
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/job-posts/filters');
      const result = await response.json();
      if (result.success) setFilterData(result.data);

      const search = searchParams?.get('search');
      const location = searchParams?.get('location');
      const category = searchParams?.get('category');

      let initialKeyword = '';
      let initialProvince = selectedProvince;
      const initialSidebarFilters = { ...sidebarFilters, cities: initialCityId ? [initialCityId] : sidebarFilters.cities };

      if (search) { initialKeyword = search; setKeyword(search); }
      if (location && !initialLocation) { initialProvince = location; setSelectedProvince(location); }
      if (category && !initialCategory) {
        initialSidebarFilters.categories = [category];
        setSidebarFilters(initialSidebarFilters);
      }

      const filters = {
        search: initialKeyword,
        location: initialProvinceId || (initialLocation && locationType === 'province' ? initialLocation : initialProvince),
        sortBy: 'newest',
        ...initialSidebarFilters,
      };
      currentFiltersRef.current = filters;

      const params = buildSearchParams(filters, 1);
      const jobsResponse = await fetch(`/api/job-posts?${params.toString()}`);
      const jobsResult = await jobsResponse.json();

      if (jobsResult.success) {
        const data = jobsResult.data;
        setJobs(data.jobs);
        setCurrentPage(data.currentPage);
        setHasMore(data.hasMore);
        setTotalJobs(data.totalJobs);
        setDisplayedJobsCount(data.jobs.length);
      }

      initialDataLoadedRef.current = true;
    } catch {
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedProvince, sidebarFilters, initialLocation, locationType, initialCategory, initialCityId, initialProvinceId, buildSearchParams, getCurrentFilters, hasServerData, serverFilterData]);

  const searchWithFilters = useCallback(
    async (filters: any, isManualSearch = false) => {
      if (isSearchingRef.current) return;
      isSearchingRef.current = true;
      setSearching(true);
      setJobs([]);
      setCurrentPage(1);
      setHasMore(true);
      setDisplayedJobsCount(0);

      try {
        setError(null);
        if (filters.search && isManualSearch) trackSearch(filters.search, filters.location, filters.categories[0]);

        if (!initialCategory && !initialLocation && isManualSearch) {
          const urlParams = new URLSearchParams();
          if (filters.search) urlParams.set('search', filters.search);
          if (filters.location && filters.location !== selectedProvince) urlParams.set('location', filters.location);
          router.replace(`/lowongan-kerja/${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
        }

        const params = buildSearchParams(filters, 1);
        const jobsResponse = await fetch(`/api/job-posts?${params.toString()}`);
        const result = await jobsResponse.json();

        if (result.success) {
          const data = result.data;
          setJobs(data.jobs);
          setCurrentPage(data.currentPage);
          setHasMore(data.hasMore);
          setTotalJobs(data.totalJobs);
          setDisplayedJobsCount(data.jobs.length);
        }
        currentFiltersRef.current = filters;
      } catch {
        setError('Gagal memuat data pekerjaan. Silakan coba lagi.');
      } finally {
        setSearching(false);
        isSearchingRef.current = false;
      }
    },
    [trackSearch, initialCategory, initialLocation, selectedProvince, router, buildSearchParams],
  );

  const handleManualSearch = useCallback(async () => {
    if (!initialDataLoadedRef.current) return;
    const filters = getCurrentFilters();
    if (isSearchHistoryEnabled && filters.search) searchHistory.addToHistory(filters.search);
    await searchWithFilters(filters, true);
    setShowSearchHistory(false);
  }, [searchWithFilters, getCurrentFilters, isSearchHistoryEnabled, searchHistory]);

  const debouncedFilterSearch = useCallback(() => {
    if (!initialDataLoadedRef.current) return;
    const filters = getCurrentFilters();
    if (!hasFiltersChanged(filters)) return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => searchWithFilters(filters, false), 300);
  }, [searchWithFilters, getCurrentFilters, hasFiltersChanged]);

  const loadMoreJobs = useCallback(async () => {
    if (loadingMore || !hasMore || isSearchingRef.current || !initialDataLoadedRef.current) return;
    setLoadingMore(true);
    try {
      const filters = getCurrentFilters();
      const params = buildSearchParams(filters, currentPage + 1);
      const jobsResponse = await fetch(`/api/job-posts?${params.toString()}`);
      const result = await jobsResponse.json();

      if (result.success && result.data.jobs.length > 0) {
        setJobs((prev) => [...prev, ...result.data.jobs]);
        setCurrentPage(result.data.currentPage);
        setHasMore(result.data.hasMore);
        setDisplayedJobsCount((prev) => prev + result.data.jobs.length);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, getCurrentFilters, buildSearchParams]);

  // --- Effects ---

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  useEffect(() => {
    trackPageView({
      page_title: document.title,
      content_group1: 'job_search',
      content_group2: initialCategory || '',
      content_group3: initialLocation || '',
    });
  }, [trackPageView, initialCategory, initialLocation]);

  useEffect(() => {
    if (!initialDataLoadedRef.current) { previousProvinceRef.current = selectedProvince; return; }
    if (selectedProvince !== previousProvinceRef.current) {
      if (filterData && sidebarFilters.cities.length > 0) {
        const validCities = sidebarFilters.cities.filter((cityId) => {
          if (!selectedProvince) return true;
          const city = filterData.regencies.find((r) => r.id === cityId);
          return city && city.province_id === selectedProvince;
        });
        if (validCities.length !== sidebarFilters.cities.length) {
          setSidebarFilters((prev) => ({ ...prev, cities: validCities }));
        }
      }
      previousProvinceRef.current = selectedProvince;
    }
  }, [selectedProvince, filterData, sidebarFilters.cities]);

  useEffect(() => {
    if (!initialDataLoadedRef.current) return;
    debouncedFilterSearch();
    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [debouncedFilterSearch]);

  // Infinite scroll
  const { isFetching, setTarget, resetFetching } = useInfiniteScroll(loadMoreJobs, {
    threshold: 0.8,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (!loadingMore && isFetching) resetFetching();
  }, [loadingMore, isFetching, resetFetching]);

  // --- Event handlers ---

  const handleSidebarFilterChange = useCallback(
    (newFilters: any) => {
      setSidebarFilters(newFilters);
      Object.entries(newFilters).forEach(([filterType, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach((value) => trackFilterUsage(filterType, value));
        }
      });
    },
    [trackFilterUsage],
  );

  const handleSortChange = useCallback((newSortBy: string) => setSortBy(newSortBy), []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleManualSearch();
  }, [handleManualSearch]);

  const clearAllFilters = useCallback(() => {
    const cleared = {
      search: '', location: '', sortBy: 'newest',
      cities: [], jobTypes: [], experiences: [], educations: [], industries: [], workPolicies: [], categories: [], salaries: [],
    };
    setKeyword(''); setSelectedProvince('');
    setSidebarFilters({ cities: [], jobTypes: [], experiences: [], educations: [], industries: [], workPolicies: [], categories: [], salaries: [] });
    setSortBy('newest');
    searchWithFilters(cleared, false);
    if (initialCategory || initialLocation || initialProvinceId || initialCityId) router.replace('/lowongan-kerja/');
  }, [searchWithFilters, initialCategory, initialLocation, initialProvinceId, initialCityId, router]);

  const removeFilter = useCallback((filterType: string, value?: string) => {
    if (filterType === 'keyword') { setKeyword(''); }
    else if (filterType === 'province') {
      if (initialProvinceId || (initialLocation && locationType === 'province')) { router.replace('/lowongan-kerja/'); }
      else { setSelectedProvince(''); setSidebarFilters((prev) => ({ ...prev, cities: [] })); }
    } else if (filterType === 'cities' && value) {
      if (initialCityId && value === initialCityId) {
        router.replace(provinceSlug ? `/lowongan-kerja/lokasi/${provinceSlug}/` : '/lowongan-kerja/');
      } else {
        setSidebarFilters((prev) => ({ ...prev, cities: prev.cities.filter((c) => c !== value) }));
      }
    } else if (value) {
      setSidebarFilters((prev) => ({
        ...prev,
        [filterType]: (prev[filterType as keyof SidebarFilters] as string[]).filter((item) => item !== value),
      }));
    }
  }, [initialLocation, locationType, initialProvinceId, initialCityId, provinceSlug, router]);

  // --- Computed / memoized values ---

  const getProvinceOptions = useMemo(() => {
    if (!filterData) return [];
    return filterData.provinces.map((p) => ({ value: p.id, label: p.name }));
  }, [filterData]);

  const getActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (keyword) count++;
    if ((initialLocation && locationType === 'province') || selectedProvince) count++;
    Object.entries(sidebarFilters).forEach(([key, arr]) => {
      if (key === 'categories' && initialCategory) count += arr.filter((v: string) => v !== initialCategory).length;
      else if (key === 'cities' && initialLocation && locationType === 'city') count += arr.filter((v: string) => v !== initialLocation).length;
      else count += arr.length;
    });
    return count;
  }, [keyword, selectedProvince, sidebarFilters, initialLocation, locationType, initialCategory]);

  const getFilterLabel = useCallback((filterType: string, value: string): string => {
    if (!filterData) return value;
    switch (filterType) {
      case 'cities': return filterData.regencies.find((r) => r.id === value)?.name ?? value;
      case 'jobTypes': return filterData.employment_types.find((t) => t.id === value)?.name ?? value;
      case 'experiences': return filterData.experience_levels.find((e) => e.id === value)?.name ?? value;
      case 'educations': return filterData.education_levels.find((e) => e.id === value)?.name ?? value;
      case 'categories': return filterData.categories.find((c) => c.id === value)?.name ?? value;
      case 'workPolicies': return filterData.work_policy.find((w) => w.value === value)?.name ?? value;
      case 'salaries': return ({ '1-3': '1-3 Juta', '4-6': '4-6 Juta', '7-9': '7-9 Juta', '10+': '10+ Juta' })[value] ?? value;
      default: return value;
    }
  }, [filterData]);

  const getProvinceName = useCallback((provinceId: string): string => {
    if (!filterData) return provinceId;
    return filterData.provinces.find((p) => p.id === provinceId)?.name ?? provinceId;
  }, [filterData]);

  const getFilterTypeLabel = useCallback((filterType: string): string => {
    const labels: Record<string, string> = {
      cities: 'Kota', jobTypes: 'Tipe Pekerjaan', experiences: 'Pengalaman', educations: 'Pendidikan',
      categories: 'Kategori', workPolicies: 'Kebijakan Kerja', salaries: 'Gaji', industries: 'Industri',
    };
    return labels[filterType] || filterType;
  }, []);

  return {
    // State
    jobs, loading, searching, loadingMore, error, filterData,
    hasMore, totalJobs, keyword, selectedProvince, sidebarFilters,
    sortBy, showMobileFilters, showSearchHistory,
    isSearchHistoryEnabled, searchHistory,

    // Setters
    setKeyword, setSelectedProvince, setShowMobileFilters, setShowSearchHistory,

    // Actions
    handleManualSearch, handleSidebarFilterChange, handleSortChange,
    handleKeyPress, clearAllFilters, removeFilter,

    // Computed
    getProvinceOptions, getActiveFiltersCount, getFilterLabel,
    getProvinceName, getFilterTypeLabel,

    // Infinite scroll
    setTarget,
  };
}
