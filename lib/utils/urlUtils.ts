export const ensureTrailingSlash = (url: string): string => {
  // Don't add trailing slash to URLs with file extensions or query parameters
  if (url.includes('.') || url.includes('?') || url.includes('#')) {
    return url;
  }
  
  // Don't add trailing slash if it already exists
  if (url.endsWith('/')) {
    return url;
  }
  
  return `${url}/`;
};

export const removeTrailingSlash = (url: string): string => {
  if (url === '/') return url; // Keep root slash
  return url.replace(/\/$/, '');
};

export const normalizeUrl = (url: string): string => {
  return ensureTrailingSlash(url);
};

export const wpCategoryMappings: Record<string, string> = {
  // Add your category mappings here
  // Example: 'teknologi-informasi': 'IT & Technology'
};

export const wpLocationMappings: Record<string, string> = {
  'aceh': '11',
  'sumatera-utara': '12',
  'sumatera-barat': '13',
  'riau': '14',
  'jambi': '15',
  'sumatera-selatan': '16',
  'bengkulu': '17',
  'lampung': '18',
  'kepulauan-bangka-belitung': '19',
  'kepulauan-riau': '21',
  'dki-jakarta': '31',
  'jawa-barat': '32',
  'jawa-tengah': '33',
  'di-yogyakarta': '34',
  'jawa-timur': '35',
  'banten': '36',
  'bali': '51',
  'nusa-tenggara-barat': '52',
  'nusa-tenggara-timur': '53',
  'kalimantan-barat': '61',
  'kalimantan-tengah': '62',
  'kalimantan-selatan': '63',
  'kalimantan-timur': '64',
  'kalimantan-utara': '65',
  'sulawesi-utara': '71',
  'sulawesi-tengah': '72',
  'sulawesi-selatan': '73',
  'sulawesi-tenggara': '74',
  'gorontalo': '75',
  'sulawesi-barat': '76',
  'maluku': '81',
  'maluku-utara': '82',
  'papua': '91',
  'papua-barat': '92',
  'papua-selatan': '93',
  'papua-tengah': '94',
  'papua-pegunungan': '95',
  'papua-barat-daya': '96'
};