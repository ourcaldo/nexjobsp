'use client';

import dynamic from 'next/dynamic';

const IntegrationSettings = dynamic(() => import('@/components/admin/IntegrationSettings'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading integration settings...</div>
    </div>
  ),
  ssr: false
});

export default function AdminIntegration() {
  return <IntegrationSettings />;
}
