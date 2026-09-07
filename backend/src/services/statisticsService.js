const { RESERVATION_STATUS } = require('../constants/reservationStatus')
const statisticsModel = require('../models/statisticsModel')
const { getPageName } = require('../utils/visitPath')
const { toLocalDateString } = require('../utils/visitDate')
const { createHttpError } = require('../utils/httpError')
const { parsePositiveInteger } = require('../utils/pagination')

const STATUS_NAMES = Object.freeze({
  [RESERVATION_STATUS.PENDING]: 'PENDING',
  [RESERVATION_STATUS.SUCCESS]: 'SUCCESS',
  [RESERVATION_STATUS.CANCELLED]: 'CANCELLED',
  [RESERVATION_STATUS.CHECKED_IN]: 'CHECKED_IN',
  [RESERVATION_STATUS.EXPIRED]: 'EXPIRED',
})
const ACTIVE_STATUSES = Object.freeze([RESERVATION_STATUS.PENDING, RESERVATION_STATUS.SUCCESS, RESERVATION_STATUS.CHECKED_IN])

function toNumber(value) {
  return Number(value) || 0
}

function parseBoundedInteger(value, name, defaultValue, maximum) {
  const parsed = parsePositiveInteger(value, name, defaultValue)
  if (parsed > maximum) throw createHttpError(400, `${name} must not exceed ${maximum}`)
  return parsed
}

function addDays(date, amount) {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(year, month - 1, day + amount)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function fillDateSeries(today, days, records, valueKeys = ['pv', 'uv']) {
  const byDate = new Map(records.map((record) => [String(record.date).slice(0, 10), record]))
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1)
    const record = byDate.get(date)
    return {
      date,
      ...Object.fromEntries(valueKeys.map((key) => [key, toNumber(record?.[key])])),
    }
  })
}

async function getOverview(pool) {
  const [visit, reservation] = await Promise.all([
    statisticsModel.getVisitOverview(pool),
    statisticsModel.getReservationOverview(pool, ACTIVE_STATUSES),
  ])
  return {
    totalPv: toNumber(visit.total_pv), totalUv: toNumber(visit.total_uv),
    todayPv: toNumber(visit.today_pv), todayUv: toNumber(visit.today_uv),
    totalReservations: toNumber(reservation.total_reservations),
    activeReservations: toNumber(reservation.active_reservations),
    cancelledReservations: toNumber(reservation.cancelled_reservations),
  }
}

async function getTrafficTrend(pool, days) {
  const records = await statisticsModel.getTrafficTrend(pool, days)
  return fillDateSeries(toLocalDateString(), days, records)
}

async function getPageRanking(pool, limit) {
  const records = await statisticsModel.getPageRanking(pool, limit)
  return records.map((record) => ({
    path: record.path,
    pageName: getPageName(record.path),
    pv: toNumber(record.pv),
    uv: toNumber(record.uv),
  }))
}

async function getReservationSummary(pool) {
  const records = await statisticsModel.getReservationSummary(pool, ACTIVE_STATUSES)
  const statuses = Object.fromEntries(Object.values(STATUS_NAMES).map((name) => [name, { reservations: 0, people: 0 }]))
  let totalReservations = 0
  let totalPeople = 0
  let activeReservations = 0
  let activePeople = 0
  for (const record of records) {
    const name = STATUS_NAMES[record.status]
    const reservations = toNumber(record.reservations)
    const people = toNumber(record.people)
    if (name) statuses[name] = { reservations, people }
    totalReservations += reservations
    totalPeople += people
    activeReservations += toNumber(record.active_reservations)
    activePeople += toNumber(record.active_people)
  }
  return { statuses, totalReservations, totalPeople, activeReservations, activePeople }
}

async function getReservationTrend(pool, days) {
  const records = await statisticsModel.getReservationTrend(pool, days)
  return fillDateSeries(toLocalDateString(), days, records, ['reservations', 'people'])
}

async function getPeriodDistribution(pool) {
  const records = await statisticsModel.getPeriodDistribution(pool, ACTIVE_STATUSES)
  return records.map((record) => ({
    period: record.period,
    reservations: toNumber(record.reservations),
    people: toNumber(record.people),
    activeReservations: toNumber(record.active_reservations),
    activePeople: toNumber(record.active_people),
  }))
}

module.exports = {
  ACTIVE_STATUSES,
  fillDateSeries,
  getOverview,
  getPageRanking,
  getPeriodDistribution,
  getReservationSummary,
  getReservationTrend,
  getTrafficTrend,
  parseBoundedInteger,
}
