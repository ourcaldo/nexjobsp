import type { Metadata } from 'next';
import { cmsArticleService } from '@/services/cmsArticleService';
import { supabaseAdminService } from '@/services/supabaseAdminService';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateArticleListingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { renderTemplate } from '@/utils/templateUtils';
import ArticleListPage from '@/components/pages/ArticleListPage';

async function getArticleData() {
  try {
    const [articlesData, categories, seoSettings] = await Promise.all([
      cmsArticleService.getPublishedArticles(20, 0),
      cmsArticleService.getCategories(),
      supabaseAdminService.getSettings()
    ]);

    const featuredArticle = articlesData.articles.length > 0 ? articlesData.articles[0] : null;

    const latestArticles = articlesData.articles
      .filter(article => article.id !== featuredArticle?.id)
      .slice(0, 3);

    const tagsSet = new Set<string>();
    articlesData.articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => tagsSet.add(tag.name));
      }
    });
    const tags = Array.from(tagsSet).slice(0, 12);

    return {
      articles: articlesData.articles,
      categories,
      featuredArticle,
      latestArticles,
      tags,
      seoSettings
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      articles: [],
      categories: [],
      featuredArticle: null,
      latestArticles: [],
      tags: [],
      seoSettings: null
    };
  }
}

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

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export default async function ArtikelPage() {
  const { articles, categories, featuredArticle, latestArticles, tags, seoSettings } = await getArticleData();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Artikel', href: '/artikel' }
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
      <SchemaMarkup schema={[articleListingSchema, breadcrumbSchema]} />
      <Header />
      <ArticleListPage
        initialArticles={articles}
        categories={categories}
        featuredArticle={featuredArticle}
        latestArticles={latestArticles}
        tags={tags}
        seoTitle={seoTitle}
        seoDescription={seoDescription}
      />
      <Footer />
    </>
  );
}
