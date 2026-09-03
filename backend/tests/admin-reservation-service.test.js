const assert = require('node:assert/strict')
const { test } = require('node:test')

const adminReservationService = require('../src/services/adminReservationService')
const { RESERVATION_STATUS } = require('../src/constants/reservationStatus')

function createPool({ status = RESERVATION_STATUS.PENDING, reservedCount = 2 } = {}) {
  const state = {
    schedule: { id: 9, capacity: 100, reserved_count: reservedCount },
    reservation: {
      id: 7,
      reservation_no: 'XA202609030001',
      name: '测试游客',
      phone: '13800138000',
      visit_date: '2026-09-03',
      schedule_id: 9,
      people_count: 2,
      status,
    },
  }
  const connection = {
    async beginTransaction() {
      this.snapshot = JSON.stringify(state)
    },
    async commit() {},
    async rollback() {
      const snapshot = JSON.parse(this.snapshot)
      state.schedule = snapshot.schedule
      state.reservation = snapshot.reservation
    },
    release() {},
    async query(sql, values = []) {
      if (sql.includes('FROM `reservation`') && sql.includes('FOR UPDATE')) {
        return [[{ ...state.reservation }]]
      }
      if (sql.includes('FROM `visit_schedule`') && sql.includes('FOR UPDATE')) {
        return [[{ ...state.schedule }]]
      }
      if (sql.includes('UPDATE `reservation`') && sql.includes('SET status = ?')) {
        const [nextStatus, id, currentStatus] = values
        if (state.reservation.id !== id || state.reservation.status !== currentStatus) return [{ affectedRows: 0 }]
        state.reservation.status = nextStatus
        return [{ affectedRows: 1 }]
      }
      if (sql.includes('reserved_count = reserved_count -')) {
        const [peopleCount, scheduleId, minimum] = values
        if (state.schedule.id !== scheduleId || state.schedule.reserved_count < minimum) return [{ affectedRows: 0 }]
        state.schedule.reserved_count -= peopleCount
        return [{ affectedRows: 1 }]
      }
      throw new Error(`Unexpected query: ${sql}`)
    },
  }
  return { getConnection: async () => connection, state }
}

test('admin cancellation changes a pending reservation once and releases its capacity', async () => {
  const pool = createPool()

  const result = await adminReservationService.updateReservationStatus(pool, 7, 'CANCELLED')

  assert.equal(result.status, 'CANCELLED')
  assert.equal(pool.state.reservation.status, RESERVATION_STATUS.CANCELLED)
  assert.equal(pool.state.schedule.reserved_count, 0)
  await assert.rejects(
    () => adminReservationService.updateReservationStatus(pool, 7, 'CANCELLED'),
    (error) => error.status === 409 && error.message === 'reservation status transition is not allowed',
  )
  assert.equal(pool.state.schedule.reserved_count, 0)
})

test('admin check-in changes a successful reservation without changing capacity', async () => {
  const pool = createPool({ status: RESERVATION_STATUS.SUCCESS })

  const result = await adminReservationService.updateReservationStatus(pool, 7, 'CHECKED_IN')

  assert.equal(result.status, 'CHECKED_IN')
  assert.equal(pool.state.reservation.status, RESERVATION_STATUS.CHECKED_IN)
  assert.equal(pool.state.schedule.reserved_count, 2)
})

test('admin reservation rows use uppercase statuses and mask phone numbers in lists', () => {
  const row = adminReservationService.toAdminReservationListItem({
    id: 7,
    reservation_no: 'XA202609030001',
    name: '测试游客',
    phone: '13800138000',
    visit_date: '2026-09-03',
    period: 'morning',
    people_count: 2,
    status: RESERVATION_STATUS.PENDING,
    created_at: '2026-09-01T00:00:00.000Z',
  })

  assert.equal(row.status, 'PENDING')
  assert.equal(row.phone, '138****8000')
  assert.equal(row.idCard, undefined)
})
