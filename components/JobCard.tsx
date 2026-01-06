import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Building, DollarSign } from 'lucide-react';
import { Job } from '@/types/job';
import { formatLocationName } from '@/utils/textUtils';

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Baru dipublikasikan';

    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      if (diffHours === 1) return 'Dipublikasikan 1 jam lalu';
      return `Dipublikasikan ${diffHours} jam lalu`;
    }

    if (diffDays === 1) return 'Dipublikasikan 1 hari lalu';
    if (diffDays < 7) return `Dipublikasikan ${diffDays} hari lalu`;
    if (diffDays < 30) return `Dipublikasikan ${Math.ceil(diffDays / 7)} minggu lalu`;
    return `Dipublikasikan ${Math.ceil(diffDays / 30)} bulan lalu`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group hover:border-primary-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link href={getJobUrl()} className="block">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
              {job.title}
            </h3>
          </Link>
          <div className="flex items-center text-primary-600 mb-2">
            <Building className="h-4 w-4 mr-2" />
            <span className="font-medium">{job.company_name}</span>
          </div>
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
          <DollarSign className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium text-accent-600">{job.gaji}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">{formatDate(job.created_at)}</span>
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
        
        <Link
          href={getJobUrl()}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
        >
          Lihat Detail →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;