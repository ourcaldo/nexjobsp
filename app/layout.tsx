import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import GoogleAnalytics from '@/components/Analytics/GoogleAnalytics';
import GoogleTagManager, { GoogleTagManagerNoScript } from '@/components/Analytics/GoogleTagManager';
import dynamic from 'next/dynamic';

const PopupAd = dynamic(() => import('@/components/Advertisement/PopupAd'), { ssr: false });
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <GoogleTagManager />
      <body className={inter.className}>
        <a 
          href="#main-content" 
          className="skip-to-content"
        >
          Langsung ke konten utama
        </a>
        <GoogleTagManagerNoScript />
        <ErrorBoundary>
          <Providers>
            <div id="main-content">
              {children}
            </div>
            <PopupAd />
          </Providers>
        </ErrorBoundary>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
