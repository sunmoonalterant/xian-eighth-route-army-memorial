const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const { createApp } = require('../src/app')

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
  })
}

let server
let baseUrl

before(async () => {
  server = await startServer(createApp({ pool: { query: async () => [[{ ok: 1 }]] } }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()))
}))

test('GET /api/health returns the server-running contract without a database query', async () => {
  const response = await fetch(`${baseUrl}/api/health`)

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    code: 200,
    message: 'server running',
    data: { status: 'ok' },
  })
})

test('GET /api/test-db reports a successful pool query as connected', async () => {
  const response = await fetch(`${baseUrl}/api/test-db`)

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    code: 200,
    message: 'database connected',
    data: { connected: true },
  })
})

test('GET /api/test-db returns a safe error body when the pool query fails', async () => {
  const failingServer = await startServer(createApp({ pool: { query: async () => { throw new Error('ECONNREFUSED') } } }))

  try {
    const response = await fetch(`http://127.0.0.1:${failingServer.address().port}/api/test-db`)

    assert.equal(response.status, 500)
    assert.deepEqual(await response.json(), {
      code: 500,
      message: 'internal server error',
      data: null,
    })
  } finally {
    await new Promise((resolve, reject) => failingServer.close((error) => (error ? reject(error) : resolve())))
  }
})
