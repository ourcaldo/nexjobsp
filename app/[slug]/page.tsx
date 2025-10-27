import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cmsService } from '@/lib/cms/service';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generatePageSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { getCurrentDomain } from '@/lib/env';
import CMSContent from '@/components/CMSContent';

interface PageProps {
  params: {
    slug: string;
  };
}

interface CMSPage {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage: string | null;
  publishDate: string;
  status: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  seo: {
    title: string | null;
    metaDescription: string | null;
    focusKeyword: string | null;
    slug: string;
  };
  categories: Array<{ id: string; name: string; slug: string; description?: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  template?: string;
  parentPageId?: string | null;
  menuOrder?: number;
}

export async function generateStaticParams() {
  try {
    const response = await cmsService.getAllPagesForSitemap();
    
    if (!response || response.length === 0) {
      return [];
    }
    
    return response.map((page: CMSPage) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const response = await cmsService.getPageBySlug(params.slug);
  
  if (!response.success || !response.data) {
    return {
      title: 'Page Not Found',
    };
  }

  const page: CMSPage = response.data;
  const currentUrl = getCurrentDomain();
  const pageTitle = page.seo?.title || page.title;
  const pageDescription = page.seo?.metaDescription || page.excerpt;
  const canonicalUrl = `${currentUrl}/${page.slug}/`;
  const ogImage = page.featuredImage || `${currentUrl}/og-page-default.jpg`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: canonicalUrl,
      images: [ogImage],
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
  };
}

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export default async function DynamicPage({ params }: PageProps) {
  const response = await cmsService.getPageBySlug(params.slug);

  if (!response.success || !response.data) {
    notFound();
  }

  const page: CMSPage = response.data;

  const breadcrumbItems = [
    { label: page.title }
  ];

  return (
    <>
      <SchemaMarkup schema={generatePageSchema(page)} />
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Image */}
          {page.featuredImage && (
            <div className="mb-8">
              <Image
                src={page.featuredImage}
                alt={page.title}
                width={800}
                height={256}
                className="w-full h-64 md:h-96 object-cover rounded-xl shadow-sm"
              />
            </div>
          )}

          {/* Page Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>

            {page.excerpt && (
              <div className="text-xl text-gray-600 mb-6">
                {page.excerpt}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <span>Published: {new Date(page.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              {page.categories && page.categories.length > 0 && (
                <div className="flex items-center">
                  <span>Categories: {page.categories.map(cat => cat.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Page Content with Rich Text Styling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <CMSContent
              content={page.content}
              className="rich-text-content max-w-none"
            />
          </div>

          {/* Tags */}
          {page.tags && page.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
