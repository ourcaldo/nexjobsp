'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Briefcase, ChevronLeft, ChevronRight, FileText, UserCheck, Send } from 'lucide-react';
import { FilterData } from '@/lib/cms/interface';
import SearchableSelect from '@/components/SearchableSelect';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/utils/schemaUtils';
import { Job } from '@/types/job';
import JobCard from '@/components/JobCard';
import { sanitizeHTML } from '@/lib/utils/sanitize';
import { getBlurDataURL } from '@/lib/utils/image';
import { formatLocationName } from '@/lib/utils/textUtils';
import { formatJobDate } from '@/lib/utils/date';

interface HomePageProps {
  initialArticles: any[];
  initialFilterData: FilterData | null;
  settings: any;
}

const HomePage: React.FC<HomePageProps> = ({ initialArticles, initialFilterData, settings }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [articles] = useState<any[]>(initialArticles || []);
  const [filterData, setFilterData] = useState<FilterData | null>(initialFilterData);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterData) {
      loadFilterData();
    } else if (filterData.categories) {
      setJobCategories(filterData.categories.map(c => c.name).slice(0, 12));
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
    if (!filterData) return [];
    return filterData.provinces.map(province => ({
      value: province.name,
      label: province.name
    }));
  }, [filterData]);

  const getCategoryUrl = useCallback((category: string) => {
    const slug = category
      .toLowerCase()
      .replace(/[&]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `/lowongan-kerja/kategori/${slug}/`;
  }, []);

  const getArticleUrl = useCallback((slug: string) => `/artikel/${slug}/`, []);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/job-posts?page=1&limit=6');
        const result = await response.json();
        setJobs(result.success ? result.data.jobs : []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = 260;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  // Featured job for the hero card
  const featuredJob = jobs[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <SchemaMarkup schema={generateWebsiteSchema()} />
      <SchemaMarkup schema={generateOrganizationSchema()} />

      {/* ─── Hero: Split Layout ─── */}
      <section className="bg-primary-800 text-white overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="relative">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text + Search */}
              <div>
                <p className="text-primary-300 text-sm font-medium tracking-widest uppercase mb-4">Platform Karir Indonesia</p>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight mb-6">
                  Temukan Karir<br />
                  <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                    Impianmu
                  </span>
                </h1>
                <p className="text-primary-200 text-lg leading-relaxed mb-8 max-w-lg">
                  {settings.site_description || 'Platform pencarian kerja terpercaya di Indonesia'}
                </p>

                {/* Search Card */}
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
              </div>

              {/* Right: Featured Job Preview Card */}
              <div className="hidden lg:block">
                {featuredJob ? (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <p className="text-primary-300 text-xs font-medium uppercase tracking-wider mb-4">Lowongan Terbaru</p>
                    {/* Main featured card */}
                    <div className="bg-white rounded-xl p-5 mb-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{(featuredJob.company_name || 'P').charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-semibold line-clamp-1">{featuredJob.title}</h3>
                          <p className="text-gray-500 text-sm">{featuredJob.company_name}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {featuredJob.tipe_pekerjaan && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{featuredJob.tipe_pekerjaan}</span>
                        )}
                        {featuredJob.lokasi_provinsi && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {formatLocationName(featuredJob.lokasi_provinsi)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-accent-600 font-medium">{featuredJob.gaji}</p>
                    </div>
                    {/* Two mini rows */}
                    {jobs.slice(1, 3).map((job) => (
                      <div key={job.id} className="flex items-center gap-3 py-3 border-t border-white/10">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{(job.company_name || 'P').charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{job.title}</p>
                          <p className="text-primary-300 text-xs truncate">{job.company_name}</p>
                        </div>
                        <span className="text-primary-300 text-xs whitespace-nowrap">{formatJobDate(job.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 flex items-center justify-center">
                    <div className="text-center">
                      <Briefcase className="h-12 w-12 text-primary-400 mx-auto mb-3" />
                      <p className="text-primary-300">Memuat lowongan...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories: Horizontal Scrolling Pills ─── */}
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

      {/* ─── How It Works ─── */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cara Kerja</h2>
            <p className="text-gray-500">Tiga langkah mudah untuk menemukan pekerjaan impianmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gray-200" />

            {[
              { step: '01', icon: FileText, title: 'Cari Lowongan', desc: 'Gunakan fitur pencarian untuk menemukan posisi yang sesuai dengan keahlianmu' },
              { step: '02', icon: UserCheck, title: 'Review Detail', desc: 'Pelajari deskripsi pekerjaan, kualifikasi, dan informasi perusahaan' },
              { step: '03', icon: Send, title: 'Lamar Sekarang', desc: 'Langsung hubungi perusahaan dan kirimkan lamaran terbaikmu' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white border-2 border-primary-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <span className="text-xs font-bold text-primary-400 tracking-widest uppercase mb-2">Langkah {step}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Jobs: 3-Column Card Grid ─── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lowongan Terbaru</h2>
              <p className="text-gray-500">Posisi terbaru dari berbagai perusahaan terpercaya</p>
            </div>
            <a
              href="/lowongan-kerja/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="sm:hidden text-center mt-8">
            <a
              href="/lowongan-kerja/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              Lihat Semua Lowongan <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Articles: Magazine Layout ─── */}
      {articles.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tips & Panduan Karir</h2>
                <p className="text-gray-500">Artikel terbaru untuk membantu perjalanan karir Anda</p>
              </div>
              <a
                href="/artikel/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Large featured article */}
              {articles[0] && (
                <a
                  href={getArticleUrl(articles[0].slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  {articles[0].featuredImage && (
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <Image
                        src={articles[0].featuredImage}
                        alt={articles[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL()}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {articles[0].title}
                    </h3>
                    <div
                      className="text-gray-500 text-sm line-clamp-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(articles[0].excerpt) }}
                    />
                  </div>
                </a>
              )}

              {/* Stacked smaller articles */}
              <div className="flex flex-col gap-6">
                {articles.slice(1, 3).map((article) => (
                  <a
                    key={article.id}
                    href={getArticleUrl(article.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-5 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {article.featuredImage && (
                      <div className="w-40 sm:w-48 flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fill
                          sizes="200px"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={getBlurDataURL()}
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-center py-5 pr-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <div
                        className="text-gray-500 text-sm line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.excerpt) }}
                      />
                      <span className="text-primary-600 text-sm font-medium mt-3 inline-flex items-center gap-1">
                        Baca Selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="sm:hidden text-center mt-8">
              <a
                href="/artikel/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                Lihat Semua Artikel <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
