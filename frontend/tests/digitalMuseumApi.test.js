import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/views/DigitalMuseum.vue', import.meta.url), 'utf8')

test('digital museum renders only API-provided courtyards as percentage hotspots', () => {
  assert.match(source, /getDigitalMuseum\(\)/)
  assert.match(source, /v-for="item in guide\.courtyards"/)
  assert.match(source, /left: `\$\{item\.positionX\}%`/)
  assert.match(source, /top: `\$\{item\.positionY\}%`/)
  assert.doesNotMatch(source, /digitalGuide\.courtyards/)
})

test('digital museum uses a safe unavailable state instead of demonstration hotspots', () => {
  assert.match(source, /数字导览资料暂时无法加载，请稍后重试/)
  assert.match(source, /不会以演示热点补齐地图/)
})
