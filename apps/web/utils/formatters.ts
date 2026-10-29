/**
 * Format date string into terminal style DD.MM.YYYY
 */
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '00.00.0000';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '00.00.0000';

  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '.');
};

/**
 * Calculate estimated reading time in minutes from HTML body text
 */
export const calculateReadingTime = (body: string | undefined): number => {
  if (!body) return 1;
  const text = body.replace(/<[^>]*>/g, '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};
