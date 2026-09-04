import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/Home.vue', import.meta.url), 'utf8')

test('home timeline renders verified historical timestamp cards', () => {
  assert.match(source, /以下节点据七贤庄词条及纪念馆资料整理/)
  assert.match(source, /v-for="\(item, index\) in homeNarrative\.timeline"/)
})

test('home presents direct-use Qixianzhuang image references with source traceability', () => {
  assert.match(source, /qixianzhuangMedia/)
  assert.match(source, /v-for="item in qixianzhuangMedia"/)
  assert.match(source, /item\.sourceLabel/)
})

test('home people section requests only formal people and does not restore demonstration data', () => {
  assert.match(source, /getPeople\(\{ page: 1, pageSize: 4 \}\)/)
  assert.match(source, /<PersonCard v-for="person in peopleHighlights"/)
  assert.doesNotMatch(source, /资料待核实/)
})
