import test from 'node:test'
import assert from 'node:assert/strict'
import { findRecord } from '../src/data/contentLookup.js'

test('findRecord returns the matching record for a route id', () => {
  const records = [{ id: 'r-01', title: '演示文物' }]

  assert.deepEqual(findRecord(records, 'r-01'), records[0])
})

test('findRecord returns undefined when a route id is unavailable', () => {
  assert.equal(findRecord([{ id: 'r-01' }], 'missing'), undefined)
})
