import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SupabaseAdminService } from '@/lib/supabase/admin';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { renderTemplate } from '@/utils/templateUtils';

async function getJobsData() {
  const settings = await SupabaseAdminService.getSettingsServerSide();
  const currentUrl = getCurrentDomain();

  return {
    settings,
    currentUrl
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings, currentUrl } = await getJobsData();
  
  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    lokasi: '',
    kategori: ''
  };

  // Get SEO settings with template rendering
  const pageTitle = renderTemplate(settings?.jobs_title || 'Lowongan Kerja Terbaru - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.jobs_description || 'Temukan lowongan kerja terbaru dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda dengan gaji terbaik.', templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: 'lowongan kerja, jobs, karir, pekerjaan, rekrutmen',
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/lowongan-kerja/`,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    alternates: {
      canonical: `${currentUrl}/lowongan-kerja/`,
    },
  };
}

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export default async function Jobs() {
  const { settings, currentUrl } = await getJobsData();

  const breadcrumbItems = [{ label: 'Lowongan Kerja' }];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    lokasi: '',
    kategori: ''
  };

  // Get SEO settings with template rendering
  const pageTitle = renderTemplate(settings?.jobs_title || 'Lowongan Kerja Terbaru - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.jobs_description || 'Temukan lowongan kerja terbaru dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda dengan gaji terbaik.', templateVars);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <nav className="mb-8">
              <ol className="flex items-center justify-center space-x-2 text-sm text-primary-100">
                <li className="flex items-center">
                  <span className="text-white">Home</span>
                  <span className="mx-2">/</span>
                  <span className="text-white">Lowongan Kerja</span>
                </li>
              </ol>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {pageTitle.replace(` - ${templateVars.site_title}`, '') || 'Lowongan Kerja Terbaru'}
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                {pageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Job Search Content */}
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>}>
          <JobSearchPage settings={settings} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
