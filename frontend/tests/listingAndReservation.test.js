import test from 'node:test'
import assert from 'node:assert/strict'
import { paginate, sortByViews } from '../src/data/listing.js'
import { getRemaining, validateReservation } from '../src/data/reservation.js'

test('sortByViews orders a copied collection from most viewed to least viewed', () => {
  const records = [{ id: 'a', views: 8 }, { id: 'b', views: 21 }]
  assert.deepEqual(sortByViews(records).map((item) => item.id), ['b', 'a'])
  assert.deepEqual(records.map((item) => item.id), ['a', 'b'])
})

test('paginate reports the current slice and total page count', () => {
  const page = paginate([1, 2, 3, 4, 5], 2, 2)
  assert.deepEqual(page.items, [3, 4])
  assert.equal(page.total, 5)
  assert.equal(page.totalPages, 3)
})

test('reservation validation rejects invalid contact data and too many visitors', () => {
  const errors = validateReservation({ name: '', phone: '123', idCard: '', count: 60, remaining: 58, agreed: false })
  assert.equal(errors.name, '请填写预约人姓名')
  assert.equal(errors.phone, '请输入正确的手机号')
  assert.equal(errors.idCard, '请输入18位身份证号（演示）')
  assert.equal(errors.count, '预约人数不能超过当前剩余名额')
  assert.equal(errors.agreed, '请先阅读并确认预约须知')
})

test('getRemaining calculates display availability from the simulated schedule', () => {
  assert.equal(getRemaining({ capacity: 100, booked: 42 }), 58)
})
