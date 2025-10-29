import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { cmsService } from '@/lib/cms/service';
import { SupabaseAdminService } from '@/lib/supabase/admin';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobDetailPage from '@/components/pages/JobDetailPage';
import { generateJobPostingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { Job } from '@/types/job';

interface JobPageProps {
  params: {
    category: string;
    slug: string;
  };
}

// Wrap with React cache() to deduplicate API calls between generateMetadata() and page component
const getJobData = cache(async (category: string, slug: string) => {
  try {
    const [job, settings] = await Promise.all([
      cmsService.getJobBySlug(slug),
      SupabaseAdminService.getSettingsServerSide()
    ]);

    const currentUrl = getCurrentDomain();

    if (!job) {
      notFound();
    }

    const jobCategorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
    if (jobCategorySlug !== category) {
      notFound();
    }

    return {
      job,
      category,
      slug,
      settings,
      currentUrl
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    notFound();
  }
});

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  try {
    const { job, category, slug, settings, currentUrl } = await getJobData(params.category, params.slug);

    const pageTitle = job.seo_title || `${job.title} - ${job.company_name} | Nexjob`;
    const pageDescription = job.seo_description || `Lowongan ${job.title} di ${job.company_name}, ${job.lokasi_kota}. Gaji: ${job.gaji}. Lamar sekarang!`;
    const canonicalUrl = `${currentUrl}/lowongan-kerja/${category}/${slug}/`;
    const ogImage = settings.default_job_og_image || `${currentUrl}/og-job-default.jpg`;

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: `${job.title}, ${job.company_name}, ${job.lokasi_kota}, ${job.kategori_pekerjaan}, lowongan kerja`,
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
    const response = await cmsService.getJobs({}, 1, 50); // Get first 50 jobs
    return response.jobs.map(job => {
      const categorySlug = job.job_categories?.[0]?.slug || 'uncategorized';
      return {
        category: categorySlug,
        slug: job.slug
      };
    });
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

export const revalidate = 300; // ISR: Revalidate every 5 minutes
export const dynamicParams = true; // Enable dynamic params for jobs not in static paths

export default async function JobPage({ params }: JobPageProps) {
  const { job, category, slug, settings, currentUrl } = await getJobData(params.category, params.slug);

  const categoryName = job.job_categories?.[0]?.name || 'Kategori';
  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: categoryName, href: `/lowongan-kerja/kategori/${category}/` },
    { label: job.title }
  ];

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
        <JobDetailPage job={job} slug={slug} settings={settings} />
      </main>
      <Footer />
    </>
  );
}
