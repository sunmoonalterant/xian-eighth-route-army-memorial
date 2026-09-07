async function insertVisitLog(pool, { visitorId, path }) {
  await pool.query('INSERT INTO `visit_log` (`visitor_id`, `page_path`) VALUES (?, ?)', [visitorId, path])
}

module.exports = { insertVisitLog }
