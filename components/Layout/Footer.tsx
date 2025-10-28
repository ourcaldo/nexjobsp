import React from 'react';
import { Search, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Search className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold">
                Nex<span className="text-primary-400">job</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Platform pencarian kerja terpercaya di Indonesia. Temukan pekerjaan impian Anda bersama ribuan perusahaan terbaik.
            </p>
            <div className="flex space-x-4" role="group" aria-label="Media sosial">
              <a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Facebook">
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Twitter">
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Instagram">
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <nav aria-label="Navigasi pencari kerja">
            <h3 className="font-semibold mb-4">Pencari Kerja</h3>
            <ul className="space-y-2">
              <li><Link href="/lowongan-kerja/" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Cari Lowongan</Link></li>
              <li><Link href="/artikel/" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Tips Karir</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Panduan Interview</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Panduan CV</a></li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Sumber daya">
            <h3 className="font-semibold mb-4">Sumber Daya</h3>
            <ul className="space-y-2">
              <li><Link href="/artikel/" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Blog</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Panduan Gaji</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Tren Industri</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">FAQ</a></li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Informasi perusahaan">
            <h3 className="font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Tentang Kami</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Kontak</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Syarat & Ketentuan</a></li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Nexjob.tech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;