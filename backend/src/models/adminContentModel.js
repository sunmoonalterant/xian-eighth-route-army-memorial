function buildWhere(alias, { keyword = '', categoryId, publicOnly = false }, searchableColumns = []) {
  const conditions = []
  const values = []
  if (publicOnly) conditions.push(`${alias}.status = 1`)
  if (keyword) {
    const like = `%${keyword}%`
    conditions.push(`(${searchableColumns.map((column) => `${alias}.${column} LIKE ?`).join(' OR ')})`)
    values.push(...searchableColumns.map(() => like))
  }
  if (categoryId !== undefined) {
    conditions.push(`${alias}.category_id = ?`)
    values.push(categoryId)
  }
  return { clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

async function listCategories(pool, table) {
  const [rows] = await pool.query(`SELECT id, name, sort FROM \`${table}\` ORDER BY sort ASC, id ASC`)
  return rows
}

async function categoryExists(pool, table, id) {
  const [rows] = await pool.query(`SELECT id FROM \`${table}\` WHERE id = ? LIMIT 1`, [id])
  return Boolean(rows[0])
}

async function findRelics(pool, filters, pagination, publicOnly = false) {
  const { clause, values } = buildWhere('r', { ...filters, publicOnly }, ['name', 'summary'])
  const [rows] = await pool.query(`
    SELECT r.id, r.name, r.category_id, rc.name AS category, r.era, r.summary, r.content,
      r.cover_image, r.views, r.source_url, r.source_api_id, r.status, r.created_at, r.updated_at
    FROM \`relic\` r LEFT JOIN \`relic_category\` rc ON rc.id = r.category_id
    ${clause} ORDER BY r.updated_at DESC, r.id DESC LIMIT ? OFFSET ?
  `, [...values, pagination.pageSize, pagination.offset])
  return rows
}

async function countRelics(pool, filters, publicOnly = false) {
  const { clause, values } = buildWhere('r', { ...filters, publicOnly }, ['name', 'summary'])
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`relic\` r ${clause}`, values)
  return rows[0].total
}

async function findRelic(pool, id, publicOnly = false) {
  const [rows] = await pool.query(`
    SELECT r.id, r.name, r.category_id, rc.name AS category, r.era, r.summary, r.content,
      r.cover_image, r.views, r.source_url, r.source_api_id, r.status, r.created_at, r.updated_at
    FROM \`relic\` r LEFT JOIN \`relic_category\` rc ON rc.id = r.category_id
    WHERE r.id = ?${publicOnly ? ' AND r.status = 1' : ''} LIMIT 1
  `, [id])
  return rows[0] || null
}

async function insertRelic(pool, input) {
  const [result] = await pool.query(`INSERT INTO \`relic\`
    (name, category_id, era, summary, content, cover_image, source_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [input.name, input.categoryId, input.era, input.summary, input.content, input.coverImage, input.sourceUrl, input.status])
  return result.insertId
}

async function updateRelic(pool, id, input) {
  const [result] = await pool.query(`UPDATE \`relic\`
    SET name = ?, category_id = ?, era = ?, summary = ?, content = ?, cover_image = ?, source_url = ?, status = ?
    WHERE id = ?`, [input.name, input.categoryId, input.era, input.summary, input.content, input.coverImage, input.sourceUrl, input.status, id])
  return result.affectedRows === 1
}

async function hideRelic(pool, id) {
  const [result] = await pool.query('UPDATE `relic` SET status = 0 WHERE id = ?', [id])
  return result.affectedRows === 1
}

async function findArticles(pool, filters, pagination, publicOnly = false) {
  const { clause, values } = buildWhere('a', { ...filters, publicOnly }, ['title', 'summary'])
  const [rows] = await pool.query(`
    SELECT a.id, a.title, a.category_id, ac.name AS category, a.summary, a.content, a.cover_image,
      a.views, a.published_at, a.source_url, a.status, a.created_at, a.updated_at
    FROM \`article\` a LEFT JOIN \`article_category\` ac ON ac.id = a.category_id
    ${clause} ORDER BY a.published_at DESC, a.updated_at DESC, a.id DESC LIMIT ? OFFSET ?
  `, [...values, pagination.pageSize, pagination.offset])
  return rows
}

async function countArticles(pool, filters, publicOnly = false) {
  const { clause, values } = buildWhere('a', { ...filters, publicOnly }, ['title', 'summary'])
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`article\` a ${clause}`, values)
  return rows[0].total
}

