'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function BackendAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const getCurrentPage = () => {
    if (pathname === '/backend/admin' || pathname === '/backend/admin/') {
      return 'dashboard';
    }
    
    if (pathname.startsWith('/backend/admin/cms')) {
      return 'cms';
    }
    
    if (pathname.startsWith('/backend/admin/users')) {
      return 'users';
    }
    
    if (pathname.startsWith('/backend/admin/seo')) {
      return 'seo';
    }
    
    if (pathname.startsWith('/backend/admin/sitemap')) {
      return 'sitemap';
    }
    
    if (pathname.startsWith('/backend/admin/system')) {
      return 'system';
    }
    
    if (pathname.startsWith('/backend/admin/integration')) {
      return 'integration';
    }
    
    if (pathname.startsWith('/backend/admin/advertisement')) {
      return 'advertisement';
    }
    
    return 'dashboard';
  };
  
  return (
    <AdminLayout currentPage={getCurrentPage()}>
      {children}
    </AdminLayout>
  );
}
