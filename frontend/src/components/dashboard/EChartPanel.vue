<script setup>
import * as echarts from 'echarts'
import { ElSkeleton } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  option: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无统计数据' },
  errorMessage: { type: String, default: '' },
  ariaLabel: { type: String, required: true },
})

const chartElement = ref(null)
let chart = null
const drawable = computed(() => Boolean(props.option) && !props.loading && !props.empty && !props.errorMessage)

function disposeChart() {
  if (chart) {
    chart.dispose()
    chart = null
  }
}

async function renderChart() {
  if (!drawable.value) {
    disposeChart()
    return
  }
  await nextTick()
  if (!chartElement.value) return
  chart ||= echarts.init(chartElement.value)
  chart.setOption(props.option, true)
}

function resizeChart() {
  chart?.resize()
}

watch(() => [props.option, props.loading, props.empty, props.errorMessage], renderChart, { deep: true, immediate: true })
onMounted(() => window.addEventListener('resize', resizeChart))
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  disposeChart()
})
</script>

<template>
  <div class="chart-panel" :aria-label="ariaLabel">
    <ElSkeleton v-if="loading" animated :rows="5" />
    <p v-else-if="errorMessage" class="chart-panel__state chart-panel__state--error" role="alert">{{ errorMessage }}</p>
    <p v-else-if="empty" class="chart-panel__state">{{ emptyText }}</p>
    <div v-else ref="chartElement" class="chart-panel__canvas" role="img" :aria-label="ariaLabel" />
  </div>
</template>

<style scoped>
.chart-panel{min-height:300px}.chart-panel__canvas{width:100%;height:300px}.chart-panel__state{display:grid;min-height:300px;place-items:center;margin:0;color:var(--muted);text-align:center}.chart-panel__state--error{color:#9b2020}
</style>
