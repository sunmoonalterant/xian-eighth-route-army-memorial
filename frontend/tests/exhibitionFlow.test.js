import assert from 'node:assert/strict'
import test from 'node:test'

import { createExhibitionApi } from '../src/api/exhibitions.js'
import { toExhibitionCard } from '../src/utils/apiAdapters.js'
import { dedupeExhibitions, findExhibitionFallback, getExhibitionErrorMessage, toExhibitionDetail } from '../src/utils/exhibitionFlow.js'

test('exhibition API requests the individual detail endpoint for the selected id', async () => {
  const calls = []
  const api = createExhibitionApi({
    get: async (...args) => { calls.push(args); return { ok: true } },
  })

  await api.getById(7)

  assert.deepEqual(calls, [['/exhibitions/7']])
})

test('exhibition cards keep their own ids in detail routes', () => {
  const first = toExhibitionCard({ id: 2, title: '展览甲', startDate: null, endDate: null }, 'fallback')
  const second = toExhibitionCard({ id: 3, title: '展览乙', startDate: null, endDate: null }, 'fallback')

  assert.equal(first.to, '/exhibition/2')
  assert.equal(second.to, '/exhibition/3')
})

test('fallback keeps one canonical duplicate and only resolves an exact stable id', () => {
  const records = [
    { id: 'official-a', sourceUrl: 'https://example.test/display/4', title: '同一展览', contentText: '完整 正文', coverImage: '/images/first.jpg' },
    { id: 'official-b', sourceUrl: 'https://example.test/display/4', title: '同一展览', contentText: '完整正文', coverImage: '/images/second.jpg' },
    { id: 'official-c', sourceUrl: 'https://example.test/display/4', title: '同名不同正文', contentText: '另一份资料' },
  ]
  const deduped = dedupeExhibitions(records)

  assert.deepEqual(deduped.map((record) => record.id), ['official-a', 'official-c'])
  assert.equal(findExhibitionFallback(deduped, 'official-a'), records[0])
  assert.equal(findExhibitionFallback(deduped, 'abc'), null)
})

test('detail presentation omits null dates and preserves the selected record content', () => {
  const detail = toExhibitionDetail({
    id: 7,
    title: '测试展览',
    summary: '展览摘要',
    content: '展览正文',
    coverImage: '/images/exhibitions/exhibition-1-01.jpg',
    startDate: null,
    endDate: null,
    sourceUrl: 'https://example.test/exhibition',
  })

  assert.equal(detail.content, '展览正文')
  assert.equal(detail.dateText, '')
  assert.equal(detail.sourceUrl, 'https://example.test/exhibition')
})

test('detail errors distinguish missing records, invalid ids, and unavailable APIs', () => {
  assert.equal(getExhibitionErrorMessage({ status: 404 }, '7'), '未找到该展览资料')
  assert.equal(getExhibitionErrorMessage({ status: 400 }, 'abc'), '展览编号无效')
  assert.equal(getExhibitionErrorMessage(new Error('service unavailable'), '7'), '展览资料暂时无法加载')
})
