import type { Metadata } from 'next';
import { cmsService } from '@/lib/cms/service';
import { supabaseAdminService } from '@/lib/supabase/admin';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { generateArticleListingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';
import { renderTemplate } from '@/utils/templateUtils';
import ArticleListPage from '@/components/pages/ArticleListPage';

async function getArticleData() {
  try {
    const [articlesResponse, categoriesResponse, seoSettings] = await Promise.all([
      cmsService.getArticles(1, 20),
      cmsService.getCategories(),
      supabaseAdminService.getSettings()
    ]);

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

    const formattedArticles = articles.map((article: any) => ({
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
      status: article.status,
      author_id: article.author_id || article.authorId,
      categories: article.categories || [],
      tags: article.tags || [],
      author: article.author ? {
        id: article.author.id,
        full_name: article.author.full_name || article.author.name,
        email: article.author.email
      } : null
    }));

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

export const revalidate = 300;

export default async function ArtikelPage() {
  const { articles, categories, featuredArticle, latestArticles, tags, seoSettings } = await getArticleData();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Artikel', href: '/artikel' }
  ];

  const articleListingSchema = generateArticleListingSchema(
    articles.map((article: any) => ({
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
