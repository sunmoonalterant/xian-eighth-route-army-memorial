const assert = require('node:assert/strict')
const test = require('node:test')

const { migrateReservationConstraints } = require('../scripts/migrateReservationConstraints')

test('migrateReservationConstraints replaces the broad phone-date unique index with an active-reservation index', async () => {
  const calls = []
  const pool = {
    async query(sql) {
      calls.push(sql)
      if (sql.startsWith('SHOW COLUMNS')) return [[]]
      if (sql.startsWith('SHOW INDEX')) return [[{ Key_name: 'uk_reservation_phone_visit_date' }]]
      return [{ affectedRows: 0 }]
    },
  }

  const result = await migrateReservationConstraints(pool)

  assert.deepEqual(result, { activePhoneColumnAdded: true, oldUniqueIndexRemoved: true })
  assert.ok(calls.some((sql) => sql.includes('ADD COLUMN `active_phone`')))
  assert.ok(calls.some((sql) => sql.includes('DROP INDEX `uk_reservation_phone_visit_date`')))
  assert.ok(calls.some((sql) => sql.includes('ADD UNIQUE KEY `uk_reservation_active_phone_visit_date`')))
})
