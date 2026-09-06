require('dotenv').config({ quiet: true })
const pool = require('../src/config/db')

const courtyardColumns = {
  candidate_id: 'VARCHAR(100) NULL', aliases: 'VARCHAR(500) NULL', historical_use: 'TEXT NULL', current_use: 'TEXT NULL',
  source_name: 'VARCHAR(200) NULL', evidence: 'TEXT NULL', review_status: "VARCHAR(20) NOT NULL DEFAULT 'pending'", sort_order: 'INT NOT NULL DEFAULT 0',
}

async function migrateDigitalMuseum(db = pool) {
  const [rows] = await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courtyard'")
  const known = new Set(rows.map((row) => row.COLUMN_NAME))
  for (const [name, definition] of Object.entries(courtyardColumns)) if (!known.has(name)) await db.query(`ALTER TABLE \`courtyard\` ADD COLUMN \`${name}\` ${definition}`)
  await db.query('CREATE UNIQUE INDEX idx_courtyard_candidate_id ON `courtyard` (`candidate_id`)').catch((error) => { if (!['ER_DUP_KEYNAME', 'ER_DUP_ENTRY'].includes(error.code)) throw error })
  await db.query("CREATE TABLE IF NOT EXISTS `digital_museum` (`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `title` VARCHAR(200) NOT NULL, `summary` TEXT NULL, `content` LONGTEXT NULL, `source_url` VARCHAR(500) NULL, `source_name` VARCHAR(200) NULL, `evidence` TEXT NULL, `review_status` VARCHAR(20) NOT NULL DEFAULT 'pending', `status` TINYINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `idx_digital_museum_public` (`review_status`,`status`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4")
  return { courtyardSchemaReady: true, digitalMuseumSchemaReady: true }
}

if (require.main === module) migrateDigitalMuseum().then(console.log).catch((error) => { console.error(error.message); process.exitCode = 1 }).finally(() => pool.end())
module.exports = { migrateDigitalMuseum }
