async function findByDate(pool, visitDate) {
  const [rows] = await pool.query(`
    SELECT id, visit_date, period, capacity, reserved_count, status
    FROM \`visit_schedule\`
    WHERE visit_date = ?
    ORDER BY FIELD(period, 'morning', 'afternoon')
  `, [visitDate])
  return rows
}

module.exports = { findByDate }
