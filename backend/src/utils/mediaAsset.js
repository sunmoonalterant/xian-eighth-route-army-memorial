const ENTITY_USAGE_TYPES = {
  person: new Set(['portrait', 'historical']),
  relic: new Set(['cover', 'gallery']),
  article: new Set(['cover', 'content']),
  exhibition: new Set(['cover', 'gallery']),
  history_event: new Set(['cover', 'historical', 'document']),
  courtyard: new Set(['cover', 'historical', 'building', 'gallery']),
  digital_museum: new Set(['map']),
}

const REVIEW_STATUSES = new Set(['pending', 'verified', 'rejected'])
const UPLOAD_PATH_PATTERN = /^\/uploads\/(people|relics|news|exhibitions|history|courtyards|digital-museum)\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|webp)$/i

function createMediaValidationError(message) {
  const error = new Error(message)
  error.status = 400
  error.code = 'MEDIA_VALIDATION_ERROR'
  return error
}

function nullableText(value, field, limit = 5000) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') throw createMediaValidationError(`${field} must be text`)
  const normalized = value.trim()
  if (normalized.length > limit) throw createMediaValidationError(`${field} is too long`)
  return normalized || null
}

function nullableHttpUrl(value, field) {
  const normalized = nullableText(value, field, 500)
  if (!normalized) return null
  try {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
    return url.toString()
  } catch {
    throw createMediaValidationError(`${field} must be a valid http or https URL`)
  }
}

function normalizeMediaMetadata(entityType, input = {}) {
  if (!ENTITY_USAGE_TYPES[entityType]) throw createMediaValidationError('entityType is invalid')
  const usageType = nullableText(input.usageType, 'usageType', 20)
  if (!usageType || !ENTITY_USAGE_TYPES[entityType].has(usageType)) {
    throw createMediaValidationError(`usageType is invalid for ${entityType}`)
  }

  const reviewStatus = input.reviewStatus === undefined || input.reviewStatus === '' ? 'pending' : input.reviewStatus
  if (!REVIEW_STATUSES.has(reviewStatus)) throw createMediaValidationError('reviewStatus is invalid')
  const status = input.status === undefined || input.status === '' ? 1 : Number(input.status)
  if (![0, 1].includes(status)) throw createMediaValidationError('status must be 0 or 1')
  const sortOrder = input.sortOrder === undefined || input.sortOrder === '' ? 0 : Number(input.sortOrder)
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) throw createMediaValidationError('sortOrder must be a non-negative integer')

  return {
    usageType,
    publisher: nullableText(input.publisher, 'publisher', 200),
    sourceImageUrl: nullableHttpUrl(input.sourceImageUrl, 'sourceImageUrl'),
    sourcePageUrl: nullableHttpUrl(input.sourcePageUrl, 'sourcePageUrl'),
    caption: nullableText(input.caption, 'caption', 1000),
    identityEvidence: nullableText(input.identityEvidence, 'identityEvidence', 2000),
    personPosition: nullableText(input.personPosition, 'personPosition', 100),
    sortOrder,
    reviewStatus,
    status,
  }
}

function assertUploadPath(localPath) {
  if (typeof localPath !== 'string' || !UPLOAD_PATH_PATTERN.test(localPath)) {
    throw createMediaValidationError('localPath is invalid')
  }
  return localPath
}

function toPublicMediaAsset(record) {
  const localPath = assertUploadPath(record.local_path)
  if (record.review_status !== 'verified' || Number(record.status) !== 1) return null
  return { url: localPath, caption: record.caption || null }
}

module.exports = {
  ENTITY_USAGE_TYPES,
  REVIEW_STATUSES,
  assertUploadPath,
  createMediaValidationError,
  normalizeMediaMetadata,
  toPublicMediaAsset,
}
