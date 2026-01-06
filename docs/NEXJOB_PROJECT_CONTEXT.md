# NEXJOB PROJECT CONTEXT - CRITICAL INFORMATION

## PROJECT OVERVIEW
This workspace contains the **NEXJOB** project - a job portal with 2 main directories:

### 1. NEXJOBSP (Frontend/Main Application)
- **Location**: `nexjobsp/` directory
- **Type**: Next.js frontend application
- **Purpose**: Main job portal website that users interact with

### 2. TUGASINCMS-NEON (Backend CMS)
- **Location**: `tugasincms-neon/` directory  
- **Type**: Backend CMS system
- **Purpose**: Content management system that provides data via API

## CRITICAL ARCHITECTURE CHANGES

### BEFORE (Old System - REMOVED):
- Had 2 backend systems:
  1. **Integrated admin panel** inside nexjobsp project using Supabase database
  2. **Self-hosted CMS** (tugasincms-neon) for content

### AFTER (Current System):
- **ONLY tugasincms-neon CMS** provides all backend functionality
- **NO Supabase** - completely removed
- **NO admin panel** in nexjobsp - completely removed
- **nexjobsp** is pure frontend that gets data from tugasincms-neon via API

## DATA FLOW
```
nexjobsp (Frontend) → API calls → tugasincms-neon (CMS Backend) → Database
```

## IMPORTANT IMPLEMENTATION DETAILS

### SEO Meta Templates
- **NOT from CMS** - served directly hardcoded in nexjobsp files
- **NOT from database** - static values in the frontend code
- **NOT from admin panel** - no admin panel exists

### Authentication/User System
- **NO Supabase auth** - completely removed
- **NO user authentication** in nexjobsp
- **NO bookmarks system** - removed with Supabase

### Settings/Configuration
- **NO admin settings** - no admin panel exists
- **NO database settings** - use hardcoded values in nexjobsp
- **CMS settings** only for CMS-specific functionality (robots.txt, advertisements)

## WHAT TO REMOVE/AVOID
- Any Supabase imports or references
- Any admin panel functionality
- Any user authentication features
- Any database settings calls
- Any bookmark functionality that requires auth

## WHAT TO KEEP/USE
- API calls to tugasincms-neon for content (jobs, articles)
- Hardcoded SEO templates in nexjobsp
- Static configuration values
- CMS provider for fetching content only