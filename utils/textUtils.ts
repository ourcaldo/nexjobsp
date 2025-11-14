export function toTitleCase(text: string): string {
  if (!text) return '';
  
  const lowercaseWords = ['di', 'dan', 'atau', 'ke', 'dari', 'untuk'];
  const preserveCase = ['kab.', 'kota', 'adm.'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      
      if (preserveCase.includes(lowerWord)) {
        if (lowerWord === 'kab.') return 'Kab.';
        if (lowerWord === 'kota') return 'Kota';
        if (lowerWord === 'adm.') return 'Adm.';
      }
      
      if (index > 0 && lowercaseWords.includes(lowerWord)) {
        return lowerWord;
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function formatLocationName(location: string): string {
  if (!location || typeof location !== 'string') return '';
  
  const trimmed = location.trim();
  if (!trimmed) return '';
  
  if (/^[A-Z\s.-]+$/.test(trimmed)) {
    return toTitleCase(trimmed);
  }
  
  return trimmed;
}

export function normalizeSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSlugForMatching(text: string): string {
  return normalizeSlug(text).replace(/\s+/g, '-');
}

export function locationToSlug(location: string): string {
  if (!location || typeof location !== 'string') return '';
  
  const trimmed = location.trim();
  if (!trimmed) return '';
  
  return normalizeSlugForMatching(trimmed);
}
