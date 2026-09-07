import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { createVisitLogApi } from '../src/api/visitLogs.js'
import { createVisitTracker, shouldRecordVisit } from '../src/utils/visitTracking.js'

const UUID_A = '9f20b91a-580f-47b2-a1b5-926e9d7b1b91'

test('visit API posts only the anonymous visitor id and route path', async () => {
  const calls = []
  const api = createVisitLogApi({ post: async (...args) => calls.push(args) })
  await api.recordVisit({ visitorId: UUID_A, path: '/people' })
  assert.deepEqual(calls, [['/visit-logs', { visitorId: UUID_A, path: '/people' }]])
})

test('tracks visitor paths but never administrator paths', async () => {
  const calls = []
  const track = createVisitTracker({
    getVisitorId: () => UUID_A,
    recordVisit: (body) => calls.push(body),
    debug: () => {},
  })
  await track({ path: '/people' })
  await track({ path: '/admin/people' })

  assert.deepEqual(calls, [{ visitorId: UUID_A, path: '/people' }])
  assert.equal(shouldRecordVisit('/admin'), false)
  assert.equal(shouldRecordVisit('/admin/login'), false)
})

test('tracking failure cannot reject a completed navigation', async () => {
  const track = createVisitTracker({
    getVisitorId: () => UUID_A,
    recordVisit: async () => { throw new Error('offline') },
    debug: () => {},
  })
  await assert.doesNotReject(() => track({ path: '/' }))
})

test('router uses one post-navigation hook and records only to.path', async () => {
  const source = await readFile(new URL('../src/router/index.js', import.meta.url), 'utf8')
  assert.equal((source.match(/router\.afterEach\(/g) || []).length, 1)
  assert.match(source, /trackVisitorRoute\(to\)/)
  assert.doesNotMatch(source, /trackVisitorRoute\(to\.fullPath\)/)
})
