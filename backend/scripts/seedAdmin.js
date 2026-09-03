require('dotenv').config({ quiet: true })

const bcrypt = require('bcryptjs')
const pool = require('../src/config/db')

function getSeedConfig(environment = process.env) {
  const username = environment.ADMIN_SEED_USERNAME?.trim()
  const password = environment.ADMIN_SEED_PASSWORD
  const displayName = environment.ADMIN_SEED_DISPLAY_NAME?.trim()
  if (!username || !password || !displayName) {
    throw new Error('ADMIN_SEED_USERNAME, ADMIN_SEED_PASSWORD and ADMIN_SEED_DISPLAY_NAME are required')
  }
  return { username, password, displayName }
}

async function seedAdmin(dbPool, config) {
  const passwordHash = await bcrypt.hash(config.password, 12)
  await dbPool.query(`
    INSERT INTO \`admin\` (username, display_name, password_hash, role, status)
    VALUES (?, ?, ?, 'admin', 1)
    ON DUPLICATE KEY UPDATE
      display_name = VALUES(display_name),
      password_hash = VALUES(password_hash),
      role = 'admin',
      status = 1
  `, [config.username, config.displayName, passwordHash])
  return { username: config.username }
}

async function main() {
  try {
    const result = await seedAdmin(pool, getSeedConfig())
    console.log(`admin seed completed for: ${result.username}`)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('admin seed failed:', error.message)
    process.exitCode = 1
  })
}

module.exports = { getSeedConfig, seedAdmin }
