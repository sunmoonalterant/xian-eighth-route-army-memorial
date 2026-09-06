const assert = require('node:assert/strict')
const { test } = require('node:test')

const { normalizeCourtyardInput, toPublicCourtyard } = require('../src/utils/courtyard')

test('rejects visual hotspot coordinates outside the percentage range', () => {
  assert.throws(() => normalizeCourtyardInput({
    name: '七贤庄一号院', summary: '摘要', sourceName: '纪念馆官网', evidence: '来源证据',
    positionX: 101, positionY: 30,
  }), /positionX is invalid/)
})

test('only serializes verified and published courtyards for visitors', () => {
  const pending = { id: 1, name: '七贤庄一号院', review_status: 'pending', status: 1 }
  assert.equal(toPublicCourtyard(pending), null)

  const verified = {
    id: 1, name: '七贤庄一号院', aliases: '一号院', description: '摘要', content: null,
    historical_use: '主要办公地点', current_use: null, position_x: '35.2', position_y: '62.8',
    image: null, source_url: 'https://example.test/1', source_name: '纪念馆官网', evidence: '来源证据',
    review_status: 'verified', status: 1, sort_order: 10,
  }
  assert.deepEqual(toPublicCourtyard(verified), {
    id: 1, name: '七贤庄一号院', aliases: ['一号院'], summary: '摘要', content: null,
    historicalUse: '主要办公地点', currentUse: null, positionX: 35.2, positionY: 62.8,
    coverImage: null, galleryImages: [], sourceUrl: 'https://example.test/1', sourceName: '纪念馆官网',
  })
})
