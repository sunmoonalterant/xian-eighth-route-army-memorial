function buildFilters({ keyword, categoryId }) {
  const conditions = []
  const values = []

  if (keyword) {
    conditions.push('r.name LIKE ?')
    values.push(`%${keyword}%`)
  }
  if (categoryId !== undefined) {
    conditions.push('r.category_id = ?')
    values.push(categoryId)
  }

  return {
    clause: `WHERE r.status = 1${conditions.length ? ` AND ${conditions.join(' AND ')}` : ''}`,
    values,
  }
}

async function findRelics(pool, filters, pagination) {
  const { clause, values } = buildFilters(filters)
  const [rows] = await pool.query(`
    SELECT r.id, r.name, rc.name AS category, r.era, r.summary, r.content,
           r.cover_image, r.views, r.source_url, r.created_at, r.updated_at
    FROM \`relic\` r
    LEFT JOIN \`relic_category\` rc ON rc.id = r.category_id
    ${clause}
    ORDER BY r.id ASC
    LIMIT ? OFFSET ?
  `, [...values, pagination.pageSize, pagination.offset])
  return rows
}

async function countRelics(pool, filters) {
  const { clause, values } = buildFilters(filters)
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`relic\` r ${clause}`, values)
  return rows[0].total
}

async function findRelicById(pool, id) {
  const [rows] = await pool.query(`
    SELECT r.id, r.name, rc.name AS category, r.era, r.summary, r.content,
           r.cover_image, r.views, r.source_url, r.created_at, r.updated_at
    FROM \`relic\` r
    LEFT JOIN \`relic_category\` rc ON rc.id = r.category_id
    WHERE r.id = ? AND r.status = 1
    LIMIT 1
  `, [id])
  return rows[0] || null
}

module.exports = { countRelics, findRelicById, findRelics }
