import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/Home.vue', import.meta.url), 'utf8')

test('home hero preserves the intentional two-line memorial title hierarchy', () => {
  assert.match(source, /XI'AN EIGHTH ROUTE ARMY OFFICE MEMORIAL/)
  assert.match(source, /<span>八路军西安办事处<\/span>\s*<span>纪念馆<\/span>/)
  assert.match(source, /class="hero-subtitle"/)
})

test('home hero uses a viewport-height composition with responsive title sizing', () => {
  assert.match(source, /min-height:calc\(100svh - var\(--header-height\)\)/)
  assert.match(source, /font-size:clamp\(2\.375rem,4\.5vw,5\.375rem\)/)
})

test('home hero crops toward the memorial facade instead of the bright sky', () => {
  assert.match(source, /background-position:center 100%/)
})
