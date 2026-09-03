const path = require('node:path')
const { pathToFileURL } = require('node:url')
require('dotenv').config()
const pool = require('../src/config/db')

async function importOfficialNews() {
  const sourcePath = path.resolve(__dirname, '../../frontend/src/data/officialNews.js')
  const module = await import(pathToFileURL(sourcePath).href)
  return module.officialNews || []
}

async function findOrCreateCategory(db, name) {
  const [existing] = await db.query('SELECT id FROM `article_category` WHERE name = ? LIMIT 1', [name])
  if (existing[0]) return existing[0].id
  const [result] = await db.query('INSERT INTO `article_category` (name, sort) VALUES (?, ?)', [name, 99])
  return result.insertId
}

function toPublishedAt(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value} 00:00:00` : null
}

async function seedOfficialNews(db, records) {
  const stats = { inserted: 0, updated: 0, skipped: 0 }
  for (const record of records) {
    if (!record?.title || !record?.sourceUrl) { stats.skipped += 1; continue }
    const categoryId = record.category ? await findOrCreateCategory(db, record.category) : null
    const values = [record.title, categoryId, record.summary || null, record.content || null, record.image || null, toPublishedAt(record.date), record.sourceUrl, 1]
    const [existing] = await db.query('SELECT id FROM `article` WHERE source_url = ? LIMIT 1', [record.sourceUrl])
    if (existing[0]) {
      await db.query(`UPDATE \`article\` SET title = ?, category_id = ?, summary = ?, content = ?, cover_image = ?,
        published_at = ?, status = ? WHERE id = ?`, [...values.slice(0, 6), values[7], existing[0].id])
      stats.updated += 1
    } else {
      await db.query(`INSERT INTO \`article\`
        (title, category_id, summary, content, cover_image, published_at, source_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, values)
      stats.inserted += 1
    }
  }
  return stats
}

async function main() {
  try {
    const stats = await seedOfficialNews(pool, await importOfficialNews())
    console.log(`news inserted: ${stats.inserted}`)
    console.log(`news updated: ${stats.updated}`)
    console.log(`news skipped: ${stats.skipped}`)
  } finally {
    await pool.end()
  }
}

if (require.main === module) main().catch((error) => { console.error(`news seed failed: ${error.code || 'unknown error'}`); process.exitCode = 1 })

module.exports = { importOfficialNews, seedOfficialNews, toPublishedAt }
