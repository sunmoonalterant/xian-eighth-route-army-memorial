const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const { assertUploadPath, createMediaValidationError } = require('./mediaAsset')

const uploadsRoot = path.resolve(__dirname, '../../uploads')
const directoryByEntity = { person: 'people', relic: 'relics', article: 'news', exhibition: 'exhibitions', history_event: 'history', courtyard: 'courtyards', digital_museum: 'digital-museum' }

function buildUploadPath(entityType, entityId, extension) {
  const directory = directoryByEntity[entityType]
  if (!directory) throw createMediaValidationError('entityType is invalid')
  return `/uploads/${directory}/${entityId}-${crypto.randomUUID()}.${extension}`
}

function filesystemPath(localPath) {
  assertUploadPath(localPath)
  const target = path.resolve(uploadsRoot, `.${localPath.slice('/uploads'.length)}`)
  if (!target.startsWith(`${uploadsRoot}${path.sep}`)) throw createMediaValidationError('localPath is invalid')
  return target
}

async function writeUpload(entityType, entityId, extension, buffer) {
  const localPath = buildUploadPath(entityType, entityId, extension)
  const target = filesystemPath(localPath)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, buffer, { flag: 'wx' })
  return localPath
}

async function removeUpload(localPath) {
  const target = filesystemPath(localPath)
  try { await fs.unlink(target) } catch (error) { if (error.code !== 'ENOENT') throw error }
}

module.exports = { buildUploadPath, filesystemPath, removeUpload, uploadsRoot, writeUpload }
