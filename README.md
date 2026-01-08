# Nexjob - Job Portal Frontend

A modern job portal frontend built with Next.js 16, React 19, and Tailwind CSS 4.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Rich Text:** Tiptap Editor
- **Icons:** Lucide React
- **Validation:** Zod
- **Analytics:** Google Analytics, GTM

## Prerequisites

- Node.js 18+
- npm 8+
- TugasCMS backend running

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://nexjob.tech
NEXT_PUBLIC_SITE_NAME=Nexjob

# CMS Connection
NEXT_PUBLIC_CMS_ENDPOINT=https://cms.nexjob.tech
CMS_TOKEN=your-api-token

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## Project Structure

```
app/
├── api/                 # API proxy routes
├── artikel/             # Article pages
├── lowongan-kerja/      # Job listing pages
└── robots.txt/          # Dynamic robots.txt

components/
├── Advertisement/       # Ad display components
├── Analytics/           # GA/GTM components
├── Layout/              # Header, Footer
└── pages/               # Page-level components

lib/
├── cms/                 # CMS provider & interfaces
├── services/            # Business logic
└── utils/               # Helpers
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint

# Bundle analysis
ANALYZE=true npm run build
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Nexjob SP     │───▶│   TugasCMS      │
│   (Frontend)    │    │   (Backend)     │
└─────────────────┘    └─────────────────┘
       │                       │
       ▼                       ▼
   Vercel/PM2            Neon PostgreSQL
```

## Production Deployment

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```
