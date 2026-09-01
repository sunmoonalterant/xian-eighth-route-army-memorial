import test from 'node:test'
import assert from 'node:assert/strict'
import { historyEvents } from '../src/data/museum.js'
import { people } from '../src/data/people.js'
import { digitalGuide } from '../src/data/digitalMuseum.js'
import { officialNews } from '../src/data/officialNews.js'
import { officialCourtyards } from '../src/data/officialCourtyards.js'

test('history timeline exposes five clearly marked demonstration events', () => {
  assert.equal(historyEvents.length, 5)
  assert.ok(historyEvents.every((event) => event.date === '时间待核实'))
  assert.ok(historyEvents.every((event) => event.title.includes('演示')))
})

test('people records use a neutral verification placeholder instead of portrait assets', () => {
  assert.deepEqual(people.map((person) => person.name), ['人物档案一（演示）', '人物档案二（演示）', '人物档案三（演示）'])
  assert.ok(people.every((person) => person.image.includes('person-placeholder')))
  assert.ok(people.every((person) => person.status === '资料待核实'))
})

test('digital guide keeps the four requested courtyard areas', () => {
  assert.deepEqual(digitalGuide.courtyards.map((courtyard) => courtyard.number), ['①', '③', '④', '⑦'])
})

test('imported official records retain source traceability and pending review status', () => {
  assert.ok([...officialNews, ...officialCourtyards].every((item) => (
    item.sourceUrl.startsWith('http://www.xabb.org.cn/')
    && item.verified === false
    && item.reviewStatus === 'pending'
  )))
})
