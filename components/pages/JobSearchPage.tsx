'use client';

import React from 'react';
import { Search, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { Job } from '@/types/job';
import { FilterData } from '@/lib/cms/interface';
import JobCard from '@/components/JobCard';
import JobSidebar from '@/components/JobSidebar';
import SearchableSelect from '@/components/SearchableSelect';
import JobCardSkeleton from '@/components/ui/JobCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import JobSearchSkeleton from '@/components/ui/JobSearchSkeleton';
import { useJobSearch } from '@/hooks/useJobSearch';

interface JobSearchPageProps {
  settings: any;
  initialCategory?: string;
  initialLocation?: string;
  initialLocationName?: string;
  locationType?: 'province' | 'city';
  initialProvinceId?: string;
  initialCityId?: string;
  initialCityName?: string;
  provinceSlug?: string;
  initialJobs?: Job[] | null;
  initialTotalJobs?: number;
  initialHasMore?: boolean;
  initialCurrentPage?: number;
  initialFilterData?: FilterData | null;
}

const JobSearchPage: React.FC<JobSearchPageProps> = ({
  settings,
  initialCategory,
  initialLocation,
  initialLocationName,
  locationType = 'province',
  initialProvinceId,
  initialCityId,
  initialCityName,
  provinceSlug,
  initialJobs: serverJobs = null,
  initialTotalJobs: serverTotalJobs = 0,
  initialHasMore: serverHasMore = false,
  initialCurrentPage: serverCurrentPage = 1,
  initialFilterData: serverFilterData = null,
}) => {
  const {
    jobs, loading, searching, loadingMore, error, filterData,
    hasMore, totalJobs, keyword, selectedProvince, sidebarFilters,
    sortBy, showMobileFilters, showSearchHistory,
    isSearchHistoryEnabled, searchHistory,
    setKeyword, setSelectedProvince, setShowMobileFilters, setShowSearchHistory,
    handleManualSearch, handleSidebarFilterChange, handleSortChange,
    handleKeyPress, clearAllFilters, removeFilter,
    getProvinceOptions, getActiveFiltersCount, getFilterLabel,
    getProvinceName, getFilterTypeLabel,
    setTarget,
  } = useJobSearch({
    initialCategory,
    initialLocation,
    initialLocationName,
    locationType,
    initialProvinceId,
    initialCityId,
    provinceSlug,
    serverJobs,
    serverTotalJobs,
    serverHasMore,
    serverCurrentPage,
    serverFilterData,
  });

  if (loading) return <JobSearchSkeleton />;

  return (
    <div className="bg-gray-50">
      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Keyword Search */}
              <div className="lg:col-span-5 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan skill, posisi, atau perusahaan..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => isSearchHistoryEnabled && setShowSearchHistory(true)}
                  onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900"
                />

                {/* Search History Dropdown */}
                {isSearchHistoryEnabled && showSearchHistory && searchHistory.history.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">Riwayat Pencarian</span>
                    </div>
                    {searchHistory.history.map((query, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between group cursor-pointer"
                        onClick={() => { setKeyword(query); setShowSearchHistory(false); }}
                      >
                        <span className="text-gray-700">{query}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); searchHistory.removeFromHistory(query); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                          aria-label="Hapus dari riwayat"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Province Select */}
              <div className="lg:col-span-4">
                <SearchableSelect
                  options={getProvinceOptions}
                  value={selectedProvince}
                  onChange={setSelectedProvince}
                  placeholder="Semua Provinsi"
                  disabled={Boolean(initialLocation && locationType === 'province')}
                />
              </div>

              {/* Search Button */}
              <div className="lg:col-span-3">
                <button
                  onClick={handleManualSearch}
                  disabled={searching}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {searching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Cari
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mt-4 text-center">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter ({getActiveFiltersCount})
            </button>
          </div>

          {/* Active Filters */}
          {getActiveFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center justify-center">
              <span className="text-sm text-gray-600">Filter aktif:</span>

              {keyword && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Keyword: {keyword}
                  <button onClick={() => removeFilter('keyword')} className="ml-2 hover:text-primary-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {initialLocation && locationType === 'province' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Provinsi: {initialLocationName || getProvinceName(initialLocation)}
                  <button onClick={() => removeFilter('province')} className="ml-2 hover:text-primary-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : selectedProvince && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Provinsi: {getProvinceName(selectedProvince)}
                  <button onClick={() => removeFilter('province')} className="ml-2 hover:text-primary-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {Object.entries(sidebarFilters).map(([filterType, values]) =>
                values
                  .filter((value: string) => {
                    if (filterType === 'categories' && initialCategory && value === initialCategory) return false;
                    if (filterType === 'cities' && initialLocation && locationType === 'city' && value === initialLocation) return false;
                    return true;
                  })
                  .map((value: string) => (
                    <span key={`${filterType}-${value}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                      {getFilterTypeLabel(filterType)}: {getFilterLabel(filterType, value)}
                      <button onClick={() => removeFilter(filterType, value)} className="ml-2 hover:text-primary-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
              )}

              <button onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-700 font-medium">
                Hapus Semua Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <JobSidebar
                filters={sidebarFilters}
                selectedProvince={selectedProvince}
                sortBy={sortBy}
                onFiltersChange={handleSidebarFilterChange}
                onSortChange={handleSortChange}
                isLoading={searching}
                initialFilterData={filterData}
              />
            </div>
          </div>

          {/* Job Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {searching ? 'Mencari...' : `${totalJobs.toLocaleString()} Lowongan Ditemukan`}
                </p>
                {initialCategory && (
                  <p className="text-gray-600">
                    Kategori: <span className="font-medium">{initialCategory}</span>
                  </p>
                )}
                {initialLocation && (
                  <p className="text-gray-600">
                    Lokasi: <span className="font-medium">{initialLocationName || initialLocation}</span>
                    {locationType === 'city' && ' (Kota)'}
                    {locationType === 'province' && ' (Provinsi)'}
                  </p>
                )}
                {keyword && (
                  <p className="text-gray-600">
                    Hasil pencarian untuk &quot;<span className="font-medium">{keyword}</span>&quot;
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {searching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <JobCardSkeleton count={6} />
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {hasMore && (
                  <div ref={setTarget} className="flex justify-center items-center py-8">
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                        <span className="text-gray-600">Memuat lowongan lainnya...</span>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Scroll untuk memuat lebih banyak lowongan</div>
                    )}
                  </div>
                )}

                {!hasMore && jobs.length > 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">
                      Anda telah melihat semua {totalJobs.toLocaleString()} lowongan yang tersedia
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={AlertCircle}
                title="Tidak ada lowongan ditemukan"
                description="Coba ubah kriteria pencarian Anda atau gunakan filter yang berbeda"
                action={
                  <button onClick={clearAllFilters} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                    Reset Filter
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearchPage;
