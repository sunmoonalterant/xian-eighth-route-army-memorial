require('dotenv').config({ quiet: true })

const pool = require('../src/config/db')

async function migrateMediaAssets(dbPool) {
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS \`media_asset\` (
      \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`entity_type\` VARCHAR(30) NOT NULL,
      \`entity_id\` BIGINT UNSIGNED NOT NULL,
      \`usage_type\` VARCHAR(30) NOT NULL,
      \`local_path\` VARCHAR(500) NOT NULL,
      \`source_image_url\` VARCHAR(500) NULL,
      \`source_page_url\` VARCHAR(500) NULL,
      \`publisher\` VARCHAR(200) NULL,
      \`caption\` TEXT NULL,
      \`identity_evidence\` TEXT NULL,
      \`person_position\` VARCHAR(100) NULL,
      \`sort_order\` INT NOT NULL DEFAULT 0,
      \`review_status\` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
      \`status\` TINYINT NOT NULL DEFAULT 0,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_media_asset_entity\` (\`entity_type\`, \`entity_id\`, \`usage_type\`, \`status\`, \`review_status\`),
      KEY \`idx_media_asset_local_path\` (\`local_path\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人物、文物、新闻与展览图片资源'
  `)
  return { mediaAssetTableReady: true }
}

async function main() {
  try { console.log(JSON.stringify(await migrateMediaAssets(pool))) } finally { await pool.end() }
}

if (require.main === module) main().catch((error) => { console.error('media asset migration failed:', error.message); process.exitCode = 1 })

module.exports = { migrateMediaAssets }
