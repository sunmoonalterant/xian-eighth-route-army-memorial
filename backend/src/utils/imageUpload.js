const path = require('node:path')
const { createMediaValidationError } = require('./mediaAsset')

const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const MIME_BY_EXTENSION = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

function detectImageMime(buffer) {
  if (!Buffer.isBuffer(buffer)) return null
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

function validateImageUpload(file) {
  if (!file || !file.originalname || !file.mimetype || !Buffer.isBuffer(file.buffer)) throw createMediaValidationError('image file is required')
  if (Number(file.size) > MAX_IMAGE_SIZE) throw createMediaValidationError('file is too large')
  const extension = path.extname(file.originalname).slice(1).toLowerCase()
  const expectedMime = MIME_BY_EXTENSION[extension]
  if (!expectedMime) throw createMediaValidationError('file extension is not allowed')
  if (file.mimetype !== expectedMime) throw createMediaValidationError('file MIME type is not allowed')
  if (detectImageMime(file.buffer) !== expectedMime) throw createMediaValidationError('file MIME type does not match image content')
  return { extension, mimeType: expectedMime }
}

module.exports = { MAX_IMAGE_SIZE, MIME_BY_EXTENSION, detectImageMime, validateImageUpload }
