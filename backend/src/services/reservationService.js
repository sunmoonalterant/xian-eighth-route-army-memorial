const { RESERVATION_STATUS } = require('../constants/reservationStatus')
const reservationModel = require('../models/reservationModel')
const { createHttpError } = require('../utils/httpError')
const { formatDatabaseDate, parseVisitDate } = require('../utils/visitDate')

function createReservationNo(visitDate, latestReservationNo) {
  const dateToken = visitDate.replaceAll('-', '')
  const latestSequence = latestReservationNo ? Number(latestReservationNo.slice(-4)) : 0
  const nextSequence = latestSequence + 1
  if (!Number.isSafeInteger(nextSequence) || nextSequence > 9999) {
    throw createHttpError(409, '当天预约编号已用尽')
  }
  return `XA${dateToken}${String(nextSequence).padStart(4, '0')}`
}

function maskPhone(phone) {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function maskName(name) {
  return name.length < 2 ? '*' : `${name[0]}${'*'.repeat(name.length - 1)}`
}

function statusToPublicValue(status) {
  return ({
    [RESERVATION_STATUS.PENDING]: 'pending',
    [RESERVATION_STATUS.SUCCESS]: 'success',
    [RESERVATION_STATUS.CANCELLED]: 'cancelled',
    [RESERVATION_STATUS.CHECKED_IN]: 'checked_in',
    [RESERVATION_STATUS.EXPIRED]: 'expired',
  })[status] || 'unknown'
}

async function createReservation(pool, input) {
  const connection = await pool.getConnection()
  let visitDateForLock = null
  let numberLockAcquired = false

  try {
    await connection.beginTransaction()
    const schedule = await reservationModel.lockScheduleById(connection, input.scheduleId)
    if (!schedule) throw createHttpError(404, 'visit schedule not found')

    const visitDate = parseVisitDate(formatDatabaseDate(schedule.visit_date))
    visitDateForLock = visitDate
    if (schedule.status !== 1) throw createHttpError(409, '当前时段不可预约')

    const remaining = schedule.capacity - schedule.reserved_count
    if (remaining < input.peopleCount) {
      throw createHttpError(409, '当前时段剩余名额不足', { remaining: Math.max(0, remaining) })
    }

    const existing = await reservationModel.findActiveByPhoneAndVisitDate(connection, input.phone, visitDate)
    if (existing) throw createHttpError(409, '同一手机号当天已有有效预约')

    numberLockAcquired = await reservationModel.acquireReservationNumberLock(connection, visitDate)
    if (!numberLockAcquired) throw createHttpError(503, '预约系统繁忙，请稍后重试')

    const latestReservationNo = await reservationModel.findLatestReservationNo(connection, visitDate)
    const reservationNo = createReservationNo(visitDate, latestReservationNo)
    await reservationModel.insertReservation(connection, {
      ...input,
      reservationNo,
      status: RESERVATION_STATUS.PENDING,
      visitDate,
    })

    const updated = await reservationModel.incrementReservedCount(connection, schedule.id, input.peopleCount)
    if (!updated) throw createHttpError(409, '当前时段剩余名额不足', { remaining: 0 })

    await connection.commit()
    return {
      reservationNo,
      visitDate,
      scheduleId: schedule.id,
      peopleCount: input.peopleCount,
      status: 'pending',
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    if (numberLockAcquired && visitDateForLock) {
      await reservationModel.releaseReservationNumberLock(connection, visitDateForLock)
    }
    connection.release()
  }
}

async function getReservationByNoAndPhone(pool, reservationNo, phone) {
  const record = await reservationModel.findByReservationNoAndPhone(pool, reservationNo, phone)
  if (!record) return null
  return {
    reservationNo: record.reservation_no,
    name: maskName(record.name),
    phone: maskPhone(record.phone),
    visitDate: formatDatabaseDate(record.visit_date),
    period: record.period,
    periodLabel: require('./visitScheduleService').PERIOD_LABELS[record.period] || record.period,
    peopleCount: record.people_count,
    status: statusToPublicValue(record.status),
    createdAt: record.created_at,
  }
}

async function cancelReservation(pool, reservationNo, phone) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const reservation = await reservationModel.lockReservationByNo(connection, reservationNo)
    if (!reservation || reservation.phone !== phone) throw createHttpError(404, 'reservation not found')
    if (reservation.status === RESERVATION_STATUS.CANCELLED) throw createHttpError(409, 'reservation already cancelled')
    if (![RESERVATION_STATUS.PENDING, RESERVATION_STATUS.SUCCESS].includes(reservation.status)) {
      throw createHttpError(409, 'reservation cannot be cancelled')
    }

    const schedule = await reservationModel.lockScheduleById(connection, reservation.schedule_id)
    if (!schedule) throw createHttpError(409, 'visit schedule not found')

    const cancelled = await reservationModel.markCancelled(connection, reservation.id)
    const released = await reservationModel.decrementReservedCount(connection, schedule.id, reservation.people_count)
    if (!cancelled || !released) throw createHttpError(409, 'reservation capacity state is invalid')

    await connection.commit()
    return { reservationNo: reservation.reservation_no, status: 'cancelled' }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  cancelReservation,
  createReservation,
  createReservationNo,
  getReservationByNoAndPhone,
  maskName,
  maskPhone,
  statusToPublicValue,
}
