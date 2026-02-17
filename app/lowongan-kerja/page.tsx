import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { getCurrentDomain } from '@/lib/config';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import { generateBreadcrumbSchema } from '@/lib/utils/schemaUtils';
import { renderTemplate } from '@/lib/utils/templateUtils';
import { jobService } from '@/lib/services/JobService';
import { logger } from '@/lib/logger';
import { JOB_PAGE_SETTINGS } from '@/lib/constants/job-settings';
import Link from 'next/link';

const getJobsData = cache(async function getJobsData() {
  const settings = JOB_PAGE_SETTINGS;
  const currentUrl = getCurrentDomain();

  // Server-side fetch: initial jobs + filter data in parallel
  try {
    const [jobsResponse, filterData] = await Promise.all([
      jobService.getJobs(undefined, 1, 24),
      jobService.getFiltersData(),
    ]);

    return {
      settings,
      currentUrl,
      initialJobs: jobsResponse.jobs,
      initialTotalJobs: jobsResponse.totalJobs,
      initialHasMore: jobsResponse.hasMore,
      initialCurrentPage: jobsResponse.currentPage,
      initialFilterData: filterData,
    };
  } catch (error) {
    logger.error('Error fetching initial jobs data:', {}, error);
    return {
      settings,
      currentUrl,
      initialJobs: null,
      initialTotalJobs: 0,
      initialHasMore: false,
      initialCurrentPage: 1,
      initialFilterData: null,
    };
  }
});

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
  const { settings, currentUrl, initialJobs, initialTotalJobs, initialHasMore, initialCurrentPage, initialFilterData } = await getJobsData();

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
        <div className="bg-primary-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <nav className="mb-8">
              <ol className="flex items-center justify-center space-x-2 text-sm text-primary-100">
                <li className="flex items-center">
                  <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
                  <span className="mx-2">/</span>
                  <span className="text-white font-medium">Lowongan Kerja</span>
                </li>
              </ol>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Lowongan Kerja Terbaru
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                {pageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Job Search Content */}
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse" role="status" aria-busy="true">
            <span className="sr-only">Memuat...</span>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="h-10 bg-gray-200 rounded-lg w-full mb-4" />
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded-lg flex-1" />
                <div className="h-10 bg-gray-200 rounded-lg w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }>
          <JobSearchPage
            settings={settings}
            initialJobs={initialJobs}
            initialTotalJobs={initialTotalJobs}
            initialHasMore={initialHasMore}
            initialCurrentPage={initialCurrentPage}
            initialFilterData={initialFilterData}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
