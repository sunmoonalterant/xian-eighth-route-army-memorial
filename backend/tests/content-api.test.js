const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const { createApp } = require('../src/app')

function createReadOnlyPool() {
  return {
    async query(sql, values = []) {
      if (sql.includes('FROM `media_asset`')) {
        const assets = {
          relic: [
            { local_path: '/uploads/relics/relic-cover.jpg', caption: '已核验封面', review_status: 'verified', status: 1, usage_type: 'cover' },
            { local_path: '/uploads/relics/relic-gallery.jpg', caption: '已核验图库', review_status: 'verified', status: 1, usage_type: 'gallery' },
          ],
          article: [
            { local_path: '/uploads/news/article-cover.jpg', caption: '新闻封面', review_status: 'verified', status: 1, usage_type: 'cover' },
            { local_path: '/uploads/news/article-content.jpg', caption: '新闻正文图', review_status: 'verified', status: 1, usage_type: 'content' },
          ],
        }
        return [assets[values[0]] || []]
      }

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

      if (sql.includes('FROM `article`')) {
        return [[{
          id: 6,
          title: '测试新闻',
          category: '新闻动态',
          summary: '新闻摘要',
          content: '新闻正文',
          cover_image: null,
          views: 0,
          published_at: null,
          source_url: 'https://example.test/article',
          status: 1,
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
  assert.equal(body.data.list[0].coverImage, '/uploads/relics/relic-cover.jpg')
  assert.deepEqual(body.data.list[0].galleryImages, [{ url: '/uploads/relics/relic-gallery.jpg', caption: '已核验图库' }])
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

test('GET /api/relics/:id prefers a verified upload cover and returns its verified gallery', async () => {
  const response = await fetch(`${baseUrl}/api/relics/8`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.coverImage, '/uploads/relics/relic-cover.jpg')
  assert.deepEqual(body.data.galleryImages, [{ url: '/uploads/relics/relic-gallery.jpg', caption: '已核验图库' }])
})

test('GET /api/articles/:id exposes only verified news cover and content images', async () => {
  const response = await fetch(`${baseUrl}/api/articles/6`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.coverImage, '/uploads/news/article-cover.jpg')
  assert.deepEqual(body.data.contentImages, [{ url: '/uploads/news/article-content.jpg', caption: '新闻正文图' }])
})

test('GET /api/exhibitions/:id serializes unknown dates as null', async () => {
  const response = await fetch(`${baseUrl}/api/exhibitions/3`)

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.startDate, null)
  assert.equal(body.data.endDate, null)
})
