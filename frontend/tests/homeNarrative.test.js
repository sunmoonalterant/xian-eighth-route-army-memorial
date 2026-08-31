import test from 'node:test'
import assert from 'node:assert/strict'
import { homeNarrative } from '../src/data/homeNarrative.js'

test('home narrative keeps the requested historical timeline in chronological order', () => {
  assert.deepEqual(
    homeNarrative.timeline.map((item) => item.year),
    ['1936', '1937', '1938', '1941', '1944', '1946'],
  )
})

test('home narrative exposes a direct digital-museum call to action', () => {
  assert.deepEqual(homeNarrative.digitalCta, {
    label: '进入线上旧址导览',
    to: '/digital-museum',
  })
})
