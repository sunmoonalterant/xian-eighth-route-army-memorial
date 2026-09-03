const assert = require('node:assert/strict')
const { test } = require('node:test')

const {
  sanitizeContent,
  validateExhibitionInput,
  validateRelicInput,
} = require('../src/utils/contentValidation')

test('content sanitizer strips executable HTML while retaining simple text markup', () => {
  const result = sanitizeContent('<p onclick="alert(1)">安全</p><script>alert(1)</script><a href="javascript:alert(1)">链接</a>')
  assert.equal(result.includes('<script'), false)
  assert.equal(result.includes('onclick'), false)
  assert.equal(result.includes('javascript:'), false)
  assert.match(result, /安全/)
})

test('content validators accept only known fields and reject invalid input', () => {
  const relic = validateRelicInput({ name: '课程设计文物', unknown: 'ignored', sourceUrl: 'https://example.com/source' })
  assert.deepEqual(relic, {
    name: '课程设计文物', categoryId: null, era: null, summary: null, content: null,
    coverImage: null, sourceUrl: 'https://example.com/source', status: 1,
  })
  assert.throws(() => validateRelicInput({ name: '' }), /name/)
})

test('content validators accept safe local public cover paths but keep source URLs external', () => {
  const relic = validateRelicInput({
    name: '本地封面文物',
    coverImage: '/images/relics/relic-1-01.png',
    sourceUrl: 'https://example.com/source',
  })
  assert.equal(relic.coverImage, '/images/relics/relic-1-01.png')
  assert.throws(
    () => validateRelicInput({ name: '不安全封面', coverImage: 'javascript:alert(1)' }),
    /coverImage/,
  )
  assert.throws(
    () => validateRelicInput({ name: '非外部来源', sourceUrl: '/images/relics/relic-1-01.png' }),
    /sourceUrl/,
  )
})

test('exhibition validator rejects an inverted date range', () => {
  assert.throws(
    () => validateExhibitionInput({ title: '课程设计展览', startDate: '2026-09-03', endDate: '2026-09-02' }),
    /endDate/,
  )
})
