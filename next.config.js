/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const path = require('path');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // NOTE: 'unsafe-inline' required for GTM, Google Ads, and CMS-injected ad scripts.
              // TODO: Migrate to nonce-based CSP when ad providers support it.
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV !== 'production' ? "'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://adservice.google.com https://clerk.nexjob.tech https://challenges.cloudflare.com`.replace(/  +/g, ' '),
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://cms.nexjob.tech https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://clerk.nexjob.tech https://api.clerk.com",
              "frame-src 'self' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://challenges.cloudflare.com https://clerk.nexjob.tech",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
              "form-action 'self'",
            ].join('; ')
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staging.nexjob.tech',
      },
      {
        protocol: 'https',
        hostname: 'nexjob.tech',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cms.nexjob.tech',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nexjob.tech',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
    unoptimized: false,
    // Tuned for mobile-heavy Indonesian user base
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async rewrites() {
    return [];
  },
  async redirects() {
    return [
      {
        source: '/jobs',
        destination: '/lowongan-kerja',
        permanent: true,
      },
      {
        source: '/jobs/',
        destination: '/lowongan-kerja/',
        permanent: true,
      },
      {
        source: '/jobs/:slug',
        destination: '/lowongan-kerja/:slug',
        permanent: true,
      },
      {
        source: '/jobs/:slug/',
        destination: '/lowongan-kerja/:slug/',
        permanent: true,
      },
      {
        source: '/articles',
        destination: '/artikel',
        permanent: true,
      },
      {
        source: '/articles/',
        destination: '/artikel/',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/artikel/:slug',
        permanent: true,
      },
      {
        source: '/articles/:slug/',
        destination: '/artikel/:slug/',
        permanent: true,
      },
    ];
  },
  trailingSlash: true,
  generateEtags: true,
  poweredByHeader: false,
};

module.exports = withBundleAnalyzer(nextConfig);