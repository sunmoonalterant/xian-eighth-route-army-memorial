const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const { createApp } = require('../src/app')

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
  })
}

function createSchedulePool() {
  return {
    async query(sql) {
      if (sql.includes('FROM `visit_schedule`')) {
        return [[{
          id: 1,
          visit_date: '2026-09-10',
          period: 'morning',
          capacity: 100,
          reserved_count: 42,
          status: 1,
        }]]
      }
      throw new Error(`Unexpected query: ${sql}`)
    },
  }
}

let server
let baseUrl

before(async () => {
  server = await startServer(createApp({ pool: createSchedulePool() }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()))
}))

test('GET /api/visit-schedules returns server-calculated remaining capacity', async () => {
  const response = await fetch(`${baseUrl}/api/visit-schedules?date=2026-09-10`)

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    code: 200,
    message: 'success',
    data: [{
      id: 1,
      visitDate: '2026-09-10',
      period: 'morning',
      label: '09:00—12:00',
      capacity: 100,
      reservedCount: 42,
      remaining: 58,
      available: true,
    }],
  })
})

test('POST /api/reservations rejects a non-positive peopleCount before opening a transaction', async () => {
  const response = await fetch(`${baseUrl}/api/reservations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: '测试游客',
      phone: '13800138000',
      idCard: '11010519491231002X',
      scheduleId: 1,
      peopleCount: 0,
    }),
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    code: 400,
    message: 'peopleCount must be between 1 and 5',
    data: null,
  })
})

test('GET /api/reservations/query requires both reservationNo and phone', async () => {
  const response = await fetch(`${baseUrl}/api/reservations/query?reservationNo=XA202609100001`)

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    code: 400,
    message: 'reservationNo and phone are required',
    data: null,
  })
})
