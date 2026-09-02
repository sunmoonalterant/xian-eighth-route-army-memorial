const assert = require('node:assert/strict')
const { test } = require('node:test')

const reservationService = require('../src/services/reservationService')
const { toVisitSchedule } = require('../src/services/visitScheduleService')
const { RESERVATION_STATUS } = require('../src/constants/reservationStatus')

function futureDate(days = 3) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function createTransactionalPool({ capacity = 100, reservedCount = 0, failInsert = false } = {}) {
  const visitDate = futureDate()
  const state = {
    schedules: [{ id: 1, visit_date: visitDate, period: 'morning', capacity, reserved_count: reservedCount, status: 1 }],
    reservations: [],
    failInsert,
  }

  const connection = {
    async beginTransaction() {
      this.snapshot = JSON.stringify({ schedules: state.schedules, reservations: state.reservations })
    },
    async commit() {},
    async rollback() {
      const snapshot = JSON.parse(this.snapshot)
      state.schedules = snapshot.schedules
      state.reservations = snapshot.reservations
    },
    release() {},
    async query(sql, values = []) {
      if (sql.includes('GET_LOCK')) return [[{ locked: 1 }]]
      if (sql.includes('RELEASE_LOCK')) return [[{ released: 1 }]]

      if (sql.includes('FROM `visit_schedule`') && sql.includes('FOR UPDATE')) {
        const schedule = state.schedules.find((item) => item.id === values[0])
        return [schedule ? [{ ...schedule }] : []]
      }

      if (sql.includes('FROM `reservation`') && sql.includes('phone = ?') && sql.includes('FOR UPDATE')) {
        const [phone, date] = values
        return [state.reservations.filter((item) => item.phone === phone && item.visit_date === date && [0, 1].includes(item.status)).map((item) => ({ id: item.id }))]
      }

      if (sql.includes('FROM `reservation`') && sql.includes('reservation_no = ?') && sql.includes('FOR UPDATE')) {
        const reservation = state.reservations.find((item) => item.reservation_no === values[0])
        return [reservation ? [{ ...reservation }] : []]
      }

      if (sql.includes('FROM `reservation`') && sql.includes('reservation_no = ?') && sql.includes('phone = ?')) {
        const reservation = state.reservations.find((item) => item.reservation_no === values[0] && item.phone === values[1])
        if (!reservation) return [[]]
        const schedule = state.schedules.find((item) => item.id === reservation.schedule_id)
        return [[{ ...reservation, period: schedule.period }]]
      }

      if (sql.includes('reservation_no LIKE ?')) {
        const prefix = values[0].replace('%', '')
        const latest = state.reservations.filter((item) => item.reservation_no.startsWith(prefix)).sort((a, b) => b.reservation_no.localeCompare(a.reservation_no))[0]
        return [latest ? [{ reservation_no: latest.reservation_no }] : []]
      }

      if (sql.includes('INSERT INTO `reservation`')) {
        if (state.failInsert) throw new Error('simulated insert failure')
        const [reservationNo, name, phone, idCard, date, scheduleId, peopleCount, status] = values
        state.reservations.push({
          id: state.reservations.length + 1,
          reservation_no: reservationNo,
          name,
          phone,
          id_card: idCard,
          visit_date: date,
          schedule_id: scheduleId,
          people_count: peopleCount,
          status,
          created_at: '2026-09-02T00:00:00.000Z',
        })
        return [{ affectedRows: 1 }]
      }

      if (sql.includes('reserved_count = reserved_count +')) {
        const [peopleCount, scheduleId, checkCount] = values
        const schedule = state.schedules.find((item) => item.id === scheduleId)
        if (!schedule || schedule.reserved_count + checkCount > schedule.capacity) return [{ affectedRows: 0 }]
        schedule.reserved_count += peopleCount
        return [{ affectedRows: 1 }]
      }

      if (sql.includes('UPDATE `reservation`') && sql.includes('SET status = ?')) {
        const [status, reservationId] = values
        const reservation = state.reservations.find((item) => item.id === reservationId)
        reservation.status = status
        return [{ affectedRows: 1 }]
      }

      if (sql.includes('reserved_count = reserved_count -')) {
        const [peopleCount, scheduleId, checkCount] = values
        const schedule = state.schedules.find((item) => item.id === scheduleId)
        if (!schedule || schedule.reserved_count < checkCount) return [{ affectedRows: 0 }]
        schedule.reserved_count -= peopleCount
        return [{ affectedRows: 1 }]
      }

      throw new Error(`Unexpected query: ${sql}`)
    },
  }

  return { getConnection: async () => connection, query: (...args) => connection.query(...args), state }
}

