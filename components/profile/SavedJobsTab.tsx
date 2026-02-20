'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bookmark, MapPin, Briefcase, ExternalLink,
  ChevronRight, Trash2, Loader2,
} from 'lucide-react';
import { useSavedJobs } from '@/hooks/useProfile';
import { formatRelativeDate } from './shared';

export default function SavedJobsTab() {
  const { savedJobs, loading, unsaveJob } = useSavedJobs();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  const items = savedJobs?.items || [];
  const total = savedJobs?.pagination?.total || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Lowongan Tersimpan</h2>
        <span className="text-xs text-gray-400">{total} lowongan</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-1">Belum ada lowongan tersimpan</p>
          <p className="text-xs text-gray-400">Simpan lowongan yang menarik untuk dilihat nanti</p>
        </div>
      ) : (
        items.map((job: any) => {
          const location = [job.regency_name, job.province_name].filter(Boolean).join(', ') || (job.job_is_remote ? 'Remote' : '-');
          const savedDate = formatRelativeDate(job.saved_at);
          const slug = job.slug || job.id;

          return (
            <div
              key={job.saved_id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden">
                    {job.job_company_logo ? (
                      <img src={job.job_company_logo} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-primary-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500">{job.job_company_name}</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> {location}
                      </span>
                      {job.employment_type_name && (
                        <>
                          <span className="text-xs text-gray-300">&middot;</span>
                          <span className="text-xs text-gray-400">{job.employment_type_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs text-gray-400">{savedDate}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lowongan-kerja/${slug}`}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Lihat <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => unsaveJob(job.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus dari tersimpan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className="text-center pt-2">
        <Link
          href="/lowongan-kerja/"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Cari Lowongan Lainnya
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
