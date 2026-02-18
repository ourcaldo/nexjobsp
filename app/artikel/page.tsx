import type { Metadata } from 'next';
import { cache } from 'react';
import { articleService } from '@/lib/services/ArticleService';
import { categoryService } from '@/lib/services/CategoryService';
import { getCurrentDomain } from '@/lib/config';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { generateArticleListingSchema, generateBreadcrumbSchema } from '@/lib/utils/schemaUtils';
import { renderTemplate } from '@/lib/utils/templateUtils';
import ArticleListPage from '@/components/pages/ArticleListPage';
import { logger } from '@/lib/logger';
import { transformArticle } from '@/lib/utils/article-transform';

const getArticleData = cache(async function getArticleData() {
  try {
    const [articlesResponse, categoriesResponse] = await Promise.all([
      articleService.getArticles(1, 20),
      categoryService.getCategories()
    ]);

    // Default SEO settings since we don't have an admin system
    const seoSettings = {
      site_title: 'Nexjob',
      site_description: 'Platform pencarian kerja terpercaya di Indonesia',
      articles_title: 'Artikel - Tips Karir dan Berita Kerja Terbaru - {{site_title}}',
      articles_description: 'Baca artikel terbaru seputar tips karir, berita kerja, dan panduan mencari pekerjaan di Indonesia. Dapatkan insight berharga untuk mengembangkan karir Anda.'
    };

    const articles = articlesResponse.success ? articlesResponse.data.posts : [];
    const categories = categoriesResponse.success ? categoriesResponse.data.categories : [];

    const featuredArticle = articles.length > 0 ? articles[0] : null;

    const latestArticles = articles
      .filter((article: any) => article.id !== featuredArticle?.id)
      .slice(0, 3);

    const tagsSet = new Set<string>();
    articles.forEach((article: any) => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: any) => {
          if (tag && tag.name) {
            tagsSet.add(tag.name);
          }
        });
      }
    });
    const tags = Array.from(tagsSet).slice(0, 12);

    const formattedArticles = articles.map(transformArticle);

    return {
      articles: formattedArticles,
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      })).slice(0, 9), // Limit to top 9 categories
      featuredArticle: formattedArticles[0] || null,
      latestArticles: formattedArticles.slice(1, 4),
      tags,
      seoSettings
    };
  } catch (error) {
    logger.error('Error fetching articles:', {}, error);
    return {
      articles: [],
      categories: [],
      featuredArticle: null,
      latestArticles: [],
      tags: [],
      seoSettings: null
    };
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const { seoSettings } = await getArticleData();
  const currentUrl = getCurrentDomain();

  const templateVars = {
    site_title: seoSettings?.site_title || 'Nexjob',
    lokasi: '',
    kategori: ''
  };

  const rawSeoTitle = seoSettings?.articles_title || 'Artikel - Tips Karir dan Berita Kerja Terbaru - {{site_title}}';
  const rawSeoDescription = seoSettings?.articles_description || 'Baca artikel terbaru seputar tips karir, berita kerja, dan panduan mencari pekerjaan di Indonesia. Dapatkan insight berharga untuk mengembangkan karir Anda.';

  const seoTitle = renderTemplate(rawSeoTitle, templateVars);
  const seoDescription = renderTemplate(rawSeoDescription, templateVars);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: 'artikel kerja, tips karir, berita kerja, panduan kerja, lowongan kerja, karir indonesia',
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      url: `${currentUrl}/artikel`,
      images: [`${currentUrl}/logo.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [`${currentUrl}/logo.png`],
    },
    alternates: {
      canonical: `${currentUrl}/artikel`,
    },
  };
}

// Revalidation strategy: Article listings don't change frequently, 1-hour refresh is sufficient
export const revalidate = 3600;

interface ArtikelPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function ArtikelPage({ searchParams }: ArtikelPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialTag = resolvedSearchParams.tag || '';
  const { articles, categories, featuredArticle, latestArticles, tags, seoSettings } = await getArticleData();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Artikel', href: '/artikel' }
  ];

  const articleListingSchema = generateArticleListingSchema(
    articles.map((article: any) => ({
      title: article.title,
      slug: article.slug,
      meta_description: article.excerpt,
      excerpt: article.excerpt || '',
      author: { full_name: article.author?.full_name || article.author?.email || 'Nexjob' },
      published_at: article.published_at || article.post_date,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems.map(item => ({ 
    label: item.name, 
    href: item.href 
  })));

  const templateVars = {
    site_title: seoSettings?.site_title || 'Nexjob',
    lokasi: '',
    kategori: ''
  };

  const rawSeoTitle = seoSettings?.articles_title || 'Artikel - Tips Karir dan Berita Kerja Terbaru - {{site_title}}';
  const rawSeoDescription = seoSettings?.articles_description || 'Baca artikel terbaru seputar tips karir, berita kerja, dan panduan mencari pekerjaan di Indonesia. Dapatkan insight berharga untuk mengembangkan karir Anda.';

  const seoTitle = renderTemplate(rawSeoTitle, templateVars);
  const seoDescription = renderTemplate(rawSeoDescription, templateVars);

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
      <main>
        <ArticleListPage
          initialArticles={articles}
          categories={categories}
          featuredArticle={featuredArticle}
          latestArticles={latestArticles}
          tags={tags}
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          initialTag={initialTag}
        />
      </main>
      <Footer />
    </>
  );
}
