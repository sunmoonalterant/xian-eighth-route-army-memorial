async function findPeople(db, { keyword = '' }, pagination) {
  const values = []
  let where = ''
  if (keyword) { where = 'WHERE name LIKE ? OR summary LIKE ? OR content LIKE ?'; values.push(...Array(3).fill(`%${keyword}%`)) }
  const [rows] = await db.query(`SELECT id, name, summary, content, image, source_url, status, created_at, updated_at FROM \`person\` ${where} ORDER BY id ASC LIMIT ? OFFSET ?`, [...values, pagination.pageSize, pagination.offset])
  return rows
}
async function countPeople(db, { keyword = '' }) { const values = keyword ? Array(3).fill(`%${keyword}%`) : []; const where = keyword ? 'WHERE name LIKE ? OR summary LIKE ? OR content LIKE ?' : ''; const [rows] = await db.query(`SELECT COUNT(*) AS total FROM \`person\` ${where}`, values); return rows[0].total }
async function findById(db, id) { const [rows] = await db.query('SELECT id, name, summary, content, image, source_url, status, created_at, updated_at FROM `person` WHERE id = ? LIMIT 1', [id]); return rows[0] || null }
async function update(db, id, input) { await db.execute('UPDATE `person` SET name = ?, summary = ?, content = ?, source_url = ?, status = ? WHERE id = ?', [input.name, input.summary, input.content, input.sourceUrl, input.status, id]); return findById(db, id) }
module.exports = { countPeople, findById, findPeople, update }
