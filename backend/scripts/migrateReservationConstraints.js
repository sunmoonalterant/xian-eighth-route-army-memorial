require('dotenv').config({ quiet: true })

const pool = require('../src/config/db')

async function migrateReservationConstraints(dbPool) {
  const [columns] = await dbPool.query("SHOW COLUMNS FROM `reservation` LIKE 'active_phone'")
  const activePhoneColumnAdded = columns.length === 0
  if (activePhoneColumnAdded) {
    await dbPool.query(`
      ALTER TABLE \`reservation\`
      ADD COLUMN \`active_phone\` VARCHAR(20)
      GENERATED ALWAYS AS (CASE WHEN \`status\` IN (0, 1) THEN \`phone\` ELSE NULL END) STORED
      AFTER \`phone\`
    `)
  }

  const [indexes] = await dbPool.query('SHOW INDEX FROM `reservation`')
  const indexNames = new Set(indexes.map((index) => index.Key_name))
  const oldUniqueIndexRemoved = indexNames.has('uk_reservation_phone_visit_date')
  if (oldUniqueIndexRemoved) {
    await dbPool.query('ALTER TABLE `reservation` DROP INDEX `uk_reservation_phone_visit_date`')
  }
  if (!indexNames.has('uk_reservation_active_phone_visit_date')) {
    await dbPool.query('ALTER TABLE `reservation` ADD UNIQUE KEY `uk_reservation_active_phone_visit_date` (`active_phone`, `visit_date`)')
  }

  return { activePhoneColumnAdded, oldUniqueIndexRemoved }
}

async function main() {
  try {
    const result = await migrateReservationConstraints(pool)
    console.log(`active_phone column added: ${result.activePhoneColumnAdded}`)
    console.log(`legacy phone-date unique index removed: ${result.oldUniqueIndexRemoved}`)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('reservation constraint migration failed:', error.message)
    process.exitCode = 1
  })
}

module.exports = { migrateReservationConstraints }
