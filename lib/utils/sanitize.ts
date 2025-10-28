import DOMPurify from 'isomorphic-dompurify';

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

  const config: any = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  };

  if (!allowExternalLinks) {
    config.ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;
  }

  const sanitized = DOMPurify.sanitize(html, config);
  
  return String(sanitized);
};

export const sanitizePlainText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
};

export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const parsed = new URL(url, window?.location?.origin || 'https://nexjob.tech');
    
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href;
    }
    
    return '';
  } catch {
    return '';
  }
};
