'use client';

import dynamic from 'next/dynamic';

const SystemSettings = dynamic(() => import('@/components/admin/SystemSettings'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading system settings...</div>
    </div>
  ),
  ssr: false
});

export default function AdminSystem() {
  return <SystemSettings />;
}
