import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Banknote } from 'lucide-react';
import { Job } from '@/types/job';
import { formatLocationName } from '@/lib/utils/textUtils';
import { formatJobDate } from '@/lib/utils/date';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getJobUrl = () => {
    const categorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
    return `/lowongan-kerja/${categorySlug}/${job.id}/`;
  };

  const getFullLocation = () => {
    const province = formatLocationName(job.lokasi_provinsi);
    const regency = formatLocationName(job.lokasi_kota);
    
    if (province && regency) {
      return `${regency}, ${province}`;
    }
    
    if (province) {
      return province;
    }
    
    if (regency) {
      return regency;
    }
    
    return '';
  };

  const companyInitial = (job.company_name || 'P').charAt(0).toUpperCase();

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-150 group hover:border-primary-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{companyInitial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Link href={getJobUrl()} className="block after:content-[''] after:absolute after:inset-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
              {job.title}
            </h3>
          </Link>
          <span className="text-sm font-medium text-gray-700">{job.company_name}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {getFullLocation() && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{getFullLocation()}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <Banknote className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium text-accent-600">{job.gaji}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">{formatJobDate(job.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {job.tipe_pekerjaan && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {job.tipe_pekerjaan}
            </span>
          )}
          {job.kategori_pekerjaan && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {job.kategori_pekerjaan}
            </span>
          )}
        </div>
        
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

export default JobCard;