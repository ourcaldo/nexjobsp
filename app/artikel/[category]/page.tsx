import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsService } from '@/lib/cms/service';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { generateArticleListingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { formatDistance } from 'date-fns';
import { Calendar, User, Folder, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ArticleCategoryPageProps {
  params: {
    category: string;
  };
}

async function getCategoryData(categorySlug: string) {
  try {
    const categoriesResponse = await cmsService.getCategories();
    if (!categoriesResponse.success) {
      return null;
    }

    const allCategories = categoriesResponse.data.categories;
    const category = allCategories.find((cat: any) => cat.slug === categorySlug);

    if (!category) {
      return null;
    }

    const articlesResponse = await cmsService.getArticles(1, 100, category.id);
    
    if (!articlesResponse.success) {
      return null;
    }

    const articles = articlesResponse.data.posts.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      featured_image: article.featured_image || article.featuredImage,
      published_at: article.publish_date || article.publishDate,
      post_date: article.publish_date || article.publishDate,
      updated_at: article.updated_at || article.updatedAt,
      seo_title: article.seo?.title || article.seo_title,
      meta_description: article.seo?.metaDescription || article.meta_description,
      categories: article.categories || [],
      tags: article.tags || [],
      author: article.author ? {
        id: article.author.id,
        full_name: article.author.full_name || article.author.name,
        email: article.author.email
      } : null
    }));

    return {
      articles,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      allCategories: allCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      })),
      total: articlesResponse.data.pagination.total
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const categoriesResponse = await cmsService.getCategories();
    if (!categoriesResponse.success) {
      return [];
    }

    return categoriesResponse.data.categories.map((category: any) => ({
      category: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ArticleCategoryPageProps): Promise<Metadata> {
  const data = await getCategoryData(params.category);
  
  if (!data) {
    return {
      title: 'Category Not Found',
    };
  }

  const { category } = data;
  const currentUrl = getCurrentDomain();

  return {
    title: `${category.name} - Artikel - Nexjob`,
    description: category.description || `Baca artikel terbaru tentang ${category.name} dan tips karir terkait.`,
    keywords: `${category.name}, artikel kerja, tips karir, berita kerja, panduan kerja`,
    openGraph: {
      title: `${category.name} - Artikel - Nexjob`,
      description: category.description || `Baca artikel terbaru tentang ${category.name} dan tips karir terkait.`,
      type: 'website',
      url: `${currentUrl}/artikel/${category.slug}`,
      images: [`${currentUrl}/logo.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Artikel - Nexjob`,
      description: category.description || `Baca artikel terbaru tentang ${category.name} dan tips karir terkait.`,
      images: [`${currentUrl}/logo.png`],
    },
    alternates: {
      canonical: `${currentUrl}/artikel/${category.slug}`,
    },
  };
}

export const revalidate = 3600;

export default async function ArticleCategoryPage({ params }: ArticleCategoryPageProps) {
  const data = await getCategoryData(params.category);

  if (!data) {
    notFound();
  }

  const { articles, category, allCategories, total } = data;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Artikel', href: '/artikel' },
    { name: category.name, href: `/artikel/${category.slug}` }
  ];

  const articleListingSchema = generateArticleListingSchema(
    articles.map(article => ({
      title: { rendered: article.title },
      seo_description: article.excerpt,
      excerpt: { rendered: article.excerpt || '' },
      author_info: { display_name: article.author?.full_name || article.author?.email || 'Nexjob' },
      date: article.published_at || article.post_date,
      slug: article.slug
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems.map(item => ({ 
    label: item.name, 
    href: item.href 
  })));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleListingSchema)
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumbItems.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {index === breadcrumbItems.length - 1 ? (
                      <span className="text-gray-900">{item.name}</span>
                    ) : (
                      <Link href={item.href} className="hover:text-gray-900">
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 mb-6">
                {category.description}
              </p>
            )}

            <div className="flex items-center text-sm text-gray-500">
              <span>{total} artikel dalam kategori ini</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Kategori Lainnya</h2>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/artikel"
                      className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span>Semua Artikel</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </li>
                  {allCategories.filter(cat => cat.id !== category.id).map(cat => (
                    <li key={cat.id}>
                      <Link
                        href={`/artikel/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada artikel di kategori ini
                  </h3>
                  <p className="text-gray-500">
                    Artikel akan segera hadir. Kembali lagi nanti untuk membaca konten menarik.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {articles.map(article => (
                    <article
                      key={article.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        {article.featured_image && (
                          <div className="flex-shrink-0">
                            <Image
                              src={article.featured_image}
                              alt={article.title}
                              width={128}
                              height={96}
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {article.categories?.map((cat: any) => (
                              <span
                                key={cat.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                <Folder className="h-3 w-3 mr-1" />
                                {cat.name}
                              </span>
                            ))}
                          </div>

                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            <Link
                              href={`/artikel/${category.slug}/${article.slug}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {article.title}
                            </Link>
                          </h2>

                          {article.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span>{article.author?.full_name || article.author?.email || 'Nexjob'}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {formatDistance(new Date(article.published_at || article.post_date), new Date(), { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/artikel/${category.slug}/${article.slug}`}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                              Baca Selengkapnya
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
