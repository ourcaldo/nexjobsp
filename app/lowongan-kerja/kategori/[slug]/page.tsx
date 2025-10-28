import type { Metadata } from 'next';
import { SupabaseAdminService } from '@/lib/supabase/admin';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { getCurrentDomain } from '@/lib/env';
import { wpCategoryMappings } from '@/utils/urlUtils';
import { renderTemplate } from '@/utils/templateUtils';

interface JobCategoryPageProps {
  params: {
    slug: string;
  };
}

async function getCategoryData(slug: string) {
  const category = wpCategoryMappings[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  const location = '';
  const settings = await SupabaseAdminService.getSettingsServerSide();
  const currentUrl = getCurrentDomain();

  return {
    slug,
    category,
    location,
    settings,
    currentUrl
  };
}

export async function generateMetadata({ params }: JobCategoryPageProps): Promise<Metadata> {
  const { slug, category, location, settings, currentUrl } = await getCategoryData(params.slug);

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
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

export default async function JobCategoryPage({ params }: JobCategoryPageProps) {
  const { slug, category, location, settings, currentUrl } = await getCategoryData(params.slug);

  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: `Kategori: ${category}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
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
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <nav className="mb-8">
              <ol className="flex items-center justify-center space-x-2 text-sm text-primary-100">
                <li className="flex items-center">
                  <span className="text-white">Home</span>
                  <span className="mx-2">/</span>
                  <span className="text-white">Lowongan Kerja</span>
                  <span className="mx-2">/</span>
                  <span className="text-white">Kategori: {category}</span>
                </li>
              </ol>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {pageTitle.replace(` - ${templateVars.site_title}`, '') || `Lowongan Kerja ${category}`}
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                {pageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Job Search Content */}
        <JobSearchPage 
          settings={settings} 
          initialCategory={category}
          initialLocation={location}
        />
      </main>
      <Footer />
    </>
  );
}
