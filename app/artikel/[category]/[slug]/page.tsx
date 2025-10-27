import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsService } from '@/lib/cms/service';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { formatDistance } from 'date-fns';
import { Calendar, User, Tag, Folder, ArrowRight } from 'lucide-react';
import ArticleContentWrapper from './ArticleContentWrapper';
import ArticleSidebar from '@/components/ArticleSidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Image from 'next/image';

interface ArticleDetailPageProps {
  params: {
    category: string;
    slug: string;
  };
}

async function getArticleData(categorySlug: string, slug: string) {
  try {
    const articleResponse = await cmsService.getArticleBySlug(slug);

    if (!articleResponse.success || !articleResponse.data) {
      return null;
    }

    const rawArticle = articleResponse.data;

    const article = {
      id: rawArticle.id,
      title: rawArticle.title,
      slug: rawArticle.slug,
      excerpt: rawArticle.excerpt,
      content: rawArticle.content,
      featured_image: rawArticle.featured_image || rawArticle.featuredImage,
      published_at: rawArticle.publish_date || rawArticle.publishDate,
      post_date: rawArticle.publish_date || rawArticle.publishDate,
      updated_at: rawArticle.updated_at || rawArticle.updatedAt,
      seo_title: rawArticle.seo?.title || rawArticle.seo_title,
      meta_description: rawArticle.seo?.metaDescription || rawArticle.meta_description,
      categories: rawArticle.categories || [],
      tags: rawArticle.tags || [],
      author: rawArticle.author ? {
        id: rawArticle.author.id,
        full_name: rawArticle.author.full_name || rawArticle.author.name,
        email: rawArticle.author.email
      } : null
    };

    const hasCategory = article.categories?.some((cat: any) => cat.slug === categorySlug);
    const isUncategorized = categorySlug === 'uncategorized' && (!article.categories || article.categories.length === 0);
    
    if (!hasCategory && !isUncategorized) {
      return null;
    }

    const relatedArticlesResponse = await cmsService.getRelatedArticles(slug, 5);
    const relatedArticles = relatedArticlesResponse || [];

    return {
      article,
      categorySlug,
      relatedArticles
    };
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const articlesResponse = await cmsService.getArticles(1, 100);
    
    if (!articlesResponse.success) {
      return [];
    }

    return articlesResponse.data.posts.map((article: any) => ({
      category: article.categories?.[0]?.slug || 'uncategorized',
      slug: article.slug
    }));
  } catch (error) {
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
    keywords: article.tags?.map((tag: any) => tag.name).join(', '),
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
      tags: article.tags?.map((tag: any) => tag.name),
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

export const revalidate = 3600;

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const data = await getArticleData(params.category, params.slug);

  if (!data) {
    notFound();
  }

  const { article, categorySlug, relatedArticles } = data;

  const breadcrumbItems = [
    { label: 'Tips Karir', href: '/artikel' },
    { label: article.title }
  ];

  const articleSchema = generateArticleSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <SchemaMarkup schema={[articleSchema, breadcrumbSchema]} />
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Full Width Image - NO CROPPING */}
                {article.featured_image && (
                  <div className="w-full">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-auto"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                )}

                <div className="p-6 md:p-10 lg:p-12">
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDistance(new Date(article.published_at || article.post_date), new Date(), { addSuffix: true })}
                    </div>

                    {article.author && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {article.author.full_name || article.author.email}
                      </div>
                    )}

                    {article.categories && article.categories.length > 0 && (
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-2" />
                        {article.categories.map((cat: any, index: number) => (
                          <span key={cat.id}>
                            {cat.name}
                            {index < article.categories.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {article.title}
                  </h1>

                  {article.meta_description && (
                    <div className="bg-gray-50 border-l-4 border-primary-500 p-4 mb-6">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {article.meta_description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {article.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Table of Contents and Content - Client Component */}
                  <ArticleContentWrapper content={article.content} />
                </div>
              </article>

              {/* Related Articles - BELOW Main Content */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedArticles.map((relatedArticle: any, index: number) => (
                      <a
                        key={relatedArticle.id}
                        href={`/artikel/${relatedArticle.categories?.[0]?.slug || 'uncategorized'}/${relatedArticle.slug}`}
                        className="group cursor-pointer"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <article className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 h-full">
                          {relatedArticle.featuredImage && (
                            <div className="aspect-video overflow-hidden relative">
                              <Image
                                src={relatedArticle.featuredImage}
                                alt={relatedArticle.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(relatedArticle.publishDate || relatedArticle.publish_date)}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                              {relatedArticle.title}
                            </h3>
                            {relatedArticle.excerpt && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {relatedArticle.excerpt}
                              </p>
                            )}
                            <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700">
                              Baca Selengkapnya
                              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                          </div>
                        </article>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <ArticleSidebar 
                relatedArticles={[]}
                isArchive={false}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
