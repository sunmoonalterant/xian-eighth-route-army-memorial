async function findExhibitions(pool, pagination) {
  const [rows] = await pool.query(`
    SELECT id, title, category, summary, content, cover_image, start_date, end_date,
           views, source_url, created_at, updated_at
    FROM \`exhibition\`
    WHERE status = 1
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `, [pagination.pageSize, pagination.offset])
  return rows
}

async function countExhibitions(pool) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM `exhibition` WHERE status = 1')
  return rows[0].total
}

async function findExhibitionById(pool, id) {
  const [rows] = await pool.query(`
    SELECT id, title, category, summary, content, cover_image, start_date, end_date,
           views, source_url, created_at, updated_at
    FROM \`exhibition\`
    WHERE id = ? AND status = 1
    LIMIT 1
  `, [id])
  return rows[0] || null
}

module.exports = { countExhibitions, findExhibitionById, findExhibitions }
