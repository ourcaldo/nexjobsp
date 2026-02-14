import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { jobService } from '@/lib/services/JobService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import { generateBreadcrumbSchema } from '@/lib/utils/schemaUtils';
import { getCurrentDomain } from '@/lib/config';
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
    regency: string;
  }>;
}

async function getLocationData(provinceSlug: string, regencySlug: string) {
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
  let provinceName = '';
  let regencyId = '';
  let regencyName = '';
  let isValid = false;

  let filterData = null;
  try {
    filterData = await jobService.getFiltersData();
    if (filterData && filterData.provinces && filterData.regencies) {
      const provinceSlugNormalized = normalizeSlug(provinceSlug);
      const province = filterData.provinces.find((p: any) => {
        const pName = normalizeSlug(p.name);
        const pNameDashed = normalizeSlugForMatching(p.name);
        return pName === provinceSlugNormalized || pNameDashed === provinceSlug;
      });

      if (province) {
        provinceId = province.id;
        provinceName = province.name;

        const regencySlugNormalized = normalizeSlug(regencySlug);
        const regency = filterData.regencies.find((r: any) => {
          if (r.province_id !== provinceId) return false;

          const regencyNameLower = normalizeSlug(r.name);
          const regencyNameNoPrefix = regencyNameLower
            .replace(/^kab\s+/i, '')
            .replace(/^kabupaten\s+/i, '')
            .replace(/^kota\s+/i, '');

          const regencyNameDashed = normalizeSlugForMatching(r.name);
          const regencyNameNoPrefixDashed = normalizeSlugForMatching(regencyNameNoPrefix);

          return (
            regencyNameLower === regencySlugNormalized ||
            regencyNameDashed === regencySlug ||
            regencyNameNoPrefix === regencySlugNormalized ||
            regencyNameNoPrefixDashed === regencySlug
          );
        });

        if (regency) {
          regencyId = regency.id;
          regencyName = regency.name;
          isValid = true;
        }
      }
    }

    // Server-side fetch: initial jobs for this city/regency
    const jobsResponse = await jobService.getJobs({ location: regencyId || regencySlug }, 1, 24);

    return {
      provinceSlug,
      regencySlug,
      provinceId,
      provinceName,
      regencyId,
      regencyName,
      isValid,
      settings,
      currentUrl,
      initialJobs: jobsResponse.jobs,
      initialTotalJobs: jobsResponse.totalJobs,
      initialHasMore: jobsResponse.hasMore,
      initialCurrentPage: jobsResponse.currentPage,
      initialFilterData: filterData,
    };
  } catch (error) {
    // Error logged server-side, will redirect to main page
    return {
      provinceSlug,
      regencySlug,
      provinceId,
      provinceName,
      regencyId,
      regencyName,
      isValid,
      settings,
      currentUrl,
      initialJobs: null,
      initialTotalJobs: 0,
      initialHasMore: false,
      initialCurrentPage: 1,
      initialFilterData: filterData,
    };
  }
}

export async function generateMetadata({ params }: JobLocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { provinceName, regencyName, isValid, settings, currentUrl, provinceSlug, regencySlug } = await getLocationData(resolvedParams.province, resolvedParams.regency);

  if (!isValid) {
    return {
      title: 'Lowongan Kerja',
      description: 'Temukan lowongan kerja terbaru'
    };
  }

  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    lokasi: `${regencyName}, ${provinceName}`,
    kategori: ''
  };

  const pageTitle = renderTemplate(settings?.location_page_title_template || 'Lowongan Kerja di {{lokasi}} - {{site_title}}', templateVars);
  const pageDescription = renderTemplate(settings?.location_page_description_template || 'Temukan lowongan kerja terbaru di {{lokasi}} dari berbagai perusahaan terpercaya. Dapatkan pekerjaan impian Anda di {{lokasi}}.', templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: `lowongan kerja ${regencyName}, lowongan kerja ${provinceName}, jobs ${regencyName}, karir ${regencyName}, pekerjaan ${regencyName}`,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/lowongan-kerja/lokasi/${provinceSlug}/${regencySlug}/`,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [settings.jobs_og_image || `${currentUrl}/og-jobs.jpg`],
    },
    alternates: {
      canonical: `${currentUrl}/lowongan-kerja/lokasi/${provinceSlug}/${regencySlug}/`,
    },
  };
}

export const revalidate = 300;
export const dynamicParams = true;

export default async function JobLocationPage({ params }: JobLocationPageProps) {
  const resolvedParams = await params;
  const { provinceId, provinceName, regencyId, regencyName, isValid, settings, currentUrl, initialJobs, initialTotalJobs, initialHasMore, initialCurrentPage, initialFilterData } = await getLocationData(resolvedParams.province, resolvedParams.regency);

  if (!isValid) {
    redirect('/lowongan-kerja/');
  }

  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: `Lokasi: ${provinceName}`, href: `/lowongan-kerja/lokasi/${resolvedParams.province}/` },
    { label: regencyName }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    lokasi: `${regencyName}, ${provinceName}`,
    kategori: ''
  };

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
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <nav className="mb-8">
              <ol className="flex items-center justify-center space-x-2 text-sm text-primary-100">
                <li className="flex items-center">
                  <span className="text-white">Home</span>
                  <span className="mx-2">/</span>
                  <span className="text-white">Lowongan Kerja</span>
                  <span className="mx-2">/</span>
                  <span className="text-white">Lokasi: {provinceName}</span>
                  <span className="mx-2">/</span>
                  <span className="text-white">{regencyName}</span>
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

        <Suspense fallback={<JobSearchPageFallback />}>
          <JobSearchPage
            settings={settings}
            initialProvinceId={provinceId}
            initialLocationName={provinceName}
            initialCityId={regencyId}
            initialCityName={regencyName}
            locationType="city"
            provinceSlug={resolvedParams.province}
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
