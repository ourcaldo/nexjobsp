'use client';

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { Calendar, User, Tag, Folder, ArrowRight, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AdDisplay from '@/components/Advertisement/AdDisplay';
import { getBlurDataURL } from '@/lib/utils/image';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  featured_image?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  publish_date?: string;
  published_at?: string;
  post_date?: string;
  created_at?: string;
  updated_at?: string;
  author?: { id?: string; full_name?: string; email?: string };
  categories?: any[];
  tags?: any[];
}

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ArticleListPageProps {
  initialArticles: Article[];
  categories: ArticleCategory[];
  featuredArticle: Article | null;
  latestArticles: Article[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

const categoryColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-red-100 text-red-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
  'bg-cyan-100 text-cyan-800',
];

export default function ArticleListPage({
  initialArticles,
  categories,
  featuredArticle,
  latestArticles,
  tags,
  seoTitle,
  seoDescription
}: ArticleListPageProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const articlesPerPage = 10;

  const fetchArticles = async (page: number, categorySlug?: string) => {
    setLoading(true);
    
    try {
      const catSlug = categorySlug || selectedCategory;
      const category = categories.find(cat => cat.slug === catSlug);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: articlesPerPage.toString(),
      });
      
      if (catSlug !== 'all' && category?.id) {
        params.set('category', category.id);
      }

      const response = await fetch(`/api/articles?${params.toString()}`);
      const articlesResponse = await response.json();

      if (articlesResponse.success) {
        const formattedArticles = articlesResponse.data.posts.map((article: any) => ({
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
        
        setArticles(formattedArticles);
        setTotalPages(articlesResponse.data.pagination.totalPages);
        setHasNextPage(articlesResponse.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Error filtering articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    await fetchArticles(1, categorySlug);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchArticles(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Artikel', href: '/artikel' }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="mb-8 flex justify-center">
            <ol className="flex items-center space-x-2 text-sm text-primary-100">
              {breadcrumbItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-white">{item.name}</span>
                  ) : (
                    <Link href={item.href} className="hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {seoTitle.replace(/ - .*$/, '') || 'Artikel & Tips Karir'}
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              {seoDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              Semua Artikel
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.slug
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Folder className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Belum ada artikel tersedia
                </h3>
                <p className="text-gray-600 text-lg">
                  Artikel akan segera hadir. Kembali lagi nanti untuk membaca konten menarik.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {articles.map((article, index) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    <Link href={`/artikel/${article.categories && article.categories.length > 0 && article.categories[0] && article.categories[0].slug ? article.categories[0].slug : 'uncategorized'}/${article.slug}`}>
                      <div className="aspect-video relative overflow-hidden">
                        {article.featured_image ? (
                          <Image
                            src={article.featured_image}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL={getBlurDataURL()}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                            <Folder className="h-16 w-16 text-white/50" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        {article.categories && article.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.categories.slice(0, 2).map((category, catIndex) => (
                              <span
                                key={category.id}
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(catIndex)}`}
                              >
                                <Folder className="h-3 w-3 mr-1" />
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1" />
                            <span className="truncate max-w-[100px]">
                              {article.author?.full_name || article.author?.email || 'Nexjob'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {formatDistance(new Date(article.published_at || article.post_date || article.created_at || new Date()), new Date(), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8 sticky top-8">
              {/* Latest Articles */}
              {latestArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2 text-primary-600" />
                    Artikel Terbaru
                  </h3>
                  <div className="space-y-4">
                    {latestArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/artikel/${article.categories && article.categories.length > 0 && article.categories[0] && article.categories[0].slug ? article.categories[0].slug : 'uncategorized'}/${article.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          {article.featured_image && (
                            <div className="flex-shrink-0">
                              <Image
                                src={article.featured_image}
                                alt={article.title}
                                width={80}
                                height={60}
                                className="w-20 h-15 object-cover rounded-lg"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL()}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDistance(new Date(article.published_at || article.post_date || article.created_at || new Date()), new Date(), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              {tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-primary-600" />
                    Tag Populer
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertisement */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <AdDisplay position="sidebar_archive_ad_code" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
