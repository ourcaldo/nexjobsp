import type { Metadata } from 'next';
import { CMSService, FilterData } from '@/services/cmsService';
import { SupabaseAdminService } from '@/services/supabaseAdminService';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HomePage from '@/components/pages/HomePage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/utils/schemaUtils';
import { renderTemplate } from '@/utils/templateUtils';

async function getHomeData() {
  try {
    const settings = await SupabaseAdminService.getSettingsServerSide();

    // Create isolated cmsService instance for this request
    const currentCmsService = new CMSService();
    currentCmsService.setBaseUrl(settings.api_url);
    currentCmsService.setFiltersApiUrl(settings.filters_api_url);
    currentCmsService.setAuthToken(settings.auth_token || '');

    // Fetch data
    const [articles, filterData] = await Promise.all([
      currentCmsService.getArticles(3),
      currentCmsService.getFiltersData()
    ]);

    return {
      articles,
      filterData,
      settings
    };
  } catch (error) {
    console.error('Error fetching home data:', error);

    return {
      articles: [],
      filterData: null,
      settings: await SupabaseAdminService.getSettingsServerSide()
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getHomeData();
  const currentUrl = getCurrentDomain();
  
  // Prepare template variables
  const templateVars = {
    site_title: settings?.site_title || 'Nexjob',
    site_tagline: settings?.site_tagline || 'Find Your Dream Job',
    lokasi: '',
    kategori: ''
  };

  // Get SEO settings with template rendering
  const rawSeoTitle = settings?.site_title ? `${settings.site_title} - ${settings.site_tagline || 'Find Your Dream Job'}` : 'Nexjob - Find Your Dream Job';
  const rawSeoDescription = settings?.site_description || 'Platform pencarian kerja terpercaya di Indonesia. Temukan lowongan kerja terbaru dari berbagai perusahaan terkemuka.';

  const pageTitle = renderTemplate(rawSeoTitle, templateVars);
  const pageDescription = renderTemplate(rawSeoDescription, templateVars);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${currentUrl}/`,
      images: [settings.home_og_image || `${currentUrl}/og-home.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [settings.home_og_image || `${currentUrl}/og-home.jpg`],
    },
    alternates: {
      canonical: `${currentUrl}/`,
    },
  };
}

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export default async function Home() {
  const { articles, filterData, settings } = await getHomeData();

  return (
    <>
      <SchemaMarkup schema={generateWebsiteSchema(settings)} />
      <SchemaMarkup schema={generateOrganizationSchema()} />

      <Header />
      <main>
        <HomePage 
          initialArticles={articles} 
          initialFilterData={filterData}
          settings={settings}
        />
      </main>
      <Footer />
    </>
  );
}
