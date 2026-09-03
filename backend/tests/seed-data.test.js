const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')

const { dedupeExhibitions, exhibitionIdentity, preferLocalCoverImage } = require('../src/utils/officialIdentity')

test('reviewed exhibitions with the same source, title, and normalized body share one stable identity', () => {
  const exhibitions = require(path.resolve(__dirname, '../../crawler/node/output/reviewed/exhibitions.json'))
  const identities = exhibitions.map(exhibitionIdentity)

  assert.equal(new Set(identities).size, 2)
})

test('exhibitions with the same title remain distinct when their body differs', () => {
  const first = exhibitionIdentity({
    sourceUrl: 'https://example.test/display/4',
    title: '同名展览',
    contentText: '第一段资料',
  })
  const second = exhibitionIdentity({
    sourceUrl: 'https://example.test/display/4',
    title: '同名展览',
    contentText: '第二段资料',
  })

  assert.notEqual(first, second)
})

test('seed input keeps the first canonical record for an otherwise duplicated exhibition', () => {
  const records = [
    { sourceUrl: 'https://example.test/display/4', title: '同一展览', contentText: '完整 正文', coverImage: '/images/first.jpg' },
    { sourceUrl: 'https://example.test/display/4', title: '同一展览', contentText: '完整正文', coverImage: '/images/second.jpg' },
  ]

  assert.deepEqual(dedupeExhibitions(records), [records[0]])
})

test('seed identity matches an existing database row with snake_case source fields', () => {
  const reviewed = exhibitionIdentity({
    sourceUrl: 'https://example.test/display/4',
    title: '同一展览',
    contentText: '完整正文',
  })
  const persisted = exhibitionIdentity({
    source_url: 'https://example.test/display/4',
    title: '同一展览',
    content: '完整 正文',
  })

  assert.equal(persisted, reviewed)
})

test('seed retains an existing localized exhibition cover instead of restoring a remote URL', () => {
  assert.equal(
    preferLocalCoverImage('http://www.xabb.org.cn/upload/cover.jpg', '/images/exhibitions/exhibition-2-01.JPG'),
    '/images/exhibitions/exhibition-2-01.JPG',
  )
  assert.equal(
    preferLocalCoverImage('/images/exhibitions/exhibition-2-01.JPG', 'http://www.xabb.org.cn/upload/cover.jpg'),
    '/images/exhibitions/exhibition-2-01.JPG',
  )
})
