const { ACTIVE_RESERVATION_STATUSES } = require('../constants/reservationStatus')

async function lockScheduleById(connection, scheduleId) {
  const [rows] = await connection.query(`
    SELECT id, visit_date, period, capacity, reserved_count, status
    FROM \`visit_schedule\`
    WHERE id = ?
    FOR UPDATE
  `, [scheduleId])
  return rows[0] || null
}

async function findActiveByPhoneAndVisitDate(connection, phone, visitDate) {
  const placeholders = ACTIVE_RESERVATION_STATUSES.map(() => '?').join(', ')
  const [rows] = await connection.query(`
    SELECT id
    FROM \`reservation\`
    WHERE phone = ? AND visit_date = ? AND status IN (${placeholders})
    FOR UPDATE
  `, [phone, visitDate, ...ACTIVE_RESERVATION_STATUSES])
  return rows[0] || null
}

async function acquireReservationNumberLock(connection, visitDate) {
  const [rows] = await connection.query('SELECT GET_LOCK(?, 5) AS locked', [`reservation-no:${visitDate}`])
  return rows[0]?.locked === 1
}

async function releaseReservationNumberLock(connection, visitDate) {
  await connection.query('SELECT RELEASE_LOCK(?) AS released', [`reservation-no:${visitDate}`])
}

async function findLatestReservationNo(connection, visitDate) {
  const [rows] = await connection.query(`
    SELECT reservation_no
    FROM \`reservation\`
    WHERE reservation_no LIKE ?
    ORDER BY reservation_no DESC
    LIMIT 1
  `, [`XA${visitDate.replaceAll('-', '')}%`])
  return rows[0]?.reservation_no || null
}

async function insertReservation(connection, reservation) {
  const [result] = await connection.query(`
    INSERT INTO \`reservation\`
      (reservation_no, name, phone, id_card, visit_date, schedule_id, people_count, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    reservation.reservationNo,
    reservation.name,
    reservation.phone,
    reservation.idCard,
    reservation.visitDate,
    reservation.scheduleId,
    reservation.peopleCount,
    reservation.status,
  ])
  return result.insertId
}

async function incrementReservedCount(connection, scheduleId, peopleCount) {
  const [result] = await connection.query(`
    UPDATE \`visit_schedule\`
    SET reserved_count = reserved_count + ?
    WHERE id = ? AND reserved_count + ? <= capacity
  `, [peopleCount, scheduleId, peopleCount])
  return result.affectedRows === 1
}

async function findByReservationNoAndPhone(pool, reservationNo, phone) {
  const [rows] = await pool.query(`
    SELECT r.reservation_no, r.name, r.phone, r.visit_date, r.people_count, r.status, r.created_at,
           s.period
    FROM \`reservation\` r
    INNER JOIN \`visit_schedule\` s ON s.id = r.schedule_id
    WHERE r.reservation_no = ? AND r.phone = ?
    LIMIT 1
  `, [reservationNo, phone])
  return rows[0] || null
}

async function lockReservationByNo(connection, reservationNo) {
  const [rows] = await connection.query(`
    SELECT id, reservation_no, phone, visit_date, schedule_id, people_count, status
    FROM \`reservation\`
    WHERE reservation_no = ?
    FOR UPDATE
  `, [reservationNo])
  return rows[0] || null
}

async function markCancelled(connection, reservationId) {
  const [result] = await connection.query('UPDATE `reservation` SET status = ? WHERE id = ?', [2, reservationId])
  return result.affectedRows === 1
}

async function decrementReservedCount(connection, scheduleId, peopleCount) {
  const [result] = await connection.query(`
    UPDATE \`visit_schedule\`
    SET reserved_count = reserved_count - ?
    WHERE id = ? AND reserved_count >= ?
  `, [peopleCount, scheduleId, peopleCount])
  return result.affectedRows === 1
}

module.exports = {
  acquireReservationNumberLock,
  findActiveByPhoneAndVisitDate,
  findLatestReservationNo,
  findByReservationNoAndPhone,
  incrementReservedCount,
  insertReservation,
  decrementReservedCount,
  lockReservationByNo,
  lockScheduleById,
  markCancelled,
  releaseReservationNumberLock,
}
