const assert = require('node:assert/strict')
const { test } = require('node:test')

const { normalizeHistoryEventInput, toPublicHistoryEvent } = require('../src/utils/historyEvent')
const { parseHistoryFilters } = require('../src/controllers/historyEventController')
const { applyPublicMedia } = require('../src/services/mediaAssetService')

test('keeps a season-only source time without inventing a calendar date', () => {
  const value = normalizeHistoryEventInput({ title: '七贤庄始建', timeText: '1934年冬', timePrecision: 'season', year: 1934, summary: '来源摘要', sourceName: '人民网', sourceUrl: 'https://example.test/source', evidence: '原文证据', reviewStatus: 'verified', status: 1 })
  assert.equal(value.month, null)
  assert.equal(value.day, null)
  assert.equal(value.eventDate, null)
})

test('never serializes pending or conflicted events into the visitor contract', () => {
  const record = { id: 1, time_text: '1937年8月', year: 1937, month: 8, day: null, time_precision: 'month', title: '设立', summary: '摘要', content: null, source_url: 'https://example.test', source_name: '官网', evidence: '原文', review_status: 'conflict', status: 1, is_featured: 1, sort_order: 0 }
  assert.equal(toPublicHistoryEvent(record), null)
})

test('accepts both boolean and select values for the homepage-feature filter', () => {
  assert.equal(parseHistoryFilters({ featured: 'true' }, true).featured, true)
  assert.equal(parseHistoryFilters({ featured: '1' }, true).featured, true)
  assert.equal(parseHistoryFilters({ featured: '0' }, true).featured, false)
})

test('includes verified historical and document images in the visitor gallery', async () => {
  const pool = {
    async query(sql) {
      assert.match(sql, /FROM `media_asset`/)
      return [[
        { local_path: '/uploads/history/1-historical.jpg', caption: '历史照片', usage_type: 'historical', review_status: 'verified', status: 1 },
        { local_path: '/uploads/history/1-document.jpg', caption: '档案扫描件', usage_type: 'document', review_status: 'verified', status: 1 },
      ]]
    },
  }
  const event = await applyPublicMedia(pool, 'history_event', { id: 1, coverImage: null })
  assert.deepEqual(event.galleryImages.map((image) => image.url), [
    '/uploads/history/1-historical.jpg',
    '/uploads/history/1-document.jpg',
  ])
})
