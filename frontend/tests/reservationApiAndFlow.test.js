import assert from 'node:assert/strict'
import test from 'node:test'

import { createReservationApi } from '../src/api/reservations.js'
import {
  canSelectSchedule,
  canCancelReservation,
  buildReservationResult,
  createSubmissionLock,
  getReservationErrorMessage,
  getReservationStatusLabel,
  makeReservationPayload,
  validateLiveReservation,
} from '../src/utils/reservationFlow.js'

test('reservation API adapter calls the backend paths with only supported request fields', async () => {
  const calls = []
  const http = {
    get: async (...args) => { calls.push(['get', ...args]); return { ok: true } },
    post: async (...args) => { calls.push(['post', ...args]); return { ok: true } },
  }
  const api = createReservationApi(http)

  await api.getVisitSchedules('2026-09-10')
  await api.createReservation({ name: '测试用户', phone: '13900000001', idCard: '110105194912310021', scheduleId: 7, peopleCount: 2 })
  await api.queryReservation({ reservationNo: 'XA202609100001', phone: '13900000001' })
  await api.cancelReservation('XA202609100001', '13900000001')

  assert.deepEqual(calls, [
    ['get', '/visit-schedules', { params: { date: '2026-09-10' } }],
    ['post', '/reservations', { name: '测试用户', phone: '13900000001', idCard: '110105194912310021', scheduleId: 7, peopleCount: 2 }],
    ['get', '/reservations/query', { params: { reservationNo: 'XA202609100001', phone: '13900000001' } }],
    ['post', '/reservations/XA202609100001/cancel', { phone: '13900000001' }],
  ])
})

test('reservation flow only enables available schedules and excludes client capacity fields from the payload', () => {
  assert.equal(canSelectSchedule({ available: false, remaining: 10 }), false)
  assert.equal(canSelectSchedule({ available: true, remaining: 0 }), false)
  assert.equal(canSelectSchedule({ available: true, remaining: 1 }), true)

  assert.deepEqual(makeReservationPayload({
    name: '测试用户',
    phone: '13900000001',
    idCard: '110105194912310021',
    peopleCount: 2,
    capacity: 100,
    remaining: 98,
    visitDate: '2026-09-10',
  }, { id: 7 }), {
    name: '测试用户',
    phone: '13900000001',
    idCard: '110105194912310021',
    scheduleId: 7,
    peopleCount: 2,
  })
})

test('reservation flow validates required data and maps backend status values for display', () => {
  assert.deepEqual(validateLiveReservation({ name: '', phone: '123', idCard: '', peopleCount: 0 }), {
    name: '请填写预约人姓名',
    phone: '请输入正确的11位手机号',
    idCard: '请输入18位身份证号（演示）',
    peopleCount: '预约人数应为1至5人',
  })
  assert.equal(getReservationStatusLabel('cancelled'), '已取消')
  assert.equal(getReservationStatusLabel(1), '预约成功')
})

test('reservation flow exposes safe cancellation eligibility and visitor-friendly request errors', () => {
  assert.equal(canCancelReservation('pending'), true)
  assert.equal(canCancelReservation('cancelled'), false)
  assert.equal(canCancelReservation(1), true)
  assert.equal(getReservationErrorMessage(new Error('service unavailable')), '预约服务暂时不可用，请稍后重试。')
  assert.equal(getReservationErrorMessage(new Error('internal server error')), '预约服务暂时不可用，请稍后重试。')
  assert.equal(getReservationErrorMessage(new Error('reservation not found')), '未找到匹配的预约记录，请核对预约编号和手机号。')
  assert.equal(getReservationErrorMessage(new Error('reservation already cancelled')), '该预约已取消，无需重复操作。')
  assert.equal(getReservationErrorMessage(new Error('当前时段剩余名额不足')), '当前时段剩余名额不足')
})

test('reservation success summary keeps the real backend reservation number without personal data', () => {
  assert.deepEqual(buildReservationResult({
    reservationNo: 'XA202609020001',
    visitDate: '2026-09-02',
    peopleCount: 2,
    status: 'pending',
    phone: '13900000001',
    idCard: '110105194912310021',
  }, {
    period: 'morning',
    label: '09:00—12:00',
  }), {
    reservationNo: 'XA202609020001',
    visitDate: '2026-09-02',
    period: 'morning',
    periodLabel: '09:00—12:00',
    peopleCount: 2,
    status: 'pending',
  })
})

test('submission lock blocks a second click until the first request has finished', () => {
  const lock = createSubmissionLock()
  assert.equal(lock.tryEnter(), true)
  assert.equal(lock.isSubmitting, true)
  assert.equal(lock.tryEnter(), false)
  lock.leave()
  assert.equal(lock.isSubmitting, false)
  assert.equal(lock.tryEnter(), true)
})
