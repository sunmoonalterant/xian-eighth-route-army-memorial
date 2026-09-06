const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api'

export function toDisplayImageUrl(value, baseUrl = apiBaseUrl) {
  if (!value || typeof value !== 'string') return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('/images/')) return value
  if (value.startsWith('/uploads/')) {
    try { return new URL(value, new URL(baseUrl).origin).toString() } catch { return value }
  }
  return value
}
