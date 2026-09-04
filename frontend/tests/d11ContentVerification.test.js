import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { people } from '../src/data/people.js'
import { historyEvents } from '../src/data/museum.js'
import { digitalGuide } from '../src/data/digitalMuseum.js'

test('unverified person records are excluded from visitor-facing data', () => {
  assert.deepEqual(people, [])
})

test('history demonstrations retain a verification boundary in the timeline data', () => {
  assert.ok(historyEvents.length > 0)
  assert.ok(historyEvents.every((event) => event.isPlaceholder === true && event.date === '时间待核实'))
})

test('unverified courtyard hotspots are excluded from the digital guide', () => {
  assert.deepEqual(digitalGuide.courtyards, [])
})

test('digital guide description states the verification boundary instead of presenting a feature preview', () => {
  assert.match(digitalGuide.description, /资料正在整理中/)
  assert.doesNotMatch(digitalGuide.description, /特色功能预览/)
})

test('site search does not include placeholder people or history events', () => {
  const source = fs.readFileSync(new URL('../src/views/Search.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /from ['"]\.\.\/data\/people/)
  assert.doesNotMatch(source, /from ['"]\.\.\/data\/museum/)
})
