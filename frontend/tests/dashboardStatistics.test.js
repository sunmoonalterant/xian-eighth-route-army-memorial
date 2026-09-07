import assert from 'node:assert/strict'
import test from 'node:test'

import { createStatisticsApi } from '../src/api/statistics.js'
import {
  formatMetric,
  formatShortDate,
  getAxisLabelInterval,
  hasPositiveReservationStatuses,
  toRankingRows,
} from '../src/utils/dashboardStatistics.js'

test('statistics API adapter uses all six protected D12 endpoints', async () => {
  const calls = []
  const api = createStatisticsApi({ get: async (...args) => { calls.push(args); return null } })

  await Promise.all([
    api.fetchOverview(), api.fetchTrafficTrend(14), api.fetchPageRanking(10),
    api.fetchReservationStatistics(), api.fetchReservationTrend(30), api.fetchPeriodDistribution(),
  ])

  assert.deepEqual(calls, [
    ['/admin/statistics/overview'],
    ['/admin/statistics/traffic-trend', { params: { days: 14 } }],
    ['/admin/statistics/page-ranking', { params: { limit: 10 } }],
    ['/admin/statistics/reservations'],
    ['/admin/statistics/reservation-trend', { params: { days: 30 } }],
    ['/admin/statistics/period-distribution'],
  ])
})

test('dashboard helpers format display values without recomputing API-owned statistics', () => {
  assert.equal(formatMetric(1234), '1,234')
  assert.equal(formatMetric(null), '0')
  assert.equal(formatShortDate('2026-09-06'), '09-06')
  assert.equal(getAxisLabelInterval(7), 1)
  assert.equal(getAxisLabelInterval(14), 3)
  assert.equal(getAxisLabelInterval(30), 7)
  assert.equal(hasPositiveReservationStatuses({ statuses: { PENDING: { reservations: 0 }, SUCCESS: { reservations: 0 } } }), false)
  assert.equal(hasPositiveReservationStatuses({ statuses: { PENDING: { reservations: 1 } } }), true)

  const ranking = [
    { pageName: '馆藏文物', path: '/relics', pv: 35, uv: 12 },
    { pageName: '文物详情', path: '/relic/:id', pv: 20, uv: 8 },
  ]
  assert.deepEqual(toRankingRows(ranking), ranking)
})
