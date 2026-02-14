import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { jobService } from '@/lib/services/JobService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import { generateBreadcrumbSchema } from '@/lib/utils/schemaUtils';
import { getCurrentDomain } from '@/lib/config';
import { wpLocationMappings } from '@/lib/utils/urlUtils';
import { renderTemplate } from '@/lib/utils/templateUtils';
import { normalizeSlug, normalizeSlugForMatching } from '@/lib/utils/textUtils';

function JobSearchPageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface JobLocationPageProps {
  params: Promise<{
    province: string;
  }>;
}

async function getLocationData(provinceSlug: string) {
  // Hardcoded settings - no admin panel
  const settings = {
    site_title: 'Nexjob',
    jobs_title: 'Lowongan Kerja {{lokasi}} {{kategori}} - {{site_title}}',
    jobs_description: 'Temukan lowongan kerja terbaru {{lokasi}} {{kategori}} di Indonesia. Lamar sekarang!',
    location_page_title_template: 'Lowongan Kerja di {{lokasi}} - {{site_title}}',
    location_page_description_template: 'Temukan lowongan kerja terbaru di {{lokasi}} dari berbagai perusahaan terpercaya.',
    jobs_og_image: '/og-jobs.jpg'
  };
  const currentUrl = getCurrentDomain();

  let provinceId = '';
  let provinceName = provinceSlug.charAt(0).toUpperCase() + provinceSlug.slice(1);

  try {
    const filterData = await jobService.getFiltersData();
    if (filterData && filterData.provinces) {
      const slugNormalized = provinceSlug.toLowerCase().replace(/-/g, ' ');
      const province = filterData.provinces.find((p: any) =>
        p.name.toLowerCase() === slugNormalized ||
        p.name.toLowerCase().replace(/\s+/g, '-') === provinceSlug
      );

      if (province) {
        provinceId = province.id;
        provinceName = province.name;
      }
    }

    // Server-side fetch: initial jobs for this location
    const jobsResponse = await jobService.getJobs({ location: provinceId || provinceSlug }, 1, 24);

    return {
      provinceSlug,
      location: provinceId,
      locationName: provinceId ? provinceName : '',
      category: '',
      locationType: 'province' as const,
      settings,
      currentUrl,
      initialJobs: jobsResponse.jobs,
      initialTotalJobs: jobsResponse.totalJobs,
      initialHasMore: jobsResponse.hasMore,
      initialCurrentPage: jobsResponse.currentPage,
      initialFilterData: filterData,
    };
  } catch (error) {
    // Error logged server-side
    return {
      provinceSlug,
      location: provinceId,
      locationName: provinceId ? provinceName : '',
      category: '',
      locationType: 'province' as const,
      settings,
      currentUrl,
      initialJobs: null,
      initialTotalJobs: 0,
      initialHasMore: false,
      initialCurrentPage: 1,
      initialFilterData: null,
    };
  }
}

export async function generateMetadata({ params }: JobLocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { provinceSlug, locationName, category, settings, currentUrl } = await getLocationData(resolvedParams.province);

  // Will redirect if invalid, but need metadata for valid case
  if (!locationName) {
    return {
      title: 'Lowongan Kerja',
      description: 'Temukan lowongan kerja terbaru'
    };
  }

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    lokasi: locationName,
    kategori: category
  };

  // Get SEO settings with template rendering
  const pageTitle = renderTemplate(settings?.location_page_title_template || 'Lowongan Kerja di {{lokasi}} - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.location_page_description_template || 'Temukan lowongan kerja terbaru di {{lokasi}} dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda di {{lokasi}}.', templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: `lowongan kerja ${locationName}, jobs ${locationName}, karir ${locationName}, pekerjaan ${locationName}`,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/lowongan-kerja/lokasi/${provinceSlug}/`,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    alternates: {
      canonical: `${currentUrl}/lowongan-kerja/lokasi/${provinceSlug}/`,
    },
  };
}

export async function generateStaticParams() {
  // Generate paths for common locations
  const commonLocations = Object.keys(wpLocationMappings);
  return commonLocations.map(province => ({
    province
  }));
}

export const revalidate = 300; // ISR: Revalidate every 5 minutes
export const dynamicParams = true; // Enable dynamic params for locations not in static paths

export default async function JobLocationPage({ params }: JobLocationPageProps) {
  const resolvedParams = await params;
  const { provinceSlug, location, locationName, category, locationType, settings, currentUrl, initialJobs, initialTotalJobs, initialHasMore, initialCurrentPage, initialFilterData } = await getLocationData(resolvedParams.province);

  // Redirect to main job page if province is not found
  if (!locationName) {
    redirect('/lowongan-kerja/');
  }

  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: `Lokasi: ${locationName}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    lokasi: locationName,
    kategori: category
  };

  // Get SEO settings with template rendering
  const pageTitle = renderTemplate(settings?.location_page_title_template || 'Lowongan Kerja di {{lokasi}} - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.location_page_description_template || 'Temukan lowongan kerja terbaru di {{lokasi}} dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda di {{lokasi}}.', templateVars);

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
                  <span className="mx-2">/</span>
                  <span className="text-white">Lokasi: {locationName}</span>
                </li>
              </ol>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {pageTitle.replace(` - ${templateVars.site_title}`, '')}
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
            initialLocation={location}
            initialLocationName={locationName}
            initialCategory={category}
            locationType={locationType as 'province' | 'city'}
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
