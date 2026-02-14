'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="font-sans bg-white text-gray-900 h-screen flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center text-center px-4 pb-16 max-w-[600px] w-full">

        <div className="mt-12 mb-4 w-[300px] h-[300px] sm:w-[240px] sm:h-[240px]">
          <Image
            src="https://nexjob.b-cdn.net/404.png"
            alt="404 Illustration"
            width={300}
            height={300}
            className="w-full h-full object-contain animate-float"
          />
        </div>

        <h1 className="text-4xl sm:text-3xl font-bold leading-tight mb-4 tracking-tight">
          Uh-oh... I think I took<br />a wrong turn.
        </h1>

        <p className="text-lg text-gray-500 mb-10">
          Let&apos;s get you back to where everything makes sense.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-12 sm:flex-col sm:items-center sm:w-full">
          <Link
            href="/"
            className="px-8 py-3 rounded-full font-semibold text-sm bg-gray-100 text-gray-800 border border-transparent hover:bg-gray-200 hover:-translate-y-0.5 transition-all sm:w-full sm:max-w-[300px] sm:text-center"
          >
            Go home
          </Link>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-full font-semibold text-sm bg-transparent text-gray-500 border border-transparent hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer sm:w-full sm:max-w-[300px] sm:text-center"
          >
            Go back
          </button>
        </div>

      </div>
    </div>
  );
}
