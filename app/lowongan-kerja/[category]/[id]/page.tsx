import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { jobService } from '@/lib/services/JobService';
import { getCurrentDomain } from '@/lib/config';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobDetailPage from '@/components/pages/JobDetailPage';
import { generateJobPostingSchema, generateBreadcrumbSchema } from '@/lib/utils/schemaUtils';
import { Job } from '@/types/job';
import { formatLocationName, locationToSlug, getLocationNamesFromIds } from '@/lib/utils/textUtils';
import { logger } from '@/lib/logger';

interface JobPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

// Wrap with React cache() to deduplicate API calls between generateMetadata() and page component
const getJobData = cache(async (category: string, id: string) => {
  try {
    const [job, filterData] = await Promise.all([
      jobService.getJobById(id),
      jobService.getFiltersData()
    ]);

    // Hardcoded settings - no admin panel
    const settings = {
      site_title: 'Nexjob',
      default_job_og_image: '/og-job-default.jpg'
    };

    const currentUrl = getCurrentDomain();

    if (!job) {
      notFound();
    }

    const jobCategorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
    if (jobCategorySlug !== category) {
      notFound();
    }

    // Enrich job with province/regency names from filter data using IDs
    if ((job.job_province_id || job.job_regency_id) && filterData?.provinces && filterData?.regencies) {
      const locationNames = getLocationNamesFromIds(
        job.job_province_id,
        job.job_regency_id,
        filterData.provinces,
        filterData.regencies
      );

      // Populate province name if we have an ID but missing the name
      if (job.job_province_id && !job.lokasi_provinsi && locationNames.provinceName) {
        job.lokasi_provinsi = locationNames.provinceName;
      }

      // Populate regency name if we have an ID but missing the name
      if (job.job_regency_id && !job.lokasi_kota && locationNames.regencyName) {
        job.lokasi_kota = locationNames.regencyName;
      }
    }

    return {
      job,
      category,
      id,
      settings,
      currentUrl
    };
  } catch (error) {
    logger.error('Error fetching job:', {}, error);
    notFound();
  }
});

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { job, category, id, settings, currentUrl } = await getJobData(resolvedParams.category, resolvedParams.id);

    const regencyName = formatLocationName(job.lokasi_kota);
    const provinceName = formatLocationName(job.lokasi_provinsi);

    let locationString = '';
    if (regencyName && provinceName) {
      locationString = `${regencyName}, ${provinceName}`;
    } else if (provinceName) {
      locationString = provinceName;
    } else if (regencyName) {
      locationString = regencyName;
    }

    const pageTitle = job.seo_title || `${job.title} - ${job.company_name} | Nexjob`;

    let defaultDescription = `Lowongan ${job.title} di ${job.company_name}`;
    if (locationString) {
      defaultDescription += `, ${locationString}`;
    }
    defaultDescription += `. Gaji: ${job.gaji}. Lamar sekarang!`;

    const pageDescription = job.seo_description || defaultDescription;

    const canonicalUrl = `${currentUrl}/lowongan-kerja/${category}/${id}/`;
    const ogImage = settings.default_job_og_image || `${currentUrl}/og-job-default.jpg`;

    const keywordParts = [job.title, job.company_name];
    if (regencyName) keywordParts.push(regencyName);
    if (provinceName) keywordParts.push(provinceName);
    if (job.kategori_pekerjaan) keywordParts.push(job.kategori_pekerjaan);
    keywordParts.push('lowongan kerja');
    const keywords = keywordParts.join(', ');

    return {
      title: pageTitle,
      description: pageDescription,
      keywords,
      authors: [{ name: 'Nexjob' }],
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        type: 'article',
        url: canonicalUrl,
        images: [ogImage],
        siteName: 'Nexjob',
        publishedTime: job.created_at,
        modifiedTime: job.created_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [ogImage],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      other: {
        'article:section': job.kategori_pekerjaan,
        'article:tag': job.kategori_pekerjaan,
      },
    };
  } catch (error) {
    return {
      title: 'Job Not Found - Nexjob',
    };
  }
}

export async function generateStaticParams() {
  try {
    // Get some popular jobs for initial static generation
    const response = await jobService.getJobs({}, 1, 50); // Get first 50 jobs
    return response.jobs.map(job => {
      const categorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
      return {
        category: categorySlug,
        id: job.id
      };
    });
  } catch (error) {
    logger.error('Error generating static paths:', {}, error);
    return [];
  }
}

// Revalidation strategy: Job detail pages may need faster updates (status changes, deadlines)
export const revalidate = 1800; // ISR: Revalidate every 30 minutes
export const dynamicParams = true; // Enable dynamic params for jobs not in static paths

export default async function JobPage({ params }: JobPageProps) {
  const resolvedParams = await params;
  const { job, category, id, settings, currentUrl } = await getJobData(resolvedParams.category, resolvedParams.id);

  const categoryName = job.job_categories?.[0]?.name || 'Kategori';
  const provinceName = formatLocationName(job.lokasi_provinsi);
  const regencyName = formatLocationName(job.lokasi_kota);
  const provinceSlug = locationToSlug(job.lokasi_provinsi);
  const regencySlug = locationToSlug(job.lokasi_kota);

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' }
  ];

  if (provinceName && provinceSlug) {
    breadcrumbItems.push({
      label: provinceName,
      href: `/lowongan-kerja/lokasi/${provinceSlug}/`
    });

    if (regencyName && regencySlug) {
      breadcrumbItems.push({
        label: regencyName,
        href: `/lowongan-kerja/lokasi/${provinceSlug}/${regencySlug}/`
      });
    }
  }

  breadcrumbItems.push(
    { label: categoryName, href: `/lowongan-kerja/kategori/${category}/` }
  );

  // Current page (no href for current page in breadcrumbs)
  breadcrumbItems.push({ label: job.title });

  const jobSchema = generateJobPostingSchema(job);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      <Header />
      <main>
        <JobDetailPage job={job} jobId={id} settings={settings} breadcrumbItems={breadcrumbItems} />
      </main>
      <Footer />
    </>
  );
}
