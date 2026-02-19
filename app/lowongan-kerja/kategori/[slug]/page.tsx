import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import { generateBreadcrumbSchema } from '@/lib/utils/schemaUtils';
import { getCurrentDomain, config } from '@/lib/config';
import { wpCategoryMappings } from '@/lib/utils/urlUtils';
import { renderTemplate } from '@/lib/utils/templateUtils';
import { jobService } from '@/lib/services/JobService';
import { logger } from '@/lib/logger';
import { JOB_PAGE_SETTINGS } from '@/lib/constants/job-settings';

interface JobCategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const getCategoryData = cache(async function getCategoryData(slug: string) {
  const category = wpCategoryMappings[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  const location = '';
  const settings = JOB_PAGE_SETTINGS;
  const currentUrl = getCurrentDomain();

  // Server-side fetch: initial jobs for this category + filter data
  try {
    const [jobsResponse, filterData] = await Promise.all([
      jobService.getJobs({ categories: [category] }, 1, 24),
      jobService.getFiltersData(),
    ]);

    return {
      slug,
      category,
      location,
      settings,
      currentUrl,
      initialJobs: jobsResponse.jobs,
      initialTotalJobs: jobsResponse.totalJobs,
      initialHasMore: jobsResponse.hasMore,
      initialCurrentPage: jobsResponse.currentPage,
      initialFilterData: filterData,
    };
  } catch (error) {
    logger.error('Error fetching initial category jobs:', {}, error);
    return {
      slug,
      category,
      location,
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

export async function generateMetadata({ params }: JobCategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug, category, location, settings, currentUrl } = await getCategoryData(resolvedParams.slug);

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || config.site.name,
    lokasi: location,
    kategori: category
  };

  // Get SEO settings with template rendering
  const pageTitle = renderTemplate(settings?.category_page_title_template || 'Lowongan Kerja {{kategori}} - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.category_page_description_template || 'Temukan lowongan kerja {{kategori}} terbaru dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda di bidang {{kategori}}.', templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: `lowongan kerja ${category}, jobs ${category}, karir ${category}, pekerjaan ${category}`,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/lowongan-kerja/kategori/${slug}/`,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    alternates: {
      canonical: `${currentUrl}/lowongan-kerja/kategori/${slug}/`,
    },
  };
}

export async function generateStaticParams() {
  // Generate paths for common job categories
  const commonCategories = Object.keys(wpCategoryMappings);
  return commonCategories.map(slug => ({
    slug
  }));
}

export const revalidate = 300; // ISR: Revalidate every 5 minutes
export const dynamicParams = true; // Enable dynamic params for categories not in static paths

function JobSearchPageFallback() {
  return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-12 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="lg:col-span-3 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function JobCategoryPage({ params }: JobCategoryPageProps) {
  const resolvedParams = await params;
  const { slug, category, location, settings, currentUrl, initialJobs, initialTotalJobs, initialHasMore, initialCurrentPage, initialFilterData } = await getCategoryData(resolvedParams.slug);

  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: `Kategori: ${category}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || config.site.name,
    lokasi: location,
    kategori: category
  };

  // Get SEO settings with template rendering
  const pageTitle = renderTemplate(settings?.category_page_title_template || 'Lowongan Kerja {{kategori}} - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.category_page_description_template || 'Temukan lowongan kerja {{kategori}} terbaru dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda di bidang {{kategori}}.', templateVars);

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
                  <a href="/" className="hover:text-white transition-colors">Beranda</a>
                  <span className="mx-2">/</span>
                  <a href="/lowongan-kerja/" className="hover:text-white transition-colors">Lowongan Kerja</a>
                  <span className="mx-2">/</span>
                  <span className="text-white font-medium">Kategori: {category}</span>
                </li>
              </ol>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Lowongan Kerja {category}
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                {pageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Job Search Content */}
        <Suspense fallback={<JobSearchPageFallback />}>
          <JobSearchPage
            settings={settings}
            initialCategory={category}
            initialLocation={location}
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
