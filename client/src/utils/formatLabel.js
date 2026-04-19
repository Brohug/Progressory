export function formatLabel(value) {
  if (!value) return '';

  return String(value)
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatSentenceLabel(value) {
  if (!value) return '';

  const normalized = String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
