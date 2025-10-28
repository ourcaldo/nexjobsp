export interface XMLValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateXML = (xmlString: string): XMLValidationResult => {
  if (!xmlString || typeof xmlString !== 'string') {
    return { isValid: false, error: 'Invalid input: XML string is required' };
  }

  if (xmlString.trim().length === 0) {
    return { isValid: false, error: 'Invalid input: XML string is empty' };
  }

  try {
    if (typeof DOMParser === 'undefined') {
      return { isValid: true };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { 
        isValid: false, 
        error: `XML parsing error: ${parseError.textContent || 'Unknown parse error'}` 
      };
    }

    if (!doc.documentElement) {
      return { isValid: false, error: 'Invalid XML: No document element found' };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: `XML validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const validateSitemapXML = (xmlString: string): XMLValidationResult => {
  const basicValidation = validateXML(xmlString);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  if (!xmlString.includes('<urlset') && !xmlString.includes('<sitemapindex')) {
    return { 
      isValid: false, 
      error: 'Invalid sitemap: Must contain <urlset> or <sitemapindex> root element' 
    };
  }

  const maliciousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(xmlString)) {
      return { 
        isValid: false, 
        error: 'Invalid sitemap: Potentially malicious content detected' 
      };
    }
  }

  return { isValid: true };
};

export const sanitizeSitemapXML = (xmlString: string): string => {
  if (!xmlString || typeof xmlString !== 'string') {
    return '';
  }

  let sanitized = xmlString.trim();

  const dangerousPatterns = [
    { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, replacement: '' },
    { pattern: /<iframe[^>]*>[\s\S]*?<\/iframe>/gi, replacement: '' },
    { pattern: /<embed[^>]*>/gi, replacement: '' },
    { pattern: /<object[^>]*>[\s\S]*?<\/object>/gi, replacement: '' },
    { pattern: /javascript:/gi, replacement: '' },
    { pattern: /on\w+\s*=/gi, replacement: '' },
  ];

  for (const { pattern, replacement } of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
};
