function buildFilters({ keyword = '', status, visitDate }) {
  const conditions = []
  const values = []

  if (keyword) {
    const match = `%${keyword}%`
    conditions.push('(r.reservation_no LIKE ? OR r.name LIKE ? OR r.phone LIKE ?)')
    values.push(match, match, match)
  }
  if (status !== undefined) {
    conditions.push('r.status = ?')
    values.push(status)
  }
  if (visitDate) {
    conditions.push('r.visit_date = ?')
    values.push(visitDate)
  }

  return { clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

async function findReservations(pool, filters, pagination) {
  const { clause, values } = buildFilters(filters)
  const [rows] = await pool.query(`
    SELECT r.id, r.reservation_no, r.name, r.phone, r.visit_date, r.people_count, r.status,
           r.created_at, s.period
    FROM \`reservation\` r
    INNER JOIN \`visit_schedule\` s ON s.id = r.schedule_id
    ${clause}
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT ? OFFSET ?
  `, [...values, pagination.pageSize, pagination.offset])
  return rows
}

async function countReservations(pool, filters) {
  const { clause, values } = buildFilters(filters)
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`reservation\` r ${clause}`, values)
  return rows[0].total
}

async function findReservationById(pool, id) {
  const [rows] = await pool.query(`
    SELECT r.id, r.reservation_no, r.name, r.phone, r.visit_date, r.people_count, r.status,
           r.remark, r.created_at, r.updated_at, s.period
    FROM \`reservation\` r
    INNER JOIN \`visit_schedule\` s ON s.id = r.schedule_id
    WHERE r.id = ?
    LIMIT 1
  `, [id])
  return rows[0] || null
}

async function lockReservationById(connection, id) {
  const [rows] = await connection.query(`
    SELECT id, reservation_no, schedule_id, people_count, status
    FROM \`reservation\`
    WHERE id = ?
    FOR UPDATE
  `, [id])
  return rows[0] || null
}

async function updateStatus(connection, id, currentStatus, nextStatus) {
  const [result] = await connection.query(
    'UPDATE `reservation` SET status = ? WHERE id = ? AND status = ?',
    [nextStatus, id, currentStatus],
  )
  return result.affectedRows === 1
}

async function lockScheduleById(connection, id) {
  const [rows] = await connection.query(`
    SELECT id, capacity, reserved_count
    FROM \`visit_schedule\`
    WHERE id = ?
    FOR UPDATE
  `, [id])
  return rows[0] || null
}

async function releaseReservedCount(connection, scheduleId, peopleCount) {
  const [result] = await connection.query(`
    UPDATE \`visit_schedule\`
    SET reserved_count = reserved_count - ?
    WHERE id = ? AND reserved_count >= ?
  `, [peopleCount, scheduleId, peopleCount])
  return result.affectedRows === 1
}

module.exports = {
  countReservations,
  findReservationById,
  findReservations,
  lockReservationById,
  lockScheduleById,
  releaseReservedCount,
  updateStatus,
}
