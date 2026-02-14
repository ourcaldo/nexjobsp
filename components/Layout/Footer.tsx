import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-800 text-white" role="contentinfo">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* Brand — wider column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Nex<span className="text-sky-300">job</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              Platform pencarian kerja terpercaya di Indonesia. Temukan posisi terbaik dari ribuan perusahaan.
            </p>
            {/* Quick action pills */}
            <div className="flex flex-wrap gap-2">
              <a
                href="/lowongan-kerja/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
              >
                Cari Lowongan <ArrowUpRight className="h-3 w-3" />
              </a>
              <a
                href="/artikel/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
              >
                Tips Karir <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Link columns — compact 3-col */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <nav aria-label="Navigasi pencari kerja">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Pencari Kerja</h3>
              <ul className="space-y-2.5">
                <li><Link href="/lowongan-kerja/" className="text-sm text-white/50 hover:text-white transition-colors">Cari Lowongan</Link></li>
                <li><Link href="/artikel/" className="text-sm text-white/50 hover:text-white transition-colors">Tips Karir</Link></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Panduan Interview</a></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Panduan CV</a></li>
              </ul>
            </nav>

            <nav aria-label="Sumber daya">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Sumber Daya</h3>
              <ul className="space-y-2.5">
                <li><Link href="/artikel/" className="text-sm text-white/50 hover:text-white transition-colors">Blog</Link></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Panduan Gaji</a></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Tren Industri</a></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </nav>

            <nav aria-label="Informasi perusahaan">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Perusahaan</h3>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Kontak</a></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} Nexjob.tech. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;