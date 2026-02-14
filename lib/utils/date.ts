export const formatRelativeDate = (dateStr?: string): string => {
  if (!dateStr) return 'Baru saja';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    if (diffHours === 1) return '1 jam lalu';
    return `${diffHours} jam lalu`;
  }

  if (diffDays === 1) return '1 hari lalu';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu lalu`;
  return `${Math.ceil(diffDays / 30)} bulan lalu`;
};

/**
 * Format a date for job cards/detail pages with "Dipublikasikan" prefix.
 * Returns "Baru dipublikasikan" for missing dates.
 */
export const formatJobDate = (dateStr?: string): string => {
  if (!dateStr) return 'Baru dipublikasikan';
  return `Dipublikasikan ${formatRelativeDate(dateStr)}`;
};

export const formatFullDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** Format a date as "15 Januari 2024" (Indonesian locale, date only). */
export const formatArticleDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const isHotJob = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours <= 12;
};

export const getHoursAgo = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};
