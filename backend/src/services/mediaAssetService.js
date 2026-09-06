const mediaAssetModel = require('../models/mediaAssetModel')
const { createHttpError } = require('../utils/httpError')
const { validateImageUpload } = require('../utils/imageUpload')
const { normalizeMediaMetadata, toPublicMediaAsset } = require('../utils/mediaAsset')
const { removeUpload, writeUpload } = require('../utils/mediaStorage')

function toAdminAsset(record) {
  return { id: record.id, entityType: record.entity_type, entityId: record.entity_id, usageType: record.usage_type, localPath: record.local_path, sourceImageUrl: record.source_image_url, sourcePageUrl: record.source_page_url, publisher: record.publisher, caption: record.caption, identityEvidence: record.identity_evidence, personPosition: record.person_position, sortOrder: record.sort_order, reviewStatus: record.review_status, status: Number(record.status), createdAt: record.created_at, updatedAt: record.updated_at }
}

function recordToInput(record, input) {
  return { usageType: input.usageType ?? record.usage_type, publisher: input.publisher ?? record.publisher, sourceImageUrl: input.sourceImageUrl ?? record.source_image_url, sourcePageUrl: input.sourcePageUrl ?? record.source_page_url, caption: input.caption ?? record.caption, identityEvidence: input.identityEvidence ?? record.identity_evidence, personPosition: input.personPosition ?? record.person_position, sortOrder: input.sortOrder ?? record.sort_order, reviewStatus: input.reviewStatus ?? record.review_status, status: input.status ?? record.status }
}

async function listAdminAssets(pool, entityType, entityId) {
  if (!await mediaAssetModel.entityExists(pool, entityType, entityId)) throw createHttpError(404, `${entityType} not found`)
  return (await mediaAssetModel.findByEntity(pool, entityType, entityId)).map(toAdminAsset)
}

async function addAsset(pool, entityType, entityId, file, metadata) {
  if (!await mediaAssetModel.entityExists(pool, entityType, entityId)) throw createHttpError(404, `${entityType} not found`)
  const input = normalizeMediaMetadata(entityType, metadata)
  const upload = validateImageUpload(file)
  const localPath = await writeUpload(entityType, entityId, upload.extension, file.buffer)
  try {
    if (['relic', 'article', 'exhibition'].includes(entityType) && input.usageType === 'cover' && input.status === 1) await mediaAssetModel.hideOtherCovers(pool, entityType, entityId)
    return toAdminAsset(await mediaAssetModel.insert(pool, entityType, entityId, localPath, input))
  } catch (error) { await removeUpload(localPath); throw error }
}

async function updateAsset(pool, entityType, entityId, imageId, metadata) {
  const record = await mediaAssetModel.findById(pool, imageId)
  if (!record || record.entity_type !== entityType || Number(record.entity_id) !== Number(entityId)) throw createHttpError(404, 'image not found')
  const input = normalizeMediaMetadata(entityType, recordToInput(record, metadata))
  if (['relic', 'article', 'exhibition'].includes(entityType) && input.usageType === 'cover' && input.status === 1) await mediaAssetModel.hideOtherCovers(pool, entityType, entityId, imageId)
  return toAdminAsset(await mediaAssetModel.update(pool, imageId, input))
}

async function removeAsset(pool, entityType, entityId, imageId) {
  const record = await mediaAssetModel.findById(pool, imageId)
  if (!record || record.entity_type !== entityType || Number(record.entity_id) !== Number(entityId)) throw createHttpError(404, 'image not found')
  await mediaAssetModel.remove(pool, imageId)
  if (!await mediaAssetModel.localPathIsUsed(pool, record.local_path)) await removeUpload(record.local_path)
  return { id: Number(imageId), removed: true }
}

async function getPublicAssets(pool, entityType, entityId) {
  return (await mediaAssetModel.findByEntity(pool, entityType, entityId, { publicOnly: true })).map((record) => {
    const asset = toPublicMediaAsset(record)
    return asset ? { ...asset, usageType: record.usage_type } : null
  }).filter(Boolean)
}

async function applyPublicMedia(pool, entityType, entity) {
  const assets = await getPublicAssets(pool, entityType, entity.id)
  const cover = assets.find((asset) => asset.usageType === 'cover')
  const relatedUsage = entityType === 'article' ? 'content' : 'gallery'
  const relatedImages = assets
    .filter((asset) => asset.usageType === relatedUsage)
    .map(({ url, caption }) => ({ url, caption }))
  const relatedField = entityType === 'article' ? 'contentImages' : 'galleryImages'
  return { ...entity, coverImage: cover?.url || entity.coverImage, [relatedField]: relatedImages }
}

module.exports = { addAsset, applyPublicMedia, getPublicAssets, listAdminAssets, removeAsset, toAdminAsset, updateAsset }
