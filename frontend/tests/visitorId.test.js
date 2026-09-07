import assert from 'node:assert/strict'
import test from 'node:test'

import { VISITOR_ID_KEY, createVisitorIdStore, createUuidV4 } from '../src/utils/visitorId.js'

class MapStorage {
  constructor() { this.values = new Map() }
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, value) }
}

test('visitor id is created once and reused under the anonymous storage key', () => {
  const storage = new MapStorage()
  const id = '9f20b91a-580f-47b2-a1b5-926e9d7b1b91'
  const visitorIds = createVisitorIdStore(storage, () => id)

  assert.equal(visitorIds.getVisitorId(), id)
  assert.equal(visitorIds.getVisitorId(), id)
  assert.equal(storage.getItem(VISITOR_ID_KEY), id)
})

test('UUID fallback produces a v4-shaped anonymous value without browser metadata', () => {
  const id = createUuidV4({ getRandomValues: (bytes) => bytes.fill(1) })
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
})