async function findArticle(pool, id, publicOnly = false) {
  const [rows] = await pool.query(`
    SELECT a.id, a.title, a.category_id, ac.name AS category, a.summary, a.content, a.cover_image,
      a.views, a.published_at, a.source_url, a.status, a.created_at, a.updated_at
    FROM \`article\` a LEFT JOIN \`article_category\` ac ON ac.id = a.category_id
    WHERE a.id = ?${publicOnly ? ' AND a.status = 1' : ''} LIMIT 1
  `, [id])
  return rows[0] || null
}

async function insertArticle(pool, input) {
  const [result] = await pool.query(`INSERT INTO \`article\`
    (title, category_id, summary, content, cover_image, published_at, source_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [input.title, input.categoryId, input.summary, input.content, input.coverImage, input.publishTime, input.sourceUrl, input.status])
  return result.insertId
}

async function updateArticle(pool, id, input) {
  const [result] = await pool.query(`UPDATE \`article\`
    SET title = ?, category_id = ?, summary = ?, content = ?, cover_image = ?, published_at = ?, source_url = ?, status = ?
    WHERE id = ?`, [input.title, input.categoryId, input.summary, input.content, input.coverImage, input.publishTime, input.sourceUrl, input.status, id])
  return result.affectedRows === 1
}

async function hideArticle(pool, id) {
  const [result] = await pool.query('UPDATE `article` SET status = 0 WHERE id = ?', [id])
  return result.affectedRows === 1
}

async function findExhibitions(pool, filters, pagination, publicOnly = false) {
  const { clause, values } = buildWhere('e', { ...filters, publicOnly }, ['title', 'summary'])
  const [rows] = await pool.query(`
    SELECT e.id, e.title, e.category, e.summary, e.content, e.cover_image, e.start_date, e.end_date,
      e.views, e.source_url, e.status, e.created_at, e.updated_at
    FROM \`exhibition\` e ${clause} ORDER BY e.updated_at DESC, e.id DESC LIMIT ? OFFSET ?
  `, [...values, pagination.pageSize, pagination.offset])
  return rows
}

async function countExhibitions(pool, filters, publicOnly = false) {
  const { clause, values } = buildWhere('e', { ...filters, publicOnly }, ['title', 'summary'])
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`exhibition\` e ${clause}`, values)
  return rows[0].total
}

async function findExhibition(pool, id, publicOnly = false) {
  const [rows] = await pool.query(`SELECT id, title, category, summary, content, cover_image, start_date, end_date,
    views, source_url, status, created_at, updated_at FROM \`exhibition\`
    WHERE id = ?${publicOnly ? ' AND status = 1' : ''} LIMIT 1`, [id])
  return rows[0] || null
}

async function insertExhibition(pool, input) {
  const [result] = await pool.query(`INSERT INTO \`exhibition\`
    (title, category, summary, content, cover_image, start_date, end_date, source_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [input.title, input.category, input.summary, input.content, input.coverImage, input.startDate, input.endDate, input.sourceUrl, input.status])
  return result.insertId
}

async function updateExhibition(pool, id, input) {
  const [result] = await pool.query(`UPDATE \`exhibition\`
    SET title = ?, category = ?, summary = ?, content = ?, cover_image = ?, start_date = ?, end_date = ?, source_url = ?, status = ?
    WHERE id = ?`, [input.title, input.category, input.summary, input.content, input.coverImage, input.startDate, input.endDate, input.sourceUrl, input.status, id])
  return result.affectedRows === 1
}

async function hideExhibition(pool, id) {
  const [result] = await pool.query('UPDATE `exhibition` SET status = 0 WHERE id = ?', [id])
  return result.affectedRows === 1
}

module.exports = {
  categoryExists, countArticles, countExhibitions, countRelics, findArticle, findArticles, findExhibition,
  findExhibitions, findRelic, findRelics, hideArticle, hideExhibition, hideRelic, insertArticle,
  insertExhibition, insertRelic, listCategories, updateArticle, updateExhibition, updateRelic,
}
