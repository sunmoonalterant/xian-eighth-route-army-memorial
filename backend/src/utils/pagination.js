const { createHttpError } = require('./httpError')

function parsePositiveInteger(value, name, defaultValue) {
  if (value === undefined) {
    return defaultValue
  }

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw createHttpError(400, `${name} must be a positive integer`)
  }

  return parsed
}

function parsePagination(query) {
  const page = parsePositiveInteger(query.page, 'page', 1)
  const pageSize = parsePositiveInteger(query.pageSize, 'pageSize', 9)
  return { page, pageSize, offset: (page - 1) * pageSize }
}

module.exports = { parsePagination, parsePositiveInteger }
