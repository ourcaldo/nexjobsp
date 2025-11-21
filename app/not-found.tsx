import Link from 'next/link';
import { Home, Search, FileQuestion } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan | Nexjob',
  description: 'Halaman yang Anda cari tidak ditemukan.',
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8 relative">
            <div className="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mb-6 animate-scale-in">
              <FileQuestion className="w-16 h-16 sm:w-20 sm:h-20 text-primary-600" strokeWidth={1.5} />
            </div>
            
            {/* Animated 404 Text */}
            <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent animate-fade-in">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-10 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. 
              Halaman mungkin telah dipindahkan atau tidak pernah ada.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
            </Link>
            
            <Link
              href="/lowongan-kerja"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 w-full sm:w-auto"
            >
              <Search className="w-5 h-5" />
              <span>Cari Lowongan Kerja</span>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Halaman Populer:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/lowongan-kerja"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Lowongan Kerja
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/artikel"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Artikel Karir
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/tentang-kami"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Tentang Kami
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/kontak"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Kontak
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
