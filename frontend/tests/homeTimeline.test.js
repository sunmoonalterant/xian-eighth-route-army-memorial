import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/Home.vue', import.meta.url), 'utf8')

test('home timeline shows a verification notice instead of unverified event cards', () => {
  assert.match(source, /历史资料正在整理中/)
  assert.doesNotMatch(source, /v-for="\(item, index\) in homeNarrative\.timeline"/)
})

test('home people section shows a verification notice instead of demonstration profiles', () => {
  assert.match(source, /人物资料正在整理中/)
  assert.doesNotMatch(source, /<PersonCard/)
})
