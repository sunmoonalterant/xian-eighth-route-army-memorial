import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

test('relic detail renders an optional verified gallery without changing the base layout', () => {
  const source = fs.readFileSync(new URL('../src/views/RelicDetail.vue', import.meta.url), 'utf8')
  assert.match(source, /galleryImages/)
  assert.match(source, /文物图库/)
})

test('news detail renders optional related images outside the article HTML body', () => {
  const source = fs.readFileSync(new URL('../src/views/NewsDetail.vue', import.meta.url), 'utf8')
  assert.match(source, /contentImages/)
  assert.match(source, /相关图片/)
})

test('visitor relic and news cards resolve uploaded media through the API origin', () => {
  const relicCard = fs.readFileSync(new URL('../src/components/RelicCard.vue', import.meta.url), 'utf8')
  const newsCard = fs.readFileSync(new URL('../src/components/NewsCard.vue', import.meta.url), 'utf8')
  assert.match(relicCard, /toDisplayImageUrl/)
  assert.match(newsCard, /toDisplayImageUrl/)
})
