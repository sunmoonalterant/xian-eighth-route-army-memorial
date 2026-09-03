const assert = require('node:assert/strict')
const { test } = require('node:test')
const { buildCandidates, localizeCandidates, toLocalPath } = require('../scripts/localizeContentImages')

test('image localization assigns deterministic public paths and ignores existing local paths', () => {
  const candidates = buildCandidates([
    { table: 'relic', id: 3, coverImage: 'http://example.test/relic.png' },
    { table: 'article', id: 5, coverImage: '/images/news/news-5-01.jpg' },
  ], {})
  assert.equal(candidates.length, 1)
  assert.equal(candidates[0].localPath, '/images/relics/relic-3-01.png')
  assert.equal(toLocalPath('exhibition', 7, 'https://example.test/picture.JPG'), '/images/exhibitions/exhibition-7-01.JPG')
})

test('dry run never downloads files, writes a manifest, or updates database rows', async () => {
  let downloaded = false
  let updated = false
  const result = await localizeCandidates([{ table: 'article', id: 1, sourceUrl: 'http://example.test/a.jpg', localPath: '/images/news/news-1-01.jpg' }], {
    dryRun: true,
    fetchImpl: async () => { downloaded = true },
    updateCover: async () => { updated = true },
  })
  assert.equal(downloaded, false)
  assert.equal(updated, false)
  assert.equal(result.planned, 1)
})

test('download failure leaves the database value unchanged', async () => {
  let updated = false
  const result = await localizeCandidates([{ table: 'relic', id: 1, sourceUrl: 'http://example.test/a.png', localPath: '/images/relics/relic-1-01.png' }], {
    dryRun: false,
    fetchImpl: async () => ({ ok: false, status: 404, headers: new Headers() }),
    updateCover: async () => { updated = true },
    writeFile: async () => {},
  })
  assert.equal(updated, false)
  assert.equal(result.failed, 1)
})
