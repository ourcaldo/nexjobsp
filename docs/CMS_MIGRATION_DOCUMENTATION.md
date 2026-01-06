# CMS Backend Migration Documentation

## Overview

This document provides comprehensive specifications for implementing the required CMS backend features to support the complete elimination of Supabase from the Nexjob project.

---

## 1. Architecture Overview

### Current State (Before Migration)
```
Nexjob Frontend
    ↓
Supabase Database (admin_settings, profiles, user_bookmarks)
    ↓
TugasCMS (jobs, articles, categories)
```

### Target State (After Migration)
```
Nexjob Frontend
    ↓
.env (infrastructure) + Hardcoded Templates (SEO) + CMS Backend (content)
    ↓
TugasCMS (jobs, articles, categories, advertisements, sitemap)
```

---

## 2. Data Migration Requirements

### 2.1 Advertisement Settings Migration

**Source**: Supabase `admin_settings` table
**Destination**: CMS `advertisement_settings` table

**Data Mapping**:
```sql
-- Supabase columns → CMS columns
popup_ad_enabled → popup_ad_enabled
popup_ad_url → popup_ad_url
popup_ad_load_settings → popup_ad_load_settings (JSONB array)
popup_ad_max_executions → popup_ad_max_executions
popup_ad_device → popup_ad_device
sidebar_archive_ad_code → sidebar_archive_ad_code
sidebar_single_ad_code → sidebar_single_ad_code
single_top_ad_code → single_top_ad_code
single_bottom_ad_code → single_bottom_ad_code
single_middle_ad_code → single_middle_ad_code
```

**Sample Migration Script**:
```sql
-- Create advertisement settings table in CMS
CREATE TABLE advertisement_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_ad_enabled BOOLEAN DEFAULT false,
  popup_ad_url TEXT DEFAULT '',
  popup_ad_load_settings JSONB DEFAULT '[]'::jsonb,
  popup_ad_max_executions INTEGER DEFAULT 0,
  popup_ad_device VARCHAR(20) DEFAULT 'all' CHECK (popup_ad_device IN ('all', 'mobile', 'desktop')),
  sidebar_archive_ad_code TEXT DEFAULT '',
  sidebar_single_ad_code TEXT DEFAULT '',
  single_top_ad_code TEXT DEFAULT '',
  single_bottom_ad_code TEXT DEFAULT '',
  single_middle_ad_code TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insert initial data (replace with actual Supabase data)
INSERT INTO advertisement_settings (
  popup_ad_enabled,
  popup_ad_url,
  popup_ad_load_settings,
  popup_ad_max_executions,
  popup_ad_device,
  sidebar_archive_ad_code,
  sidebar_single_ad_code,
  single_top_ad_code,
  single_bottom_ad_code,
  single_middle_ad_code
) VALUES (
  false,
  '',
  '[]'::jsonb,
  0,
  'all',
  '',
  '',
  '',
  '',
  ''
);
```

### 2.2 Sitemap Settings Migration

**Source**: Supabase `admin_settings` table
**Destination**: CMS `sitemap_settings` table

**Data Mapping**:
```sql
-- Supabase columns → CMS columns
sitemap_update_interval → update_interval
auto_generate_sitemap → auto_generate
last_sitemap_update → last_update
robots_txt → robots_txt_additions (partial)
```

**Sample Migration Script**:
```sql
-- Create sitemap settings table in CMS
CREATE TABLE sitemap_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_interval INTEGER DEFAULT 300,
  auto_generate BOOLEAN DEFAULT true,
  last_update TIMESTAMP DEFAULT now(),
  robots_txt_additions TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insert initial data
INSERT INTO sitemap_settings (
  update_interval,
  auto_generate,
  last_update,
  robots_txt_additions
) VALUES (
  300,
  true,
  now(),
  '# Additional robots.txt rules can be added here'
);
```

---

## 3. API Endpoints Specification

### 3.1 Advertisement Settings API

#### GET /api/v1/settings/advertisements

**Purpose**: Retrieve current advertisement settings
**Authentication**: Bearer token required
**Method**: GET
**Headers**:
```
Authorization: Bearer <cms-api-token>
Content-Type: application/json
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "popup_ad": {
      "enabled": false,
      "url": "https://example.com/promo",
      "load_settings": ["all_pages", "single_articles"],
      "max_executions": 3,
      "device": "all"
    },
    "ad_codes": {
      "sidebar_archive": "<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js\"></script>",
      "sidebar_single": "<ins class=\"adsbygoogle\" style=\"display:block\"></ins>",
      "single_top": "<!-- Ad code for top of articles -->",
      "single_bottom": "<!-- Ad code for bottom of articles -->",
      "single_middle": "<!-- Ad code for middle of articles -->"
    }
  },
  "cached_at": "2024-01-15T10:30:00Z",
  "cache_ttl": 1800
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing API token",
  "code": 401
}
```

