'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FilterData } from '@/lib/cms/interface';

interface HomeCategoryScrollProps {
  initialFilterData: FilterData | null;
}

function getCategoryUrl(category: string) {
  const slug = category
    .toLowerCase()
    .replace(/[&]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `/lowongan-kerja/kategori/${slug}/`;
}

export default function HomeCategoryScroll({ initialFilterData }: HomeCategoryScrollProps) {
  const [filterData, setFilterData] = useState<FilterData | null>(initialFilterData);
  const [jobCategories, setJobCategories] = useState<string[]>(() => {
    if (initialFilterData?.categories) {
      return initialFilterData.categories.map(c => c.name).slice(0, 12);
    }
    return [];
  });
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterData) {
      loadFilterData();
    }
  }, [filterData]);

  const loadFilterData = async () => {
    try {
      const response = await fetch('/api/job-posts/filters');
      const result = await response.json();
      if (result.success) {
        setFilterData(result.data);
        if (result.data.categories) {
          setJobCategories(result.data.categories.map((c: any) => c.name).slice(0, 12));
        }
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const scrollCategories = useCallback((direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = 260;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  }, []);

  if (jobCategories.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kategori Populer</h2>
            <p className="text-gray-500 text-sm mt-1">Jelajahi lowongan berdasarkan bidang keahlian</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollCategories('left')}
              className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={categoryScrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {jobCategories.map((category, index) => (
            <a
              key={index}
              href={getCategoryUrl(category)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-primary-800 hover:text-white hover:border-primary-800 transition-all duration-200 whitespace-nowrap flex-shrink-0 group"
            >
              <Briefcase className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">{category}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
