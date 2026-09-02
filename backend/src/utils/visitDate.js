const { createHttpError } = require('./httpError')

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function formatDatabaseDate(value) {
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return value
}

function toLocalDateString(value = new Date()) {
  const offset = value.getTimezoneOffset() * 60 * 1000
  return new Date(value.getTime() - offset).toISOString().slice(0, 10)
}

function parseVisitDate(value, { allowToday = true } = {}) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw createHttpError(400, 'date must use YYYY-MM-DD format')
  }

  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw createHttpError(400, 'date must use YYYY-MM-DD format')
  }

  const today = toLocalDateString()
  if (allowToday ? value < today : value <= today) {
    throw createHttpError(400, 'date must be today or later')
  }

  return value
}

module.exports = { formatDatabaseDate, parseVisitDate, toLocalDateString }
