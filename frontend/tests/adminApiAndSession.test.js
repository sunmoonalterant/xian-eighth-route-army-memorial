import assert from 'node:assert/strict'
import test from 'node:test'

import { createAdminAuthApi } from '../src/api/adminAuth.js'
import { createAdminReservationApi } from '../src/api/adminReservations.js'
import {
  adminStatusLabels,
  availableAdminActions,
  buildAdminReservationParams,
  sanitizeAdminSession,
} from '../src/utils/adminReservationFlow.js'

test('admin API adapters use the protected authentication and reservation endpoints', async () => {
  const calls = []
  const http = {
    get: async (...args) => { calls.push(['get', ...args]); return { ok: true } },
    post: async (...args) => { calls.push(['post', ...args]); return { ok: true } },
    patch: async (...args) => { calls.push(['patch', ...args]); return { ok: true } },
  }

  const auth = createAdminAuthApi(http)
  const reservations = createAdminReservationApi(http)
  await auth.login({ username: 'admin', password: 'secret' })
  await auth.getCurrentAdmin()
  await reservations.getList({ page: 2, pageSize: 20, status: 'PENDING' })
  await reservations.getById(8)
  await reservations.updateStatus(8, 'SUCCESS')

  assert.deepEqual(calls, [
    ['post', '/admin/auth/login', { username: 'admin', password: 'secret' }],
    ['get', '/admin/auth/me'],
    ['get', '/admin/reservations', { params: { page: 2, pageSize: 20, status: 'PENDING' } }],
    ['get', '/admin/reservations/8'],
    ['patch', '/admin/reservations/8/status', { status: 'SUCCESS' }],
  ])
})

test('admin reservation helpers only retain safe session fields and provide valid status actions', () => {
  assert.deepEqual(sanitizeAdminSession({
    token: 'jwt-value',
    admin: { id: 1, username: 'admin', displayName: '系统管理员', password: 'secret', passwordHash: 'hash' },
  }), {
    token: 'jwt-value',
    admin: { id: 1, username: 'admin', displayName: '系统管理员' },
  })
  assert.deepEqual(availableAdminActions('PENDING'), ['SUCCESS', 'CANCELLED'])
  assert.deepEqual(availableAdminActions('SUCCESS'), ['CHECKED_IN', 'CANCELLED'])
  assert.deepEqual(availableAdminActions('CANCELLED'), [])
  assert.equal(adminStatusLabels.CHECKED_IN, '已核销')
})

test('admin reservation query keeps only meaningful filter values', () => {
  assert.deepEqual(buildAdminReservationParams({
    page: 1, pageSize: 10, keyword: ' XA2026 ', status: '', visitDate: '2026-09-03',
  }), {
    page: 1, pageSize: 10, keyword: 'XA2026', visitDate: '2026-09-03',
  })
})
