const assert = require('node:assert/strict')
const { test } = require('node:test')
const jwt = require('jsonwebtoken')

const {
  createMediaValidationError,
  normalizeMediaMetadata,
  toPublicMediaAsset,
} = require('../src/utils/mediaAsset')
const { validateImageUpload } = require('../src/utils/imageUpload')
const { buildUploadPath } = require('../src/utils/mediaStorage')
const { migrateMediaAssets } = require('../scripts/migrateMediaAssets')
const { createApp } = require('../src/app')

test('normalizes verified portrait metadata for a person', () => {
  assert.deepEqual(normalizeMediaMetadata('person', {
    usageType: 'portrait',
    publisher: '课程设计本地资料',
    sourcePageUrl: 'https://example.org/person',
    caption: '人物历史照片',
    identityEvidence: '来源页面明确说明人物身份',
    personPosition: '左三',
    reviewStatus: 'verified',
    status: 1,
  }), {
    usageType: 'portrait',
    publisher: '课程设计本地资料',
    sourceImageUrl: null,
    sourcePageUrl: 'https://example.org/person',
    caption: '人物历史照片',
    identityEvidence: '来源页面明确说明人物身份',
    personPosition: '左三',
    sortOrder: 0,
    reviewStatus: 'verified',
    status: 1,
  })
})

test('rejects an exhibition-only gallery usage for a person', () => {
  assert.throws(() => normalizeMediaMetadata('person', { usageType: 'gallery' }), createMediaValidationError('usageType is invalid for person'))
})

test('normalizes gallery metadata for a relic and content metadata for an article', () => {
  assert.equal(normalizeMediaMetadata('relic', { usageType: 'gallery' }).usageType, 'gallery')
  assert.equal(normalizeMediaMetadata('article', { usageType: 'content' }).usageType, 'content')
})

test('serializes verified relic and article upload paths for the visitor contract', () => {
  assert.deepEqual(toPublicMediaAsset({ local_path: '/uploads/relics/relic-1.jpg', caption: '文物图片', review_status: 'verified', status: 1 }), { url: '/uploads/relics/relic-1.jpg', caption: '文物图片' })
  assert.deepEqual(toPublicMediaAsset({ local_path: '/uploads/news/article-1.webp', caption: '新闻图片', review_status: 'verified', status: 1 }), { url: '/uploads/news/article-1.webp', caption: '新闻图片' })
})

test('generates server-controlled directories for relic and article uploads', () => {
  assert.match(buildUploadPath('relic', 12, 'jpg'), /^\/uploads\/relics\/12-[a-f0-9-]+\.jpg$/)
  assert.match(buildUploadPath('article', 5, 'webp'), /^\/uploads\/news\/5-[a-f0-9-]+\.webp$/)
})

test('rejects pending images from the visitor contract', () => {
  assert.equal(toPublicMediaAsset({ local_path: '/uploads/people/person-1.jpg', caption: '待核实', review_status: 'pending', status: 1 }), null)
})

test('serializes verified public images without exposing filesystem paths', () => {
  assert.deepEqual(toPublicMediaAsset({ local_path: '/uploads/people/person-1.jpg', caption: '人物照片', review_status: 'verified', status: 1 }), {
    url: '/uploads/people/person-1.jpg',
    caption: '人物照片',
  })
})

test('rejects traversal-shaped local paths before physical deletion', () => {
  assert.throws(() => toPublicMediaAsset({ local_path: '/uploads/../.env', caption: null, review_status: 'verified', status: 1 }), createMediaValidationError('localPath is invalid'))
})

test('accepts a PNG only when extension, claimed MIME type and binary signature agree', () => {
  const file = {
    originalname: 'portrait.png',
    mimetype: 'image/png',
    size: 8,
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  }
  assert.equal(validateImageUpload(file).extension, 'png')
})

test('rejects a file when MIME type and image binary signature disagree', () => {
  const file = {
    originalname: 'portrait.jpg',
    mimetype: 'image/jpeg',
    size: 8,
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  }
  assert.throws(() => validateImageUpload(file), createMediaValidationError('file MIME type does not match image content'))
})

test('rejects files larger than eight megabytes before persistence', () => {
  const file = { originalname: 'portrait.webp', mimetype: 'image/webp', size: 8 * 1024 * 1024 + 1, buffer: Buffer.alloc(12) }
  assert.throws(() => validateImageUpload(file), createMediaValidationError('file is too large'))
})

test('creates the media resource table with entity and local path indexes', async () => {
  const calls = []
  const pool = { async query(sql) { calls.push(sql); return [[]] } }
  assert.deepEqual(await migrateMediaAssets(pool), { mediaAssetTableReady: true })
  assert.match(calls[0], /CREATE TABLE IF NOT EXISTS `media_asset`/)
  assert.match(calls[0], /idx_media_asset_entity/)
  assert.match(calls[0], /idx_media_asset_local_path/)
})

test('rejects unauthenticated access to administrator image routes', async () => {
  const app = createApp({ pool: { query: async () => { throw new Error('database must not be queried') } } })
  const server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)) })
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/people/1/images`)
    assert.equal(response.status, 401)
  } finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) }
})

test('lists relic media through the authenticated unified media route', async () => {
  const previousSecret = process.env.JWT_SECRET
  process.env.JWT_SECRET = 'test-media-secret'
  const pool = {
    async query(sql) {
      if (sql.includes('FROM `relic`')) return [[{ id: 1 }]]
      if (sql.includes('FROM `media_asset`')) return [[]]
      throw new Error(`unexpected query: ${sql}`)
    },
  }
  const app = createApp({ pool })
  const server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)) })
  try {
    const token = jwt.sign({ adminId: 1, username: 'admin' }, process.env.JWT_SECRET)
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/relics/1/images`, { headers: { authorization: `Bearer ${token}` } })
    assert.equal(response.status, 200)
    assert.deepEqual((await response.json()).data, [])
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    if (previousSecret === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = previousSecret
  }
})
