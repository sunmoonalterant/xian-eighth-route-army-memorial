import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('dashboard loads six D12 modules and exposes all required metrics and states', () => {
  const source = readFileSync(new URL('../src/views/AdminDashboard.vue', import.meta.url), 'utf8')
  for (const token of ['fetchOverview', 'fetchTrafficTrend', 'fetchPageRanking', 'fetchReservationStatistics', 'fetchReservationTrend', 'fetchPeriodDistribution', 'Promise.allSettled', '总访问量（PV）', '独立访客（UV）', '今日访问量', '今日独立访客', '预约总数', '有效预约', '近7天', '近14天', '近30天', '刷新数据']) assert.match(source, new RegExp(token.replace(/[()]/g, '\\$&')))
})

test('dashboard charts cover every D12 visualization with empty-state handling', () => {
  for (const [file, copy] of [
    ['TrafficTrendChart.vue', 'PV'], ['PageRankingChart.vue', '暂无页面访问数据'], ['ReservationStatusChart.vue', '暂无预约数据'], ['ReservationTrendChart.vue', '预约单数'], ['PeriodDistributionChart.vue', '暂无时段预约数据'],
  ]) {
    const source = readFileSync(new URL(`../src/components/dashboard/${file}`, import.meta.url), 'utf8')
    assert.match(source, new RegExp(copy))
    assert.match(source, /EChartPanel/)
  }
})

test('mobile admin layout keeps its single grid track shrinkable', () => {
  const source = readFileSync(new URL('../src/views/AdminLayout.vue', import.meta.url), 'utf8')
  assert.match(source, /@media\(max-width:760px\)\{\.admin-layout\{grid-template-columns:minmax\(0,1fr\)\}/)
})
