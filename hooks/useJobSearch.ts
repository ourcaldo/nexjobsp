'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Job } from '@/types/job';
import { FilterData } from '@/lib/cms/interface';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { features } from '@/lib/features';
import {
  SidebarFilters,
  EMPTY_SIDEBAR_FILTERS,
  buildSearchParams,
  getFilterLabel as _getFilterLabel,
  getProvinceName as _getProvinceName,
  getProvinceOptions as _getProvinceOptions,
  getFilterTypeLabel,
  countActiveFilters,
} from '@/lib/utils/jobSearchUtils';

export type { SidebarFilters } from '@/lib/utils/jobSearchUtils';

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  const getCurrentFilters = useCallback(() => {
    const locationFilter = selectedProvince || (initialLocation && locationType === 'province' ? initialLocation : '');
    return { search: keyword, location: locationFilter, sortBy, ...sidebarFilters };
  }, [keyword, selectedProvince, sortBy, sidebarFilters, initialLocation, locationType]);

  const hasFiltersChanged = useCallback(
    (newFilters: any) => JSON.stringify(newFilters) !== JSON.stringify(currentFiltersRef.current),
    [],
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
  }, [searchParams, selectedProvince, sidebarFilters, initialLocation, locationType, initialCategory, initialCityId, initialProvinceId, getCurrentFilters, hasServerData, serverFilterData]);

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
    [trackSearch, initialCategory, initialLocation, selectedProvince, router],
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
  }, [currentPage, hasMore, loadingMore, getCurrentFilters]);

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
    setSidebarFilters(EMPTY_SIDEBAR_FILTERS);
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

  const provinceOptions = useMemo(() => _getProvinceOptions(filterData), [filterData]);

  const activeFiltersCount = useMemo(
    () => countActiveFilters(keyword, selectedProvince, sidebarFilters, initialLocation, locationType, initialCategory),
    [keyword, selectedProvince, sidebarFilters, initialLocation, locationType, initialCategory],
  );

  const getFilterLabelFn = useCallback(
    (filterType: string, value: string) => _getFilterLabel(filterData, filterType, value),
    [filterData],
  );

  const getProvinceNameFn = useCallback(
    (provinceId: string) => _getProvinceName(filterData, provinceId),
    [filterData],
  );

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
    getProvinceOptions: provinceOptions,
    getActiveFiltersCount: activeFiltersCount,
    getFilterLabel: getFilterLabelFn,
    getProvinceName: getProvinceNameFn,
    getFilterTypeLabel,

    // Infinite scroll
    setTarget,
  };
}
