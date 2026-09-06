const { createHttpError } = require('./httpError')

const PRECISIONS = new Set(['year', 'month', 'day', 'season', 'range', 'unknown'])
const REVIEW_STATUSES = new Set(['pending', 'verified', 'conflict', 'rejected'])

function text(value, field, { required = false, max = 5000 } = {}) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (required && !normalized) throw createHttpError(400, `${field} is required`)
  if (normalized.length > max) throw createHttpError(400, `${field} is too long`)
  return normalized || null
}

function nullableInteger(value, field, min, max) {
  if (value === '' || value === undefined || value === null) return null
  const number = Number(value)
  if (!Number.isInteger(number) || number < min || number > max) throw createHttpError(400, `${field} is invalid`)
  return number
}

function httpUrl(value, field, required = false) {
  const normalized = text(value, field, { required, max: 500 })
  if (!normalized) return null
  try { const url = new URL(normalized); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); return url.toString() } catch { throw createHttpError(400, `${field} must be a valid http or https URL`) }
}

function normalizeHistoryEventInput(body = {}) {
  const timePrecision = text(body.timePrecision, 'timePrecision', { required: true, max: 20 })
  if (!PRECISIONS.has(timePrecision)) throw createHttpError(400, 'timePrecision is invalid')
  const year = nullableInteger(body.year, 'year', 1, 9999)
  const month = nullableInteger(body.month, 'month', 1, 12)
  const day = nullableInteger(body.day, 'day', 1, 31)
  if (['year', 'month', 'day', 'season'].includes(timePrecision) && !year) throw createHttpError(400, 'year is required for the selected timePrecision')
  if (['month', 'day'].includes(timePrecision) && !month) throw createHttpError(400, 'month is required for the selected timePrecision')
  if (timePrecision === 'day' && !day) throw createHttpError(400, 'day is required for the selected timePrecision')
  if (timePrecision !== 'day' && day) throw createHttpError(400, 'day is only allowed when timePrecision is day')
  const reviewStatus = body.reviewStatus || 'pending'
  if (!REVIEW_STATUSES.has(reviewStatus)) throw createHttpError(400, 'reviewStatus is invalid')
  const status = body.status === undefined ? 0 : Number(body.status)
  const isFeatured = body.isFeatured === undefined ? 0 : Number(body.isFeatured)
  if (![0, 1].includes(status) || ![0, 1].includes(isFeatured)) throw createHttpError(400, 'status or isFeatured is invalid')
  const sourceUrl = httpUrl(body.sourceUrl, 'sourceUrl', false)
  if (reviewStatus === 'verified' && !sourceUrl) throw createHttpError(400, 'sourceUrl is required before verification')
  const eventDate = timePrecision === 'day' ? `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
  return { title: text(body.title, 'title', { required: true, max: 200 }), timeText: text(body.timeText, 'timeText', { required: true, max: 100 }), year, month, day, timePrecision, summary: text(body.summary, 'summary', { required: true }), content: text(body.content, 'content'), sourceUrl, sourceName: text(body.sourceName, 'sourceName', { required: true, max: 200 }), evidence: text(body.evidence, 'evidence', { required: true }), reviewStatus, status, isFeatured, sortOrder: nullableInteger(body.sortOrder, 'sortOrder', 0, 999999) || 0, eventDate }
}

function toPublicHistoryEvent(record) {
  if (!record || record.review_status !== 'verified' || Number(record.status) !== 1) return null
  return { id: record.id, timeText: record.time_text, year: record.year, month: record.month, day: record.day, timePrecision: record.time_precision, title: record.title, summary: record.summary, content: record.content, sourceUrl: record.source_url, sourceName: record.source_name, evidence: record.evidence, isFeatured: Number(record.is_featured), sortOrder: Number(record.sort_order), coverImage: record.cover_image || null, galleryImages: record.gallery_images || [] }
}

module.exports = { PRECISIONS, REVIEW_STATUSES, normalizeHistoryEventInput, toPublicHistoryEvent }
