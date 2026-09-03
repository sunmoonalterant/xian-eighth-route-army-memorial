import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { buildListParams, isSourceBacked, validateCoverImageUrl, validateExhibitionDates, validateHttpUrl, validateRequiredTitle } from '../src/utils/adminContentForm.js'

test('admin content form utilities validate required values, URL schemes and date ranges', () => {
  assert.equal(validateRequiredTitle(''), false)
  assert.equal(validateRequiredTitle('课程设计文物'), true)
  assert.equal(validateHttpUrl('ftp://example.com'), false)
  assert.equal(validateHttpUrl('https://example.com'), true)
  assert.equal(validateCoverImageUrl('/images/relics/relic-1-01.png'), true)
  assert.equal(validateCoverImageUrl('data:image/png;base64,abc'), false)
  assert.equal(validateExhibitionDates('2026-09-03', '2026-09-02'), false)
  assert.equal(isSourceBacked({ sourceApiId: 'official-1' }), true)
})

test('content API adapters use protected endpoints and omit empty list filters', () => {
  assert.deepEqual(buildListParams({ page: 1, keyword: '', categoryId: null }), { page: 1 })
  for (const [file, endpoint] of [['adminRelics.js', '/admin/relics'], ['adminNews.js', '/admin/articles'], ['adminExhibitions.js', '/admin/exhibitions']]) {
    assert.match(fs.readFileSync(new URL(`../src/api/${file}`, import.meta.url), 'utf8'), new RegExp(endpoint))
  }
})

test('admin layout exposes only implemented D10 content menu routes', () => {
  const source = fs.readFileSync(new URL('../src/views/AdminLayout.vue', import.meta.url), 'utf8')
  for (const item of ['预约管理', '文物管理', '新闻管理', '展览管理']) assert.match(source, new RegExp(item))
  assert.doesNotMatch(source, /人物管理|统计中心|系统设置/)
})
