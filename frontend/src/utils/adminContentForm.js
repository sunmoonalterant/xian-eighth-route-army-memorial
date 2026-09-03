export function buildListParams(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

export function validateRequiredTitle(value) { return typeof value === 'string' && value.trim().length > 0 }

export function validateHttpUrl(value) {
  if (!value) return true
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

export function validateCoverImageUrl(value) {
  if (!value) return true
  return /^\/images\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) && !value.includes('..')
    ? true
    : validateHttpUrl(value)
}

export function validateExhibitionDates(startDate, endDate) { return !startDate || !endDate || endDate >= startDate }

export function isSourceBacked(record) { return Boolean(record?.sourceUrl || record?.sourceApiId) }
