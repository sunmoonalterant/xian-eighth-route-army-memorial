const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { createApp } = require('../src/app')

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
  })
}

let server
let baseUrl

before(async () => {
  process.env.JWT_SECRET = 'test-only-jwt-secret-for-admin-auth'
  const passwordHash = await bcrypt.hash('correct-password', 4)
  const admin = {
    id: 7,
    username: 'admin',
    display_name: '系统管理员',
    password_hash: passwordHash,
    role: 'admin',
    status: 1,
  }
  server = await startServer(createApp({
    pool: {
      query: async (sql, values) => {
        if (sql.includes('WHERE username = ?')) {
          return [values[0] === admin.username ? [admin] : []]
        }
        if (sql.includes('WHERE id = ?')) {
          return [values[0] === admin.id ? [admin] : []]
        }
        return [[]]
      },
    },
  }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()))
}))

test('POST /api/admin/auth/login rejects unknown credentials without exposing details', async () => {
  const response = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'unknown', password: 'incorrect-password' }),
  })

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), {
    code: 401,
    message: 'invalid credentials',
    data: null,
  })
})

test('GET /api/admin/auth/me requires a bearer token', async () => {
  const response = await fetch(`${baseUrl}/api/admin/auth/me`)

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), {
    code: 401,
    message: 'authentication required',
    data: null,
  })
})

test('POST /api/admin/auth/login returns a safe JWT and administrator profile', async () => {
  const response = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'correct-password' }),
  })

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.code, 200)
  assert.deepEqual(body.data.admin, {
    id: 7,
    username: 'admin',
    displayName: '系统管理员',
    role: 'admin',
  })
  assert.equal(typeof body.data.token, 'string')
  assert.deepEqual(jwt.verify(body.data.token, process.env.JWT_SECRET), {
    adminId: 7,
    username: 'admin',
    iat: jwt.decode(body.data.token).iat,
    exp: jwt.decode(body.data.token).exp,
  })
  assert.doesNotMatch(JSON.stringify(body), /password_hash|correct-password/)
})

test('GET /api/admin/auth/me accepts a valid bearer token and rejects an invalid one', async () => {
  const token = jwt.sign({ adminId: 7, username: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' })
  const validResponse = await fetch(`${baseUrl}/api/admin/auth/me`, {
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(validResponse.status, 200)
  assert.deepEqual((await validResponse.json()).data, {
    id: 7,
    username: 'admin',
    displayName: '系统管理员',
    role: 'admin',
  })

  const invalidResponse = await fetch(`${baseUrl}/api/admin/auth/me`, {
    headers: { authorization: 'Bearer invalid-token' },
  })
  assert.equal(invalidResponse.status, 401)
  assert.equal((await invalidResponse.json()).message, 'authentication required')
})
