import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('EChartPanel owns init, update, resize and disposal lifecycle', () => {
  const source = readFileSync(new URL('../src/components/dashboard/EChartPanel.vue', import.meta.url), 'utf8')
  for (const token of ['echarts.init', 'setOption', 'addEventListener', 'removeEventListener', 'dispose', 'onBeforeUnmount']) {
    assert.match(source, new RegExp(token.replace('.', '\\.')))
  }
  assert.match(source, /emptyText/)
  assert.match(source, /errorMessage/)
})

test('StatCard uses a skeleton while a metric is loading', () => {
  const source = readFileSync(new URL('../src/components/dashboard/StatCard.vue', import.meta.url), 'utf8')
  assert.match(source, /loading/)
  assert.match(source, /ElSkeleton/)
  assert.match(source, /import \{ ElSkeleton, ElSkeletonItem \} from 'element-plus'/)
  assert.match(source, /label/)
  assert.match(source, /hint/)
})

test('chart loading state registers the Element Plus skeleton component', () => {
  const source = readFileSync(new URL('../src/components/dashboard/EChartPanel.vue', import.meta.url), 'utf8')
  assert.match(source, /import \{ ElSkeleton \} from 'element-plus'/)
})

test('dashboard chart tooltips are appended to the document body after responsive resizing', () => {
  for (const file of [
    'TrafficTrendChart.vue',
    'PageRankingChart.vue',
    'ReservationStatusChart.vue',
    'ReservationTrendChart.vue',
    'PeriodDistributionChart.vue',
  ]) {
    const source = readFileSync(new URL(`../src/components/dashboard/${file}`, import.meta.url), 'utf8')
    assert.match(source, /appendTo:'body'/)
  }
})

test('trend and period legends reserve space above their horizontal axes', () => {
  for (const file of ['TrafficTrendChart.vue', 'ReservationTrendChart.vue', 'PeriodDistributionChart.vue']) {
    const source = readFileSync(new URL(`../src/components/dashboard/${file}`, import.meta.url), 'utf8')
    assert.match(source, /legend:\{data:\[.*\],top:0\}/)
  }
})
