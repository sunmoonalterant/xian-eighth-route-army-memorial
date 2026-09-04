import test from 'node:test'
import assert from 'node:assert/strict'
import { homeNarrative } from '../src/data/homeNarrative.js'

test('home narrative uses the verified seven-step Qixianzhuang timeline', () => {
  assert.equal(homeNarrative.timeline.length, 7)
  assert.deepEqual(homeNarrative.timeline.map((item) => item.year), [
    '1934—1936', '1936', '1936年末', '1937年', '1937—1946', '1946年9月10日', '1959年',
  ])
  assert.match(homeNarrative.timeline[0].label, /始建|落成/)
  assert.match(homeNarrative.timeline[6].label, /纪念馆/)
})

test('home narrative exposes a direct digital-museum call to action', () => {
  assert.deepEqual(homeNarrative.digitalCta, {
    label: '进入线上旧址导览',
    to: '/digital-museum',
  })
})
