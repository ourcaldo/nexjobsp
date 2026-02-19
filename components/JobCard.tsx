import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Banknote } from 'lucide-react';
import { Job } from '@/types/job';
import { formatLocationName } from '@/lib/utils/textUtils';
import { formatJobDate } from '@/lib/utils/date';

interface JobCardProps {
  job: Job;
}

const MAX_VISIBLE_TAGS = 4;

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getJobUrl = () => {
    const categorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
    return `/lowongan-kerja/${categorySlug}/${job.id}/`;
  };

  const getFullLocation = () => {
    const province = formatLocationName(job.lokasi_provinsi);
    const regency = formatLocationName(job.lokasi_kota);
    if (province && regency) return `${regency}, ${province}`;
    return province || regency || '';
  };

  // Collect all tags: employment type + job_tags
  const allTags: string[] = [];
  if (job.tipe_pekerjaan) allTags.push(job.tipe_pekerjaan);
  if (job.job_tags && job.job_tags.length > 0) {
    job.job_tags.forEach((t) => allTags.push(t.name));
  }
  const visibleTags = allTags.slice(0, MAX_VISIBLE_TAGS);
  const overflowCount = allTags.length - MAX_VISIBLE_TAGS;

  const companyInitial = (job.company_name || 'P').charAt(0).toUpperCase();

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150 group hover:border-primary-300">
      {/* Header: avatar + title + company */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{companyInitial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Link href={getJobUrl()} className="block after:content-[''] after:absolute after:inset-0">
            <h3 className="text-base font-semibold text-gray-900 mb-0.5 group-hover:text-primary-600 transition-colors line-clamp-2">
              {job.title}
            </h3>
          </Link>
          <span className="text-sm text-gray-600">{job.company_name}</span>
        </div>
      </div>

      {/* Tags row */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleTags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
              +{overflowCount}
            </span>
          )}
        </div>
      )}

      {/* Info rows */}
      <div className="space-y-1.5 mb-3">
        {getFullLocation() && (
          <div className="flex items-center text-gray-500">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="text-sm">{getFullLocation()}</span>
          </div>
        )}
        <div className="flex items-center">
          <Banknote className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-accent-600">{job.gaji}</span>
        </div>
        <div className="flex items-center text-gray-400">
          <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span className="text-xs">{formatJobDate(job.created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end">
        <span
          className="relative z-10 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors pointer-events-none"
          aria-hidden="true"
        >
          Lihat Detail →
        </span>
      </div>
    </div>
  );
};

export default React.memo(JobCard);