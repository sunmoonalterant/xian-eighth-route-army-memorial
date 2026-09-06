import assert from 'node:assert/strict'
import test from 'node:test'
import { toDisplayImageUrl } from '../src/utils/imageUrl.js'

test('keeps existing Vite public image paths unchanged', () => {
  assert.equal(toDisplayImageUrl('/images/exhibitions/cover.jpg'), '/images/exhibitions/cover.jpg')
})

test('resolves backend upload paths from the configured API origin', () => {
  assert.equal(toDisplayImageUrl('/uploads/people/person-1.jpg', 'http://localhost:3000/api'), 'http://localhost:3000/uploads/people/person-1.jpg')
})

test('keeps external image URLs unchanged without rewriting http to https', () => {
  assert.equal(toDisplayImageUrl('http://example.test/photo.jpg'), 'http://example.test/photo.jpg')
})
