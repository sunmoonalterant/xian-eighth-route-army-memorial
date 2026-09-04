import test from 'node:test'
import assert from 'node:assert/strict'
import { historyEvents } from '../src/data/museum.js'
import { people } from '../src/data/people.js'
import { digitalGuide } from '../src/data/digitalMuseum.js'
import { officialNews } from '../src/data/officialNews.js'
import { officialCourtyards } from '../src/data/officialCourtyards.js'

test('history timeline excludes unverified demonstration events', () => {
  assert.deepEqual(historyEvents, [])
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
