import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { config } from '@/lib/config';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-800 text-white" role="contentinfo">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* Brand — wider column */}
          <div className="lg:col-span-4">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                {config.site.name}
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              {config.site.description}. Temukan posisi terbaik dari ribuan perusahaan.
            </p>
            {/* Quick action pills */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/lowongan-kerja/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
              >
                Cari Lowongan <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link
                href="/artikel/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
              >
                Tips Karir <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Link columns — compact 3-col */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <nav aria-label="Navigasi pencari kerja">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Pencari Kerja</h3>
              <ul className="space-y-2.5">
                <li><Link href="/lowongan-kerja/" className="text-sm text-white/50 hover:text-white transition-colors">Cari Lowongan</Link></li>
                <li><Link href="/artikel/" className="text-sm text-white/50 hover:text-white transition-colors">Tips Karir</Link></li>
                <li><Link href="/artikel/interview" className="text-sm text-white/50 hover:text-white transition-colors">Panduan Interview</Link></li>
                <li><Link href="/artikel/cv" className="text-sm text-white/50 hover:text-white transition-colors">Panduan CV</Link></li>
              </ul>
            </nav>

            <nav aria-label="Sumber daya">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Sumber Daya</h3>
              <ul className="space-y-2.5">
                <li><Link href="/artikel/" className="text-sm text-white/50 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/artikel/gaji" className="text-sm text-white/50 hover:text-white transition-colors">Panduan Gaji</Link></li>
                {/* TODO: Add actual routes when pages are created */}
                <li><span className="text-sm text-white/50 cursor-default" aria-disabled="true">Tren Industri</span></li>
                <li><span className="text-sm text-white/50 cursor-default" aria-disabled="true">FAQ</span></li>
              </ul>
            </nav>

            <nav aria-label="Informasi perusahaan">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Perusahaan</h3>
              <ul className="space-y-2.5">
                {/* TODO [L-4]: These routes resolve to CMS-served pages — create [slug]/page.tsx catch-all or static pages */}
                <li><Link href="/tentang-kami" className="text-sm text-white/50 hover:text-white transition-colors" prefetch={false}>Tentang Kami</Link></li>
                <li><Link href="/kontak" className="text-sm text-white/50 hover:text-white transition-colors" prefetch={false}>Kontak</Link></li>
                <li><Link href="/kebijakan-privasi" className="text-sm text-white/50 hover:text-white transition-colors" prefetch={false}>Kebijakan Privasi</Link></li>
                <li><Link href="/syarat-ketentuan" className="text-sm text-white/50 hover:text-white transition-colors" prefetch={false}>Syarat &amp; Ketentuan</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} {config.site.url.replace(/^https?:\/\//, '')}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/kebijakan-privasi" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/syarat-ketentuan" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="text-xs text-white/25 hover:text-white/50 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;