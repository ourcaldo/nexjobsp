'use client';

import dynamic from 'next/dynamic';

const AdvertisementSettings = dynamic(() => import('@/components/admin/AdvertisementSettings'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading advertisement settings...</div>
    </div>
  ),
  ssr: false
});

export default function AdvertisementPage() {
  return <AdvertisementSettings />;
}
