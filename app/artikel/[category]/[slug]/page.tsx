import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cmsArticleService } from '@/lib/cms/articles';
import { NxdbArticle } from '@/lib/supabase';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import CMSContent from '@/components/CMSContent';
import { formatDistance } from 'date-fns';
import { Calendar, User, Tag, Folder, Eye } from 'lucide-react';

interface ArticleDetailPageProps {
  params: {
    category: string;
    slug: string;
  };
}

async function getArticleData(categorySlug: string, slug: string) {
  try {
    const article = await cmsArticleService.getArticleBySlug(slug);

    if (!article) {
      return null;
    }

    const hasCategory = article.categories?.some(cat => cat.slug === categorySlug);
    if (!hasCategory) {
      return null;
    }

    return {
      article,
      categorySlug
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const { articles } = await cmsArticleService.getPublishedArticles(100, 0);
    return articles.map(article => ({
      category: article.categories?.[0]?.slug || 'uncategorized',
      slug: article.slug
    }));
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const data = await getArticleData(params.category, params.slug);
  
  if (!data) {
    return {
      title: 'Article Not Found',
    };
  }

  const { article, categorySlug } = data;
  const currentUrl = getCurrentDomain();

  return {
    title: `${article.seo_title || article.title} - Nexjob`,
    description: article.meta_description || article.excerpt,
    keywords: article.tags?.map(tag => tag.name).join(', '),
    openGraph: {
      title: article.seo_title || article.title,
      description: article.meta_description || article.excerpt,
      type: 'article',
      url: `${currentUrl}/artikel/${categorySlug}/${article.slug}`,
      images: article.featured_image ? [article.featured_image] : [],
      publishedTime: article.published_at || article.post_date,
      modifiedTime: article.updated_at,
      authors: [article.author?.full_name || article.author?.email || 'Nexjob'],
      section: article.categories?.[0]?.name || 'Article',
      tags: article.tags?.map(tag => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo_title || article.title,
      description: article.meta_description || article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
    },
    alternates: {
      canonical: `${currentUrl}/artikel/${categorySlug}/${article.slug}`,
    },
  };
}

export const revalidate = 3600; // ISR: Revalidate every 1 hour

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const data = await getArticleData(params.category, params.slug);

  if (!data) {
    notFound();
  }

  const { article, categorySlug } = data;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Artikel', href: '/artikel' },
    { name: article.categories?.[0]?.name || 'Uncategorized', href: `/artikel/${categorySlug}` },
    { name: article.title, href: `/artikel/${categorySlug}/${article.slug}` }
  ];

  const articleSchema = generateArticleSchema(article);

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems.map(item => ({ 
    label: item.name, 
    href: item.href 
  })));

  return (
    <>
      <SchemaMarkup schema={[articleSchema, breadcrumbSchema]} />
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-gray-900">{item.name}</span>
                  ) : (
                    <a href={item.href} className="hover:text-gray-900">
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              {article.categories?.map(category => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  <Folder className="h-4 w-4 mr-1" />
                  {category.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-gray-600 mb-6">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>By {article.author?.full_name || article.author?.email || 'Nexjob'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDistance(new Date(article.published_at || article.post_date), new Date(), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>Updated {formatDistance(new Date(article.updated_at), new Date(), { addSuffix: true })}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-8">
              <Image
                src={article.featured_image}
                alt={article.title}
                width={800}
                height={384}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <CMSContent content={article.content} />
            </div>
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
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
