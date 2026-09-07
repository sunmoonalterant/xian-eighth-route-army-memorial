const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const { createApp } = require('../src/app')

const UUID_A = '9f20b91a-580f-47b2-a1b5-926e9d7b1b91'

function createPool() {
  const calls = []
  return {
    calls,
    async query(sql, values) {
      calls.push({ sql, values })
      return [{ affectedRows: 1 }]
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

before(async () => {
  pool = createPool()
  server = await startServer(createApp({ pool }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))))

function post(body) {
  return fetch(`${baseUrl}/api/visit-logs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

test('POST /api/visit-logs writes only anonymous visitor and route path', async () => {
  const response = await post({ visitorId: UUID_A, path: '/relic/12' })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { code: 200, message: 'success', data: null })
  assert.equal(pool.calls.length, 1)
  assert.match(pool.calls[0].sql, /INSERT INTO `visit_log` \(`visitor_id`, `page_path`\) VALUES \(\?, \?\)/)
  assert.deepEqual(pool.calls[0].values, [UUID_A, '/relic/12'])
})

test('POST /api/visit-logs rejects malformed visitor ids and unsafe paths', async () => {
  for (const body of [
    { visitorId: 'not-a-uuid', path: '/' },
    { visitorId: UUID_A },
    { visitorId: UUID_A, path: '/reservation/query?phone=13800138000' },
    { visitorId: UUID_A, path: `/${'a'.repeat(255)}` },
  ]) {
    const response = await post(body)
    assert.equal(response.status, 400)
  }
})
