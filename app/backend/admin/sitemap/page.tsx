'use client';

import dynamic from 'next/dynamic';

const SitemapManagement = dynamic(() => import('@/components/admin/SitemapManagement'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading sitemap management...</div>
    </div>
  ),
  ssr: false
});

export default function AdminSitemap() {
  return <SitemapManagement />;
}
