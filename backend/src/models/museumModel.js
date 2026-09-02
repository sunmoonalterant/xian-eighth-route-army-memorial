async function findMuseum(pool) {
  const [rows] = await pool.query(`
    SELECT id, title, summary, content, cover_image, source_url, created_at, updated_at
    FROM \`museum\`
    ORDER BY id ASC
    LIMIT 1
  `)
  return rows[0] || null
}

module.exports = { findMuseum }
