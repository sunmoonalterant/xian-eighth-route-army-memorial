require('dotenv').config({ quiet: true })
const pool = require('../src/config/db')

const columns = {
  candidate_id: 'VARCHAR(100) NULL', time_text: 'VARCHAR(100) NULL', month: 'TINYINT UNSIGNED NULL', day: 'TINYINT UNSIGNED NULL',
  time_precision: "VARCHAR(20) NOT NULL DEFAULT 'unknown'", source_name: 'VARCHAR(200) NULL', evidence: 'TEXT NULL',
  review_status: "VARCHAR(20) NOT NULL DEFAULT 'pending'", is_featured: 'TINYINT NOT NULL DEFAULT 0', sort_order: 'INT NOT NULL DEFAULT 0',
}
async function migrateHistoryEvents(db = pool) {
  const [rows] = await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'history_event'")
  const known = new Set(rows.map((row) => row.COLUMN_NAME))
  for (const [name, definition] of Object.entries(columns)) if (!known.has(name)) await db.query(`ALTER TABLE \`history_event\` ADD COLUMN \`${name}\` ${definition}`)
  await db.query('CREATE UNIQUE INDEX idx_history_event_candidate_id ON `history_event` (`candidate_id`)')
    .catch((error) => { if (!['ER_DUP_KEYNAME', 'ER_DUP_ENTRY'].includes(error.code)) throw error })
  return { historyEventSchemaReady: true }
}
if (require.main === module) migrateHistoryEvents().then(console.log).catch((error) => { console.error(error.message); process.exitCode = 1 }).finally(() => pool.end())
module.exports = { migrateHistoryEvents }
