const assert = require('node:assert/strict')
const test = require('node:test')

const { buildScheduleDates, seedVisitSchedules } = require('../scripts/seedVisitSchedules')

test('buildScheduleDates skips Mondays while preserving each other day in the development window', () => {
  const dates = buildScheduleDates({ days: 7, startDate: new Date('2026-09-07T12:00:00') })

  assert.deepEqual(dates, [
    '2026-09-08',
    '2026-09-09',
    '2026-09-10',
    '2026-09-11',
    '2026-09-12',
    '2026-09-13',
  ])
})

test('seedVisitSchedules inserts each date-period pair once and leaves existing schedules untouched', async () => {
  const calls = []
  const pool = {
    async query(sql, values) {
      calls.push({ sql, values })
      return [{ affectedRows: calls.length === 1 ? 1 : 0 }]
    },
  }

  const result = await seedVisitSchedules(pool, {
    dates: ['2026-09-08'],
    capacity: 100,
  })

  assert.deepEqual(result, { inserted: 1, skipped: 1, total: 2 })
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[0].values, ['2026-09-08', 'morning', 100])
  assert.deepEqual(calls[1].values, ['2026-09-08', 'afternoon', 100])
})
