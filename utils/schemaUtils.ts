import { Job } from '@/types/job';
import { AdminSettings } from '@/lib/supabase';
import { getCurrentDomain } from '@/lib/env';

export const generateWebsiteSchema = (settings: AdminSettings) => {
  const baseUrl = getCurrentDomain();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": settings.site_title,
    "description": settings.site_description,
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/lowongan-kerja/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": settings.site_title,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };
};

export const generateOrganizationSchema = () => {
  const baseUrl = getCurrentDomain();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nexjob",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Platform pencarian kerja terpercaya di Indonesia dengan ribuan lowongan dari perusahaan terbaik",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Indonesian"
    },
    "sameAs": [
      "https://www.facebook.com/nexjob",
      "https://www.twitter.com/nexjob",
      "https://www.instagram.com/nexjob",
      "https://www.linkedin.com/company/nexjob"
    ]
  };
};

// Helper function to map employment type
const mapEmploymentType = (tipeKerja: string): string => {
  const mapping: Record<string, string> = {
    'Full Time': 'FULL_TIME',
    'Part Time': 'PART_TIME',
    'Contract': 'CONTRACTOR',
    'Kontrak': 'CONTRACTOR',
    'Freelance': 'TEMPORARY',
    'Internship': 'INTERN',
    'Magang': 'INTERN',
    'Intern': 'INTERN'
  };

  return mapping[tipeKerja] || 'FULL_TIME';
};

// Helper function to extract salary information
const extractSalaryInfo = (gaji: string) => {
  if (!gaji || gaji === 'Negosiasi' || gaji.toLowerCase().includes('negosiasi')) {
    return null;
  }

  return {
    "@type": "MonetaryAmount",
    "currency": "IDR",
    "value": {
      "@type": "QuantitativeValue",
      "name": gaji,
      "unitText": "MONTH"
    }
  };
};

export const generateJobPostingSchema = (job: Job) => {
  const baseUrl = getCurrentDomain();

  // Calculate valid through date (30 days from posting date)
  const postedDate = new Date(job.created_at || Date.now());
  const validThrough = new Date(postedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.seo_description || job.content.replace(/<[^>]*>/g, '').substring(0, 300),
    "datePosted": job.created_at,
    "validThrough": validThrough.toISOString(),
    "employmentType": mapEmploymentType(job.tipe_pekerjaan),
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company_name,
      "value": job.id
    },
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name,
      "sameAs": baseUrl
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.lokasi_kota,
        "addressRegion": job.lokasi_provinsi,
        "addressCountry": "ID"
      }
    },
    "baseSalary": extractSalaryInfo(job.gaji),
    "qualifications": job.pendidikan,
    "experienceRequirements": job.pengalaman,
    "workHours": job.kebijakan_kerja,
    "url": `${baseUrl}/lowongan-kerja/${job.job_categories?.[0]?.slug || 'uncategorized'}/${job.id}/`,
    "applicationContact": {
      "@type": "ContactPoint",
      "url": job.link
    }
  };
};

export const generateBreadcrumbSchema = (items: Array<{ label: string; href?: string }>) => {
  const baseUrl = getCurrentDomain();

  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.label,
    ...(item.href && { "item": `${baseUrl}${item.href}` })
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl + "/"
      },
      ...itemListElement
    ]
  };
};

export const generateArticleSchema = (article: any) => {
  const baseUrl = getCurrentDomain();

  // Handle both WordPress articles and CMS articles
  const isWordPressArticle = article.title?.rendered !== undefined;

  if (isWordPressArticle) {
    // WordPress article structure
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title.rendered,
      "description": article.seo_description || article.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
      "image": article.featured_media_url || `${baseUrl}/default-article-image.jpg`,
      "author": {
        "@type": "Person",
        "name": article.author_info?.display_name || article.author_info?.name || "Nexjob Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nexjob",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": article.date,
      "dateModified": article.modified || article.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/artikel/${article.slug}/`
      },
      "articleSection": article.categories_info?.[0]?.name || "Career Tips",
      "keywords": article.tags_info?.map((tag: any) => tag.name).join(", ") || "",
      "url": `${baseUrl}/artikel/${article.slug}/`
    };
  } else {
    // CMS article structure (NxdbArticle)
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.meta_description || article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 160) || "",
      "image": article.featured_image || `${baseUrl}/default-article-image.jpg`,
      "author": {
        "@type": "Person",
        "name": article.author?.full_name || article.author?.email || "Nexjob Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nexjob",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": article.published_at || article.post_date,
      "dateModified": article.updated_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/artikel/${article.categories?.[0]?.slug || 'uncategorized'}/${article.slug}/`
      },
      "articleSection": article.categories?.[0]?.name || "Career Tips",
      "keywords": article.tags?.map((tag: any) => tag.name).join(", ") || "",
      "url": `${baseUrl}/artikel/${article.categories?.[0]?.slug || 'uncategorized'}/${article.slug}/`
    };
  }
};

export const generateJobListingSchema = (jobs: Job[]) => {
  const baseUrl = getCurrentDomain();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Job Listings",
    "description": "Latest job opportunities available on Nexjob",
    "url": `${baseUrl}/lowongan-kerja/`,
    "numberOfItems": jobs.length,
    "itemListElement": jobs.slice(0, 10).map((job, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "JobPosting",
        "title": job.title,
        "description": job.seo_description || job.content.replace(/<[^>]*>/g, '').substring(0, 200),
        "datePosted": job.created_at,
        "employmentType": mapEmploymentType(job.tipe_pekerjaan),
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company_name
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.lokasi_kota,
            "addressRegion": job.lokasi_provinsi,
            "addressCountry": "ID"
          }
        },
        "baseSalary": extractSalaryInfo(job.gaji),
        "url": `${baseUrl}/lowongan-kerja/${job.job_categories?.[0]?.slug || 'uncategorized'}/${job.id}/`
      }
    }))
  };
};

export const generateArticleListingSchema = (articles: any[]) => {
  const baseUrl = getCurrentDomain();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Career Articles",
    "description": "Latest career tips and guidance articles",
    "url": `${baseUrl}/artikel/`,
    "numberOfItems": Array.isArray(articles) ? articles.length : 0,
    "itemListElement": Array.isArray(articles) ? articles.slice(0, 10).map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "BlogPosting",
        "headline": article.title.rendered,
        "description": article.seo_description || article.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
        "author": {
          "@type": "Person",
          "name": article.author_info?.display_name || article.author_info?.name || "Nexjob Team"
        },
        "datePublished": article.date,
        "url": `${baseUrl}/artikel/${article.slug}/`
      }
    })) : [],
  };
};

export const generateAuthorSchema = (author: any) => {
  const baseUrl = getCurrentDomain();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.display_name || author.name,
    "description": author.description || "Content writer at Nexjob",
    "url": `${baseUrl}/author/${author.slug}/`,
    "image": author.avatar_urls?.['96'] || `${baseUrl}/default-avatar.png`,
    "worksFor": {
      "@type": "Organization",
      "name": "Nexjob"
    }
  };
};