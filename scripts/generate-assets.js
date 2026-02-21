const fs = require('fs');

function createOGImage(title, subtitle, filename) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f2b3c"/>
      <stop offset="100%" style="stop-color:#1a4a6e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="250" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-size="72" font-weight="bold">Nexjob</text>
  <text x="600" y="340" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="36">${title}</text>
  <text x="600" y="400" text-anchor="middle" fill="#94a3b8" font-family="Arial,sans-serif" font-size="24">${subtitle}</text>
  <rect x="500" y="440" width="200" height="4" rx="2" fill="#38bdf8"/>
  <text x="600" y="550" text-anchor="middle" fill="#64748b" font-family="Arial,sans-serif" font-size="18">nexjob.tech</text>
</svg>`;
  fs.writeFileSync('public/' + filename, svg);
}

createOGImage('Platform Lowongan Kerja Indonesia', 'Temukan karir impianmu', 'og-home.jpg');
createOGImage('Lowongan Kerja Terbaru', 'Ribuan posisi dari perusahaan terpercaya', 'og-jobs.jpg');
createOGImage('Artikel &amp; Tips Karir', 'Panduan pengembangan karir profesional', 'og-articles.jpg');
createOGImage('Lowongan Kerja', 'Detail posisi dan informasi perusahaan', 'og-job-default.jpg');
createOGImage('Artikel Karir', 'Tips dan panduan karir terbaru', 'og-article-default.jpg');

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#0f2b3c"/>
  <text x="256" y="300" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-size="200" font-weight="bold">N</text>
  <text x="256" y="420" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="60" font-weight="bold">nexjob</text>
</svg>`;
fs.writeFileSync('public/logo.png', logoSvg);

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#0f2b3c"/>
  <text x="16" y="24" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-size="22" font-weight="bold">N</text>
</svg>`;
fs.writeFileSync('public/favicon.svg', faviconSvg);
fs.writeFileSync('public/favicon.ico', faviconSvg);

const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="36" fill="#0f2b3c"/>
  <text x="90" y="120" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-size="100" font-weight="bold">N</text>
</svg>`;
fs.writeFileSync('public/apple-touch-icon.png', appleTouchSvg);

console.log('All assets created successfully');
