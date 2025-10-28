import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsService } from '@/lib/cms/service';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { formatDistance } from 'date-fns';
import { Calendar, User, Tag, Folder, ArrowRight } from 'lucide-react';
import ArticleContentWrapper from './ArticleContentWrapper';
import ArticleSidebar from '@/components/ArticleSidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import Image from 'next/image';

export const fetchCache = 'force-no-store';

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2">
              <article className="bg-white">
                {/* Full Width Image */}
                {article.featured_image && (
                  <div className="w-full mb-8 relative" style={{ aspectRatio: '16/9' }}>
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div className="px-8 pb-12">
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
                    <div className="bg-blue-50 border-l-4 border-primary-500 p-4 mb-6">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {article.meta_description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
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

                  {/* Table of Contents and Content */}
                  <ArticleContentWrapper content={article.content} />
                </div>
              </article>

              {/* Related Articles - Simple Grid, No Cards */}
              {relatedArticles.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 px-8">Artikel Terkait</h2>
                  <div className="space-y-6">
                    {relatedArticles.map((relatedArticle: any) => (
                      <a
                        key={relatedArticle.id}
                        href={`/artikel/${relatedArticle.categories?.[0]?.slug || 'uncategorized'}/${relatedArticle.slug}`}
                        className="group flex gap-4 hover:bg-gray-50 p-4 -mx-4 rounded-lg transition-colors"
                      >
                        {relatedArticle.featuredImage && (
                          <div className="flex-shrink-0 w-32 h-24 relative overflow-hidden rounded">
                            <Image
                              src={relatedArticle.featuredImage}
                              alt={relatedArticle.title}
                              className="object-cover"
                              fill
                              sizes="128px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(relatedArticle.publishDate || relatedArticle.publish_date)}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {relatedArticle.title}
                          </h3>
                          {relatedArticle.excerpt && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {relatedArticle.excerpt}
                            </p>
                          )}
                        </div>
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
