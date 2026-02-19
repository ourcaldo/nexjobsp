import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import GoogleAnalytics from '@/components/Analytics/GoogleAnalytics';
import GoogleTagManager, { GoogleTagManagerNoScript } from '@/components/Analytics/GoogleTagManager';
import PopupAdClient from '@/components/Advertisement/PopupAdClient';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/utils/schemaUtils';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech'),
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f2b3c',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema())
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema())
          }}
        />
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
            <PopupAdClient />
          </Providers>
        </ErrorBoundary>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
