import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'

test('visitor news calls public articles API and retains local fallback notice', () => {
  const api = fs.readFileSync(new URL('../src/api/news.js', import.meta.url), 'utf8')
  const list = fs.readFileSync(new URL('../src/views/News.vue', import.meta.url), 'utf8')
  const detail = fs.readFileSync(new URL('../src/views/NewsDetail.vue', import.meta.url), 'utf8')
  assert.match(api, /\/articles/)
  assert.match(list, /officialNews/)
  assert.match(detail, /officialNews/)
  assert.match(list, /当前展示本地资料/)
  assert.match(detail, /当前展示本地资料/)
})
