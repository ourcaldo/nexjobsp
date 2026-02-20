import { Job } from '@/types/job';
import { Article } from '@/lib/cms/interface';
import { config } from '@/lib/config';

export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.site.name,
    "description": config.site.description,
    "url": config.site.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${config.site.url}/lowongan-kerja/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": config.site.name,
      "url": config.site.url,
      "logo": {
        "@type": "ImageObject",
        "url": `${config.site.url}/logo.png`
      }
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.site.name,
    "url": config.site.url,
    "logo": `${config.site.url}/logo.png`,
    "description": config.site.description,
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Indonesian"
    },
    // L-2: Social media URLs removed — add verified URLs via config/CMS when accounts are created
    "sameAs": []
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
      "sameAs": config.site.url
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
    "url": `${config.site.url}/lowongan-kerja/${job.job_categories?.[0]?.slug || 'uncategorized'}/${job.id}/`,
    "applicationContact": {
      "@type": "ContactPoint",
      "url": job.link
    }
  };
};

export const generateBreadcrumbSchema = (items: Array<{ label: string; href?: string }>) => {
  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 2, // Start at 2 since Home is position 1
    "name": item.label,
    ...(item.href && { "item": `${config.site.url}${item.href}` })
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": config.site.url + "/"
      },
      ...itemListElement
    ]
  };
};

export const generateArticleSchema = (article: Partial<Article> & Pick<Article, 'title' | 'slug'>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.meta_description || article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 160) || "",
    "image": article.featured_image || `${config.site.url}/default-article-image.jpg`,
    "author": {
      "@type": "Person",
      "name": article.author?.full_name || article.author?.email || `${config.site.name} Team`
    },
    "publisher": {
      "@type": "Organization",
      "name": config.site.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${config.site.url}/logo.png`
      }
    },
    "datePublished": article.published_at || article.post_date,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${config.site.url}/artikel/${article.categories?.[0]?.slug || 'uncategorized'}/${article.slug}/`
    },
    "articleSection": article.categories?.[0]?.name || "Career Tips",
    "keywords": article.tags?.map((tag: { name: string }) => tag.name).join(", ") || "",
    "url": `${config.site.url}/artikel/${article.categories?.[0]?.slug || 'uncategorized'}/${article.slug}/`
  };
};

export const generateJobListingSchema = (jobs: Job[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Job Listings",
    "description": `Latest job opportunities available on ${config.site.name}`,
    "url": `${config.site.url}/lowongan-kerja/`,
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
        "url": `${config.site.url}/lowongan-kerja/${job.job_categories?.[0]?.slug || 'uncategorized'}/${job.id}/`
      }
    }))
  };
};

export const generateArticleListingSchema = (articles: Array<Partial<Article> & Pick<Article, 'title' | 'slug'>>) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Career Articles",
    "description": "Latest career tips and guidance articles",
    "url": `${config.site.url}/artikel/`,
    "numberOfItems": Array.isArray(articles) ? articles.length : 0,
    "itemListElement": Array.isArray(articles) ? articles.slice(0, 10).map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.meta_description || article.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160) || "",
        "author": {
          "@type": "Person",
          "name": article.author?.full_name || article.author?.email || `${config.site.name} Team`
        },
        "datePublished": article.published_at || article.post_date,
        "url": `${config.site.url}/artikel/${article.categories?.[0]?.slug || 'uncategorized'}/${article.slug}/`
      }
    })) : [],
  };
};

export const generateAuthorSchema = (author: { full_name?: string; name?: string; email?: string; description?: string; slug?: string; id?: string; avatar?: string }) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.full_name || author.name || author.email,
    "description": author.description || `Content writer at ${config.site.name}`,
    "url": `${config.site.url}/author/${author.slug || author.id}/`,
    "image": author.avatar || `${config.site.url}/default-avatar.png`,
    "worksFor": {
      "@type": "Organization",
      "name": config.site.name
    }
  };
};