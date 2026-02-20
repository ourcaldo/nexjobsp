'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Briefcase } from 'lucide-react';
import { Job } from '@/types/job';
import JobCard from '@/components/JobCard';
import { formatLocationName } from '@/lib/utils/textUtils';
import { formatJobDate } from '@/lib/utils/date';

/* ────── Shared context so hero card + job grid share one fetch ────── */
const HomeJobsContext = createContext<{ jobs: Job[]; loading: boolean }>({ jobs: [], loading: true });

/**
 * Provider that fetches jobs once and makes them available to child consumers.
 * Wrap both <HomeHeroCard> and <HomeJobGrid> in this provider.
 * Server-component children passed as {children} remain server-rendered.
 */
export function HomeJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <HomeJobsContext.Provider value={{ jobs, loading }}>
      {children}
    </HomeJobsContext.Provider>
  );
}

/** The right-side hero card showing the top featured job + 2 mini rows */
export function HomeHeroCard() {
  const { jobs, loading } = useContext(HomeJobsContext);
  const featuredJob = jobs[0];

  if (loading || !featuredJob) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-primary-400 mx-auto mb-3" />
          <p className="text-primary-300">Memuat lowongan...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}

/** The 3-column job card grid + loading skeletons */
export function HomeJobGrid() {
  const { jobs, loading } = useContext(HomeJobsContext);

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.slice(0, 6).map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
