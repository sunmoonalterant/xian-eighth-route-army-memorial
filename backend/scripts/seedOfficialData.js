const fs = require('node:fs/promises')
const path = require('node:path')
require('dotenv').config()

const pool = require('../src/config/db')
const { exhibitionIdentity } = require('../src/utils/officialIdentity')

const reviewedDirectory = path.resolve(__dirname, '../../crawler/node/output/reviewed')

function toNullable(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

async function loadReviewed(name) {
  const content = await fs.readFile(path.join(reviewedDirectory, `${name}.json`), 'utf8')
  return JSON.parse(content)
}

async function upsertMuseum(record) {
  const title = toNullable(record.title) || toNullable(record.name)
  const values = [title, toNullable(record.summary), toNullable(record.contentText), toNullable(record.coverImage), toNullable(record.sourceUrl), 0]
  const [existing] = await pool.execute('SELECT id FROM `museum` WHERE source_url = ? LIMIT 1', [toNullable(record.sourceUrl)])
  if (existing.length) {
    await pool.execute('UPDATE `museum` SET title = ?, summary = ?, content = ?, cover_image = ?, source_url = ?, status = ? WHERE id = ?', [...values, existing[0].id])
    return 'updated'
  }
  await pool.execute('INSERT INTO `museum` (title, summary, content, cover_image, source_url, status) VALUES (?, ?, ?, ?, ?, ?)', values)
  return 'inserted'
}

async function upsertRelic(record) {
  const sourceApiId = toNullable(record.sourceApiId)
  const sourceUrl = toNullable(record.sourceUrl)
  const values = [toNullable(record.name) || toNullable(record.title), null, toNullable(record.era), toNullable(record.summary), toNullable(record.contentText), toNullable(record.coverImage), sourceUrl, sourceApiId, 0]
  const [existing] = sourceApiId
    ? await pool.execute('SELECT id FROM `relic` WHERE source_api_id = ? LIMIT 1', [sourceApiId])
    : await pool.execute('SELECT id FROM `relic` WHERE source_url = ? LIMIT 1', [sourceUrl])
  if (existing.length) {
    await pool.execute('UPDATE `relic` SET name = ?, category_id = ?, era = ?, summary = ?, content = ?, cover_image = ?, source_url = ?, source_api_id = ?, status = ? WHERE id = ?', [...values, existing[0].id])
    return 'updated'
  }
  await pool.execute('INSERT INTO `relic` (name, category_id, era, summary, content, cover_image, source_url, source_api_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', values)
  return 'inserted'
}

async function upsertExhibition(record) {
  const sourceUrl = toNullable(record.sourceUrl)
  const content = toNullable(record.contentText)
  const values = [toNullable(record.title), toNullable(record.category), toNullable(record.summary), content, toNullable(record.coverImage), toNullable(record.startDate), toNullable(record.endDate), sourceUrl, 0]
  const [existing] = await pool.execute('SELECT id FROM `exhibition` WHERE source_url <=> ? AND content <=> ? LIMIT 1', [sourceUrl, content])
  if (existing.length) {
    await pool.execute('UPDATE `exhibition` SET title = ?, category = ?, summary = ?, content = ?, cover_image = ?, start_date = ?, end_date = ?, source_url = ?, status = ? WHERE id = ?', [...values, existing[0].id])
    return 'updated'
  }
  await pool.execute('INSERT INTO `exhibition` (title, category, summary, content, cover_image, start_date, end_date, source_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', values)
  return 'inserted'
}

async function importRecords(records, upsert) {
  const statistics = { inserted: 0, updated: 0 }
  for (const record of records) {
    statistics[await upsert(record)] += 1
  }
  return statistics
}

async function main() {
  const [museum, relics, exhibitions] = await Promise.all([
    loadReviewed('museum'),
    loadReviewed('relics'),
    loadReviewed('exhibitions'),
  ])
  const museumStats = await importRecords(museum, upsertMuseum)
  const relicStats = await importRecords(relics, upsertRelic)
  const exhibitionStats = await importRecords(exhibitions, upsertExhibition)

  console.log(`museum inserted: ${museumStats.inserted}, updated: ${museumStats.updated}`)
  console.log(`relic inserted: ${relicStats.inserted}, updated: ${relicStats.updated}`)
  console.log(`exhibition inserted: ${exhibitionStats.inserted}, updated: ${exhibitionStats.updated}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
