import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/Home.vue', import.meta.url), 'utf8')

test('home timeline renders every historical node as an exhibition card on a continuous rail', () => {
  assert.match(source, /class="home-timeline__node"/)
  assert.match(source, /class="home-timeline__card"/)
  assert.match(source, /home-timeline__item--upper/)
  assert.match(source, /home-timeline__item--lower/)
})

test('home timeline keeps a connected vertical reading order on small screens', () => {
  assert.match(source, /\.home-timeline__item\{[^}]*grid-template-columns:28px 1fr/)
  assert.match(source, /\.home-timeline:before\{[^}]*left:13px/)
})
