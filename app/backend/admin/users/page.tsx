'use client';

import dynamic from 'next/dynamic';

const UserManagement = dynamic(() => import('@/components/admin/UserManagement'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading user management...</div>
    </div>
  ),
  ssr: false
});

export default function AdminUsers() {
  return <UserManagement />;
}
