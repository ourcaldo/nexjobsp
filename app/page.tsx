import type { Metadata } from 'next';
import { FilterData } from '@/lib/cms/interface';
import { articleService } from '@/lib/services/ArticleService';
import { jobService } from '@/lib/services/JobService';
import { config } from '@/lib/config';
import { seoTemplates } from '@/lib/seo-templates';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HomePage from '@/components/pages/HomePage';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/utils/schemaUtils';
import { logger } from '@/lib/logger';

async function getHomeData() {
  try {
    // Fetch data
    const [articlesResponse, filterData] = await Promise.all([
      articleService.getArticles(1, 3),
      jobService.getFiltersData()
    ]);

    // Extract articles from CMS response
    const articles = articlesResponse.success ? articlesResponse.data.posts : [];

    return {
      articles,
      filterData
    };
  } catch (error) {
    logger.error('Error fetching home data:', {}, error);

    return {
      articles: [],
      filterData: null
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const pageTitle = `${config.site.name} - ${config.site.description}`;
  const pageDescription = config.site.description;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${config.site.url}/`,
      images: [seoTemplates.ogImages.home],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [seoTemplates.ogImages.home],
    },
    alternates: {
      canonical: `${config.site.url}/`,
    },
  };
}

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export default async function Home() {
  const { articles, filterData } = await getHomeData();

  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />

      <Header />
      <main>
        <HomePage 
          initialArticles={articles} 
          initialFilterData={filterData}
          settings={{
            site_title: 'Nexjob',
            siteDescription: 'Platform pencarian kerja terpercaya di Indonesia'
          }}
        />
      </main>
      <Footer />
    </>
  );
}
