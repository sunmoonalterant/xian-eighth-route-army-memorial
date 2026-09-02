const visitScheduleModel = require('../models/visitScheduleModel')
const { formatDatabaseDate } = require('../utils/visitDate')

const PERIOD_LABELS = Object.freeze({
  morning: '09:00—12:00',
  afternoon: '13:00—16:30',
})

function toVisitSchedule(record) {
  const remaining = Math.max(0, record.capacity - record.reserved_count)
  return {
    id: record.id,
    visitDate: formatDatabaseDate(record.visit_date),
    period: record.period,
    label: PERIOD_LABELS[record.period] || record.period,
    capacity: record.capacity,
    reservedCount: record.reserved_count,
    remaining,
    available: record.status === 1 && remaining > 0,
  }
}

async function getSchedules(pool, visitDate) {
  const records = await visitScheduleModel.findByDate(pool, visitDate)
  return records.map(toVisitSchedule)
}

module.exports = { PERIOD_LABELS, getSchedules, toVisitSchedule }
