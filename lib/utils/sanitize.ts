// TODO: Add unit test coverage (see audit E-11)
/**
 * HTML Sanitization Utility
 * 
 * Security Strategy:
 * - Uses sanitize-html for both server-side and client-side sanitization
 * - Prevents XSS attacks in both SSR and client-side rendering
 * - No jsdom dependency issues on the server
 * - Consistent sanitization across environments
 */

import sanitizeHtml from 'sanitize-html';

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
  'width', 'height', 'align'
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
    return '';
  }
};

export const sanitizePlainText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

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
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech');
    const parsed = new URL(url, baseUrl);
    
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href;
    }
    
    return '';
  } catch {
    return '';
  }
};
