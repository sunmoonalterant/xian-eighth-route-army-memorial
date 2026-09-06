const { createHttpError } = require('./httpError')

const REVIEW_STATUSES = new Set(['pending', 'verified', 'conflict', 'rejected'])

function text(value, field, { required = false, max = 5000 } = {}) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (required && !normalized) throw createHttpError(400, `${field} is required`)
  if (normalized.length > max) throw createHttpError(400, `${field} is too long`)
  return normalized || null
}

function optionalUrl(value, field) {
  const normalized = text(value, field, { max: 500 })
  if (!normalized) return null
  try {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol')
    return url.toString()
  } catch { throw createHttpError(400, `${field} must be a valid http or https URL`) }
}

function coordinate(value, field) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 100) throw createHttpError(400, `${field} is invalid`)
  return Number(number.toFixed(2))
}

function aliases(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[，,]/) : []
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))].join('|') || null
}

function normalizeCourtyardInput(body = {}) {
  const reviewStatus = body.reviewStatus || 'pending'
  if (!REVIEW_STATUSES.has(reviewStatus)) throw createHttpError(400, 'reviewStatus is invalid')
  const status = body.status === undefined ? 0 : Number(body.status)
  if (![0, 1].includes(status)) throw createHttpError(400, 'status is invalid')
  const sortOrder = body.sortOrder === undefined || body.sortOrder === '' ? 0 : Number(body.sortOrder)
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) throw createHttpError(400, 'sortOrder is invalid')
  const sourceUrl = optionalUrl(body.sourceUrl, 'sourceUrl')
  if (reviewStatus === 'verified' && !sourceUrl) throw createHttpError(400, 'sourceUrl is required before verification')
  return {
    name: text(body.name, 'name', { required: true, max: 100 }), aliases: aliases(body.aliases),
    summary: text(body.summary, 'summary', { required: true }), content: text(body.content, 'content'),
    historicalUse: text(body.historicalUse, 'historicalUse'), currentUse: text(body.currentUse, 'currentUse'),
    positionX: coordinate(body.positionX, 'positionX'), positionY: coordinate(body.positionY, 'positionY'),
    sourceUrl, sourceName: text(body.sourceName, 'sourceName', { required: true, max: 200 }),
    evidence: text(body.evidence, 'evidence', { required: true }), reviewStatus, status, sortOrder,
  }
}

function toPublicCourtyard(record) {
  if (!record || record.review_status !== 'verified' || Number(record.status) !== 1) return null
  return {
    id: record.id, name: record.name, aliases: record.aliases ? record.aliases.split('|') : [],
    summary: record.description, content: record.content, historicalUse: record.historical_use,
    currentUse: record.current_use, positionX: record.position_x === null ? null : Number(record.position_x),
    positionY: record.position_y === null ? null : Number(record.position_y), coverImage: record.image || null,
    galleryImages: [], sourceUrl: record.source_url, sourceName: record.source_name,
  }
}

module.exports = { REVIEW_STATUSES, normalizeCourtyardInput, toPublicCourtyard }
