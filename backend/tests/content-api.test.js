const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const { createApp } = require('../src/app')

function createReadOnlyPool() {
  return {
    async query(sql) {
      if (sql.includes('FROM `museum`')) {
        return [[{
          id: 1,
          title: '纪念馆资料',
          summary: '馆情摘要',
          content: '馆情正文',
          cover_image: null,
          source_url: 'https://example.test/museum',
          created_at: '2026-09-02T00:00:00.000Z',
          updated_at: '2026-09-02T00:00:00.000Z',
        }]]
      }

      if (sql.includes('COUNT(*) AS total')) {
        return [[{ total: 1 }]]
      }

      if (sql.includes('FROM `relic`')) {
        return [[{
          id: 8,
          name: '测试文物',
          category: null,
          era: null,
          summary: '文物摘要',
          content: '文物正文',
          cover_image: null,
          views: 0,
          source_url: 'https://example.test/relic',
          created_at: '2026-09-02T00:00:00.000Z',
          updated_at: '2026-09-02T00:00:00.000Z',
        }]]
      }

      if (sql.includes('FROM `exhibition`')) {
        return [[{
          id: 3,
          title: '测试展览',
          category: null,
          summary: '展览摘要',
          content: '展览正文',
          cover_image: null,
          start_date: null,
          end_date: null,
          views: 0,
          source_url: 'https://example.test/exhibition',
          created_at: '2026-09-02T00:00:00.000Z',
          updated_at: '2026-09-02T00:00:00.000Z',
        }]]
      }

      throw new Error(`Unexpected query: ${sql}`)
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
  server = await startServer(createApp({ pool: createReadOnlyPool() }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))))

test('GET /api/museum converts persisted fields to the public camelCase contract', async () => {
  const response = await fetch(`${baseUrl}/api/museum`)

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    code: 200,
    message: 'success',
    data: {
      id: 1,
      title: '纪念馆资料',
      summary: '馆情摘要',
      content: '馆情正文',
      coverImage: null,
      sourceUrl: 'https://example.test/museum',
      createdAt: '2026-09-02T00:00:00.000Z',
      updatedAt: '2026-09-02T00:00:00.000Z',
    },
  })
})

test('GET /api/relics returns requested pagination and public field names', async () => {
  const response = await fetch(`${baseUrl}/api/relics?page=1&pageSize=2&keyword=%E6%B5%8B%E8%AF%95`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.code, 200)
  assert.equal(body.data.total, 1)
  assert.equal(body.data.page, 1)
  assert.equal(body.data.pageSize, 2)
  assert.equal(body.data.list[0].coverImage, null)
  assert.equal(body.data.list[0].sourceUrl, 'https://example.test/relic')
})

test('GET /api/relics rejects an invalid pagination parameter', async () => {
  const response = await fetch(`${baseUrl}/api/relics?page=0`)

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    code: 400,
    message: 'page must be a positive integer',
    data: null,
  })
})

test('GET /api/relics/:id rejects a non-numeric route id', async () => {
  const response = await fetch(`${baseUrl}/api/relics/not-a-number`)

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    code: 400,
    message: 'id must be a positive integer',
    data: null,
  })
})

test('GET /api/exhibitions/:id serializes unknown dates as null', async () => {
  const response = await fetch(`${baseUrl}/api/exhibitions/3`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.startDate, null)
  assert.equal(body.data.endDate, null)
})
