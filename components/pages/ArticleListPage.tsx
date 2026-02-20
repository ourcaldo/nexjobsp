import Link from 'next/link';
import ArticleFilteredContent from './articles/ArticleFilteredContent';

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
  published_at?: string | null;
  post_date?: string | null;
  created_at?: string;
  updated_at?: string | null;
  author_id?: string;
  author?: { id?: string; full_name?: string; email?: string } | null;
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
  initialTag?: string;
}

/**
 * Server component shell for the Article Listing page.
 * The hero section (breadcrumb, title, description) renders on the server with zero JS.
 * All interactive content (category filter, article grid, pagination, tag filter, sidebar)
 * is delegated to the ArticleFilteredContent client island.
 */
export default function ArticleListPage({
  initialArticles,
  categories,
  featuredArticle,
  latestArticles,
  tags,
  seoTitle,
  seoDescription,
  initialTag = ''
}: ArticleListPageProps) {
  const breadcrumbItems = [
    { name: 'Beranda', href: '/' },
    { name: 'Artikel', href: '/artikel' }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section — fully static, server-rendered */}
      <div className="bg-primary-700 text-white">
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

      {/* Interactive content — client island */}
      <ArticleFilteredContent
        initialArticles={initialArticles}
        categories={categories}
        latestArticles={latestArticles}
        tags={tags}
        initialTag={initialTag}
      />
    </main>
  );
}
