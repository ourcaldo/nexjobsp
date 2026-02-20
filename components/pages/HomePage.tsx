import React from 'react';
import Image from 'next/image';
import { ArrowRight, FileText, UserCheck, Send } from 'lucide-react';
import { FilterData } from '@/lib/cms/interface';
import { sanitizeHTML } from '@/lib/utils/sanitize';
import { getBlurDataURL } from '@/lib/utils/image';
import HomeSearchBox from './home/HomeSearchBox';
import { HomeJobsProvider, HomeHeroCard, HomeJobGrid } from './home/HomeFeaturedJobs';
import HomeCategoryScroll from './home/HomeCategoryScroll';

interface HomePageProps {
  initialArticles: any[];
  initialFilterData: FilterData | null;
  settings: any;
}

/**
 * Server component shell for the Homepage.
 * Static sections (hero text, how-it-works, articles) render on the server with zero JS.
 * Interactive parts are isolated client islands: HomeSearchBox, HomeHeroCard, HomeJobGrid, HomeCategoryScroll.
 * HomeJobsProvider shares a single fetch between HomeHeroCard and HomeJobGrid via React Context.
 */
const HomePage: React.FC<HomePageProps> = ({ initialArticles, initialFilterData, settings }) => {
  const articles = initialArticles || [];
  const getArticleUrl = (slug: string) => `/artikel/${slug}/`;

  return (
    <HomeJobsProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Organization/WebSite schemas are emitted globally in app/layout.tsx */}

      {/* ─── Hero: Split Layout ─── */}
      <section className="bg-primary-800 text-white overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="relative">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text + Search */}
              <div>
                <p className="text-primary-300 text-sm font-medium tracking-widest uppercase mb-4">Platform Karir Indonesia</p>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight mb-6">
                  Temukan Karir<br />
                  <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                    Impianmu
                  </span>
                </h1>
                <p className="text-primary-200 text-lg leading-relaxed mb-8 max-w-lg">
                  {settings.site_description || 'Platform pencarian kerja terpercaya di Indonesia'}
                </p>

                {/* Client island: Search Card */}
                <HomeSearchBox initialFilterData={initialFilterData} />
              </div>

              {/* Right: Featured Job Preview Card (client island) */}
              <div className="hidden lg:block">
                <HomeHeroCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories: Horizontal Scrolling Pills (client island) ─── */}
      <HomeCategoryScroll initialFilterData={initialFilterData} />

      {/* ─── How It Works ─── */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cara Kerja</h2>
            <p className="text-gray-500">Tiga langkah mudah untuk menemukan pekerjaan impianmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gray-200" />

            {[
              { step: '01', icon: FileText, title: 'Cari Lowongan', desc: 'Gunakan fitur pencarian untuk menemukan posisi yang sesuai dengan keahlianmu' },
              { step: '02', icon: UserCheck, title: 'Review Detail', desc: 'Pelajari deskripsi pekerjaan, kualifikasi, dan informasi perusahaan' },
              { step: '03', icon: Send, title: 'Lamar Sekarang', desc: 'Langsung hubungi perusahaan dan kirimkan lamaran terbaikmu' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white border-2 border-primary-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <span className="text-xs font-bold text-primary-400 tracking-widest uppercase mb-2">Langkah {step}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Jobs: 3-Column Card Grid (client island) ─── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lowongan Terbaru</h2>
              <p className="text-gray-500">Posisi terbaru dari berbagai perusahaan terpercaya</p>
            </div>
            <a
              href="/lowongan-kerja/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <HomeJobGrid />

          {/* Mobile CTA */}
          <div className="sm:hidden text-center mt-8">
            <a
              href="/lowongan-kerja/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              Lihat Semua Lowongan <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Articles: Magazine Layout ─── */}
      {articles.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tips & Panduan Karir</h2>
                <p className="text-gray-500">Artikel terbaru untuk membantu perjalanan karir Anda</p>
              </div>
              <a
                href="/artikel/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Large featured article */}
              {articles[0] && (
                <a
                  href={getArticleUrl(articles[0].slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  {articles[0].featuredImage && (
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <Image
                        src={articles[0].featuredImage}
                        alt={articles[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL()}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {articles[0].title}
                    </h3>
                    <div
                      className="text-gray-500 text-sm line-clamp-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(articles[0].excerpt) }}
                    />
                  </div>
                </a>
              )}

              {/* Stacked smaller articles */}
              <div className="flex flex-col gap-6">
                {articles.slice(1, 3).map((article) => (
                  <a
                    key={article.id}
                    href={getArticleUrl(article.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-5 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {article.featuredImage && (
                      <div className="w-40 sm:w-48 flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fill
                          sizes="200px"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={getBlurDataURL()}
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-center py-5 pr-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <div
                        className="text-gray-500 text-sm line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.excerpt) }}
                      />
                      <span className="text-primary-600 text-sm font-medium mt-3 inline-flex items-center gap-1">
                        Baca Selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="sm:hidden text-center mt-8">
              <a
                href="/artikel/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                Lihat Semua Artikel <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
    </HomeJobsProvider>
  );
};

export default HomePage;
