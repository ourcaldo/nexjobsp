import { sanitizeHTML, sanitizePlainText, sanitizeURL } from '../sanitize';

describe('sanitizeHTML', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeHTML('')).toBe('');
    expect(sanitizeHTML(null as any)).toBe('');
    expect(sanitizeHTML(undefined as any)).toBe('');
    expect(sanitizeHTML(123 as any)).toBe('');
  });

  it('preserves allowed HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHTML(html)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('strips disallowed tags', () => {
    const html = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHTML(html)).toBe('<p>Hello</p>');
  });

  it('preserves allowed attributes', () => {
    const html = '<a href="https://example.com" target="_blank">Link</a>';
    const result = sanitizeHTML(html);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
  });

  it('strips disallowed attributes like style', () => {
    const html = '<p style="color:red" class="text">Hello</p>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('style=');
    expect(result).toContain('class="text"');
  });

  it('strips javascript: URLs', () => {
    const html = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('javascript:');
  });

  it('allows mailto: and tel: schemes', () => {
    const html = '<a href="mailto:test@test.com">Email</a>';
    const result = sanitizeHTML(html);
    expect(result).toContain('mailto:test@test.com');
  });

  it('strips mailto/tel when allowExternalLinks is false', () => {
    const html = '<a href="mailto:test@test.com">Email</a>';
    const result = sanitizeHTML(html, { allowExternalLinks: false });
    expect(result).not.toContain('mailto:');
  });

  it('accepts custom allowed tags', () => {
    const html = '<p>Hello</p><div>World</div>';
    const result = sanitizeHTML(html, { allowedTags: ['p'] });
    expect(result).toBe('<p>Hello</p>World');
  });

  it('handles nested tags correctly', () => {
    const html = '<ul><li><strong>Item 1</strong></li><li>Item 2</li></ul>';
    expect(sanitizeHTML(html)).toContain('<ul>');
    expect(sanitizeHTML(html)).toContain('<li>');
    expect(sanitizeHTML(html)).toContain('<strong>');
  });

  it('strips iframe, object, embed, form tags', () => {
    const html = '<iframe src="https://evil.com"></iframe><object data="x"></object>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('<object');
  });

  it('strips event handler attributes', () => {
    const html = '<img src="x.jpg" onerror="alert(1)" alt="test" />';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('onerror');
  });

  it('preserves image tags with allowed attributes', () => {
    const html = '<img src="https://example.com/img.jpg" alt="photo" width="200" />';
    const result = sanitizeHTML(html);
    expect(result).toContain('src="https://example.com/img.jpg"');
    expect(result).toContain('alt="photo"');
  });
});

describe('sanitizePlainText', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizePlainText('')).toBe('');
    expect(sanitizePlainText(null as any)).toBe('');
    expect(sanitizePlainText(undefined as any)).toBe('');
  });

  it('strips all HTML tags', () => {
    expect(sanitizePlainText('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('strips script tags and content', () => {
    const result = sanitizePlainText('<script>alert("xss")</script>Safe text');
    expect(result).not.toContain('<script');
    expect(result).toContain('Safe text');
  });

  it('preserves plain text', () => {
    expect(sanitizePlainText('Just text')).toBe('Just text');
  });

  it('decodes HTML entities', () => {
    expect(sanitizePlainText('&amp; &lt; &gt;')).toBe('&amp; &lt; &gt;');
  });
});

describe('sanitizeURL', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeURL('')).toBe('');
    expect(sanitizeURL(null as any)).toBe('');
    expect(sanitizeURL(undefined as any)).toBe('');
  });

  it('allows https URLs', () => {
    expect(sanitizeURL('https://example.com/path')).toBe('https://example.com/path');
  });

  it('allows http URLs', () => {
    expect(sanitizeURL('http://example.com')).toBe('http://example.com/');
  });

  it('allows mailto URLs', () => {
    expect(sanitizeURL('mailto:test@test.com')).toBe('mailto:test@test.com');
  });

  it('allows tel URLs', () => {
    expect(sanitizeURL('tel:+628123456789')).toBe('tel:+628123456789');
  });

  it('blocks javascript: URLs', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('');
  });

  it('blocks data: URLs', () => {
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('handles relative URLs by resolving against base', () => {
    const result = sanitizeURL('/some/path');
    expect(result).toContain('/some/path');
  });

  it('blocks ftp: URLs', () => {
    expect(sanitizeURL('ftp://files.example.com/secret')).toBe('');
  });
});
