import test from 'node:test'
import assert from 'node:assert/strict'
import { homeNarrative } from '../src/data/homeNarrative.js'

test('home narrative excludes unverified historical timeline entries', () => {
  assert.deepEqual(homeNarrative.timeline, [])
})

test('home narrative exposes a direct digital-museum call to action', () => {
  assert.deepEqual(homeNarrative.digitalCta, {
    label: '进入线上旧址导览',
    to: '/digital-museum',
  })
})