#### PUT /api/v1/settings/advertisements

**Purpose**: Update advertisement settings
**Authentication**: Bearer token required
**Method**: PUT
**Headers**:
```
Authorization: Bearer <cms-api-token>
Content-Type: application/json
```

**Request Format**:
```json
{
  "popup_ad": {
    "enabled": true,
    "url": "https://example.com/new-promo",
    "load_settings": ["single_articles"],
    "max_executions": 2,
    "device": "mobile"
  },
  "ad_codes": {
    "sidebar_archive": "<script>/* Updated archive ad code */</script>",
    "single_top": "<div class=\"ad-container\"><!-- New top ad --></div>"
  }
}
```

**Validation Rules**:
- `popup_ad.enabled`: Boolean
- `popup_ad.url`: Valid URL or empty string
- `popup_ad.load_settings`: Array of strings, allowed values: ["all_pages", "single_articles"]
- `popup_ad.max_executions`: Integer between 0-10
- `popup_ad.device`: String, allowed values: ["all", "mobile", "desktop"]
- `ad_codes.*`: String, HTML/JavaScript code (sanitized)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "updated_fields": ["popup_ad.enabled", "popup_ad.device", "ad_codes.sidebar_archive"],
    "updated_at": "2024-01-15T10:35:00Z"
  },
  "message": "Advertisement settings updated successfully"
}
```

### 3.2 Sitemap Settings API

#### GET /api/v1/settings/sitemap

**Purpose**: Retrieve current sitemap settings
**Authentication**: Bearer token required
**Method**: GET

**Response Format**:
```json
{
  "success": true,
  "data": {
    "update_interval": 300,
    "auto_generate": true,
    "last_update": "2024-01-15T10:30:00Z",
    "robots_txt_additions": "# Custom rules\nDisallow: /private/\nDisallow: /temp/"
  }
}
```

#### PUT /api/v1/settings/sitemap

**Purpose**: Update sitemap settings
**Authentication**: Bearer token required
**Method**: PUT

**Request Format**:
```json
{
  "update_interval": 600,
  "auto_generate": false,
  "robots_txt_additions": "# Updated custom rules\nDisallow: /admin/\nDisallow: /api/"
}
```

**Validation Rules**:
- `update_interval`: Integer between 60-3600 (1 minute to 1 hour)
- `auto_generate`: Boolean
- `robots_txt_additions`: String, valid robots.txt syntax

### 3.3 Sitemap XML Generation

#### GET /api/v1/sitemap.xml

**Purpose**: Generate and return sitemap XML
**Authentication**: None (public endpoint)
**Method**: GET
**Headers**:
```
Content-Type: application/xml
Cache-Control: public, max-age=300
```

**Response**: Raw XML sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://nexjob.tech</loc>
    <lastmod>2024-01-15T10:30:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>https://nexjob.tech/lowongan-kerja</loc>
    <lastmod>2024-01-15T10:30:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://nexjob.tech/artikel</loc>
    <lastmod>2024-01-15T10:30:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Dynamic job posts -->
  <url>
    <loc>https://nexjob.tech/lowongan-kerja/software-engineer-jakarta-123</loc>
    <lastmod>2024-01-15T09:15:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Dynamic articles -->
  <url>
    <loc>https://nexjob.tech/artikel/tips-interview-kerja</loc>
    <lastmod>2024-01-14T14:20:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Category pages -->
  <url>
    <loc>https://nexjob.tech/lowongan-kerja/kategori/teknologi</loc>
    <lastmod>2024-01-15T08:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Location pages -->
  <url>
    <loc>https://nexjob.tech/lowongan-kerja/lokasi/jakarta</loc>
    <lastmod>2024-01-15T08:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**Sitemap Generation Logic**:
1. Include homepage and main pages
2. Include all published job posts (from existing job_posts table)
3. Include all published articles (from existing posts table)
4. Include category pages (from categories table)
5. Include location pages (from job locations)
6. Sort by priority and last modified date
7. Limit to 50,000 URLs per sitemap
8. Generate sitemap index if needed

---

## 4. Database Schema

### 4.1 Advertisement Settings Table

```sql
CREATE TABLE advertisement_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Popup Advertisement
  popup_ad_enabled BOOLEAN DEFAULT false,
  popup_ad_url TEXT DEFAULT '',
  popup_ad_load_settings JSONB DEFAULT '[]'::jsonb,
  popup_ad_max_executions INTEGER DEFAULT 0 CHECK (popup_ad_max_executions >= 0 AND popup_ad_max_executions <= 10),
  popup_ad_device VARCHAR(20) DEFAULT 'all' CHECK (popup_ad_device IN ('all', 'mobile', 'desktop')),
  
  -- Ad Codes
  sidebar_archive_ad_code TEXT DEFAULT '',
  sidebar_single_ad_code TEXT DEFAULT '',
  single_top_ad_code TEXT DEFAULT '',
  single_bottom_ad_code TEXT DEFAULT '',
  single_middle_ad_code TEXT DEFAULT '',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_advertisement_settings_updated_at ON advertisement_settings(updated_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_advertisement_settings_updated_at 
    BEFORE UPDATE ON advertisement_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Sitemap Settings Table

```sql
CREATE TABLE sitemap_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sitemap Configuration
  update_interval INTEGER DEFAULT 300 CHECK (update_interval >= 60 AND update_interval <= 3600),
  auto_generate BOOLEAN DEFAULT true,
  last_update TIMESTAMP DEFAULT now(),
  
  -- Robots.txt Additions
  robots_txt_additions TEXT DEFAULT '',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_sitemap_settings_last_update ON sitemap_settings(last_update);
CREATE INDEX idx_sitemap_settings_updated_at ON sitemap_settings(updated_at);

-- Create trigger for updated_at
CREATE TRIGGER update_sitemap_settings_updated_at 
    BEFORE UPDATE ON sitemap_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.3 Settings Audit Log (Optional)

```sql
CREATE TABLE settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100), -- Admin user identifier
  changed_at TIMESTAMP DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes
