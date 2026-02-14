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

export interface LocationLookup {
  provinceName: string;
  regencyName: string;
}

export function getLocationNamesFromIds(
  provinceId: string | null | undefined,
  regencyId: string | null | undefined,
  provinces: Array<{ id: string; name: string; post_count?: number }>,
  regencies: Array<{ id: string; name: string; province_id: string; post_count?: number }>
): LocationLookup {
  let provinceName = '';
  let regencyName = '';

  if (provinceId) {
    const province = provinces.find(p => p.id === provinceId);
    if (province) {
      provinceName = formatLocationName(province.name);
    }
  }

  if (regencyId) {
    const regency = regencies.find(r => r.id === regencyId);
    if (regency) {
      regencyName = formatLocationName(regency.name);
    }
  }

  return { provinceName, regencyName };
}
