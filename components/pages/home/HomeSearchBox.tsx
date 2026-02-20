'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import type { FilterData } from '@/lib/cms/interface';

interface HomeSearchBoxProps {
  initialFilterData: FilterData | null;
}

export default function HomeSearchBox({ initialFilterData }: HomeSearchBoxProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set('search', searchKeyword);
    if (selectedLocation) params.set('location', selectedLocation);
    const url = `/lowongan-kerja/?${params.toString()}`;
    window.open(url, '_blank');
  }, [searchKeyword, selectedLocation]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const getProvinceOptions = useMemo(() => {
    if (!initialFilterData) return [];
    return initialFilterData.provinces.map(province => ({
      value: province.name,
      label: province.name
    }));
  }, [initialFilterData]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Posisi, skill, atau perusahaan..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchableSelect
              options={getProvinceOptions}
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Semua Provinsi"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-600 text-white px-7 py-3.5 rounded-xl hover:bg-primary-700 transition-colors font-semibold whitespace-nowrap"
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  );
}