CREATE INDEX idx_settings_audit_log_table_name ON settings_audit_log(table_name);
CREATE INDEX idx_settings_audit_log_changed_at ON settings_audit_log(changed_at);
CREATE INDEX idx_settings_audit_log_changed_by ON settings_audit_log(changed_by);
```

---

## 5. CMS Admin Interface Requirements

### 5.1 Advertisement Management Interface

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Advertisement Settings                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Popup Advertisement                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ ☐ Enable Popup Ads                                         │   │
│  │ URL: [https://example.com/promo                    ]        │   │
│  │ Load on: ☐ All Pages  ☑ Single Articles                   │   │
│  │ Max executions: [3] per page                               │   │
│  │ Target device: ○ All  ○ Mobile  ○ Desktop                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Advertisement Codes                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ Sidebar Archive Ad:                                         │   │
│  │ ┌─────────────────────────────────────────────────────────┐ │   │
│  │ │<script async src="https://pagead2.googlesyndication...│ │   │
│  │ │</script>                                               │ │   │
│  │ └─────────────────────────────────────────────────────────┘ │   │
│  │ [Preview] [Clear]                                           │   │
│  │                                                             │   │
│  │ Sidebar Single Ad:                                          │   │
│  │ ┌─────────────────────────────────────────────────────────┐ │   │
│  │ │<ins class="adsbygoogle" style="display:block"></ins>   │ │   │
│  │ └─────────────────────────────────────────────────────────┘ │   │
│  │ [Preview] [Clear]                                           │   │
│  │                                                             │   │
│  │ (Similar sections for Single Top, Single Bottom, Single    │   │
│  │  Middle ad codes)                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Save Settings] [Reset to Defaults] [Preview All Ads]             │
└─────────────────────────────────────────────────────────────────────┘
```

#### Required Form Fields

1. **Popup Advertisement Section**:
   - Checkbox: "Enable Popup Ads"
   - Text input: "Popup URL" (with URL validation)
   - Multi-checkbox: "Load Settings" (All Pages, Single Articles)
   - Number input: "Max Executions" (range 0-10)
   - Radio buttons: "Target Device" (All, Mobile, Desktop)

2. **Advertisement Codes Section**:
   - Textarea: "Sidebar Archive Ad Code" (with syntax highlighting)
   - Textarea: "Sidebar Single Ad Code" (with syntax highlighting)
   - Textarea: "Single Top Ad Code" (with syntax highlighting)
   - Textarea: "Single Bottom Ad Code" (with syntax highlighting)
   - Textarea: "Single Middle Ad Code" (with syntax highlighting)

3. **Action Buttons**:
   - "Save Settings" (primary button)
   - "Reset to Defaults" (secondary button)
   - "Preview All Ads" (opens preview modal)

#### JavaScript Functionality

