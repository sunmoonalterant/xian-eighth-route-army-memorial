async function findEnabledByUsername(pool, username) {
  const [rows] = await pool.query(`
    SELECT id, username, display_name, password_hash, role, status
    FROM \`admin\`
    WHERE username = ? AND status = 1
    LIMIT 1
  `, [username])
  return rows[0] || null
}

async function findEnabledById(pool, id) {
  const [rows] = await pool.query(`
    SELECT id, username, display_name, role, status
    FROM \`admin\`
    WHERE id = ? AND status = 1
    LIMIT 1
  `, [id])
  return rows[0] || null
}

module.exports = { findEnabledById, findEnabledByUsername }
