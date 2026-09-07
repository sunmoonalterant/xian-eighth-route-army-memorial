const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const jwt = require('jsonwebtoken')

const { createApp } = require('../src/app')
const { fillDateSeries } = require('../src/services/statisticsService')

function createPool() {
  const calls = []
  return {
    calls,
    async query(sql, values = []) {
      calls.push({ sql, values })
      if (sql.includes('GROUP BY DATE(created_at)') && sql.includes('visit_log')) {
        return [[{ date: '2026-09-05', pv: 4, uv: 2 }]]
      }
      if (sql.includes('normalized_visits')) {
        return [[{ path: '/relic/:id', pv: 4, uv: 2 }]]
      }
      if (sql.includes('GROUP BY status')) {
        return [[
          { status: 0, reservations: 1, people: 2, active_reservations: 1, active_people: 2 },
          { status: 1, reservations: 1, people: 3, active_reservations: 1, active_people: 3 },
          { status: 2, reservations: 1, people: 4, active_reservations: 0, active_people: 0 },
          { status: 3, reservations: 1, people: 5, active_reservations: 1, active_people: 5 },
          { status: 4, reservations: 2, people: 6, active_reservations: 0, active_people: 0 },
        ]]
      }
      if (sql.includes('GROUP BY DATE(created_at)') && sql.includes('reservation')) {
        return [[{ date: '2026-09-05', reservations: 2, people: 5 }]]
      }
      if (sql.includes('GROUP BY s.period')) {
        return [[{ period: 'morning', reservations: 3, people: 8, active_reservations: 2, active_people: 5 }]]
      }
      if (sql.includes('FROM `visit_log`') && sql.includes('CURDATE()')) {
        return [[{ total_pv: 8, total_uv: 3, today_pv: 4, today_uv: 2 }]]
      }
      if (sql.includes('FROM `reservation`') && sql.includes('total_reservations')) {
        return [[{ total_reservations: 6, active_reservations: 3, cancelled_reservations: 1 }]]
      }
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
let pool
let authHeaders

before(async () => {
  process.env.JWT_SECRET = 'test-statistics-secret'
  pool = createPool()
  server = await startServer(createApp({ pool }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
  const token = jwt.sign({ adminId: 1, username: 'admin' }, process.env.JWT_SECRET)
  authHeaders = { authorization: `Bearer ${token}` }
})

after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))))

test('statistics endpoints reject unauthenticated callers', async () => {
  const response = await fetch(`${baseUrl}/api/admin/statistics/overview`)
  assert.equal(response.status, 401)
})

test('traffic trend creates all requested dates with zeros', () => {
  assert.deepEqual(fillDateSeries('2026-09-06', 3, [{ date: '2026-09-05', pv: 4, uv: 2 }]), [
    { date: '2026-09-04', pv: 0, uv: 0 },
    { date: '2026-09-05', pv: 4, uv: 2 },
    { date: '2026-09-06', pv: 0, uv: 0 },
  ])
})

test('protected statistics APIs return SQL aggregates and zero-filled trends', async () => {
  const endpoints = [
    '/overview',
    '/traffic-trend?days=7',
    '/page-ranking?limit=10',
    '/reservations',
    '/reservation-trend?days=7',
    '/period-distribution',
  ]
  const responses = await Promise.all(endpoints.map((endpoint) => fetch(`${baseUrl}/api/admin/statistics${endpoint}`, { headers: authHeaders })))
  for (const response of responses) assert.equal(response.status, 200)

  const [overview, trafficTrend, ranking, reservations, reservationTrend, periodDistribution] = await Promise.all(responses.map((response) => response.json()))
  assert.deepEqual(overview.data, {
    totalPv: 8, totalUv: 3, todayPv: 4, todayUv: 2,
    totalReservations: 6, activeReservations: 3, cancelledReservations: 1,
  })
  assert.equal(trafficTrend.data.length, 7)
  assert.deepEqual(trafficTrend.data.find((item) => item.date === '2026-09-05'), { date: '2026-09-05', pv: 4, uv: 2 })
  assert.deepEqual(ranking.data, [{ path: '/relic/:id', pageName: '文物详情', pv: 4, uv: 2 }])
  assert.deepEqual(reservations.data, {
    statuses: {
      PENDING: { reservations: 1, people: 2 }, SUCCESS: { reservations: 1, people: 3 },
      CANCELLED: { reservations: 1, people: 4 }, CHECKED_IN: { reservations: 1, people: 5 },
      EXPIRED: { reservations: 2, people: 6 },
    },
    totalReservations: 6, totalPeople: 20, activeReservations: 3, activePeople: 10,
  })
  assert.equal(reservationTrend.data.length, 7)
  assert.deepEqual(reservationTrend.data.find((item) => item.date === '2026-09-05'), { date: '2026-09-05', reservations: 2, people: 5 })
  assert.deepEqual(periodDistribution.data, [{ period: 'morning', reservations: 3, people: 8, activeReservations: 2, activePeople: 5 }])
})

test('statistics bounds reject out-of-range days and ranking limits', async () => {
  for (const endpoint of ['/traffic-trend?days=0', '/traffic-trend?days=91', '/reservation-trend?days=0', '/reservation-trend?days=91', '/page-ranking?limit=0', '/page-ranking?limit=51']) {
    const response = await fetch(`${baseUrl}/api/admin/statistics${endpoint}`, { headers: authHeaders })
    assert.equal(response.status, 400, endpoint)
  }
})

test('page ranking computes distinct UV after normalizing dynamic paths in SQL', async () => {
  await fetch(`${baseUrl}/api/admin/statistics/page-ranking?limit=10`, { headers: authHeaders })
  const rankingQuery = pool.calls.find(({ sql }) => sql.includes('normalized_visits'))
  assert.match(rankingQuery.sql, /COUNT\(DISTINCT visitor_id\)/)
  assert.match(rankingQuery.sql, /CASE[\s\S]*\/relic\/:id/)
})