```javascript
// Advertisement settings management
class AdvertisementSettings {
  constructor() {
    this.form = document.getElementById('advertisement-form');
    this.previewModal = document.getElementById('preview-modal');
    this.bindEvents();
  }

  bindEvents() {
    // Save settings
    this.form.addEventListener('submit', this.saveSettings.bind(this));
    
    // Preview individual ads
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', this.previewAd.bind(this));
    });
    
    // Clear ad code
    document.querySelectorAll('.clear-btn').forEach(btn => {
      btn.addEventListener('click', this.clearAdCode.bind(this));
    });
    
    // Reset to defaults
    document.getElementById('reset-btn').addEventListener('click', this.resetToDefaults.bind(this));
  }

  async saveSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(this.form);
    const settings = {
      popup_ad: {
        enabled: formData.get('popup_enabled') === 'on',
        url: formData.get('popup_url') || '',
        load_settings: formData.getAll('popup_load_settings'),
        max_executions: parseInt(formData.get('popup_max_executions')) || 0,
        device: formData.get('popup_device') || 'all'
      },
      ad_codes: {
        sidebar_archive: formData.get('sidebar_archive_code') || '',
        sidebar_single: formData.get('sidebar_single_code') || '',
        single_top: formData.get('single_top_code') || '',
        single_bottom: formData.get('single_bottom_code') || '',
        single_middle: formData.get('single_middle_code') || ''
      }
    };

    try {
      const response = await fetch('/api/v1/settings/advertisements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getApiToken()}`
        },
        body: JSON.stringify(settings)
      });

      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Settings saved successfully!', 'success');
      } else {
        this.showNotification('Error saving settings: ' + result.message, 'error');
      }
    } catch (error) {
      this.showNotification('Network error: ' + error.message, 'error');
    }
  }

  previewAd(event) {
    const adCode = event.target.dataset.adCode;
    const adType = event.target.dataset.adType;
    
    // Open preview modal with ad code rendered
    this.previewModal.innerHTML = `
      <div class="modal-content">
        <h3>Preview: ${adType}</h3>
        <div class="ad-preview">${adCode}</div>
        <button onclick="this.closest('.modal').style.display='none'">Close</button>
      </div>
    `;
    this.previewModal.style.display = 'block';
  }

  clearAdCode(event) {
    const targetTextarea = event.target.dataset.target;
    document.getElementById(targetTextarea).value = '';
  }

  async resetToDefaults() {
    if (confirm('Are you sure you want to reset all advertisement settings to defaults?')) {
      // Reset form to default values
      this.form.reset();
      // Optionally call API to reset server-side defaults
    }
  }

  getApiToken() {
    // Return CMS API token (from session, config, etc.)
    return document.querySelector('meta[name="api-token"]').content;
  }

  showNotification(message, type) {
    // Show toast notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdvertisementSettings();
});
```

### 5.2 Sitemap Management Interface

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│                      Sitemap Settings                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Sitemap Configuration                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ Update Interval: [300] seconds                              │   │
│  │ ☑ Auto-generate sitemap                                    │   │
│  │ Last Update: 2024-01-15 10:30:00                           │   │
│  │ [Generate Now] [View Sitemap]                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Robots.txt Additions                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ ┌─────────────────────────────────────────────────────────┐ │   │
│  │ │# Custom robots.txt rules                               │ │   │
│  │ │Disallow: /private/                                     │ │   │
│  │ │Disallow: /temp/                                        │ │   │
│  │ │                                                        │ │   │
│  │ └─────────────────────────────────────────────────────────┘ │   │
│  │ [Preview robots.txt] [Validate Syntax]                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Sitemap Statistics                          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ Total URLs: 1,234                                           │   │
│  │ Job Posts: 856                                              │   │
│  │ Articles: 234                                               │   │
│  │ Category Pages: 45                                          │   │
│  │ Location Pages: 89                                          │   │
│  │ Other Pages: 10                                             │   │
│  │ Sitemap Size: 45.6 KB                                      │   │
│  │ Last Generation Time: 0.8 seconds                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Save Settings] [Reset to Defaults]                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Steps

### Step 1: Database Setup (2 hours)
1. Create `advertisement_settings` table
2. Create `sitemap_settings` table
3. Create audit log table (optional)
4. Insert default data
5. Create indexes and triggers

### Step 2: API Endpoints (6 hours)
1. Implement GET/PUT `/api/v1/settings/advertisements`
2. Implement GET/PUT `/api/v1/settings/sitemap`
3. Implement GET `/api/v1/sitemap.xml`
4. Add authentication middleware
5. Add validation and error handling
6. Add rate limiting

### Step 3: Admin Interface (8 hours)
1. Create advertisement settings page
2. Create sitemap settings page
3. Implement form handling and validation
4. Add preview functionality
5. Add statistics dashboard
6. Implement responsive design

### Step 4: Testing (4 hours)
1. Unit tests for API endpoints
2. Integration tests with Nexjob frontend
3. UI testing for admin interface
4. Performance testing for sitemap generation
5. Security testing for authentication

### **Total Estimated Effort: 20 hours**

---

## 7. Testing Checklist

### API Testing
- [ ] GET `/api/v1/settings/advertisements` returns correct format
- [ ] PUT `/api/v1/settings/advertisements` accepts valid data
- [ ] PUT `/api/v1/settings/advertisements` rejects invalid data with proper errors
- [ ] GET `/api/v1/settings/sitemap` returns correct format
- [ ] PUT `/api/v1/settings/sitemap` accepts valid data
- [ ] GET `/api/v1/sitemap.xml` returns valid XML
- [ ] Authentication works with valid API tokens
- [ ] Authentication fails with invalid/missing tokens
- [ ] Rate limiting prevents abuse
- [ ] CORS headers allow Nexjob frontend access

### Integration Testing
- [ ] Nexjob can fetch advertisement settings from CMS
- [ ] Advertisement codes display correctly on Nexjob
- [ ] Popup ads work according to settings
- [ ] Sitemap middleware can fetch XML from CMS
- [ ] Settings changes reflect immediately in Nexjob
- [ ] Caching works correctly (30-minute TTL)
- [ ] Error handling works when CMS is unavailable

### Admin Interface Testing
- [ ] Advertisement form saves correctly
- [ ] Sitemap form saves correctly
- [ ] Preview functionality works
- [ ] Validation prevents invalid data
- [ ] Responsive design works on mobile
- [ ] Statistics display correctly
- [ ] Error messages are user-friendly

---

## 8. Deployment Instructions

### Prerequisites
1. CMS backend with database access
2. API authentication system
3. Admin user interface framework
4. SSL certificate for HTTPS

### Deployment Steps
1. **Database Migration**:
   ```bash
   # Run database migration scripts
   psql -d cms_database -f migration_001_advertisement_settings.sql
   psql -d cms_database -f migration_002_sitemap_settings.sql
   ```

2. **API Deployment**:
   ```bash
   # Deploy API endpoints
   cp api/settings/* /var/www/cms/api/v1/settings/
   
   # Update API routes
   php artisan route:cache
   ```

3. **Admin Interface**:
   ```bash
   # Deploy admin interface files
   cp admin/advertisements.php /var/www/cms/admin/
   cp admin/sitemap.php /var/www/cms/admin/
   
   # Update admin navigation
   # Add menu items for new settings pages
   ```

4. **Configuration**:
   ```bash
   # Set environment variables
   echo "CMS_API_TOKEN=your-secure-token" >> .env
   echo "SITEMAP_CACHE_TTL=300" >> .env
   ```

5. **Testing**:
   ```bash
   # Test API endpoints
   curl -H "Authorization: Bearer token" https://cms.nexjob.tech/api/v1/settings/advertisements
   
   # Test sitemap generation
   curl https://cms.nexjob.tech/api/v1/sitemap.xml
   ```

---

## 9. Monitoring & Maintenance

### Performance Monitoring
- Monitor API response times (target: <200ms)
- Monitor sitemap generation time (target: <500ms)
- Monitor database query performance
- Monitor cache hit rates

### Error Monitoring
- Log API authentication failures
- Log validation errors
- Log sitemap generation failures
- Monitor 4xx/5xx error rates

### Maintenance Tasks
- Regular database cleanup of audit logs
- Monitor and rotate API tokens
- Update sitemap generation logic as needed
- Review and optimize database indexes

---

## 10. Security Considerations

### API Security
- Use strong, randomly generated API tokens
- Implement rate limiting (60 requests/minute)
- Validate and sanitize all input data
- Use HTTPS for all API communications
- Log authentication attempts

### Data Security
- Sanitize HTML/JavaScript in ad codes
- Validate robots.txt syntax
- Prevent SQL injection in database queries
- Implement proper error handling (don't expose internals)

### Admin Interface Security
- Implement CSRF protection
- Use secure session management
- Validate user permissions
- Sanitize output to prevent XSS

---

This comprehensive documentation provides everything needed to implement the CMS backend features required for the Nexjob migration. The estimated 20-hour implementation will provide a robust, secure, and maintainable solution for managing advertisements and sitemaps centrally in the CMS.