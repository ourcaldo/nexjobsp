import type { Metadata } from 'next';
import { SupabaseAdminService } from '@/lib/supabase/admin';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import BookmarkPage from '@/components/pages/BookmarkPage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';

async function getBookmarksData() {
  const settings = await SupabaseAdminService.getSettingsServerSide();
  return { settings };
}

export async function generateMetadata(): Promise<Metadata> {
  const currentUrl = getCurrentDomain();

  return {
    title: 'Lowongan Tersimpan - Nexjob',
    description: 'Kelola lowongan kerja yang telah Anda simpan di Nexjob',
    openGraph: {
      title: 'Lowongan Tersimpan - Nexjob',
      description: 'Kelola lowongan kerja yang telah Anda simpan di Nexjob',
      type: 'website',
      url: `${currentUrl}/bookmarks/`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${currentUrl}/bookmarks/`,
    },
  };
}

export default async function Bookmarks() {
  await getBookmarksData();

  const breadcrumbItems = [{ label: 'Lowongan Tersimpan' }];

  return (
    <>
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <BookmarkPage />
      </main>
      <Footer />
    </>
  );
}
