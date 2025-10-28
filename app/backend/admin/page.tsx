'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading admin dashboard...</div>
    </div>
  ),
  ssr: false
});

export default function AdminDashboard() {
  return <Dashboard />;
}
