'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="font-sans bg-white text-gray-900 h-screen flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center text-center px-4 pb-16 max-w-[600px] w-full">

        <div className="mt-12 mb-8 text-8xl sm:text-7xl font-bold text-gray-200 select-none">
          404
        </div>

        <h1 className="text-4xl sm:text-3xl font-bold leading-tight mb-4 tracking-tight">
          Ups... Halaman tidak<br />ditemukan.
        </h1>

        <p className="text-lg text-gray-500 mb-10">
          Mari kembali ke halaman yang tepat.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-12 sm:flex-col sm:items-center sm:w-full">
          <Link
            href="/"
            className="px-8 py-3 rounded-full font-semibold text-sm bg-gray-100 text-gray-800 border border-transparent hover:bg-gray-200 hover:-translate-y-0.5 transition-all sm:w-full sm:max-w-[300px] sm:text-center"
          >
            Ke Beranda
          </Link>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-full font-semibold text-sm bg-transparent text-gray-500 border border-transparent hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer sm:w-full sm:max-w-[300px] sm:text-center"
          >
            Kembali
          </button>
        </div>

      </div>
    </div>
  );
}
