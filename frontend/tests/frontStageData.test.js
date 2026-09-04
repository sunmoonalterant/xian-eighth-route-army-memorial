import test from 'node:test'
import assert from 'node:assert/strict'
import { historyEvents } from '../src/data/museum.js'
import { people } from '../src/data/people.js'
import { digitalGuide } from '../src/data/digitalMuseum.js'
import { officialNews } from '../src/data/officialNews.js'
import { officialCourtyards } from '../src/data/officialCourtyards.js'

test('history timeline contains only clearly marked course-design demonstrations', () => {
  assert.equal(historyEvents.length, 5)
  assert.ok(historyEvents.every((event) => (
    event.isPlaceholder === true
    && event.year === '资料整理中'
    && event.date === '时间待核实'
    && event.title.includes('（演示）')
  )))
})

test('people records exclude unverified demonstration profiles', () => {
  assert.deepEqual(people, [])
})

test('digital guide excludes unverified courtyard hotspots', () => {
  assert.deepEqual(digitalGuide.courtyards, [])
})

test('imported official records retain source traceability and pending review status', () => {
  assert.ok([...officialNews, ...officialCourtyards].every((item) => (
    item.sourceUrl.startsWith('http://www.xabb.org.cn/')
    && item.verified === false
    && item.reviewStatus === 'pending'
  )))
})
