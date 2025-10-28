/**
 * HTML Sanitization Utility
 * 
 * Security Strategy:
 * - Server-side (SSR): Uses sanitize-html (no jsdom dependency, works in Node.js)
 * - Client-side: Uses DOMPurify (native browser APIs, more comprehensive)
 * 
 * This dual approach:
 * 1. Prevents XSS attacks in both SSR and client-side rendering
 * 2. Avoids jsdom initialization errors on the server
 * 3. Provides optimal performance for each environment
 */

import sanitizeHtml from 'sanitize-html';

// Client-side DOMPurify instance (lazy-loaded)
let purifyInstance: any = null;

// Initialize DOMPurify (client-side only)
const initDOMPurify = () => {
  if (purifyInstance) return purifyInstance;
  
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DOMPurify = require('dompurify');
      purifyInstance = DOMPurify;
    } catch (e) {
      return null;
    }
  }
  
  return purifyInstance;
};

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  allowExternalLinks?: boolean;
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span',
  'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 's', 'del',
  'b', 'i', 'mark', 'small', 'sub', 'sup', 'hr'
];

const DEFAULT_ALLOWED_ATTR = [
  'href', 'src', 'alt', 'class', 'id', 'target', 'rel', 'title',
  'width', 'height', 'style', 'align'
];

export const sanitizeHTML = (
  html: string,
  options: SanitizeOptions = {}
): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTR,
    allowExternalLinks = true,
  } = options;

  const DOMPurify = initDOMPurify();
  
  // Client-side: use DOMPurify for comprehensive sanitization
  if (DOMPurify) {
    const config: any = {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      KEEP_CONTENT: true,
      ALLOW_DATA_ATTR: false,
    };

    if (!allowExternalLinks) {
      config.ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;
    }

    try {
      const sanitized = DOMPurify.sanitize(html, config);
      return String(sanitized);
    } catch (e) {
      // Fallback to server-side sanitization if DOMPurify fails
    }
  }

  // Server-side (SSR): use sanitize-html (no jsdom dependency)
  try {
    const sanitized = sanitizeHtml(html, {
      allowedTags: allowedTags,
      allowedAttributes: {
        '*': allowedAttributes
      },
      allowedSchemes: allowExternalLinks 
        ? ['http', 'https', 'mailto', 'tel'] 
        : ['http', 'https'],
    });
    return sanitized;
  } catch (e) {
    // Last resort: return empty string if both sanitizers fail
    return '';
  }
};

export const sanitizePlainText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const DOMPurify = initDOMPurify();
  
  // Client-side: use DOMPurify
  if (DOMPurify) {
    try {
      return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true,
      });
    } catch (e) {
      // Fallback to server-side sanitization
    }
  }

  // Server-side: use sanitize-html to strip all tags
  try {
    return sanitizeHtml(text, {
      allowedTags: [],
      allowedAttributes: {},
    });
  } catch (e) {
    return '';
  }
};

export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const baseUrl = typeof window !== 'undefined' && window.location?.origin 
      ? window.location.origin 
      : 'https://nexjob.tech';
    const parsed = new URL(url, baseUrl);
    
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href;
    }
    
    return '';
  } catch {
    return '';
  }
};
