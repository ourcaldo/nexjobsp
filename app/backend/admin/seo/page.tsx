'use client';

import dynamic from 'next/dynamic';

const SEOSettings = dynamic(() => import('@/components/admin/SEOSettings'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading SEO settings...</div>
    </div>
  ),
  ssr: false
});

export default function AdminSEO() {
  return <SEOSettings />;
}
