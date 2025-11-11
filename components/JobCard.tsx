'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Briefcase, GraduationCap, ExternalLink, Building, Bookmark, EyeOff, Flame, Layers } from 'lucide-react';
import { Job } from '@/types/job';
import { supabase } from '@/lib/supabase';
import { userBookmarkService } from '@/lib/api/user-bookmarks';
import { toggleBookmark as toggleBookmarkAction } from '@/app/actions/bookmarks';
import { useToast } from '@/components/ui/ToastProvider';
import BookmarkLoginModal from '@/components/ui/BookmarkLoginModal';
import { useRouter } from 'next/navigation';
import { formatRelativeDate, isHotJob, getHoursAgo } from '@/lib/utils/date';

interface JobCardProps {
  job: Job;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkChange?: (jobId: string, isBookmarked: boolean) => void;
}

const JobCard: React.FC<JobCardProps> = React.memo(({ 
  job, 
  showBookmark = true, 
  isBookmarked: initialIsBookmarked,
  onBookmarkChange 
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked || false);
  const [isPending, startTransition] = useTransition();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSalaryText, setShowSalaryText] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);


  const initializeAuth = useCallback(async () => {
    if (isInitialized) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Only check bookmark status if not provided via props
      if (user && showBookmark && initialIsBookmarked === undefined) {
        const bookmarked = await userBookmarkService.isBookmarked(user.id, job.id);
        setIsBookmarked(bookmarked);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error checking user:', error);
      setIsInitialized(true);
    }
  }, [job.id, showBookmark, initialIsBookmarked, isInitialized]);

  useEffect(() => {
    // If bookmark status is provided via props, use it
    if (initialIsBookmarked !== undefined) {
      setIsBookmarked(initialIsBookmarked);
      setIsInitialized(true);
      return;
    }

    // Only initialize if not already done
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Don't auto-check bookmark status here to prevent excessive requests
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsBookmarked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth, initialIsBookmarked]);

  // Update local state when prop changes
  useEffect(() => {
    if (initialIsBookmarked !== undefined) {
      setIsBookmarked(initialIsBookmarked);
    }
  }, [initialIsBookmarked]);

  const isSalaryHidden = useCallback((salary: string) => {
    return salary === 'Perusahaan Tidak Menampilkan Gaji';
  }, []);

  const formatSalary = useCallback((salary: string) => {
    // Remove period suffixes like /monthly, /yearly, /bulan, /tahun, etc.
    return salary.replace(/\/(monthly|yearly|bulan|tahun|month|year)$/i, '').trim();
  }, []);

  const handleBookmarkClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(job.id);
        
        setIsBookmarked(result.isBookmarked);
        onBookmarkChange?.(job.id, result.isBookmarked);
        showToast(
          result.isBookmarked ? 'success' : 'info',
          result.isBookmarked ? 'Lowongan berhasil disimpan!' : 'Lowongan dihapus dari bookmark'
        );
      } catch (error) {
        showToast('error', 'Gagal menyimpan lowongan');
      }
    });
  }, [job.id, onBookmarkChange, showToast]);

  const handleBookmarkKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBookmarkClick(e as any);
    }
  }, [handleBookmarkClick]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Only open in new tab if clicking anywhere except the buttons
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('a')) {
      const categorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
      window.open(`/lowongan-kerja/${categorySlug}/${job.slug}/`, '_blank');
    }
  }, [job.slug, job.job_categories]);

  const handleLoginModalLogin = useCallback(() => {
    setShowLoginModal(false);
    window.open('/login/', '_blank');
  }, []);

  const handleLoginModalSignup = useCallback(() => {
    setShowLoginModal(false);
    window.open('/signup/', '_blank');
  }, []);

  const getJobTags = useCallback(() => {
    // Prefer job_tags array from API, fallback to old tag string
    if (job.job_tags && job.job_tags.length > 0) {
      const tagNames = job.job_tags.map(tag => tag.name);
      
      if (tagNames.length > 4) {
        const visibleTags = tagNames.slice(0, 3);
        const remainingCount = tagNames.length - 3;
        return [...visibleTags, `+${remainingCount} Lainnya`];
      }

      return tagNames.slice(0, 4);
    }

    // Fallback to old comma-separated tag string
    if (!job.tag) return [];

    const tags = job.tag.split(', ').map(tag => tag.trim()).filter(tag => tag.length > 0);

    if (tags.length > 4) {
      const visibleTags = tags.slice(0, 3);
      const remainingCount = tags.length - 3;
      return [...visibleTags, `+${remainingCount} Lainnya`];
    }

    return tags.slice(0, 4);
  }, [job.job_tags, job.tag]);

  const tags = React.useMemo(() => getJobTags(), [getJobTags]);



  return (
    <>
      <article 
        ref={cardRef}
        onClick={handleCardClick}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-200 animate-fade-in cursor-pointer focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
        aria-label={`Lowongan ${job.title} di ${job.company_name}, ${job.lokasi_provinsi}`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
              {job.title}
            </h2>
            <div className="flex items-center text-primary-600 font-medium mb-2">
              <Building className="h-4 w-4 mr-2" />
              {job.company_name}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {job.lokasi_provinsi}
            </div>
          </div>
          <div className="text-right">
            {isSalaryHidden(job.gaji) ? (
              <div 
                className="relative"
                onMouseEnter={() => setShowSalaryText(true)}
                onMouseLeave={() => setShowSalaryText(false)}
              >
                <div className="flex items-center justify-end text-gray-400">
                  <EyeOff className="h-5 w-5" />
                </div>
                {showSalaryText && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Gaji tidak ditampilkan
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg font-bold text-accent-600">{formatSalary(job.gaji)}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  tag.includes('Lainnya') 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
            {job.tipe_pekerjaan}
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
            {job.pendidikan}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {job.pengalaman}
          </div>
          <div className="flex items-center">
            <Layers className="h-4 w-4 mr-2 text-gray-400" />
            {job.industry}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {isHotJob(job.created_at) ? (
              <div className="flex items-center text-orange-600 text-sm font-medium">
                <Flame className="h-4 w-4 mr-1" />
                <span>HOT</span>
                <span className="ml-1 text-gray-500">{getHoursAgo(job.created_at)} jam lalu</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                {formatRelativeDate(job.created_at)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmarkClick}
              onKeyDown={handleBookmarkKeyDown}
              disabled={isPending}
              className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isBookmarked 
                  ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                  : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
              aria-label={isBookmarked ? 'Hapus dari bookmark' : 'Simpan ke bookmark'}
              title={isBookmarked ? 'Hapus dari bookmark' : 'Simpan ke bookmark'}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''} ${isPending ? 'animate-pulse' : ''}`} />
            </button>
            <Link
              href={`/lowongan-kerja/${job.job_categories?.[0]?.slug || 'uncategorized'}/${job.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Lihat detail lowongan ${job.title} di ${job.company_name}`}
            >
              Lihat Detail
              <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>

      {/* Login Modal */}
      <BookmarkLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginModalLogin}
        onSignup={handleLoginModalSignup}
      />
    </>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;