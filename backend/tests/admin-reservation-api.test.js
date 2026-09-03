const assert = require('node:assert/strict')
const express = require('express')
const { after, before, test } = require('node:test')

const createAdminReservationRouter = require('../src/routes/adminReservation')
const { errorHandler, notFoundHandler } = require('../src/middleware/errorHandler')

function createPool() {
  return {
    async query(sql, values = []) {
      if (sql.includes('COUNT(*) AS total')) return [[{ total: 1 }]]
      if (sql.includes('WHERE r.id = ?')) return [[{
        id: 7,
        reservation_no: 'XA202609030001',
        name: '测试游客',
        phone: '13800138000',
        visit_date: '2026-09-03',
        period: 'morning',
        people_count: 2,
        status: 0,
        remark: null,
        created_at: '2026-09-01T00:00:00.000Z',
        updated_at: '2026-09-01T00:00:00.000Z',
      }]]
      if (sql.includes('FROM `reservation`')) return [[{
        id: 7,
        reservation_no: 'XA202609030001',
        name: '测试游客',
        phone: '13800138000',
        visit_date: '2026-09-03',
        period: 'morning',
        people_count: 2,
        status: 0,
        created_at: '2026-09-01T00:00:00.000Z',
      }]]
      throw new Error(`Unexpected query: ${sql}; ${JSON.stringify(values)}`)
    },
  }
}

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
  })
}

let server
let baseUrl

before(async () => {
  const app = express()
  app.use(express.json())
  app.use('/api/admin/reservations', createAdminReservationRouter(createPool(), (request, response, next) => {
    request.admin = { adminId: 1, username: 'admin' }
    next()
  }))
  app.use(notFoundHandler)
  app.use(errorHandler)
  server = await startServer(app)
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))))

test('admin reservation list masks phones and accepts semantic status filters', async () => {
  const response = await fetch(`${baseUrl}/api/admin/reservations?status=PENDING&page=1&pageSize=10`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.total, 1)
  assert.equal(body.data.list[0].phone, '138****8000')
  assert.equal(body.data.list[0].status, 'PENDING')
})

test('admin reservation detail exposes phone but never an identity card', async () => {
  const response = await fetch(`${baseUrl}/api/admin/reservations/7`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.phone, '13800138000')
  assert.equal(body.data.idCard, undefined)
})

test('admin reservation endpoints reject invalid status and id input', async () => {
  const statusResponse = await fetch(`${baseUrl}/api/admin/reservations?status=NOT_A_STATUS`)
  assert.equal(statusResponse.status, 400)

  const idResponse = await fetch(`${baseUrl}/api/admin/reservations/nope`)
  assert.equal(idResponse.status, 400)
})
