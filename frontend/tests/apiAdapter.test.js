import assert from 'node:assert/strict'
import test from 'node:test'
import { toExhibitionCard, toMuseumView, toRelicView } from '../src/utils/apiAdapters.js'

test('toRelicView adapts API camelCase fields to the existing relic-card contract', () => {
  const result = toRelicView({
    id: 8,
    name: '测试文物',
    category: null,
    era: null,
    summary: '摘要',
    content: '正文',
    coverImage: 'https://example.test/relic.png',
    sourceUrl: 'https://example.test/source',
    views: 0,
  }, 'fallback-image')

  assert.equal(result.image, 'https://example.test/relic.png')
  assert.equal(result.contentText, '正文')
  assert.equal(result.sourceUrl, 'https://example.test/source')
  assert.equal(result.views, 0)
})

test('toMuseumView keeps the existing section layout while using API content', () => {
  const result = toMuseumView({
    title: '馆情标题',
    summary: '馆情摘要',
    content: '馆情正文',
    coverImage: null,
    sourceUrl: 'https://example.test/museum',
  }, { image: 'local-image', sourceName: '本地来源' })

  assert.equal(result.image, 'local-image')
  assert.equal(result.intro, '馆情摘要')
  assert.deepEqual(result.sections, [{ title: '馆情标题', text: '馆情正文', image: 'local-image' }])
})

test('toExhibitionCard converts missing API dates to an empty legacy time label', () => {
  const result = toExhibitionCard({
    id: 3,
    title: '测试展览',
    category: null,
    summary: '展览摘要',
    coverImage: null,
    startDate: null,
    endDate: null,
  }, 'fallback-image')

  assert.equal(result.type, '未分类')
  assert.equal(result.time, '')
  assert.equal(result.image, 'fallback-image')
})