function validInput() {
  return {
    name: '测试游客',
    phone: '13800138000',
    idCard: '11010519491231002X',
    scheduleId: 1,
    peopleCount: 2,
  }
}

test('createReservation locks a schedule, persists one record, and increments capacity in one transaction', async () => {
  const pool = createTransactionalPool()

  const reservation = await reservationService.createReservation(pool, validInput())

  assert.match(reservation.reservationNo, /^XA\d{8}0001$/)
  assert.equal(pool.state.reservations.length, 1)
  assert.equal(pool.state.schedules[0].reserved_count, 2)
})

test('toVisitSchedule serializes a MySQL DATE object as YYYY-MM-DD without a timezone suffix', () => {
  const result = toVisitSchedule({
    id: 1,
    visit_date: new Date('2026-09-01T16:00:00.000Z'),
    period: 'morning',
    capacity: 100,
    reserved_count: 0,
    status: 1,
  })

  assert.equal(result.visitDate, '2026-09-02')
})

test('createReservation rejects an over-capacity request without consuming places', async () => {
  const pool = createTransactionalPool({ capacity: 100, reservedCount: 98 })

  await assert.rejects(
    () => reservationService.createReservation(pool, { ...validInput(), peopleCount: 3 }),
    (error) => error.status === 409 && error.message === '当前时段剩余名额不足' && error.data.remaining === 2,
  )
  assert.equal(pool.state.reservations.length, 0)
  assert.equal(pool.state.schedules[0].reserved_count, 98)
})

test('createReservation rolls back if writing the reservation fails', async () => {
  const pool = createTransactionalPool({ failInsert: true })

  await assert.rejects(() => reservationService.createReservation(pool, validInput()), /simulated insert failure/)
  assert.equal(pool.state.reservations.length, 0)
  assert.equal(pool.state.schedules[0].reserved_count, 0)
})

test('createReservation prevents a second active reservation for the same phone and date', async () => {
  const pool = createTransactionalPool()
  await reservationService.createReservation(pool, validInput())

  await assert.rejects(
    () => reservationService.createReservation(pool, validInput()),
    (error) => error.status === 409 && error.message === '同一手机号当天已有有效预约',
  )
  assert.equal(pool.state.reservations.length, 1)
  assert.equal(pool.state.schedules[0].reserved_count, 2)
})

test('createReservation creates distinct same-day reservation numbers under the number lock', async () => {
  const pool = createTransactionalPool()

  const first = await reservationService.createReservation(pool, validInput())
  const second = await reservationService.createReservation(pool, { ...validInput(), phone: '13900139000' })

  assert.match(first.reservationNo, /^XA\d{8}0001$/)
  assert.match(second.reservationNo, /^XA\d{8}0002$/)
})

test('getReservation masks contact data and never returns an id card', async () => {
  const pool = createTransactionalPool()
  const created = await reservationService.createReservation(pool, validInput())

  const result = await reservationService.getReservationByNoAndPhone(pool, created.reservationNo, '13800138000')

  assert.equal(result.reservationNo, created.reservationNo)
  assert.equal(result.phone, '138****8000')
  assert.equal(result.idCard, undefined)
})

test('cancelReservation releases capacity once and rejects a repeated cancellation', async () => {
  const pool = createTransactionalPool()
  const created = await reservationService.createReservation(pool, validInput())

  const cancelled = await reservationService.cancelReservation(pool, created.reservationNo, '13800138000')

  assert.equal(cancelled.status, 'cancelled')
  assert.equal(pool.state.schedules[0].reserved_count, 0)
  await assert.rejects(
    () => reservationService.cancelReservation(pool, created.reservationNo, '13800138000'),
    (error) => error.status === 409 && error.message === 'reservation already cancelled',
  )
  assert.equal(pool.state.schedules[0].reserved_count, 0)
  assert.equal(pool.state.reservations[0].status, RESERVATION_STATUS.CANCELLED)
})
