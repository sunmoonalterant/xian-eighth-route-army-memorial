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

test('admin layout exposes implemented D11.6 people management without future-only routes', () => {
  const source = fs.readFileSync(new URL('../src/views/AdminLayout.vue', import.meta.url), 'utf8')
  for (const item of ['预约管理', '文物管理', '新闻管理', '展览管理', '人物管理']) assert.match(source, new RegExp(item))
  assert.doesNotMatch(source, /统计中心|系统设置/)
})

test('history management provides a homepage-feature filter for reviewed event operations', () => {
  const source = fs.readFileSync(new URL('../src/views/AdminHistory.vue', import.meta.url), 'utf8')
  assert.match(source, /<ElSelect v-model="filters\.featured"/)
})

test('people and exhibition API adapters expose protected image management endpoints', () => {
  const peopleApi = fs.readFileSync(new URL('../src/api/adminPeople.js', import.meta.url), 'utf8')
  const exhibitionApi = fs.readFileSync(new URL('../src/api/adminExhibitions.js', import.meta.url), 'utf8')
  assert.match(peopleApi, /\/admin\/people\/\$\{id\}\/images/)
  assert.match(exhibitionApi, /\/admin\/exhibitions\/\$\{id\}\/images/)
})

test('relic and article API adapters expose their protected unified image endpoints', () => {
  const relicApi = fs.readFileSync(new URL('../src/api/adminRelics.js', import.meta.url), 'utf8')
  const newsApi = fs.readFileSync(new URL('../src/api/adminNews.js', import.meta.url), 'utf8')
  assert.match(relicApi, /\/admin\/relics\/\$\{id\}\/images/)
  assert.match(newsApi, /\/admin\/articles\/\$\{id\}\/images/)
})

test('the shared content manager passes its real entity type to image management', () => {
  const source = fs.readFileSync(new URL('../src/components/AdminContentManager.vue', import.meta.url), 'utf8')
  assert.match(source, /:entity-type="type"/)
})
