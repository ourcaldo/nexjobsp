'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Banknote,
  ExternalLink,
  Bookmark,
  CalendarDays,
  AlertTriangle,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Job } from '@/types/job';
import { bookmarkService } from '@/lib/utils/bookmarks';
import { useAnalytics } from '@/hooks/useAnalytics';
import Breadcrumbs from '@/components/Breadcrumbs';
import JobCard from '@/components/JobCard';
import dynamic from 'next/dynamic';
import { sanitizeHTML } from '@/lib/utils/sanitize';
import { formatLocationName } from '@/lib/utils/textUtils';
import { formatJobDate } from '@/lib/utils/date';
import { config } from '@/lib/config';

const JobApplicationModal = dynamic(() => import('@/components/ui/JobApplicationModal'), { ssr: false });
const ShareButton = dynamic(() => import('@/components/ui/ShareButton'), { ssr: false });

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface JobDetailPageProps {
  job: Job;
  jobId: string;
  settings: any;
  breadcrumbItems?: BreadcrumbItem[];
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, jobId, settings, breadcrumbItems: propsBreadcrumbItems }) => {
  const { trackPageView, trackJobApplication, trackBookmark } = useAnalytics();

  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    const fetchRelatedJobs = async () => {
      try {
        const response = await fetch(`/api/job-posts/${job.id}/related?limit=4`);
        const data = await response.json();
        if (data.success && data.data) {
          setRelatedJobs(data.data);
        }
      } catch (err) {
        console.error('Error loading related jobs:', err);
      }
    };
    fetchRelatedJobs();
  }, [job.id]);

  useEffect(() => {
    trackPageView({
      page_title: `${job.title} - ${job.company_name}`,
      content_group1: 'job_detail',
      content_group2: job.kategori_pekerjaan,
      content_group3: job.lokasi_kota,
    });
  }, [job.id, job.title, job.company_name, job.kategori_pekerjaan, job.lokasi_kota, trackPageView]);

  useEffect(() => {
    setIsBookmarked(bookmarkService.isBookmarked(job.id));
  }, [job.id]);

  useEffect(() => {
    const handleBookmarkUpdate = () => {
      setIsBookmarked(bookmarkService.isBookmarked(job.id));
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nexjob_bookmarks') {
        setIsBookmarked(bookmarkService.isBookmarked(job.id));
      }
    };
    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [job.id]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleBookmarkToggle = async () => {
    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        bookmarkService.removeBookmark(job.id);
        trackBookmark('remove', job.title, job.id);
      } else {
        bookmarkService.addBookmark(job.id);
        trackBookmark('add', job.title, job.id);
      }
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleApplyClick = () => {
    setShowApplicationModal(true);
  };

  const handleProceedApplication = () => {
    trackJobApplication(job.title, job.company_name, job.id);
    setShowApplicationModal(false);
    window.open(job.link, '_blank');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Baru dipublikasikan';
    if (!isHydrated) return 'Baru dipublikasikan';
    return formatJobDate(dateStr);
  };

  const parseJobContent = (content: string) => {
    return content
      .replace(/<h2>/g, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">')
      .replace(/<h3>/g, '<h3 class="text-lg font-semibold text-gray-800 mt-5 mb-2">')
      .replace(/<p>/g, '<p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 mb-4 text-gray-700">')
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 mb-4 text-gray-700">')
      .replace(/<li>/g, '<li class="pl-2">');
  };

  const getJobTags = (tagString: string) => {
    if (!tagString) return [];
    return tagString.split(', ').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  const getFullLocation = () => {
    const province = formatLocationName(job.lokasi_provinsi);
    const regency = formatLocationName(job.lokasi_kota);
    if (province && regency) return `${regency}, ${province}`;
    if (province) return province;
    if (regency) return regency;
    return '';
  };

  const companyInitial = job.company_name?.charAt(0)?.toUpperCase() || 'C';

  const breadcrumbItems = propsBreadcrumbItems || [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: job.title },
  ];

  const infoItems = [
    { icon: Banknote, label: 'Gaji', value: job.gaji, highlight: true },
    getFullLocation() ? { icon: MapPin, label: 'Lokasi', value: getFullLocation() } : null,
    { icon: Briefcase, label: 'Tipe Pekerjaan', value: job.tipe_pekerjaan },
    { icon: Clock, label: 'Pengalaman', value: job.pengalaman },
    { icon: GraduationCap, label: 'Pendidikan', value: job.pendidikan },
    { icon: Globe, label: 'Kebijakan Kerja', value: job.kebijakan_kerja },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; highlight?: boolean }>;

  const tags = getJobTags(job.tag);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              {/* Company Initial */}
              <div className="hidden sm:flex w-12 h-12 bg-primary-600 rounded-lg items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">{companyInitial}</span>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {job.title}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-gray-900">{job.company_name}</span>
                  {job.industry && (
                    <span className="text-gray-500">{job.industry}</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  {getFullLocation() && (
                    <span className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {getFullLocation()}
                    </span>
                  )}
                  <span className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-1" />
                    {isHydrated ? formatDate(job.created_at) : 'Baru dipublikasikan'}
                  </span>
                </div>

                {/* Key info pills — only job type + work policy (rest in sidebar) */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tipe_pekerjaan && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700">
                      {job.tipe_pekerjaan}
                    </span>
                  )}
                  {job.kebijakan_kerja && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {job.kebijakan_kerja}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleBookmarkToggle}
                disabled={isBookmarkLoading}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                  isBookmarked
                    ? 'border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isHydrated && isBookmarked ? 'Tersimpan' : 'Simpan'}
              </button>
              <ShareButton
                title={job.title}
                text={`${job.title} - ${job.company_name} | ${config.site.name}`}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scam Warning */}
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50/70 border border-amber-100 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p>
                Waspada penipuan &mdash; perusahaan yang sah <strong>tidak pernah meminta biaya</strong> dalam proses rekrutmen.
              </p>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Deskripsi Pekerjaan</h2>
              </div>
              <div className="px-6 py-5">
                <div
                  className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(parseJobContent(job.content)) }}
                />

                {/* Tags — inline after description */}
                {tags.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="sm:hidden flex gap-2">
              <button
                onClick={handleBookmarkToggle}
                disabled={isBookmarkLoading}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                  isBookmarked
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isHydrated && isBookmarked ? 'Tersimpan' : 'Simpan'}
              </button>
              <ShareButton
                title={job.title}
                text={`${job.title} - ${job.company_name} | ${config.site.name}`}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700"
              />
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Lowongan Serupa</h2>
                  <Link href="/lowongan-kerja/" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                    Lihat semua
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {relatedJobs.map((relatedJob) => (
                    <div key={relatedJob.id} className="px-6 py-4">
                      <JobCard job={relatedJob} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-6 space-y-5">
              {/* Apply CTA */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold inline-flex items-center justify-center"
                >
                  Lamar Sekarang
                  <ExternalLink className="h-4 w-4 ml-2" />
                </button>
                <p className="text-xs text-gray-400 text-center mt-2.5">
                  Anda akan diarahkan ke halaman lamaran perusahaan
                </p>
              </div>

              {/* Job Details */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Detail Pekerjaan</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {infoItems.map((item, index) => (
                    <div key={index} className="px-5 py-3 flex items-start gap-3">
                      <item.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${item.highlight ? 'text-accent-600' : 'text-gray-400'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className={`text-sm font-medium ${item.highlight ? 'text-accent-600' : 'text-gray-900'}`}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-50">
        <button
          onClick={handleApplyClick}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center hover:bg-primary-700 transition-colors"
        >
          Lamar Sekarang
          <ExternalLink className="h-4 w-4 ml-2" />
        </button>
      </div>

      {/* Job Application Modal */}
      <JobApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onProceed={handleProceedApplication}
        jobLink={job.link}
      />
    </div>
  );
};

export default JobDetailPage;
