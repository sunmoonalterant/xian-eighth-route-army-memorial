const assert = require('node:assert/strict')
const { test } = require('node:test')
const { seedOfficialNews, toPublishedAt } = require('../scripts/seedOfficialNews')

test('news seed preserves an absent date as null', () => {
  assert.equal(toPublishedAt(null), null)
  assert.equal(toPublishedAt('not-a-date'), null)
  assert.equal(toPublishedAt('2026-08-24'), '2026-08-24 00:00:00')
})

test('news seed uses source URL to insert once and update on a repeat run', async () => {
  let exists = false
  const queries = []
  const pool = { query: async (sql, values = []) => {
    queries.push({ sql, values })
    if (sql.includes('FROM `article_category`')) return [[{ id: 4 }]]
    if (sql.includes('FROM `article` WHERE source_url')) return [exists ? [{ id: 9 }] : []]
    if (sql.includes('INSERT INTO `article`')) { exists = true; return [{ insertId: 9 }] }
    if (sql.includes('UPDATE `article`')) return [{ affectedRows: 1 }]
    throw new Error('unexpected query')
  } }
  const record = { title: '官网新闻', category: '馆内动态', sourceUrl: 'https://example.test/news', date: null }
  assert.deepEqual(await seedOfficialNews(pool, [record]), { inserted: 1, updated: 0, skipped: 0 })
  assert.deepEqual(await seedOfficialNews(pool, [record]), { inserted: 0, updated: 1, skipped: 0 })
  assert.ok(queries.every(({ sql }) => !sql.includes(record.sourceUrl)))
})
