const sanitizeHtml = require('sanitize-html')
const { createHttpError } = require('./httpError')

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function nullableText(value, field, maxLength) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') throw createHttpError(400, `${field} must be text`)
  const normalized = value.trim()
  if (normalized.length > maxLength) throw createHttpError(400, `${field} is too long`)
  return normalized || null
}

function requiredText(value, field, maxLength) {
  const normalized = nullableText(value, field, maxLength)
  if (!normalized) throw createHttpError(400, `${field} is required`)
  return normalized
}

function sanitizeContent(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') throw createHttpError(400, 'content must be text')
  if (value.length > 100000) throw createHttpError(400, 'content is too long')
  return sanitizeHtml(value, {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote'],
    allowedAttributes: {},
    allowedSchemes: ['http', 'https'],
  }).trim() || null
}

function parseOptionalUrl(value, field) {
  const url = nullableText(value, field, 500)
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol')
    return parsed.toString()
  } catch {
    throw createHttpError(400, `${field} must be a valid http or https URL`)
  }
}

function parseOptionalCoverImage(value) {
  const image = nullableText(value, 'coverImage', 500)
  if (!image) return null
  if (/^\/images\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(image) && !image.includes('..')) return image
  return parseOptionalUrl(image, 'coverImage')
}

function parseOptionalId(value, field) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1) throw createHttpError(400, `${field} must be a positive integer`)
  return number
}

function parseOptionalDate(value, field) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) throw createHttpError(400, `${field} must use YYYY-MM-DD format`)
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw createHttpError(400, `${field} must use YYYY-MM-DD format`)
  }
  return value
}

function normalizeStatus(value) {
  if (value === undefined || value === null || value === '') return 1
  const status = Number(value)
  if (![0, 1].includes(status)) throw createHttpError(400, 'status must be 0 or 1')
  return status
}

function validateRelicInput(input = {}) {
  return {
    name: requiredText(input.name, 'name', 200),
    categoryId: parseOptionalId(input.categoryId, 'categoryId'),
    era: nullableText(input.era, 'era', 100),
    summary: nullableText(input.summary, 'summary', 10000),
    content: sanitizeContent(input.content),
    coverImage: parseOptionalCoverImage(input.coverImage),
    sourceUrl: parseOptionalUrl(input.sourceUrl, 'sourceUrl'),
    status: normalizeStatus(input.status),
  }
}

function validateArticleInput(input = {}) {
  return {
    title: requiredText(input.title, 'title', 255),
    categoryId: parseOptionalId(input.categoryId, 'categoryId'),
    summary: nullableText(input.summary, 'summary', 10000),
    content: sanitizeContent(input.content),
    coverImage: parseOptionalCoverImage(input.coverImage),
    publishTime: input.publishTime === undefined || input.publishTime === null || input.publishTime === ''
      ? null
      : (() => {
          const date = new Date(input.publishTime)
          if (Number.isNaN(date.getTime())) throw createHttpError(400, 'publishTime is invalid')
          return date
        })(),
    sourceUrl: parseOptionalUrl(input.sourceUrl, 'sourceUrl'),
    status: normalizeStatus(input.status),
  }
}

function validateExhibitionInput(input = {}) {
  const startDate = parseOptionalDate(input.startDate, 'startDate')
  const endDate = parseOptionalDate(input.endDate, 'endDate')
  if (startDate && endDate && endDate < startDate) throw createHttpError(400, 'endDate must be on or after startDate')
  return {
    title: requiredText(input.title, 'title', 200),
    category: nullableText(input.category, 'category', 100),
    summary: nullableText(input.summary, 'summary', 10000),
    content: sanitizeContent(input.content),
    coverImage: parseOptionalCoverImage(input.coverImage),
    startDate,
    endDate,
    sourceUrl: parseOptionalUrl(input.sourceUrl, 'sourceUrl'),
    status: normalizeStatus(input.status),
  }
}

module.exports = {
  normalizeStatus,
  parseOptionalDate,
  parseOptionalCoverImage,
  parseOptionalId,
  parseOptionalUrl,
  sanitizeContent,
  validateArticleInput,
  validateExhibitionInput,
  validateRelicInput,
}
