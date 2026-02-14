import { toTitleCase, formatLocationName, normalizeSlug, normalizeSlugForMatching, locationToSlug } from '../textUtils';

describe('toTitleCase', () => {
  it('converts uppercase text to title case', () => {
    expect(toTitleCase('JAWA BARAT')).toBe('Jawa Barat');
  });

  it('keeps Indonesian lowercase words in the middle', () => {
    expect(toTitleCase('KOTA ADMINISTRASI JAKARTA PUSAT')).toContain('Jakarta');
  });

  it('handles empty string', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('preserves special words like Kab.', () => {
    expect(toTitleCase('KAB. BANDUNG')).toBe('Kab. Bandung');
  });
});

describe('formatLocationName', () => {
  it('formats uppercase location', () => {
    expect(formatLocationName('JAWA BARAT')).toBe('Jawa Barat');
  });

  it('handles empty string', () => {
    expect(formatLocationName('')).toBe('');
  });

  it('returns already-formatted text unchanged', () => {
    expect(formatLocationName('Jakarta')).toBe('Jakarta');
  });
});

describe('normalizeSlug', () => {
  it('lowercases and trims', () => {
    expect(normalizeSlug('Hello World')).toBe('hello world');
  });

  it('removes special characters', () => {
    expect(normalizeSlug('Hello, World!')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(normalizeSlug('')).toBe('');
  });
});

describe('normalizeSlugForMatching', () => {
  it('replaces spaces with hyphens', () => {
    expect(normalizeSlugForMatching('Hello World')).toBe('hello-world');
  });
});

describe('locationToSlug', () => {
  it('converts location to slug format', () => {
    expect(locationToSlug('JAWA BARAT')).toBe('jawa-barat');
  });

  it('handles empty string', () => {
    expect(locationToSlug('')).toBe('');
  });
});
