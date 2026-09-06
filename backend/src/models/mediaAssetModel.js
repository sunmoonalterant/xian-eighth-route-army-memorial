const fields = 'id, entity_type, entity_id, usage_type, local_path, source_image_url, source_page_url, publisher, caption, identity_evidence, person_position, sort_order, review_status, status, created_at, updated_at'

async function entityExists(db, entityType, entityId) {
  const table = {
    person: 'person',
    relic: 'relic',
    article: 'article',
    exhibition: 'exhibition',
  }[entityType]
  if (!table) return false
  const [rows] = await db.query(`SELECT id FROM \`${table}\` WHERE id = ? LIMIT 1`, [entityId])
  return rows.length > 0
}

async function findByEntity(db, entityType, entityId, { publicOnly = false } = {}) {
  const conditions = ['entity_type = ?', 'entity_id = ?']
  const values = [entityType, entityId]
  if (publicOnly) { conditions.push("review_status = 'verified'", 'status = 1') }
  const [rows] = await db.query(`SELECT ${fields} FROM \`media_asset\` WHERE ${conditions.join(' AND ')} ORDER BY CASE usage_type WHEN 'cover' THEN 0 WHEN 'portrait' THEN 0 ELSE 1 END, sort_order ASC, id ASC`, values)
  return rows
}

async function findById(db, id) {
  const [rows] = await db.query(`SELECT ${fields} FROM \`media_asset\` WHERE id = ? LIMIT 1`, [id])
  return rows[0] || null
}

async function insert(db, entityType, entityId, localPath, input) {
  const [result] = await db.execute(`INSERT INTO \`media_asset\` (entity_type, entity_id, usage_type, local_path, source_image_url, source_page_url, publisher, caption, identity_evidence, person_position, sort_order, review_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [entityType, entityId, input.usageType, localPath, input.sourceImageUrl, input.sourcePageUrl, input.publisher, input.caption, input.identityEvidence, input.personPosition, input.sortOrder, input.reviewStatus, input.status])
  return findById(db, result.insertId)
}

async function update(db, id, input) {
  await db.execute('UPDATE `media_asset` SET usage_type = ?, source_image_url = ?, source_page_url = ?, publisher = ?, caption = ?, identity_evidence = ?, person_position = ?, sort_order = ?, review_status = ?, status = ? WHERE id = ?', [input.usageType, input.sourceImageUrl, input.sourcePageUrl, input.publisher, input.caption, input.identityEvidence, input.personPosition, input.sortOrder, input.reviewStatus, input.status, id])
  return findById(db, id)
}

async function hideOtherCovers(db, entityType, entityId, excludedId = null) {
  const excluded = excludedId ? ' AND id <> ?' : ''
  const values = excludedId ? [entityType, entityId, excludedId] : [entityType, entityId]
  await db.execute(`UPDATE \`media_asset\` SET status = 0 WHERE entity_type = ? AND entity_id = ? AND usage_type = 'cover' AND status = 1${excluded}`, values)
}

async function remove(db, id) { await db.execute('DELETE FROM `media_asset` WHERE id = ?', [id]) }
async function localPathIsUsed(db, localPath) { const [rows] = await db.query('SELECT id FROM `media_asset` WHERE local_path = ? LIMIT 1', [localPath]); return rows.length > 0 }

module.exports = { entityExists, findByEntity, findById, hideOtherCovers, insert, localPathIsUsed, remove, update }
