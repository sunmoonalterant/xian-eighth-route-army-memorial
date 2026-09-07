const ACTIVE_STATUS_PLACEHOLDERS = '?, ?, ?'

async function getVisitOverview(pool) {
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_pv,
      COUNT(DISTINCT visitor_id) AS total_uv,
      COALESCE(SUM(DATE(created_at) = CURDATE()), 0) AS today_pv,
      COUNT(DISTINCT CASE WHEN DATE(created_at) = CURDATE() THEN visitor_id END) AS today_uv
    FROM \`visit_log\`
  `)
  return rows[0]
}

async function getReservationOverview(pool, activeStatuses) {
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_reservations,
      COALESCE(SUM(status IN (${ACTIVE_STATUS_PLACEHOLDERS})), 0) AS active_reservations,
      COALESCE(SUM(status = ?), 0) AS cancelled_reservations
    FROM \`reservation\`
  `, [...activeStatuses, 2])
  return rows[0]
}

async function getTrafficTrend(pool, days) {
  const [rows] = await pool.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv
    FROM \`visit_log\`
    WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `, [days - 1])
  return rows
}

async function getPageRanking(pool, limit) {
  const [rows] = await pool.query(`
    SELECT normalized_path AS path, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv
    FROM (
      SELECT visitor_id, CASE
        WHEN page_path REGEXP '^/relic/[0-9]+$' THEN '/relic/:id'
        WHEN page_path REGEXP '^/person/[0-9]+$' THEN '/person/:id'
        WHEN page_path REGEXP '^/news/[0-9]+$' THEN '/news/:id'
        WHEN page_path REGEXP '^/exhibition/[0-9]+$' THEN '/exhibition/:id'
        ELSE page_path
      END AS normalized_path
      FROM \`visit_log\`
    ) AS normalized_visits
    GROUP BY normalized_path
    ORDER BY pv DESC, normalized_path ASC
    LIMIT ?
  `, [limit])
  return rows
}

async function getReservationSummary(pool, activeStatuses) {
  const [rows] = await pool.query(`
    SELECT status, COUNT(*) AS reservations, COALESCE(SUM(people_count), 0) AS people,
      COALESCE(SUM(status IN (${ACTIVE_STATUS_PLACEHOLDERS})), 0) AS active_reservations,
      COALESCE(SUM(CASE WHEN status IN (${ACTIVE_STATUS_PLACEHOLDERS}) THEN people_count ELSE 0 END), 0) AS active_people
    FROM \`reservation\`
    GROUP BY status
    ORDER BY status ASC
  `, [...activeStatuses, ...activeStatuses])
  return rows
}

async function getReservationTrend(pool, days) {
  const [rows] = await pool.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS reservations, COALESCE(SUM(people_count), 0) AS people
    FROM \`reservation\`
    WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `, [days - 1])
  return rows
}

async function getPeriodDistribution(pool, activeStatuses) {
  const [rows] = await pool.query(`
    SELECT s.period, COUNT(*) AS reservations, COALESCE(SUM(r.people_count), 0) AS people,
      COALESCE(SUM(r.status IN (${ACTIVE_STATUS_PLACEHOLDERS})), 0) AS active_reservations,
      COALESCE(SUM(CASE WHEN r.status IN (${ACTIVE_STATUS_PLACEHOLDERS}) THEN r.people_count ELSE 0 END), 0) AS active_people
    FROM \`reservation\` r
    INNER JOIN \`visit_schedule\` s ON s.id = r.schedule_id
    GROUP BY s.period
    ORDER BY s.period ASC
  `, [...activeStatuses, ...activeStatuses])
  return rows
}

module.exports = {
  getPageRanking,
  getPeriodDistribution,
  getReservationOverview,
  getReservationSummary,
  getReservationTrend,
  getTrafficTrend,
  getVisitOverview,
}
