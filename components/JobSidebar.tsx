'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Clock, GraduationCap, Users, Filter, MapPin, ChevronDown, ChevronUp, Star, Zap, Banknote, Search } from 'lucide-react';
import { FilterData } from '@/lib/cms/interface';

// Searchable city filter sub-component
function CityFilterSection({
  cities,
  selectedCities,
  isExpanded,
  onToggle,
  onFilterChange,
  isLoading,
}: {
  cities: Array<{ id: string; name: string }>;
  selectedCities: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onFilterChange: (value: string, checked: boolean) => void;
  isLoading: boolean;
}) {
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, citySearch]);

  return (
    <div className="border-b border-gray-100 pb-6">
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400" />
          <label className="text-sm font-medium text-gray-700 ml-2">Kota</label>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div>
          {/* Search input */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kota..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Selected cities shown first */}
          {selectedCities.length > 0 && (
            <div className="mb-2 pb-2 border-b border-gray-50">
              {selectedCities.map((cityId) => {
                const city = cities.find((c) => c.id === cityId);
                if (!city) return null;
                return (
                  <label key={cityId} className="flex items-center cursor-pointer group py-0.5">
                    <input
                      type="checkbox"
                      checked
                      onChange={(e) => onFilterChange(cityId, e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
                    />
                    <span className="ml-3 text-sm text-gray-900 font-medium">{city.name}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Filtered city list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredCities
              .filter((c) => !selectedCities.includes(c.id))
              .map((city) => (
                <label key={city.id} className="flex items-center cursor-pointer group py-0.5">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={(e) => onFilterChange(city.id, e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{city.name}</span>
                </label>
              ))}
            {filteredCities.filter((c) => !selectedCities.includes(c.id)).length === 0 && (
              <p className="text-sm text-gray-400 py-2 text-center">Tidak ditemukan</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface JobSidebarProps {
  filters: {
    cities: string[];
    jobTypes: string[];
    experiences: string[];
    educations: string[];
    industries: string[];
    workPolicies: string[];
    categories: string[];
    salaries: string[];
  };
  selectedProvince: string;
  sortBy: string;
  onFiltersChange: (filters: any) => void;
  onSortChange: (sortBy: string) => void;
  isLoading: boolean;
  initialFilterData?: FilterData | null;
}

const JobSidebar: React.FC<JobSidebarProps> = ({ 
  filters, 
  selectedProvince, 
  sortBy,
  onFiltersChange, 
  onSortChange,
  isLoading,
  initialFilterData = null 
}) => {
  const [filterData, setFilterData] = useState<FilterData | null>(initialFilterData);
  const [loadingFilters, setLoadingFilters] = useState(!initialFilterData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sort: true,
    cities: true,
    categories: true,
    jobTypes: true,
    experiences: true,
    educations: true,
    industries: true,
    workPolicies: true,
    salaries: true
  });

  useEffect(() => {
    if (!initialFilterData) {
      loadFilterData();
    }
  }, [initialFilterData]);

  const loadFilterData = async () => {
    try {
      const response = await fetch('/api/job-posts/filters');
      const result = await response.json();
      
      if (result.success) {
        setFilterData(result.data);
      }
    } catch (error) {
      console.error('Failed to load filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    const currentValues = filters[filterType as keyof typeof filters] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(item => item !== value);
    }

    const newFilters = {
      ...filters,
      [filterType]: newValues
    };

    onFiltersChange(newFilters);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const allCities = useMemo(() => {
    if (!filterData) return [];
    
    // If province is selected, return cities for that province
    if (selectedProvince) {
      return filterData.regencies
        .filter(r => r.province_id === selectedProvince)
        .map(r => ({ id: r.id, name: r.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Otherwise, return all cities from all regencies
    return filterData.regencies
      .map(r => ({ id: r.id, name: r.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filterData, selectedProvince]);

  const renderSortSection = () => {
    const isExpanded = expandedSections.sort;
    
    return (
      <div className="border-b border-gray-100 pb-6">
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => toggleSection('sort')}
        >
          <div className="flex items-center">
            <Star className="h-4 w-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Prioritaskan</label>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sortBy"
                value="newest"
                checked={sortBy === 'newest'}
                onChange={(e) => onSortChange(e.target.value)}
                disabled={isLoading}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                <Zap className="h-3 w-3 mr-1 text-green-500" />
                Baru Ditambahkan
              </span>
            </label>
            <label className="flex items-center cursor-pointer group opacity-50">
              <input
                type="radio"
                name="sortBy"
                value="relevant"
                checked={sortBy === 'relevant'}
                onChange={(e) => onSortChange(e.target.value)}
                disabled={true}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                <Star className="h-3 w-3 mr-1 text-orange-500" />
                Paling Relevan
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Coming Soon
                </span>
              </span>
            </label>
          </div>
        )}
      </div>
    );
  };

  const renderCheckboxGroup = (
    title: string,
    icon: React.ReactNode,
    filterKey: string,
    options: string[] | Array<{id: string; name: string}>
  ) => {
    const isExpanded = expandedSections[filterKey];
    const hasScrollbar = options.length > 15;

    // Determine if options are objects with id and name or just strings
    const isObjectOptions = options.length > 0 && typeof options[0] === 'object' && 'id' in options[0];

    return (
      <div className="border-b border-gray-100 pb-6 last:border-b-0">
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => toggleSection(filterKey)}
        >
          <div className="flex items-center">
            {icon}
            <label className="text-sm font-medium text-gray-700 ml-2">{title}</label>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className={`space-y-2 ${hasScrollbar ? 'max-h-60 overflow-y-auto' : ''}`}>
            {options.map((option) => {
              const value = isObjectOptions ? (option as {id: string; name: string}).id : (option as string);
              const label = isObjectOptions ? (option as {id: string; name: string}).name : (option as string);
              
              return (
                <label key={value} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters[filterKey as keyof typeof filters]?.includes(value) || false}
                    onChange={(e) => handleFilterChange(filterKey, value, e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 disabled:opacity-50">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loadingFilters) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
        <div className="flex items-center mb-6">
          <Filter className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Pencarian</h2>
        </div>
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 text-primary-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Filter Pencarian</h2>
      </div>

      <div className="space-y-6">
        {/* Sort Section */}
        {renderSortSection()}

        {/* Cities Filter - Searchable */}
        {allCities.length > 0 && (
          <CityFilterSection
            cities={allCities}
            selectedCities={filters.cities}
            isExpanded={expandedSections.cities ?? false}
            onToggle={() => toggleSection('cities')}
            onFilterChange={(value, checked) => handleFilterChange('cities', value, checked)}
            isLoading={isLoading}
          />
        )}

        {/* Job Categories */}
        {filterData?.categories && filterData.categories.length > 0 && (
          renderCheckboxGroup(
            'Kategori Pekerjaan',
            <Briefcase className="h-4 w-4 text-gray-400" />,
            'categories',
            filterData.categories.map(c => ({ id: c.id, name: c.name }))
          )
        )}

        {/* Job Types */}
        {filterData?.employment_types && filterData.employment_types.length > 0 && (
          renderCheckboxGroup(
            'Tipe Pekerjaan',
            <Briefcase className="h-4 w-4 text-gray-400" />,
            'jobTypes',
            filterData.employment_types.map(et => ({ id: et.id, name: et.name }))
          )
        )}

        {/* Experience */}
        {filterData?.experience_levels && filterData.experience_levels.length > 0 && (
          renderCheckboxGroup(
            'Pengalaman',
            <Clock className="h-4 w-4 text-gray-400" />,
            'experiences',
            filterData.experience_levels.map(el => ({ id: el.id, name: el.years_max != null ? `${el.years_min}-${el.years_max} tahun` : `${el.years_min}+ tahun` }))
          )
        )}

        {/* Education Level */}
        {filterData?.education_levels && filterData.education_levels.length > 0 && (
          renderCheckboxGroup(
            'Pendidikan',
            <GraduationCap className="h-4 w-4 text-gray-400" />,
            'educations',
            filterData.education_levels.map(edu => ({ id: edu.id, name: edu.name }))
          )
        )}

        {/* Work Policy / Kebijakan Kerja */}
        {renderCheckboxGroup(
          'Kebijakan Kerja',
          <Users className="h-4 w-4 text-gray-400" />,
          'workPolicies',
          [
            { id: 'onsite', name: 'Kerja di Kantor (Onsite)' },
            { id: 'remote', name: 'Kerja di Rumah (Remote)' },
            { id: 'hybrid', name: 'Kerja di Kantor/Rumah (Hybrid)' }
          ]
        )}

        {/* Salary Range */}
        {renderCheckboxGroup(
          'Rentang Gaji',
          <Banknote className="h-4 w-4 text-gray-400" />,
          'salaries',
          [
            { id: '1-3', name: '1-3 Juta' },
            { id: '4-6', name: '4-6 Juta' },
            { id: '7-9', name: '7-9 Juta' },
            { id: '10+', name: '10+ Juta' }
          ]
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          onFiltersChange({
            cities: [],
            jobTypes: [],
            experiences: [],
            educations: [],
            industries: [],
            workPolicies: [],
            categories: [],
            salaries: []
          });
          onSortChange('newest');
        }}
        disabled={isLoading}
        className="w-full mt-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
      >
        Reset Filter
      </button>
    </div>
  );
};

export default JobSidebar;