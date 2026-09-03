require('dotenv').config({ quiet: true })

const pool = require('../src/config/db')

async function migrateAdminDisplayName(dbPool) {
  const [columns] = await dbPool.query("SHOW COLUMNS FROM `admin` LIKE 'display_name'")
  const displayNameColumnAdded = columns.length === 0
  if (displayNameColumnAdded) {
    await dbPool.query(`
      ALTER TABLE \`admin\`
      ADD COLUMN \`display_name\` VARCHAR(100) NULL COMMENT '管理员显示名称' AFTER \`username\`
    `)
  }
  return { displayNameColumnAdded }
}

async function main() {
  try {
    const result = await migrateAdminDisplayName(pool)
    console.log(`admin display_name column added: ${result.displayNameColumnAdded}`)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('admin display name migration failed:', error.message)
    process.exitCode = 1
  })
}

module.exports = { migrateAdminDisplayName }
