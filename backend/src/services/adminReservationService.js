const { RESERVATION_STATUS } = require('../constants/reservationStatus')
const adminReservationModel = require('../models/adminReservationModel')
const { createHttpError } = require('../utils/httpError')
const { formatDatabaseDate } = require('../utils/visitDate')
const { PERIOD_LABELS } = require('./visitScheduleService')

const STATUS_NAMES = Object.freeze({
  [RESERVATION_STATUS.PENDING]: 'PENDING',
  [RESERVATION_STATUS.SUCCESS]: 'SUCCESS',
  [RESERVATION_STATUS.CANCELLED]: 'CANCELLED',
  [RESERVATION_STATUS.CHECKED_IN]: 'CHECKED_IN',
  [RESERVATION_STATUS.EXPIRED]: 'EXPIRED',
})

const STATUS_VALUES = Object.freeze(Object.fromEntries(
  Object.entries(STATUS_NAMES).map(([value, name]) => [name, Number(value)]),
))

const ALLOWED_TRANSITIONS = Object.freeze({
  [RESERVATION_STATUS.PENDING]: [RESERVATION_STATUS.SUCCESS, RESERVATION_STATUS.CANCELLED],
  [RESERVATION_STATUS.SUCCESS]: [RESERVATION_STATUS.CHECKED_IN, RESERVATION_STATUS.CANCELLED],
})

function maskPhone(phone) {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function toStatusName(status) {
  return STATUS_NAMES[status] || 'UNKNOWN'
}

function toPeriodLabel(period) {
  return PERIOD_LABELS[period] || period
}

function toAdminReservationListItem(record) {
  return {
    id: record.id,
    reservationNo: record.reservation_no,
    name: record.name,
    phone: maskPhone(record.phone),
    visitDate: formatDatabaseDate(record.visit_date),
    period: record.period,
    periodLabel: toPeriodLabel(record.period),
    peopleCount: record.people_count,
    status: toStatusName(record.status),
    createdAt: record.created_at,
  }
}

function toAdminReservationDetail(record) {
  return {
    ...toAdminReservationListItem(record),
    phone: record.phone,
    remark: record.remark,
    updatedAt: record.updated_at,
  }
}

async function getReservationList(pool, filters, pagination) {
  const [records, total] = await Promise.all([
    adminReservationModel.findReservations(pool, filters, pagination),
    adminReservationModel.countReservations(pool, filters),
  ])
  return { list: records.map(toAdminReservationListItem), total }
}

async function getReservationDetail(pool, id) {
  const record = await adminReservationModel.findReservationById(pool, id)
  return record ? toAdminReservationDetail(record) : null
}

async function updateReservationStatus(pool, id, statusName) {
  const nextStatus = STATUS_VALUES[statusName]
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const reservation = await adminReservationModel.lockReservationById(connection, id)
    if (!reservation) throw createHttpError(404, 'reservation not found')

    const allowed = ALLOWED_TRANSITIONS[reservation.status] || []
    if (!allowed.includes(nextStatus)) {
      throw createHttpError(409, 'reservation status transition is not allowed')
    }

    if (nextStatus === RESERVATION_STATUS.CANCELLED) {
      const schedule = await adminReservationModel.lockScheduleById(connection, reservation.schedule_id)
      if (!schedule) throw createHttpError(409, 'visit schedule not found')

      const updated = await adminReservationModel.updateStatus(connection, reservation.id, reservation.status, nextStatus)
      const released = await adminReservationModel.releaseReservedCount(connection, schedule.id, reservation.people_count)
      if (!updated || !released) throw createHttpError(409, 'reservation capacity state is invalid')
    } else {
      const updated = await adminReservationModel.updateStatus(connection, reservation.id, reservation.status, nextStatus)
      if (!updated) throw createHttpError(409, 'reservation status is stale')
    }

    await connection.commit()
    return { id: reservation.id, reservationNo: reservation.reservation_no, status: toStatusName(nextStatus) }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  STATUS_VALUES,
  getReservationDetail,
  getReservationList,
  maskPhone,
  toAdminReservationDetail,
  toAdminReservationListItem,
  toStatusName,
  updateReservationStatus,
}
